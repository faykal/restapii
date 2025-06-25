const axios = require('axios');
const cheerio = require('cheerio');

async function search(query) {
  const searchUrl = 'https://s60.notube.net/suggestion.php?lang=id';
  const payload = new URLSearchParams({
    keyword: query,
    format: 'mp3',
    subscribed: 'false'
  });

  try {
    const { data } = await axios.post(searchUrl, payload.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Origin': 'https://notube.net',
        'Referer': 'https://notube.net/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
      }
    });

    const $ = cheerio.load(data);
    const results = [];
    $('.row > a').each((i, element) => {
      const onclickAttr = $(element).attr('onclick');
      const urlMatch = onclickAttr.match(/DOWNL\('([^']+)'/);
      const videoUrl = urlMatch ? urlMatch[1] : null;

      if (videoUrl) {
        const title = $(element).find('p').text().trim();
        const thumbnail = $(element).find('img').attr('src');
        const duration = $(element).find('div[style*="background-color"]').text().trim();
        const author = $(element).find('small font').first().text().trim();
        const description = $(element).find('small font').last().text().trim();

        results.push({
          title,
          author,
          duration,
          description,
          thumbnail,
          url: videoUrl,
        });
      }
    });
    return results;
  } catch (error) {
    throw new Error('Gagal nggolek video. Ono sing salah iki.');
  }
}

async function download(url, format = 'mp3') {
  const serverUrl = 'https://s60.notube.net';

  try {
    const weightPayload = new URLSearchParams({ url, format, lang: 'id', subscribed: 'false' });
    const { data: weightData } = await axios.post(`${serverUrl}/recover_weight.php`, weightPayload.toString());

    const { token, name_mp4 } = weightData;
    if (!token) throw new Error('Ora iso nemokke token, Rek!');

    const filePayload = new URLSearchParams({ url, format, name_mp4, lang: 'id', token, subscribed: 'false', playlist: 'false', adblock: 'false' });
    await axios.post(`${serverUrl}/recover_file.php?lang=id`, filePayload.toString());

    const conversionPayload = new URLSearchParams({ token });
    await axios.post(`${serverUrl}/conversion.php`, conversionPayload.toString());

    const downloadPageUrl = `https://notube.net/id/download?token=${token}`;
    const { data: pageData } = await axios.get(downloadPageUrl);

    const $ = cheerio.load(pageData);
    const title = $('#blocLinkDownload h2').text().trim();
    const finalDownloadUrl = $('#downloadButton').attr('href');

    if (!finalDownloadUrl || !finalDownloadUrl.includes('key=')) {
      throw new Error('Link download-e ora ono utowo ora valid. Piye tho?');
    }

    return {
      download_url: finalDownloadUrl
    };
  } catch (error) {
    throw new Error('Gagal ngunduh video. Coba maneh, Rek.');
  }
}

module.exports = {
    name: 'YouTube Play',
    desc: 'Play song on youtube',
    category: 'Downloader',
    params: ['q'],
    async run(req, res) {
        const { q } = req.query;
        if (!q) return res.status(400).json({ status: false, error: 'Query is required' });
        try {
            const searchResults = await search(q);
            const metadata = searchResults[0]
            const firstResultUrl = searchResults[0].url;
            const downloadInfo = await download(firstResultUrl);
            res.status(200).json({
                status: true,
                data: {
                    metadata: metadata,
                    download: downloadInfo
                }
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}
