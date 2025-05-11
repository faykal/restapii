const axios = require("axios")
module.exports = {
    name: 'YouTube Play',
    desc: 'Play song on youtube',
    category: 'Downloader',
    params: ['q'],
    async run(req, res) {
        const { q } = req.query;
        if (!q) return res.status(400).json({ status: false, error: 'Url is required' });
        try {
            const fay = await axios.get(`https://api.vreden.my.id/api/ytplaymp3?query=${q}`)
            res.status(200).json({
                status: true,
                result: {
                    metadata: fay.data.result.metadata,
                    download: fay.data.result.download
                }
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}