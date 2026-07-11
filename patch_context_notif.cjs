const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const addTarget = `    sendNotification('Yeni Servis Atandı', {
      body: \`\${newService.customerName} - \${newService.type === 'ALIS' ? 'Alış' : 'Satış'} servisi planlandı.\`,
    });
    logAction('ADD_SERVICE', 'SERVICE', newService.id, \`Added service for \${newService.customerName}\`);
  };`;

const addRep = `    sendNotification('Yeni Servis Atandı', {
      body: \`\${newService.customerName} - \${newService.type === 'ALIS' ? 'Alış' : 'Satış'} servisi planlandı.\`,
    });
    addNotification({
      title: 'Yeni Görev Atandı',
      message: \`\${newService.customerName} için yeni bir \${newService.type === 'ALIS' ? 'Alış' : 'Satış'} görevi oluşturuldu.\`,
      type: 'INFO',
      read: false
    });
    logAction('ADD_SERVICE', 'SERVICE', newService.id, \`Added service for \${newService.customerName}\`);
  };`;
content = content.replace(addTarget, addRep);

const updateTarget = `  const updateService = (id: string, updates: Partial<Service>) => {
    setServices((prev) => prev.map((service) => (service.id === id ? { ...service, ...updates } : service)));
    if (!isOnline) queueOperation({ type: 'UPDATE_SERVICE', payload: { id, updates } });
    logAction('UPDATE_SERVICE', 'SERVICE', id, \`Updated service details\`);
  };`;
const updateRep = `  const updateService = (id: string, updates: Partial<Service>) => {
    setServices((prev) => {
      const existing = prev.find(s => s.id === id);
      if (existing) {
        if (updates.status && updates.status !== existing.status) {
          addNotification({
            title: 'Durum Güncellendi',
            message: \`\${existing.customerName} görevi "\${updates.status}" olarak işaretlendi.\`,
            type: updates.status === 'Tamamlandı' ? 'SUCCESS' : (updates.status === 'İptal Edildi' ? 'ERROR' : 'INFO'),
            read: false
          });
        }
      }
      return prev.map((service) => (service.id === id ? { ...service, ...updates } : service));
    });
    if (!isOnline) queueOperation({ type: 'UPDATE_SERVICE', payload: { id, updates } });
    logAction('UPDATE_SERVICE', 'SERVICE', id, \`Updated service details\`);
  };`;
content = content.replace(updateTarget, updateRep);

const reorderTarget = `  const reorderServices = (reorderedServices: Service[]) => {
    if (!currentUser) return;
    setServices((prev) => {
      const otherTenants = prev.filter(s => s.tenantId !== currentUser.tenantId);
      return [...otherTenants, ...reorderedServices];
    });
    if (!isOnline) queueOperation({ type: 'REORDER_SERVICES', payload: reorderedServices });
  };`;
const reorderRep = `  const reorderServices = (reorderedServices: Service[]) => {
    if (!currentUser) return;
    setServices((prev) => {
      const otherTenants = prev.filter(s => s.tenantId !== currentUser.tenantId);
      return [...otherTenants, ...reorderedServices];
    });
    addNotification({
      title: 'Rota Değiştirildi',
      message: 'Görev sırası ve rota güncellendi. Yeni rotayı kontrol edin.',
      type: 'WARNING',
      read: false
    });
    if (!isOnline) queueOperation({ type: 'REORDER_SERVICES', payload: reorderedServices });
  };`;
content = content.replace(reorderTarget, reorderRep);

fs.writeFileSync('src/context/AppContext.tsx', content);
console.log('Appcontext hooks patched');
