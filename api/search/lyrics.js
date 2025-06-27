const axios = require("axios")
const cheerio = require('cheerio');

const BASE_URL = "https://lirik-lagu.net";
const SEARCH_PATH = "/search";

async function LirikByPonta(query) {
  try {
    const encodedQuery = encodeURIComponent(query.trim().replace(/\s+/g, "+"));
    const url = `${BASE_URL}${SEARCH_PATH}/${encodedQuery}.html`;

    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const $ = cheerio.load(data);
    const firstResult = $(".card-body.list_main .title-list a").first();

    if (!firstResult.length) return [];

    const title = firstResult.text().trim();
    const link = BASE_URL + firstResult.attr("href");

    return [{ title, link }];
  } catch {
    return [];
  }
}

async function LirikByPontaJs(url) {
  try {
    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const $ = cheerio.load(data);
    const lirikContainer = $(".post-read.lirik_lagu, #lirik_lagu").first();

    if (!lirikContainer.length) throw new Error();

    lirikContainer.find('script, style, div[align="center"], ins, .mt-3.pt-3, .artis, .tags, .adsbygoogle').remove();

    let htmlLirik = lirikContainer.html();
    if (!htmlLirik) throw new Error();

    htmlLirik = htmlLirik.replace(/<br\s*\/?>/gi, "\n");
    let lirikText = cheerio.load(htmlLirik).text();

    const lines = lirikText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    let resultLines = [];
    for (let i = 0; i < lines.length; i++) {
      if (/^(\[.*\]|\(.*\))$/.test(lines[i]) && i > 0) {
        resultLines.push('');
      }
      resultLines.push(lines[i]);
    }

    return resultLines.join('\n');
  } catch {
    return null;
  }
}

async function main(query) {
  const daftarLirik = await LirikByPonta(query);
  if (daftarLirik.length === 0) {
    return { message: `Tidak ditemukan lagu untuk query: ${query}` };
  }
  const result = [];
  for (const { title, link } of daftarLirik) {
    const lirik = await LirikByPontaJs(link);
    result.push({
      title,
      link,
      lirik: lirik || "Gagal mengambil lirik."
    });
  }
  return result;
}


module.exports = {
    name: 'Lyrics',
    desc: 'Search lyrics on song',
    category: 'Search',
    params: ['q'],
    async run(req, res) {
            try {
                const { q } = req.query;
                if (!q) return res.status(400).json({ status: false, error: 'Query is required' });
                const fay = await main(q)
                res.status(200).json({
                    status: true,
                    data: fay[0]
                });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}
