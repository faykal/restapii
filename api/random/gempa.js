const axios = require("axios")
module.exports = {
    name: 'Gempa',
    desc: 'Information gempa',
    category: 'Random',
    async run(req, res) {
        try {
        const { data } = await axios.get(`https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json`)
        res.status(200).json({
            status: true,
            result: data.Infogempa.gempa
        });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}