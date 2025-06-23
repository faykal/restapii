const axios = require("axios");
module.exports = {
    name: 'YouTube Video',
    desc: 'Video download',
    category: 'Downloader',
    params: ['url'],
    async run(req, res) {
        const { url } = req.query;
        if (!url) return res.status(400).json({ status: false, error: 'Url is required' });
        try {
            const fay = await axios.get(`https://api.kenshiro.cfd/api/downloader/ytv?url=${url}`)
            res.status(200).json({
                status: true,
                data: fay.data.data
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}
