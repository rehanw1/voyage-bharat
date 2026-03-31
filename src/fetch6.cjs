const https = require('https');

const terms = [
  'Gurez'
];

async function getWikiImage(title) {
  return new Promise((resolve) => {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=800`;
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query.pages;
          const pageId = Object.keys(pages)[0];
          if (pageId !== '-1' && pages[pageId].thumbnail) {
            resolve({ title, url: pages[pageId].thumbnail.source });
          } else {
            resolve({ title, url: 'NOT_FOUND' });
          }
        } catch (e) {
          resolve({ title, url: 'ERROR' });
        }
      });
    }).on('error', () => resolve({ title, url: 'REQ_ERROR' }));
  });
}

async function run() {
  for (const term of terms) {
    const res = await getWikiImage(term);
    console.log(`${res.title} | ${res.url}`);
  }
}
run();
