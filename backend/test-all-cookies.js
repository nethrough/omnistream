const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  await page.setRequestInterception(true);
  page.on('request', req => {
    if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) req.abort();
    else req.continue();
  });

  await page.goto('https://streamimdb.ru/embed/movie/tt0133093', { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(e => {});
  
  await new Promise(r => setTimeout(r, 4000));
  
  // Method 1: standard cookies
  const standardCookies = await page.cookies();
  console.log('Standard cookies domains:', [...new Set(standardCookies.map(c => c.domain))]);
  
  // Method 2: all cookies via CDP
  const client = await page.target().createCDPSession();
  const { cookies: allCookies } = await client.send('Network.getAllCookies');
  console.log('All cookies domains:', [...new Set(allCookies.map(c => c.domain))]);
  
  const targetCookies = allCookies.filter(c => c.domain.includes('strategicgrowthpartners.site') || c.domain.includes('nextgenmarketinghub.site'));
  console.log('Target CDN Cookies:', targetCookies.map(c => c.name));
  
  await browser.close();
})();
