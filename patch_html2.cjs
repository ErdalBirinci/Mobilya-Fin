const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const swScript = `    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('SW registered: ', registration);
          }).catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
          });
          
          let refreshing = false;
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
              refreshing = true;
              window.location.reload();
            }
          });
        });
      }
    </script>`;

const newSwScript = `    <script>
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
          for(let registration of registrations) {
            registration.unregister();
          }
        });
      }
      if (window.caches) {
        caches.keys().then(function(names) {
          for (let name of names) {
            caches.delete(name);
          }
        });
      }
    </script>`;

if (html.includes(swScript)) {
  html = html.replace(swScript, newSwScript);
} else {
  // Try to find any service worker script and replace it
  html = html.replace(/<script>\s*if \('serviceWorker' in navigator\) \{[\s\S]*?<\/script>/, newSwScript);
}

// Add a cache buster parameter to main.tsx
html = html.replace(/\/src\/main\.tsx/g, '/src/main.tsx?t=' + Date.now());

fs.writeFileSync('index.html', html);
console.log('Patched index.html to unregister SW and clear cache');
