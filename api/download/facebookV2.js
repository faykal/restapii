const axios = require('axios');
 
async function Kithubs(fbUrl) {
  try {
    const res = await axios.post(
      'https://kithubs.com/api/video/facebook/download',
      { url: fbUrl },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0',
          'Accept': '*/*',
          'Referer': 'https://kithubs.com/facebook-video-downloader'
        }
      }
    )
 
    const { sd_url, hd_url, title } = res.data.data || {}
 
    if (!sd_url && !hd_url) {
      return { error: '❌ Tidak ada link video ditemukan.' }
    }
 
    return {
      title: title || 'Tanpa Judul',
      sd: sd_url || null,
      hd: hd_url || null
    }
 
  } catch (err) {
    return {
      error: '❌ Gagal menghubungi server.',
      detail: err.response?.data || err.message
    }
  }
}


module.exports = {
    name: 'Facebook V2',
    desc: 'Download on facebook',
    category: 'Downloader',
    params: ['url'],
    async run(req, res) {
        const { url } = req.query;
            if (!url) {
                return res.status(400).json({ status: false, error: 'Url is required' });
            }
        try {
            const results = await Kithubs(url);
            res.status(200).json({
                status: true,
                data: results
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}