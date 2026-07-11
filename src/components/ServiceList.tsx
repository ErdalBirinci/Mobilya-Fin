import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { ServiceCard } from './ServiceCard';
import { useAppContext } from '../context/AppContext';
import { Service } from '../types';
import { Filter, Download } from 'lucide-react';
import { exportToCsv } from '../utils/export';
import { RouteOptimizer } from './RouteOptimizer';

interface ServiceListProps {
  date: string;
  onEdit?: (service: Service) => void;
}

export const ServiceList: React.FC<ServiceListProps> = ({ date, onEdit }) => {
  const { services, currentUser, reorderServices, updateService } = useAppContext();
  
  const [hideAlis, setHideAlis] = useState(false);
  const [hideSatis, setHideSatis] = useState(false);
  const [hideCompleted, setHideCompleted] = useState(false);

  if (!currentUser) return null;

  // Sadece ilgili günün servislerini al ve sıraya göre diz
  const todaysServices = services
    .filter(s => s.date === date)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  // Filtreleri uygula
  const filteredServices = todaysServices.filter(s => {
    if (hideAlis && s.type === 'ALIS') return false;
    if (hideSatis && s.type === 'SATIS') return false;
    if (hideCompleted && s.status === 'Tamamlandı') return false;
    return true;
  });

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    // We need to reorder based on the filtered list, but update the original todaysServices
    // To keep it simple and accurate, dragging should ideally be done without filters, 
    // or we map the filtered index back to the original index.
    // For now, let's reorder the filtered array and then merge it back.
    const newFilteredItems = [...filteredServices];
    const [reorderedItem] = newFilteredItems.splice(sourceIndex, 1);
    newFilteredItems.splice(destinationIndex, 0, reorderedItem);

    // Create a map of updated order indices for the filtered items
    const orderUpdates = new Map<string, number>();
    // Use the original items' indices to distribute the new order
    const originalIndices = filteredServices.map(s => s.orderIndex).sort((a, b) => a - b);
    
    newFilteredItems.forEach((item, idx) => {
      orderUpdates.set(item.id, originalIndices[idx]);
    });

    const updatedServices = todaysServices.map((item) => {
      if (orderUpdates.has(item.id)) {
        return { ...item, orderIndex: orderUpdates.get(item.id) };
      }
      return item;
    }).sort((a, b) => a.orderIndex - b.orderIndex);

    // orderIndex'leri baştan sırala ki boşluk kalmasın
    const normalizedServices = updatedServices.map((item, index) => ({
      ...item,
      orderIndex: index,
    }));

    const otherServices = services.filter(s => s.date !== date);
    reorderServices([...otherServices, ...normalizedServices]);
  };

  const handleUpdateStatus = (id: string, status: Service['status']) => {
    updateService(id, { status });
  };

  const handleUploadPhotos = (id: string, photos: string[]) => {
    updateService(id, { photos });
  };

  const handleExportCsv = () => {
    const rows = [
      ['Tarih', 'Saat Aralığı', 'Müşteri Adı', 'Müşteri Telefon', 'Servis Tipi', 'Durum', 'Tutar', 'Tahsil Edilen', 'Notlar']
    ];
    filteredServices.forEach(s => {
      rows.push([
        s.date,
        s.timeRange,
        s.customerName,
        s.customerPhone,
        s.type === 'ALIS' ? 'Alış' : 'Satış',
        s.status,
        s.totalAmount.toString(),
        s.collectionAmount.toString(),
        s.notes
      ]);
    });
    exportToCsv('servis_listesi.csv', rows);
  };

  return (
    <div className="space-y-6">
      {currentUser.role === 'ADMIN' && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-slate-500 font-bold text-sm mr-2">
              <Filter size={16} />
              Filtreler:
            </div>
            <label className="flex items-center space-x-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors">
              <input 
                type="checkbox" 
                checked={hideAlis} 
                onChange={(e) => setHideAlis(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-semibold text-slate-700">Alışları Gizle</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors">
              <input 
                type="checkbox" 
                checked={hideSatis} 
                onChange={(e) => setHideSatis(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-semibold text-slate-700">Satışları Gizle</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors">
              <input 
                type="checkbox" 
                checked={hideCompleted} 
                onChange={(e) => setHideCompleted(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-semibold text-slate-700">Tamamlananları Gizle</span>
            </label>
          </div>
          <button 
            onClick={handleExportCsv}
            className="flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-lg border border-indigo-100 font-semibold text-sm hover:bg-indigo-50 transition-colors shadow-sm"
          >
            <Download size={16} />
            Dışa Aktar (CSV)
          </button>
        </div>
      )}
      
      <RouteOptimizer services={filteredServices} />

      {filteredServices.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-400 font-medium">Bu kriterlere uygun servis bulunmamaktadır.</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="service-list">
            {(provided) => (
              <div 
                {...provided.droppableProps} 
                ref={provided.innerRef}
                className="space-y-4"
              >
                {filteredServices.map((service, index) => (
                  <React.Fragment key={service.id}>
                    <Draggable draggableId={service.id} index={index} isDragDisabled={currentUser.role !== 'ADMIN'}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                        >
                          <ServiceCard 
                            service={service} 
                            currentUser={currentUser}
                            onUpdateStatus={handleUpdateStatus}
                            onUploadPhotos={handleUploadPhotos}
                            onEdit={onEdit}
                            dragHandleProps={provided.dragHandleProps}
                          />
                        </div>
                      )}
                    </Draggable>
                  </React.Fragment>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
};
