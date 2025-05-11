const axios = require("axios")
module.exports = {
    name: 'YouTube Audio',
    desc: 'Audio download',
    category: 'Downloader',
    params: ['url'],
    async run(req, res) {
        const { url } = req.query;
        if (!url) return res.status(400).json({ status: false, error: 'Url is required' });
        try {
            const fay = await axios.get(`https://api.vreden.my.id/api/ytmp3?url=${url}`)
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