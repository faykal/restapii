const axios = require('axios');
module.exports = {
    name: 'Pak Ustad',
    desc: 'Only type1 and type2 available',
    category: 'Image Creator',
    params: ['text', 'type'],
    async run(req, res) {
        try {
    const { text, type } = req.query;
    if (!text || !type) return res.status(400).json({ status: false, error: 'Text and type is required' });
            const response = await axios.post('https://lemon-ustad.vercel.app/api/generate-image', {
                isi: text,
                option: type // hanya tersedia type1 dan type2
                }, { responseType: 'arraybuffer' })
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