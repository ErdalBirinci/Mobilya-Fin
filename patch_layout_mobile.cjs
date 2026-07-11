const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

const target = `              {showNotifications && (
                <div className="absolute top-full right-0 mt-2 z-50 w-[360px]">
                  <NotificationPanel onClose={() => setShowNotifications(false)} />
                </div>
              )}`;

const rep = `              {showNotifications && (
                <div className="absolute top-full right-[-60px] sm:right-0 mt-2 z-50 w-[320px] sm:w-[360px]">
                  <NotificationPanel onClose={() => setShowNotifications(false)} />
                </div>
              )}`;
content = content.replace(target, rep);

fs.writeFileSync('src/components/Layout.tsx', content);
