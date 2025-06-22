const axios = require("axios")
const cheerio = require('cheerio');

const scrapeSavetik = async (tiktokUrl) => {
  try {
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Origin': 'https://savetik.co',
      'Referer': 'https://savetik.co/id/tiktok-mp3-downloader',
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64)',
      'X-Requested-With': 'XMLHttpRequest'
    }

    const data = new URLSearchParams()
    data.append('q', tiktokUrl)
    data.append('lang', 'id')

    const res = await axios.post('https://savetik.co/api/ajaxSearch', data, { headers })
    const $ = cheerio.load(res.data.data)

    const title = $('h3').text()
    const thumbnail = $('.thumbnail img').attr('src')
    const buttons = $('a.tik-button-dl')
    const results = {}

    // Deteksi apakah ini video atau photo
    const isPhoto = $('.photo-list .download-items__btn a').length > 0

    if (isPhoto) {
      const images = []
      $('.photo-list .download-items__btn a').each((_, el) => {
        const link = $(el).attr('href')
        if (link) images.push(link)
      })
      const audio = $('a').filter((_, el) => $(el).text().includes('Unduh MP3')).attr('href') || ''
      return {
        type: 'photo',
        title,
        thumbnail,
        audio,
        images
      }
    } else {
      buttons.each((_, el) => {
        const text = $(el).text().toLowerCase()
        const href = $(el).attr('href')
        if (text.includes('mp3')) results.mp3 = href
        else if (text.includes('hd')) results.video_hd = href
        else if (text.includes('mp4')) results.video_sd = href
      })
      return {
        type: 'video',
        title,
        thumbnail,
        ...results
      }
    }
  } catch (err) {
    console.error('❌ Gagal scraping:', err.message)
    return null
  }
}

module.exports = {
    name: 'TikTok V4',
    desc: 'Download video/image on tiktok',
    category: 'Downloader',
    params: ['url'],
    async run(req, res) {
        const { url } = req.query;
        if (!url) return res.status(400).json({ status: false, error: 'Url is required' });
        try {
            const results = await scrapeSavetik(url);
            res.status(200).json({
                status: true,
                data: results
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}