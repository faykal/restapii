const axios = require('axios');
module.exports = {
    name: 'Fake Ngl Instagram',
    desc: 'Fake ngl question on instagram',
    category: 'Image Creator',
    params: ['text'],
    async run(req, res) {
        try {
    const { text } = req.query;
    if (!text) return res.status(400).json({ status: false, error: 'Text is required' });
            const response = await axios.post('https://lemon-ngl.vercel.app/api/generate-image', { text }, { responseType: "arraybuffer" })
            let videoBuffer = response.data;
            res.writeHead(200, {
                'Content-Type': 'image/png',
                'Content-Length': videoBuffer.length,
            });
            res.end(videoBuffer);
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
};