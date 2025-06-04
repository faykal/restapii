const axios = require('axios');
 
async function threads(url) {
  if (!url) throw new Error('URL kosong!');
 
  const apiUrl = `https://api.threadsphotodownloader.com/v2/media?url=${encodeURIComponent(url)}`;
  const { data } = await axios.get(apiUrl, {
    headers: {
      'User-Agent': '5.0'
    }
  });
 
  return {
    image_urls: data.image_urls || [],
    video_urls: data.video_urls || []
  };
}

module.exports = {
    name: 'Threads',
    desc: 'Download video/image on threads',
    category: 'Downloader',
    params: ['url'],
    async run(req, res) {
        const { url } = req.query;
        if (!url) return res.status(400).json({ status: false, error: 'Url is required' });
        
        try {
            const results = await threads(url);
            res.status(200).json({
                status: true,
                data: results
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}