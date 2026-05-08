const { parseImdbHtml } = require('./src/services/imdbSearchService');

const mockHtml = `
<html>
<body>
  <ul class="ipc-metadata-list">
    <li>
      <a class="ipc-metadata-list-summary-item__t" href="/title/tt0145487/?ref_=fn_tt_tt_1">Spider-Man</a>
      <ul class="ipc-metadata-list-summary-item__tl">
        <li class="ipc-metadata-list-summary-item__li">2002</li>
        <li class="ipc-metadata-list-summary-item__li">Movie</li>
      </ul>
      <img class="ipc-image" src="https://m.media-amazon.com/images/M/spider.jpg" />
    </li>
    <li>
      <a class="ipc-metadata-list-summary-item__t" href="/title/tt0212671/?ref_=fn_tt_tt_2">Spider-Man: The Animated Series</a>
      <ul class="ipc-metadata-list-summary-item__tl">
        <li class="ipc-metadata-list-summary-item__li">1994-1998</li>
        <li class="ipc-metadata-list-summary-item__li">TV Series</li>
      </ul>
      <img class="ipc-image" src="https://m.media-amazon.com/images/M/spider_tv.jpg" />
    </li>
  </ul>
</body>
</html>
`;

console.log(JSON.stringify(parseImdbHtml(mockHtml), null, 2));
