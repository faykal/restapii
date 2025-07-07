const axios = require('axios');
const cheerio = require('cheerio');

async function getTurnstileToken(targetUrl, siteKey) {
  const resp = await axios.get('https://api.yogik.id/tools/tcloudflare/', { params: { url: targetUrl, siteKey } });
  if (!resp.data?.data?.token) throw new Error('Token tidak ditemukan di respons API');
  return resp.data.data.token;
}

async function fetchAndParseFreeFire(uid) {
  const targetUrl = 'https://freefireinfo.in/get-free-fire-account-information-via-uid/';
  const siteKey = '0x4AAAAAABAe_Da-31Q7nqIm';
  const token = await getTurnstileToken(targetUrl, siteKey);

  const html = await axios.post(
    targetUrl,
    new URLSearchParams({ uid, 'cf-turnstile-response': token }).toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9'
      },
      withCredentials: true
    }
  ).then(r => r.data);

  const $ = cheerio.load(html);
  const $result = $('.result');

  $result.find('br').replaceWith('\n');
  const lines = $result
    .text()
    .split('\n')
    .map(l => l.trim())
    .filter(l => l);

  const petIndex = lines.findIndex(l => l.includes('Pet Information'));
  const guildIndex = lines.findIndex(l => l.includes('Guild Information'));

  const accountInfo = {};
  lines
    .slice(0, petIndex > -1 ? petIndex : guildIndex > -1 ? guildIndex : lines.length)
    .filter(l => l.startsWith('✔'))
    .forEach(line => {
      const [key, ...vals] = line.slice(1).trim().split(':');
      accountInfo[key.trim()] = vals.join(':').trim();
    });

  const petInfo = {};
  if (petIndex > -1) {
    lines
      .slice(petIndex + 1, guildIndex > -1 ? guildIndex : lines.length)
      .filter(l => l.startsWith('✔'))
      .forEach(line => {
        const [key, ...vals] = line.slice(1).trim().split(':');
        petInfo[key.trim()] = vals.join(':').trim();
      });
  }

  const guildInfo = {};
  if (guildIndex > -1) {
    lines
      .slice(guildIndex + 1)
      .filter(l => l.startsWith('✔'))
      .forEach(line => {
        const [key, ...vals] = line.slice(1).trim().split(':');
        guildInfo[key.trim()] = vals.join(':').trim();
      });
  }

  const equipped = {};
  const $equipDiv = $('.equipped-items');
  $equipDiv.find('h4').each((_, h4) => {
    const category = $(h4).text().trim();
    equipped[category] = [];
    const items = $(h4).nextUntil('h4', '.equipped-item');
    items.each((_, item) => {
      const $item = $(item);
      const name = $item.find('p').text().trim();
      const img = $item.find('img').attr('data-lazy-src') || $item.find('img').attr('src');
      equipped[category].push({ name, image: img });
    });
  });

  return { accountInfo, petInfo, guildInfo, equipped };
}


module.exports = {
    name: 'FreeFire V2',
    desc: 'Get info freefire account',
    category: 'Stalk',
    params: ['id'],
    async run(req, res) {
            try {
                const { id } = req.query;
                if (!id) return res.status(400).json({ status: false, error: 'Id is required' });
                const fay = await fetchAndParseFreeFire(id)
                res.status(200).json({
                    status: true,
                    data: fay
                });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}
