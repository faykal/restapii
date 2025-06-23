const axios = require('axios');
const cheerio = require('cheerio');
 
function extractVideoId(url) {
  const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/)
  return match ? match[1] : null
}
 
async function ytmp3(url) {
  if (!url) throw 'Masukkan URL YouTube!'
 
  try {
    const form = new URLSearchParams()
    form.append('q', url)
    form.append('type', 'mp3')
 
    const res = await axios.post('https://yt1s.click/search', form.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://yt1s.click',
        'Referer': 'https://yt1s.click/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    })
 
    const $ = cheerio.load(res.data)
    const link = $('a[href*="download"]').attr('href')
 
    if (link) {
      return {
        link,
        title: $('title').text().trim() || 'Unknown Title',
        filesize: null,
        duration: null,
        success: true
      }
    }
  } catch (e) {
    console.warn('Gagal:', e.message || e.toString())
  }
 
  try {
    const videoId = extractVideoId(url)
    if (!videoId) throw 'Video ID tidak valid'
 
    const payload = {
      fileType: 'MP3',
      id: videoId
    }
 
    const res = await axios.post('https://ht.flvto.online/converter', payload, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://ht.flvto.online',
        'Referer': `https://ht.flvto.online/widget?url=https://www.youtube.com/watch?v=${videoId}`,
        'User-Agent': 'Mozilla/5.0 (Linux; Android 13)',
      },
    })
 
    const data = res?.data
    if (!data || typeof data !== 'object') {
      throw 'ga ada respon'
    }
 
    if (data.status !== 'ok' || !data.link) {
      throw `Status gagal: ${data.msg || 'Tidak diketahui'}`
    }
 
    return {
      link: data.link,
      title: data.title,
      filesize: data.filesize,
      duration: data.duration,
      success: true
    }
 
  } catch (e) {
    console.warn('Gagal:', e.message || e.toString())
  }
 
  throw 'ga ada link download.'
}

module.exports = {
    name: 'YouTube Audio',
    desc: 'Audio download',
    category: 'Downloader',
    params: ['url'],
    async run(req, res) {
        const { url } = req.query;
        if (!url) return res.status(400).json({ status: false, error: 'Url is required' });
        try {
            const fay = await ytmp3(url)
            res.status(200).json({
                status: true,
                data: fay
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}
