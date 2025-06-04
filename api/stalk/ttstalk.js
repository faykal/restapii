const axios = require('axios');
const cheerio = require('cheerio');

async function tiktokStalk(username) {
    try {
        const response = await axios.get(`https://www.tiktok.com/@${username}?_t=ZS-8tHANz7ieoS&_r=1`);
        const html = response.data;
        const $ = cheerio.load(html);
        const scriptData = $('#__UNIVERSAL_DATA_FOR_REHYDRATION__').html();
        if (!scriptData) {
            throw new Error('User tidak ditemukan');
        }
        const parsedData = JSON.parse(scriptData);
        const userDetail = parsedData.__DEFAULT_SCOPE__?.['webapp.user-detail'];
        if (!userDetail || !userDetail.userInfo) {
            throw new Error('User tidak ditemukan');
        }
        return {
            creator: global.creator,
            status: true,
            data: userDetail.userInfo
        };
    } catch (error) {
        return {
            creator: global.creator,
            status: false,
            message: error.message || 'Terjadi kesalahan'
        };
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
            res.status(200).json({
                status: true,
                data: anu.data
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}
