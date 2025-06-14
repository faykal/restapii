const axios = require("axios")

const fetchJson = async (url, options) => {
    try {
        options ? options : {}
        const res = await axios({
            method: 'GET',
            url: url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
            },
            ...options
        })
        return res.data
    } catch (err) {
        return err
    }
}

module.exports = {
    name: 'Jadwal Sholat',
    desc: 'Search info jadwal sholat',
    category: 'Search',
    params: ['q'],
    async run(req, res) {
        try {
            const { q } = req.query;
            if (!q) return res.status(400).json({ status: false, error: 'Query is required' });
            const fay = await fetchJson(`https://api.aladhan.com/v1/timingsByCity?city=${q}&country=Indonesia&method=8`)
            res.status(200).json({
                status: true,
                data: fay
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}
