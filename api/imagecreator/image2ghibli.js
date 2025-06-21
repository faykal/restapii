const axios = require('axios');
module.exports = {
    name: 'Image To Ghibli',
    desc: 'Convert image to ghibli style',
    category: 'Image Creator',
    params: ['url'],
    async run(req, res) {
        try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ status: false, error: 'Text is required' });
            const pedo = await axios.get(`https://api.siputzx.my.id/api/image2ghibli?image=${url}`, { responseType: "arraybuffer" })
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
