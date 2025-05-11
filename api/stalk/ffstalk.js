const axios = require("axios")
module.exports = {
    name: 'FreeFire',
    desc: 'Get info freefire account',
    category: 'Stalk',
    params: ['id'],
    async run(req, res) {
            try {
                const { id } = req.query;
                if (!id) return res.status(400).json({ status: false, error: 'Id is required' });
                const fay = await axios.get(`https://www.xlanznet.site/ffstats?id=${id}`)
                res.status(200).json({
                    status: true,
                    result: fay.data.data
                });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}