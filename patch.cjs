const fs = require('fs');
const file = 'src/components/RouteMap.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `<span className="text-xs font-semibold mt-2 inline-block px-2 py-1 bg-slate-100 rounded-md">
                        {marker.status}
                      </span>`;

const replacement = `<div className="mt-2 flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold inline-block px-2 py-1 bg-slate-100 rounded-md">
                          {marker.status}
                        </span>
                        <a
                          href={\`https://www.google.com/maps/search/?api=1&query=\${encodeURIComponent(marker.customerAddress)}\`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-2 py-1 rounded-md transition-colors whitespace-nowrap"
                        >
                          Haritada Aç
                        </a>
                      </div>`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content);
console.log('Patched correctly');
