import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Service } from '../types';

interface RouteMapProps {
  services: Service[];
}

export const RouteMap: React.FC<RouteMapProps> = ({ services }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || services.length === 0) return;

    // Clear previous
    d3.select(svgRef.current).selectAll("*").remove();

    const width = 800;
    const height = 300;
    const padding = 60;

    const svg = d3.select(svgRef.current)
      .attr("width", "100%")
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);

    // Generate pseudo-coordinates for services to display a path
    // We spread them out horizontally
    const nodes = services.map((s, i) => {
      const x = services.length > 1 
        ? padding + (i * ((width - 2 * padding) / (services.length - 1)))
        : width / 2;
      const y = height / 2 + (i % 2 === 0 ? -40 : 40); // zig-zag
      return {
        id: s.id,
        name: s.customerName.length > 15 ? s.customerName.substring(0, 15) + '...' : s.customerName,
        address: s.customerAddress ? s.customerAddress.substring(0, 20) + '...' : 'Adres yok',
        status: s.status,
        x,
        y
      };
    });

    const links = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      links.push({
        source: nodes[i],
        target: nodes[i + 1]
      });
    }

    // Draw links
    svg.selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y)
      .attr("stroke", "#94a3b8")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4 4");

    // Draw nodes
    const nodeGroups = svg.selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .attr("transform", d => `translate(${d.x},${d.y})`);

    // Add node background for better readability
    nodeGroups.append("circle")
      .attr("r", 12)
      .attr("fill", d => d.status === 'Tamamlandı' ? '#10b981' : (d.status === 'Yolda' ? '#f59e0b' : '#6366f1'))
      .attr("stroke", "#fff")
      .attr("stroke-width", 3)
      .style("filter", "drop-shadow(0px 2px 4px rgba(0,0,0,0.15))");

    // Order number inside circle
    nodeGroups.append("text")
      .attr("y", 4)
      .attr("text-anchor", "middle")
      .text((d, i) => (i + 1).toString())
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .attr("fill", "#fff");

    // Node labels (Name)
    nodeGroups.append("text")
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .text(d => d.name)
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", "#334155");

    // Node labels (Address)
    nodeGroups.append("text")
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .text(d => d.address)
      .attr("font-size", "10px")
      .attr("fill", "#64748b");

  }, [services]);

  if (services.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mt-6 overflow-hidden">
      <div className="p-4 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-800">Rota Özeti Haritası (D3)</h3>
      </div>
      <div className="w-full overflow-x-auto overflow-y-hidden p-4">
        <svg ref={svgRef} className="min-w-[600px]"></svg>
      </div>
    </div>
  );
};
