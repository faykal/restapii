const axios = require("axios")
module.exports = {
    name: 'Mobile Legends',
    desc: 'Get info ml account',
    category: 'Stalk',
    params: ['id','zone'],
    async run(req, res) {
            try {
                const { id, zone} = req.query;
                if (!id) return res.status(400).json({ status: false, error: 'Id is required' });
                if (!zone) return res.status(400).json({ status: false, error: 'Zone is required' });
                const fay = await axios.get(`https://dev.luckycat.my.id/api/stalker/mobile-legend?users=${id}&servers=${zone}`)
                res.status(200).json({
                    status: true,
                    result: fay.data.data
                });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}