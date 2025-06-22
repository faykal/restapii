const axios = require('axios');
 
const downloadFromThreads = async (threadsUrl) => {
  const api = 'https://api.threadsphotodownloader.com/v2/media';
 
  try {
    const response = await axios.get(api, {
      params: { url: threadsUrl },
      headers: {
        'Origin': 'https://sssthreads.pro',
        'Referer': 'https://sssthreads.pro/',
        'User-Agent': 'Mozilla/5.0',
      }
    });
 
    const { video_urls = [], image_urls = [] } = response.data;
 
    if (video_urls.length === 0 && image_urls.length === 0) {
      console.log('ga ada media, senpai!');
      return;
    }
 
    for (const item of video_urls) {
      console.log(`Video tersedia: ${item.download_url}`);
    }
 
    for (const url of image_urls) {
      console.log(`Gambar tersedia: ${url}`);
    }
 
  } catch (err) {
    console.error(`A-ano... terjadi kesalahan saat memproses, senpai: ${err.message}`);
  }
};

module.exports = {
    name: 'Threads V2',
    desc: 'Download video/image on threads',
    category: 'Downloader',
    params: ['url'],
    async run(req, res) {
        const { url } = req.query;
        if (!url) return res.status(400).json({ status: false, error: 'Url is required' });
        
        try {
            const results = await downloadFromThreads(url);
            res.status(200).json({
                status: true,
                data: results
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}