const axios = require("axios")
const cheerio = require('cheerio');
 
async function SnapTok(tiktokUrl) {
  if (!/^https:\/\/(vt|www)\.tiktok\.com/.test(tiktokUrl)) {
    return { error: '❌ Link TikTok tidak valid, senpai!' }
  }
 
  try {
    const res = await axios.post('https://snap-tok.com/api/download', {
      id: tiktokUrl,
      locale: 'id'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0',
        'Origin': 'https://snap-tok.com',
        'Referer': 'https://snap-tok.com/tiktok-downloader'
      }
    })
 
    const $ = cheerio.load(res.data)
 
    const videoUrl = $('a[href*="tikcdn.io"]').first().attr('href')
    const username = $('h2').first().text().trim() || 'Tidak diketahui'
    const caption = $('p.maintext, div.text-gray-500').first().text().trim() || 'Tanpa deskripsi'
 
    if (!videoUrl) {
      return { error: '❌ Video tidak ditemukan, mungkin private atau SnapTok sedang error, senpai 😢' }
    }
 
    return {
      username,
      caption,
      videoUrl
    }
 
  } catch (err) {
    console.error('Hmm, error senpai:(', err.message)
    return { error: '❌ Gagal mengambil data dari SnapTok, senpai! 😓' }
  }
}

module.exports = {
    name: 'TikTok V3',
    desc: 'Download video on tiktok',
    category: 'Downloader',
    params: ['url'],
    async run(req, res) {
        const { url } = req.query;
        if (!url) return res.status(400).json({ status: false, error: 'Url is required' });
        try {
            const results = await SnapTok(url);
            res.status(200).json({
                status: true,
                data: results
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}