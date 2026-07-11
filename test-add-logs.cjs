const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  // Login
  await page.type('input[name="email"]', 'admin@mobilya.com');
  await page.type('input[name="password"]', 'password');
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle0' })
  ]);
  
  await page.waitForSelector('button:has-text("Yeni Servis Ekle")');
  await page.click('button:has-text("Yeni Servis Ekle")');
  
  await page.waitForSelector('input[type="text"]');
  const inputs = await page.$$('input[type="text"]');
  await inputs[0].type('Test Name');
  
  const textareas = await page.$$('textarea');
  await textareas[0].type('Test Address');
  
  await page.type('input[type="date"]', '2026-07-10');
  
  await page.click('button:has-text("Servis Ekle")');
  
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();
