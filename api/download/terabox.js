const axios = require('axios');
 
async function Terabox(link) {
  try {
    if (!/^https:\/\/(1024)?terabox\.com\/s\//.test(link)) {
      return { error: '❌ Link tidak valid! Harus dari terabox.com atau 1024terabox.com' }
    }
 
    const res = await axios.post('https://teraboxdownloader.online/api.php',
      { url: link },
      {
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://teraboxdownloader.online',
          'Referer': 'https://teraboxdownloader.online/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Accept': '*/*'
        }
      }
    )
 
    const data = res.data
    if (!data?.direct_link) {
      return { error: '❌ Tidak ada link download ditemukan.', debug: data }
    }
 
    return {
      file_name: data.file_name,
      size: data.size,
      size_bytes: data.sizebytes,
      direct_link: data.direct_link,
      thumb: data.thumb
    }
 
  } catch (err) {
    return { error: '❌ Gagal mengakses web.', detail: err.message }
  }
}

module.exports = {
    name: 'Terabox',
    desc: 'Download on terabox',
    category: 'Downloader',
    params: ['url'],
    async run(req, res) {
        const { url } = req.query;
        if (!url) return res.status(400).json({ status: false, error: 'Url is required' });
        
        try {
            const results = await Terabox(url);
            res.status(200).json({
                status: true,
                data: results
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}