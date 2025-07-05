const axios = require('axios');
const cheerio = require('cheerio');

async function getTurnstileToken(targetUrl, siteKey) {
  try {
    const resp = await axios.get('https://api.yogik.id/tools/tcloudflare/', {
      params: {
        url: targetUrl,
        siteKey
      }
    });
    if (!resp.data?.data?.token) {
      throw new Error('Token tidak ditemukan di respons API');
    }
    return resp.data.data.token;
  } catch (error) {
    throw new Error(`Gagal mendapatkan token Turnstile: ${error.message}`);
  }
}

async function fetchAndParseFreeFire(uid) {
    const targetUrl = 'https://freefireinfo.in/get-free-fire-account-information-via-uid/';
    const siteKey = '0x4AAAAAABAe_Da-31Q7nqIm';
    const token = await getTurnstileToken(targetUrl, siteKey);
    const html = await axios.post(
      targetUrl,
      new URLSearchParams({
        uid,
        'cf-turnstile-response': '0.rVRFnQkNFOBd3JR_HcVFPUlGAXwI5kdWFyj_15PgljtY9ItT0_Ia1ZdtclzuC9UqijL58IRzBnqzstS36rOUUUh8oSFDft5LZT6wevxl5sfUHnDd_dEPER1Mrs23tKG2pYf4bO_vV971y6CRHK864JNaj_G8PxlufJk8nkmjPGRp2U9uEfGkmt8bWZPY2W3ddJfLc6ehNrXiJW8a3XKEO1PT_sh9BPytLZw45EviHhZ1hI3vfGFGqC5vwax3iLfIJjPo835X4fKOEmwle_E_aU4BuWTR_W-IZf-j76BTH8kUhCkZnxNJsWwmaTj1mZ7VU5T-hu4tc_ulIjDZY10b4YgJECQ8Y-ML7IrMeXYJA2CyD1Ay97h9LXLj0OVRJjFbBeeXRn_bRrx882rj0yiHIxx_NIHe8VOoS7VxFxxkCyH7p3PArvBYwjY8D5Fa2PvGBnp1ty2fdQ6Ng6BsBliWAvxqFTe9xGBCFS_kIs5LcSaiNgfLpdLnaud5s3dELybtAIwuQpr6rDA_96nnIP3k_aoqFH3kahgUzRid3dkWaPgJR1fr9kYAc4toY6MpiwCeCDSB9aNYEJBSLnQDlx9VfNbvwOjIDC3TFHXY13skBc-d--hZIS1ADBxc3fTWF5MMF-uGYPrvKC8pw-y6jthzn3_sBtAJBEmpRQ3ubgh_I0HS8cDUCyoExbrn1WW5ErK4nNW25ypDTAYM49DFqQjT78tfUat4izyDgNhtVbUA3EcqXZyjDL6tvY1P0PXh9cPcIwDH5pVY2HY-ECbP58ZV7RjxDpfP0QGPzCZxMSQoYtgEh_Fe0o8PE_HDAEBNkxnh-oeXHfxen_EODRsSk0qHaf4DNlhhSBl-9xriPeIVk1Pa2wulhYXg9gA-sRjIrP2dKpNMrHaugSFrocslzvcGfQ.OsbWalvy9xW0riNfeLC6Hg.afb1b80c4b1aacb6d41e7a395fd34988dbb386916f516173ff9d2bd8002735b7'
      }).toString(),
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
    return {
      accountInfo,
      petInfo,
      guildInfo,
      equipped
    };
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
