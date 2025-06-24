const axios = require("axios");
const cheerio = require("cheerio");
 
export async function stalkIg(username) {
  const url = `https://socialstats.info/report/${username}/instagram`
 
  const { data, request } = await axios.get(url, {
    maxRedirects: 5,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Referer': 'https://socialstats.info/',
      'Connection': 'keep-alive'
    }
  })
 
  const $ = cheerio.load(data)
 
  const title = $('title').text()
  if (!title.toLowerCase().includes(username.toLowerCase())) {
    throw new Error('ga ada respon!')
  }
 
  const name = $('h1').first().text().trim()
  const usernameText = $('a[href^="https://instagram.com/"]').first().text().trim()
  const profileUrl = $('a[href^="https://instagram.com/"]').first().attr('href')
  const avatar = $('.instagram-avatar').attr('src')
 
  const reportNumbers = $('.report-header-number').toArray().map(el => $(el).text().trim())
  const followers = reportNumbers[0] || ''
  const uploads = reportNumbers[1] || ''
  const engagement = reportNumbers[2] || ''
 
  return {
    username: usernameText,
    name,
    profileUrl,
    avatar,
    followers,
    uploads,
    engagement
  }
}

module.exports = {
    name: 'Instagram V3',
    desc: 'Get info instagram account',
    category: 'Stalk',
    params: ['user'],
    async run(req, res) {
      const { user } = req.query;
      if (!user) return res.status(400).json({ status: false, error: 'User is required' })
        try {
            const { user } = req.query;
            if (!user) return res.status(400).json({ status: false, error: 'User is required' })
            const anu = await stalkIg(user); 
            res.status(200).json({
                status: true,
                data: anu
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}