const axios = require("axios")
module.exports = {
    name: 'Pubg Mobile',
    desc: 'Get info pubg account',
    category: 'Stalk',
    params: ['id'],
    async run(req, res) {
            try {
                const { id } = req.query;
                if (!id) return res.status(400).json({ status: false, error: 'Id is required' });
                const fay = await axios.get(`https://api.kenshiro.cfd/api/stalker/game/pubg?q=${id}`)
                res.status(200).json({
                    status: true,
                    result: fay.data.data
                });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}