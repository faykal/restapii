const axios = require("axios")
module.exports = {
    name: 'Pinterest',
    desc: 'Download video/image on pinterest',
    category: 'Downloader',
    params: ['url'],
    async run(req, res) {
        try {
            const { url } = req.query;
            if (!url) return res.status(400).json({ status: false, error: 'Url is required' });
            const fay = await axios.get(`https://api.agatz.xyz/api/pinterest?url=${url}`)
            res.status(200).json({
                status: true,
                result: fay.data.data
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}