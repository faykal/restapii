const axios = require('axios');

    async function anim() {
        try {
            const data = await axios.get(`https://api.waifu.pics/sfw/waifu`)
            const response = await getBuffer(data.url)
            return response
        } catch (error) {
            throw error;
        }
    }

module.exports = {
    name: 'Waifu',
    desc: 'Waifu random image',
    category: 'Random',
    async run(req, res) {
        try {
            const pedo = await anim();
            res.writeHead(200, {
                'Content-Type': 'image/png',
                'Content-Length': pedo.length,
            });
            res.end(pedo);
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
};

