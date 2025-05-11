const axios = require('axios');
module.exports = {
    name: 'Brat',
    desc: 'Brat generator',
    category: 'Image Creator',
    async run(req, res) {
        try {
    const { text } = req.query;
    if (!text) return res.status(400).json({ status: false, error: 'Text is required' });
            const pedo = await axios.get(`https://brat.caliphdev.com/api/brat?text=${text}`, { responseType: "arraybuffer" })
            let videoBuffer = pedo.data;
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
