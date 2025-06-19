const axios = require('axios');

async function ytmonet(url) {
    try {
        if (!/youtube.com|youtu.be/.test(url)) throw new Error('Invalid url');
        const { data } = await axios.post('https://timeskip.io/api/tools/youtube-monetization', {
            url: url
        }, {
            headers: {
                'content-type': 'application/json'
            }
        });
        
        return data;
    } catch (error) {
        console.error(error.message);
        throw new Error('No result found');
    }
}

module.exports = {
    name: 'YouTube Monetization',
    desc: 'YouTube monetization checker',
    category: 'Search',
    params: ['url'],
    async run(req, res) {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({ status: false, error: 'Url is required' });
        }
        try {
            const resp = await ytmonet(url);
            res.status(200).json({
                status: true,
                data: resp
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}