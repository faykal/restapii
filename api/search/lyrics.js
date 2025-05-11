const axios = require("axios")
module.exports = {
    name: 'Lyrics',
    desc: 'Search lyrics on song',
    category: 'Search',
    params: ['q'],
    async run(req, res) {
            try {
                const { q } = req.query;
                if (!q) return res.status(400).json({ status: false, error: 'Query is required' });
                const fay = await axios.get(`https://api.kenshiro.cfd/api/search/lirik?q=${q}`)
                res.status(200).json({
                    status: true,
                    result: fay.data.data
                });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}