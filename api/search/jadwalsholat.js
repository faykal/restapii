const axios = require("axios")
const cheerio = require('cheerio');
 
const jadwalSholat = {
  kota: async (kota) => {
    if (!kota) return "Masukan Query Kota";
 
    try {
      let { data } = await axios.get(`https://www.umroh.com/jadwal-sholat/${kota}`);
      let $ = cheerio.load(data);
      let hasil = [];
 
      $("table tbody tr").each((_, el) => {
        let kolom = $(el).find("td");
        hasil.push({
          tanggal: $(kolom[0]).text().trim(),
          imsyak: $(kolom[1]).text().trim(),
          subuh: $(kolom[2]).text().trim(),
          dzuhur: $(kolom[3]).text().trim(),
          ashar: $(kolom[4]).text().trim(),
          maghrib: $(kolom[5]).text().trim(),
          isya: $(kolom[6]).text().trim(),
        });
      });
 
      return hasil;
    } catch (e) {
      return `Gagal mengambil data: ${e.message}`;
    }
  }
};

module.exports = {
    name: 'Jadwal Sholat',
    desc: 'Search info jadwal sholat',
    category: 'Search',
    params: ['q'],
    async run(req, res) {
        try {
            const { q } = req.query;
            if (!q) return res.status(400).json({ status: false, error: 'Query is required' });
            const fay = await jadwalSholat.kota(q)
            res.status(200).json({
                status: true,
                data: fay
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}