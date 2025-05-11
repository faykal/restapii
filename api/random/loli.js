const axios = require('axios');

module.exports = {
    name: 'Loli',
    desc: 'Loli random image',
    category: 'Random',
    async run(req, res) {
        try {
            const { data } = await axios.get(`https://raw.githubusercontent.com/rynxzyy/loli-r-img/refs/heads/main/links.json`)
            const response = await axios.get(data[Math.floor(data.length * Math.random())], { responseType: 'arraybuffer' });
            const pedo = Buffer.from(response.data);
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
