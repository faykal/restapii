const axios = require("axios")
const cheerio = require('cheerio');
 
async function snappinDownload(pinterestUrl) {
  try {
    const { csrfToken, cookies } = await getSnappinToken()
 
    const postRes = await axios.post(
      'https://snappin.app/',
      { url: pinterestUrl },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
          Cookie: cookies,
          Referer: 'https://snappin.app',
          Origin: 'https://snappin.app',
          'User-Agent': 'Mozilla/5.0'
        }
      }
    )
 
    const $ = cheerio.load(postRes.data)
    const thumb = $('img').attr('src')
 
    const downloadLinks = $('a.button.is-success')
      .map((_, el) => $(el).attr('href'))
      .get()
 
    let videoUrl = null
    let imageUrl = null
 
    for (const link of downloadLinks) {
      const fullLink = link.startsWith('http') ? link : 'https://snappin.app' + link
 
      const head = await axios.head(fullLink).catch(() => null)
      const contentType = head?.headers?.['content-type'] || ''
 
      if (link.includes('/download-file/')) {
        if (contentType.includes('video')) {
          videoUrl = fullLink
        } else if (contentType.includes('image')) {
          imageUrl = fullLink
        }
      } else if (link.includes('/download-image/')) {
        imageUrl = fullLink
      }
    }
 
    return {
      thumb,
      video: videoUrl,
      image: videoUrl ? null : imageUrl
    }
 
  } catch (err) {
    return {
      status: false,
      message: err?.response?.data?.message || err.message || 'Unknown Error'
    }
  }
}
 
async function getSnappinToken() {
  const { headers, data } = await axios.get('https://snappin.app/')
  const cookies = headers['set-cookie'].map(c => c.split(';')[0]).join('; ')
  const $ = cheerio.load(data)
  const csrfToken = $('meta[name="csrf-token"]').attr('content')
  return { csrfToken, cookies }
}

module.exports = {
    name: 'Pinterest V2',
    desc: 'Download video/image on pinterest',
    category: 'Downloader',
    params: ['url'],
    async run(req, res) {
        try {
            const { url } = req.query;
            if (!url) return res.status(400).json({ status: false, error: 'Url is required' });
            const result = await snappinDownload(url)
            res.status(200).json({
                status: true,
                data: result
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}
