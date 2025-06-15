const axios = require("axios")
module.exports = {
    name: 'Gempa',
    desc: 'Information gempa',
    category: 'Random',
    async run(req, res) {
        try {
        const { data } = await axios.get(`https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json`)
        const faykal = data.Infogempa.gempa
        res.status(200).json({
            status: true,
            data: {
                Tanggal: faykal.Tanggal,
                Jam: faykal.Jam,
                DateTime: `${faykal.Tanggal} ${faykal.jam}`,
                Coordinates: faykal.Coordinates,
                Lintang: faykal.Lintang,
                Bujur: faykal.Bujur,
                Magnitude: faykal.Magnitude,
                Kedalaman: faykal.Kedalaman,
                Wilayah: faykal.Wilayah,
                Potensi: faykal.Potensi,
                Dirasakan: faykal.Dirasakan,
                Shakemap: `https://data.bmkg.go.id/DataMKG/TEWS/${faykal.Shakemap}`
            }
        });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}
