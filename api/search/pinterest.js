const axios = require("axios")
module.exports = {
    name: 'Pinterest',
    desc: 'Search image on pinterest',
    category: 'Search',
    params: ['q'],
    async run(req, res) {
            try {
                const { q } = req.query;
                if (!q) return res.status(400).json({ status: false, error: 'Query is required' });
                const fay = await axios.get(`https://api.nekorinn.my.id/search/pinterest?q=${q}`)
                res.status(200).json({
                    status: true,
                    result: fay.data.result
                });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}