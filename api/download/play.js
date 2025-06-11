const axios = require("axios");
module.exports = {
    name: 'YouTube Play',
    desc: 'Play song on youtube',
    category: 'Downloader',
    params: ['q'],
    async run(req, res) {
        const { q } = req.query;
        if (!q) return res.status(400).json({ status: false, error: 'Url is required' });
        try {
            const fay = await axios.get(`https://api.kenshiro.cfd/api/downloader/play?q=${q}`)
            res.status(200).json({
                status: true,
                data: fay.data.data
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}
