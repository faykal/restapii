const cheerio = require('cheerio');
const fetch = require('node-fetch')

async function tiktokStalk(user) {
  try {
    const url = await fetch(`https://tiktok.com/@${user}`, {
      headers: {
        'User-Agent': 'PostmanRuntime/7.32.2'
      }
    });
    const html = await url.text();
    const $ = cheerio.load(html);
    const data = $('#__UNIVERSAL_DATA_FOR_REHYDRATION__').text();
    const result = JSON.parse(data);
    if (result['__DEFAULT_SCOPE__']['webapp.user-detail'].statusCode !== 0) {
      const ress = {
        status: 'error',
        message: 'User not found!',
      };
      console.log(ress);
      return ress;
    }
    const res = result['__DEFAULT_SCOPE__']['webapp.user-detail']['userInfo'];
    return res;
  } catch (err) {
    console.log(err);
    return String(err);
  }
}

module.exports = {
    name: 'TikTok',
    desc: 'Get info tiktok account',
    category: 'Stalk',
    params: ['user'],
    async run(req, res) {
      const { user } = req.query;
      if (!user) return res.status(400).json({ status: false, error: 'User is required' })
        try {
            let anu = await tiktokStalk(user);  
            anu.user.heart = anu.stats.heart
            anu.user.followerCount = anu.stats.followerCount
            anu.user.followingCount = anu.stats.followingCount
            res.status(200).json({
                status: true,
                result: anu.user
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}