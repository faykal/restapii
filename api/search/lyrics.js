const axios = require("axios")
const cheerio = require('cheerio');
module.exports = {
    name: 'Lyrics',
    desc: 'Search lyrics on song',
    category: 'Search',
    params: ['q'],
    async run(req, res) {
            try {
                const { q } = req.query;
                if (!q) return res.status(400).json({ status: false, error: 'Query is required' });
                const url = `https://www.lyrics.com/lyrics/${encodeURIComponent(q)}`;
                const response = await axios.get(url, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36',
                        'Referer': `https://www.lyrics.com/lyrics/${encodeURIComponent(q)}`,
                    },
                    decompress: true,
                });
                
                const htmlContent = response.data;
                const $ = cheerio.load(htmlContent);
                const lyricDiv = $('.sec-lyric.clearfix').first();
                const lyricBody = lyricDiv.find('.lyric-body').text().trim();
                res.status(200).json({
                    status: true,
                    result: lyricBody
                });
            } catch (error) {
                res.status(500).json({ status: false, error: error.message });
            }
        }
    }
