const axios = require("axios")
const cheerio = require("cheerio")

async function PlayStore(search) {
    return new Promise(async (resolve, reject) => {
        try {
            const { data } = await axios.get(`https://play.google.com/store/search?q=${search}&c=apps`)
            const hasil = []
            const $ = cheerio.load(data)
            
            $('.ULeU3b > .VfPpkd-WsjYwc.VfPpkd-WsjYwc-OWXEXe-INsAgc.KC1dQ.Usd1Ac.AaN0Dd.Y8RQXd > .VfPpkd-aGsRMb > .VfPpkd-EScbFb-JIbuQc.TAQqTe > a').each((i, u) => {
                const linkk = $(u).attr('href')
                const nama = $(u).find('.j2FCNc > .cXFu1 > .ubGTjb > .DdYX5').text()
                const developer = $(u).find('.j2FCNc > .cXFu1 > .ubGTjb > .wMUdtb').text()
                const rate = $(u).find('.j2FCNc > .cXFu1 > .ubGTjb > div').attr('aria-label')
                const rate2 = $(u).find('.j2FCNc > .cXFu1 > .ubGTjb > div > span.w2kbF').text()
                const link = `https://play.google.com${linkk}`

                hasil.push({
                    link: link,
                    nama: nama || 'No name',
                    developer: developer || 'No Developer',
                    img: 'https://files.catbox.moe/dklg5y.jpg', 
                    rate: rate || 'No Rate',
                    rate2: rate2 || 'No Rate',
                    link_dev: `https://play.google.com/store/apps/developer?id=${developer.split(" ").join('+')}`
                })
            })
            
            if (hasil.length === 0) return resolve({ mess: 'Tidak ada hasil yang ditemukan' })
            
            resolve(hasil.slice(0, Math.max(3, Math.min(5, hasil.length)))) 
        } catch (err) {
            console.error(err)
            reject(err)
        }
    })
}

module.exports = {
    name: 'Playstore',
    desc: 'Search apk on playstore',
    category: 'Search',
    params: ['q'],
    async run(req, res) {
        try {
            const { q } = req.query;
            if (!q) {
            return res.status(400).json({ status: false, error: 'Query is required' });
            }
            const results = await PlayStore(q);  
            res.status(200).json({
                status: true,
                data: results
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}