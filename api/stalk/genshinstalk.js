const axios = require("axios")
module.exports = {
    name: 'Genshin Impact',
    desc: 'Get info genshin account',
    category: 'Stalk',
    params: ['id'],
    async run(req, res) {
            try {
                const { id } = req.query;
                if (!id) return res.status(400).json({ status: false, error: 'Id is required' });
                const fay = await axios.get(`https://api.siputzx.my.id/api/check/genshin?uid=${id}`)
                const kall = fay.data.data
                res.status(200).json({
                    status: true,
                    data: kall.playerData
                });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}