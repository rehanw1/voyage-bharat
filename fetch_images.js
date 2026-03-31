const https = require('https');
const terms = [
  'taj mahal', 'hawa mahal', 'meenakshi temple', 'mysore palace', 'golden temple amritsar', 'qutub minar', 'ajanta caves', 
  'andaman islands', 'jama masjid delhi', 'royal bengal tiger', 'hampi ruins', 'chadar trek', 'varanasi ghats', 
  'old delhi food', 'living root bridges meghalaya', 'ziro valley', 'majuli island', 'chembra peak', 
  'pashmina weaving', 'blue pottery jaipur', 'madhubani painting', 'kanchipuram silk', 'dhokra art', 'chikankari embroidery', 
  'diwali festival', 'holi festival', 'pushkar camel fair', 'durga puja festival', 'ganesh chaturthi festival', 
  'kumbh mela', 'hornbill festival nagaland', 'goa carnival', 'rann utsav'
];

async function search(term) {
  return new Promise((resolve) => {
    const req = https.get(`https://unsplash.com/napi/search/photos?query=${encodeURIComponent(term)}&per_page=1`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.results && json.results.length > 0) {
            resolve({ term, url: json.results[0].urls.raw });
          } else {
            resolve({ term, url: 'NOT_FOUND' });
          }
        } catch (e) {
          resolve({ term, url: 'ERROR' });
        }
      });
    });
    req.on('error', () => resolve({ term, url: 'REQ_ERROR' }));
  });
}

async function run() {
  for (const term of terms) {
    const res = await search(term);
    console.log(`${res.term} | ${res.url}`);
  }
}
run();
