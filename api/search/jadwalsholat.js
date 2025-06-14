const axios = require("axios")
const cheerio = require('cheerio');

async function jadwalSholat(kota) {
            try {
              const {
                data
              } = await axios.get(`https://www.dream.co.id/jadwal-sholat/${kota}/`);
              const $ = cheerio.load(data);
              const rows = $(".table-index-jadwal tbody tr");
              const jadwal = [];
              rows.each((index, row) => {
                const cols = $(row).find("td");
                jadwal.push({
                  subuh: $(cols[1]).text().trim(),
                  duha: $(cols[2]).text().trim(),
                  zuhur: $(cols[3]).text().trim(),
                  asar: $(cols[4]).text().trim(),
                  magrib: $(cols[5]).text().trim(),
                  isya: $(cols[6]).text().trim()
                });
              });
              return jadwal[0];
            } catch (error) {
              throw new Error("Gagal mengambil data jadwal sholat");
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
            const fay = await jadwalSholat(q)
            res.status(200).json({
                status: true,
                data: fay
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}
