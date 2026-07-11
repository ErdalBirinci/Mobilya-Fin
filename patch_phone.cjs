const fs = require('fs');
let content = fs.readFileSync('src/components/ServiceCard.tsx', 'utf8');

const target = `                <div className="flex items-center space-x-2">
                  <Phone size={16} className="shrink-0 text-slate-400" />
                  {isMasked ? (
                    <span>{displayPhone}</span>
                  ) : (
                    <a href={\`https://wa.me/\${service.customerPhone.replace(/[^0-9]/g, '')}\`} target="_blank" rel="noreferrer" className="hover:text-indigo-600 transition-colors">
                      {displayPhone}
                    </a>
                  )}
                </div>`;

const rep = `                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <Phone size={16} className="shrink-0 text-slate-400" />
                    {isMasked ? (
                      <span>{displayPhone}</span>
                    ) : (
                      <span className="font-bold">{displayPhone}</span>
                    )}
                  </div>
                  
                  {/* Quick Action Buttons for Driver */}
                  {!isMasked && currentUser.role === 'DRIVER' && (
                    <div className="flex items-center gap-2 pl-6">
                      <a 
                        href={\`tel:\${service.customerPhone.replace(/[^0-9+]/g, '')}\`} 
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors border border-blue-100 shadow-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Phone size={14} /> Müşteriyi Ara
                      </a>
                      <a 
                        href={\`https://wa.me/\${service.customerPhone.replace(/[^0-9]/g, '')}?text=\${encodeURIComponent("Merhaba, teslimat için yoldayız. Lütfen konumunuzu paylaşır mısınız?")}\`}
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors border border-emerald-100 shadow-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MessageCircle size={14} /> Konum İste
                      </a>
                    </div>
                  )}
                </div>`;

content = content.replace(target, rep);

fs.writeFileSync('src/components/ServiceCard.tsx', content);
