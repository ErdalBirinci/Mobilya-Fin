const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000');
  
  // Login
  await page.type('input[name="email"]', 'admin@mobilya.com');
  await page.type('input[name="password"]', 'password');
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation()
  ]);
  
  // wait a bit
  await new Promise(r => setTimeout(r, 1000));
  
  // Go to add service
  const btn = await page.$x('//button[contains(., "Yeni Servis Ekle")]');
  await btn[0].click();
  
  // Fill form
  await page.waitForSelector('input[type="text"]');
  const inputs = await page.$$('input[type="text"]');
  await inputs[0].type('Test Customer');
  
  const textareas = await page.$$('textarea');
  await textareas[0].type('Test Address');
  
  const addBtn = await page.$x('//button[contains(., "Servis Ekle")]');
  await addBtn[0].click();
  
  await new Promise(r => setTimeout(r, 2000));
  
  // Check if added
  const text = await page.$eval('body', el => el.innerText);
  console.log("Is Test Customer visible?", text.includes('Test Customer'));
  
  await browser.close();
})();
