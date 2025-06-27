const axios = require("axios")
 
async function expandlink(url) {
  try {
    const res = await axios.get(url); 
    return res.request.res.responseUrl || url;
  } catch {
    return url; 
  }
}
 
async function tiktokdl(tiktokUrl) {
  const expandedUrl = await expandlink(tiktokUrl);
 
  const t = Date.now();
  const r = Math.random().toString(36).substring(2, 18);
  const prefix = Buffer.from('tiktokio.com').toString('base64');
  const payload = `prefix=${prefix}&vid=${encodeURIComponent(expandedUrl)}`;
 
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'hx-request': 'true',
    'hx-current-url': 'https://tiktokio.com/id/',
    'referer': 'https://tiktokio.com/id/',
    'origin': 'https://tiktokio.com',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  };
 
  const { data: html } = await axios.post(
    `https://tiktokio.com/api/v1/tk-htmx?t=${t}&r=${r}`,
    payload,
    { headers }
  );
 
  const titleMatch = html.match(/<h2 id="tk-search-h2">(.*?)<\/h2>/);
  const title = titleMatch ? titleMatch[1].trim() : 'Tanpa Judul';
 
  const linkMatches = [...html.matchAll(/<a[^>]+href="(https:\/\/dl\.tiktokio\.com\/download\?token=[^"]+)"[^>]*>(.*?)<\/a>/g)];
  const results = linkMatches.map(([_, href, label]) => ({
    href,
    text: label.replace(/<\/?[^>]+(>|$)/g, '').trim()
  }));
 
  if (!results.length) throw new Error('ga ada result');
 
  return {
    metadata: { title },
    results
  };
}

module.exports = {
    name: 'TikTok V5',
    desc: 'Download on tiktok',
    category: 'Downloader',
    params: ['url'],
    async run(req, res) {
        const { url } = req.query;
        if (!url) return res.status(400).json({ status: false, error: 'Url is required' });
        try {
            const results = await tiktokdl(url);
            res.status(200).json({
                status: true,
                data: results
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}