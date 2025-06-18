const cheerio = require('cheerio');

async function getYouTubeProfile(username) {
  const res = await fetch(`https://m.youtube.com/${username.startsWith('@') ? username : '@' + username}`, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const html = await res.text();
  const $ = cheerio.load(html);
  const name = $('meta[property="og:title"]').attr('content') || '';
  const description = $('meta[property="og:description"]').attr('content') || '';
  const image = $('meta[property="og:image"]').attr('content') || '';
  const url = $('link[rel="canonical"]').attr('href') || '';
  const bannerMatch = html.match(/https:\/\/yt3\.googleusercontent\.com\/[^\s"']+?=w\d+-fcrop64=[^"']+/i);
  const banner = bannerMatch ? bannerMatch[0] : '';
  const subsMatch = html.match(/(\d[\d.,]*)\s+subscribers/i);
  let subscribers = subsMatch ? subsMatch[1] : null;
  
  if (!subscribers) {
    const altRes = await fetch(`https://www.youtube.com/${username.startsWith('@') ? username : '@' + username}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const altHtml = await altRes.text();
    const altMatch = altHtml.match(/"text"\s*:\s*\{\s*"content"\s*:\s*"(\d[\d.,]*[MK]?)\s*subscribers"/);
    subscribers = altMatch ? altMatch[1] : null;
  }

  const videoMatches = [...html.matchAll(/\/watch\?v=([a-zA-Z0-9_-]{11})/g)];
  const videoSet = new Set();
  const videos = [];
  for (const match of videoMatches) {
    const videoId = match[1];
    if (!videoSet.has(videoId)) {
      videoSet.add(videoId);
      videos.push(`https://www.youtube.com/watch?v=${videoId}`);
      if (videos.length === 5) break;
    }
  }
  const idMatch = url.match(/\/channel\/(UC[\w-]+)/);
  const channelId = idMatch ? idMatch[1] : null;
  return {
    name,
    username,
    description,
    image,
    banner,
    subscribers,
    url,
    channelId,
    videos
  };
}

module.exports = {
    name: 'YouTube',
    desc: 'Get info youtube account',
    category: 'Stalk',
    params: ['@user'],
    async run(req, res) {
      const { user } = req.query;
      if (!user) return res.status(400).json({ status: false, error: 'User is required' })
        try {
            const anu = await getYouTubeProfile(user);  
            res.status(200).json({
                status: true,
                data: anu
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}