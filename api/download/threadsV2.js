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
      throw new Error('Tidak ada media yang tersedia');
    }

    const results = [];
    for (const item of video_urls) {
      results.push({ type: 'video', url: item.download_url });
    }
    for (const url of image_urls) {
      results.push({ type: 'image', url });
    }

    return results;
  } catch (err) {
    throw new Error(`Terjadi kesalahan saat memproses: ${err.message}`);
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
      res.status(200).json({ status: true, data: results });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  }
};
