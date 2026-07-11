const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  await page.type('input[name="email"]', 'admin@mobilya.com');
  await page.type('input[name="password"]', 'password');
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle0' })
  ]);
  
  const html = await page.content();
  const hasButton = html.includes('Yeni Servis Ekle');
  console.log("Has button:", hasButton);
  
  await browser.close();
})();
