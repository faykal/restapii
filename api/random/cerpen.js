const axios = require("axios")
module.exports = {
    name: 'Cerpen',
    desc: 'Collection of short stories',
    category: 'Random',
    async run(req, res) {
        try {
        const { data } = await axios.get(`https://api.kenshiro.cfd/api/random/cerpen`)
        res.status(200).json({
            status: true,
            data: data.data
        });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}