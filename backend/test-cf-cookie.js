const puppeteer = require('puppeteer');
const axios = require('axios');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  let streamUrl = null;
  await page.setRequestInterception(true);
  
  page.on('request', req => {
    if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) req.abort();
    else req.continue();
  });

  page.on('response', res => {
    const url = res.url();
    if (url.includes('.m3u8')) streamUrl = url;
  });

  await page.goto('https://www.playimdb.com/title/tt0133093/', { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(e => {});
  
  // Wait a bit for stream
  await new Promise(r => setTimeout(r, 3000));
  
  const cookies = await page.cookies();
  const cookieStr = cookies.map(c => `${c.name}=${c.value}`).join('; ');
  console.log('Stream URL:', streamUrl);
  console.log('Cookie String length:', cookieStr.length);
  
  if (streamUrl) {
    try {
      const res = await axios.get(streamUrl, {
        headers: {
          'User-Agent': await browser.userAgent(),
          'Referer': 'https://www.playimdb.com/',
          'Cookie': cookieStr
        }
      });
      console.log('AXIOS FETCH SUCCESS! Content length:', res.data.length);
    } catch (e) {
      console.error('AXIOS FETCH FAILED:', e.response ? e.response.status : e.message);
    }
  }
  
  await browser.close();
})();
