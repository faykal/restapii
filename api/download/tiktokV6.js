const axios = require("axios")
const cheerio = require('cheerio');

async function TikDownloader(url) {
  try {
    const res = await axios.post('https://tikdownloader.io/api/ajaxSearch', new URLSearchParams({ q: url }), {
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'referer': 'https://tikdownloader.io/id',
        'x-requested-with': 'XMLHttpRequest',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      }
    })

    const $ = cheerio.load(res.data.data)
    
    const title = $('.tik-left .content h3').text().trim()
    const thumbnail = $('.image-tik img').attr('src')

    let downloadsImage = []
    $('.photo-list ul.download-box li').each((i, el) => {
      const url = $(el).find('.download-items__btn a').attr('href')
      if (url) downloadsImage.push({ url })
    })
    if (downloadsImage.length === 0) downloadsImage = null

    let downloadsVideo = []
    $('.tik-button-dl').each((i, el) => {
      downloadsVideo.push({
        quality: $(el).text().replace(/\s+/g, ' ').trim(),
        url: $(el).attr('href')
      })
    })
    if (downloadsVideo.length === 0) downloadsVideo = null

    if (downloadsImage && downloadsImage.length > 0) {
      downloadsVideo = null
    } else if (downloadsVideo && downloadsVideo.length > 0) {
      downloadsImage = null
    }

    return {
      status: true,
      title,
      thumbnail,
      downloadsImage,
      downloadsVideo
    }

  } catch (err) {
    return {
      status: false,
      message: err.message
    }
  }
}

module.exports = {
    name: 'TikTok V6',
    desc: 'Download video/image on tiktok',
    category: 'Downloader',
    params: ['url'],
    async run(req, res) {
        const { url } = req.query;
        if (!url) return res.status(400).json({ status: false, error: 'Url is required' });
        try {
            const results = await TikDownloader(url);
            res.status(200).json({
                status: true,
                data: results
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}