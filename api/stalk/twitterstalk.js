const axios = require("axios")
module.exports = {
    name: 'Twitter',
    desc: 'Get info twitter account',
    category: 'Stalk',
    params: ['user'],
    async run(req, res) {
            try {
                const { user } = req.query;
                if (!user) return res.status(400).json({ status: false, error: 'User is required' })
                const fay = await axios.get(`https://api.siputzx.my.id/api/stalk/twitter?user=${user}`)
                res.status(200).json({
                    status: true,
                    data: fay.data.data
                });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}