const { getBrowserInstance, closeBrowser } = require('./src/services/browser/browserManager');
const cheerio = require('cheerio');

(async () => {
  const browser = await getBrowserInstance();
  const page = await browser.newPage();
  await page.goto('https://www.imdb.com/find/?q=The%20Matrix&s=tt', { waitUntil: 'domcontentloaded', timeout: 15000 });
  const html = await page.content();
  console.log('HTML SNIPPET:', html.substring(0, 1000));
  
  const $ = cheerio.load(html);
  console.log('ipc-metadata-list li count:', $('.ipc-metadata-list li').length);
  console.log('findResult count:', $('.findResult').length);
  console.log('any li count:', $('li').length);
  
  await closeBrowser();
})();
