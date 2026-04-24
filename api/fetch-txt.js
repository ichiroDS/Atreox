const https = require('https');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    return res.status(400).send('Invalid file ID');
  }

  try {
    const text = await gdFetch(`https://drive.google.com/uc?export=download&id=${id}`);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(text);
  } catch (err) {
    console.error('fetch-txt error:', err.message);
    res.status(500).send('Could not fetch file');
  }
};

function gdFetch(url, depth = 0) {
  if (depth > 6) return Promise.reject(new Error('Too many redirects'));
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, response => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume();
        gdFetch(response.headers.location, depth + 1).then(resolve).catch(reject);
        return;
      }
      let body = '';
      response.on('data', chunk => (body += chunk));
      response.on('end', () => resolve(body));
    }).on('error', reject);
  });
}
