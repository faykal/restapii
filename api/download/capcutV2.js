const axios = require('axios');

const Ponta3Bic = async (url) => {
  try {
    const response = await axios.post('https://3bic.com/api/download', {
      url: url
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        'Origin': 'https://3bic.com',
        'Referer': 'https://3bic.com/id',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
      }
    })

    const res = response.data
    if (res.code !== 200) throw new Error('Gagal ambil data 😥')

    return {
      title: res.title,
      video: 'https://3bic.com' + res.originalVideoUrl,
      thumbnail: res.coverUrl,
      author: res.authorName
    }
  } catch (err) {
    console.error('Error scraping:', err.message)
    return null
  }
}

module.exports = {
    name: 'Capcut V2',
    desc: 'Download on capcut',
    category: 'Downloader',
    params: ['url'],
    async run(req, res) {
        const { url } = req.query;
        if (!url) return res.status(400).json({ status: false, error: 'Url is required' });
        try {
            const results = await Ponta3Bic(url);
            res.status(200).json({
                status: true,
                data: results
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}