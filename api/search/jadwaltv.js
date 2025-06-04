const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
    name: 'Jadwal Tv',
    desc: 'Search info jadwal Tv',
    category: 'Search',
    params: ['channel'],
    async run(req, res) {
        try {
            const { channel } = req.query;
            if (!channel) return res.status(400).json({ status: false, error: 'Query is required' });
            const url = `https://www.jadwaltv.net/channel/${channel}`;
            const { data: html } = await axios.get(url);
            const $ = cheerio.load(html);
            const result = [];
            $('tr.jklIv').each((i, el) => {
              const time = $(el).find('td').first().text().trim();
              const program = $(el).find('td').last().text().trim();
              result.push({ time, program });
            });
            res.status(200).json({
                status: true,
                data: result
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}