const fs = require('fs');
let content = fs.readFileSync('src/components/NewServiceForm.tsx', 'utf8');

const oldMethod = `              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className={\`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 transition-shadow cursor-pointer appearance-none \${isAlis ? 'focus:ring-emerald-500 focus:border-emerald-500' : 'focus:ring-indigo-500 focus:border-indigo-500'}\`}
              >`;

const newMethod = `              <select
                value={paymentMethod}
                onChange={e => {
                  const val = e.target.value as PaymentMethod;
                  setPaymentMethod(val);
                  if (val === 'Ücretsiz') {
                    setTotalAmount(0);
                    setCollectionAmount(0);
                  }
                }}
                className={\`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 transition-shadow cursor-pointer appearance-none \${isAlis ? 'focus:ring-emerald-500 focus:border-emerald-500' : 'focus:ring-indigo-500 focus:border-indigo-500'}\`}
              >`;

content = content.replace(oldMethod, newMethod);

const oldTotal = `                <input
                  required
                  type="number"
                  min="0"
                  value={totalAmount || ''}
                  onChange={e => setTotalAmount(Number(e.target.value))}
                  className={\`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 transition-shadow \${isAlis ? 'focus:ring-emerald-500' : 'focus:ring-indigo-500'}\`}
                />`;

const newTotal = `                <input
                  required={paymentMethod !== 'Ücretsiz'}
                  type="number"
                  min="0"
                  value={paymentMethod === 'Ücretsiz' ? 0 : (totalAmount || '')}
                  onChange={e => setTotalAmount(Number(e.target.value))}
                  disabled={paymentMethod === 'Ücretsiz'}
                  className={\`w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 transition-shadow \${
                    paymentMethod === 'Ücretsiz' 
                      ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' 
                      : \`bg-slate-50 border-slate-200 \${isAlis ? 'focus:ring-emerald-500' : 'focus:ring-indigo-500'}\`
                  }\`}
                />`;

const oldCollection = `                <input
                  required
                  type="number"
                  min="0"
                  value={collectionAmount || ''}
                  onChange={e => setCollectionAmount(Number(e.target.value))}
                  className={\`w-full bg-red-50 border border-red-200 text-red-900 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-red-500 transition-shadow\`}
                  placeholder="0"
                />`;

const newCollection = `                <input
                  required={paymentMethod !== 'Ücretsiz'}
                  type="number"
                  min="0"
                  value={paymentMethod === 'Ücretsiz' ? 0 : (collectionAmount || '')}
                  onChange={e => setCollectionAmount(Number(e.target.value))}
                  disabled={paymentMethod === 'Ücretsiz'}
                  className={\`w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 transition-shadow \${
                    paymentMethod === 'Ücretsiz'
                      ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-red-50 border-red-200 text-red-900 focus:ring-red-500'
                  }\`}
                  placeholder="0"
                />`;

content = content.replace(oldTotal, newTotal);
content = content.replace(oldCollection, newCollection);
fs.writeFileSync('src/components/NewServiceForm.tsx', content);
console.log('Patched NewServiceForm.tsx');
