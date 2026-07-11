const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('LOG:', msg.text()));
  
  await page.goto('http://localhost:3000');
  
  // Try to bypass UI and inject via window if possible, but React hides it.
  // Instead, let's type properly.
  await page.type('input[name="email"]', 'admin@mobilya.com');
  await page.type('input[name="password"]', 'password');
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation()
  ]);
  
  // Wait for the new service button
  await page.waitForFunction(() => {
    return Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('Yeni Servis Ekle'));
  });
  
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Yeni Servis Ekle'));
    btn.click();
  });
  
  // Wait for the form to appear
  await page.waitForSelector('input[type="text"]');
  
  await page.evaluate(() => {
    const nameInput = document.querySelectorAll('input[type="text"]')[0];
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    nativeInputValueSetter.call(nameInput, 'Test Customer');
    nameInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Fill required fields
    const phoneInput = document.querySelector('input[type="tel"]');
    nativeInputValueSetter.call(phoneInput, '555-1234');
    phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    // timeRange is text type
    const timeInput = document.querySelectorAll('input[type="text"]')[1];
    nativeInputValueSetter.call(timeInput, '10:00-12:00');
    timeInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    // address is textarea
    const addressInput = document.querySelector('textarea');
    const nativeTextareaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
    nativeTextareaValueSetter.call(addressInput, 'Test Address');
    addressInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    // totalAmount and collectionAmount are number
    const numberInputs = document.querySelectorAll('input[type="number"]');
    nativeInputValueSetter.call(numberInputs[0], '100');
    numberInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
    nativeInputValueSetter.call(numberInputs[1], '100');
    numberInputs[1].dispatchEvent(new Event('input', { bubbles: true }));
    
    // click submit
    const addBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Servis Ekle'));
    addBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  const html = await page.content();
  console.log("Includes Test Customer?", html.includes('Test Customer'));
  
  await browser.close();
})();
