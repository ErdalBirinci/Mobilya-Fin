const fs = require('fs');
const file = 'src/components/RouteMap.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `const iconHtml = \`
                <div style="
                  background-color: \${marker.status === 'Tamamlandı' ? '#10b981' : (marker.status === 'Yolda' ? '#f59e0b' : '#6366f1')};
                  color: white;
                  border: 2px solid white;
                  border-radius: 50%;
                  width: 24px;
                  height: 24px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: bold;
                  font-size: 12px;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                ">
                  \${marker.order}
                </div>
              \`;`;

const replacement = `const isCompleted = marker.status === 'Tamamlandı';
              const bgColor = isCompleted ? '#64748b' : (marker.type === 'ALIS' ? '#10b981' : '#3b82f6'); // Completed: Slate, Alis: Emerald, Satis: Blue
              const iconHtml = \`
                <div style="
                  background-color: \${bgColor};
                  color: white;
                  border: 2px solid white;
                  border-radius: 50%;
                  width: 24px;
                  height: 24px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: bold;
                  font-size: 12px;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                  opacity: \${isCompleted ? '0.7' : '1'};
                ">
                  \${marker.order}
                </div>
              \`;`;

if(content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(file, content);
    console.log('Patched correctly');
} else {
    console.log('Target not found in content!');
}
