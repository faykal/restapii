const axios = require('axios');

async function searchInstagramUser(user) {
  const username = user.startsWith('@') ? user : '@' + user;

  const response = await axios.post(
    'https://api.app.iqhashtags.com/shadowban/preview',
    { username },
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 9; CPH1923 Build/PPR1.180610.011) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.7103.87 Mobile Safari/537.36',
        'Accept-Encoding': 'application/json',
        'sec-ch-ua-platform': '"Android"',
        'sec-ch-ua': '"Chromium";v="136", "Android WebView";v="136", "Not.A/Brand";v="99"',
        'sec-ch-ua-mobile': '?1',
        'x-client-view': `/preview?profile=${username.replace('@', '')}&referrer=webstagram`,
        'x-client-version': '15.3.1',
        'origin': 'https://app.iqhashtags.com',
        'x-requested-with': 'mark.via.gp',
        'sec-fetch-site': 'same-site',
        'sec-fetch-mode': 'cors',
        'sec-fetch-dest': 'empty',
        'referer': 'https://app.iqhashtags.com/',
        'accept-language': 'ar-EG,ar;q=0.9,en-US;q=0.8,en;q=0.7',
        'priority': 'u=1, i'
      }
    }
  );

  return response.data;
}

module.exports = {
    name: 'Instagram V2',
    desc: 'Get info instagram account (@user)',
    category: 'Stalk',
    params: ['user'],
    async run(req, res) {
      const { user } = req.query;
      if (!user) return res.status(400).json({ status: false, error: 'User is required' })
        try {
            const { user } = req.query;
            if (!user) return res.status(400).json({ status: false, error: 'User is required' })
            const anu = await searchInstagramUser(user); 
            res.status(200).json({
                status: true,
                data: anu
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}
