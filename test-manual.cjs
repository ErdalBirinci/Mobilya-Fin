const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('LOG:', msg.text()));
  
  await page.goto('http://localhost:3000');
  await page.type('input[name="email"]', 'admin@mobilya.com');
  await page.type('input[name="password"]', 'password');
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation()
  ]);
  
  await page.waitForSelector('span');
  
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('span')).find(s => s.textContent.includes('Yeni Servis Ekle')).closest('button');
    btn.click();
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  await page.evaluate(() => {
    const inputs = document.querySelectorAll('input[type="text"]');
    inputs[0].value = 'Test Customer'; // name
    // React relies on the input event but we need native value setter workaround:
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    nativeInputValueSetter.call(inputs[0], 'Test Customer');
    inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
    
    const textareas = document.querySelectorAll('textarea');
    const nativeTextareaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
    nativeTextareaValueSetter.call(textareas[0], 'Test Address');
    textareas[0].dispatchEvent(new Event('input', { bubbles: true }));
    
    const btn = Array.from(document.querySelectorAll('span')).find(s => s.textContent.includes('Servis Ekle')).closest('button');
    btn.click();
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  const html = await page.content();
  console.log("Includes Test Customer?", html.includes('Test Customer'));
  
  await browser.close();
})();
