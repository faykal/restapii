const axios = require('axios');
module.exports = {
    name: 'Brat Animated',
    desc: 'Brat generator animated',
    category: 'Image Creator',
    params: ['text'],
    async run(req, res) {
        try {
    const { text } = req.query;
    if (!text) return res.status(400).json({ status: false, error: 'Text is required' });
            const pedo = await axios.get(`https://skyzxu-brat.hf.space/brat-animated?text=${text}`, { responseType: "arraybuffer" })
            let videoBuffer = pedo.data;
            res.writeHead(200, {
                'Content-Type': 'video/mp4',
                'Content-Length': videoBuffer.length,
            });
            res.end(videoBuffer);
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
};
