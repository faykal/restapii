const axios = require("axios")
const cheerio = require('cheerio');

const scrapeSaveTwitter = async (twitterUrl) => {
  try {
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Origin': 'https://savetwitter.net',
      'Referer': 'https://savetwitter.net/id',
      'User-Agent': 'Mozilla/5.0',
      'X-Requested-With': 'XMLHttpRequest'
    }

    const form = new URLSearchParams()
    form.append('q', twitterUrl)
    form.append('lang', 'id')

    const res = await axios.post('https://savetwitter.net/api/ajaxSearch', form, { headers })
    const html = res.data.data
    const $ = cheerio.load(html)

    const result = {
      thumbnail: $('img').first().attr('src'),
      videos: [],
      images: []
    }

    $('a').each((_, el) => {
      const href = $(el).attr('href')
      const text = $(el).text().toLowerCase()
      if (!href || href === '#') return

      if (text.includes('mp4') || href.includes('.mp4')) {
        result.videos.push({
          quality: text.match(/(\d{3,4}p)/)?.[1] || 'unknown',
          url: href
        })
      }

      if (/\/get\?token=/.test(href) && !href.includes('.mp4')) {
        result.images.push(href)
      }
    })

    if (result.videos.length > 0) {
      result.images = []
    }

    return result
  } catch (err) {
    console.error('error', err.message)
    return null
  }
}

module.exports = {
    name: 'Twitter',
    desc: 'Download video/image on twitter',
    category: 'Downloader',
    params: ['url'],
    async run(req, res) {
        try {
            const { url } = req.query;
            if (!url) return res.status(400).json({ status: false, error: 'Url is required' });
            const fay = await scrapeSaveTwitter(url)
            res.status(200).json({
                status: true,
                data: fay
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}
