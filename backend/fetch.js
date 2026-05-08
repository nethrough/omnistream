const axios = require('axios');
const fs = require('fs');
axios.get('https://www.imdb.com/find/?q=batman&s=tt', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9'
  }
}).then(r => fs.writeFileSync('imdb.html', r.data)).catch(console.error);
