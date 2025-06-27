const axios = require('axios');

async function ytmp3(url) {

  const format = 'mp3'; // ganti mp4 buat video bray
  const id = (url.match(/(?:v=|\.be\/)([a-zA-Z0-9_-]{11})/) || [])[1];
  if (!id) return 'error: invalid YouTube URL';

  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const jantung = {
    referer: 'https://id.ytmp3.plus/'
  };

  try {
    const init = await axios.get('https://d.ymcdn.org/api/v1/init?p=y&23=1llum1n471&_=' + Math.random(), { headers: jantung });
    const cu = init.data?.convertURL;
    if (!cu) return 'error: convertURL not found';

    const convert = await axios.get(`${cu}&v=${id}&f=${format}&_=` + Math.random(), { headers: jantung });
    const { downloadURL, progressURL } = convert.data;
    if (!downloadURL) return 'error: downloadURL not found';

    for (let x = 0; x < 10; x++) {
      try {
        const r = await axios.get(downloadURL, {
          headers: jantung,
          responseType: 'stream',
          maxContentLength: 1
        });
        if (r.status === 200) break;
      } catch {}
      await sleep(3000);
    }

    const meta = await axios.get(progressURL, { headers: jantung });
    return JSON.stringify({
    title: meta.data?.title || 'unknown',
    format,
    downloadURL
  }, null, 2);
  } catch (e) {
    const err = e.response?.data || e.message;
    return 'error: ' + JSON.stringify(err, null, 2);
  }
}

module.exports = {
    name: 'YouTube Audio',
    desc: 'Audio download',
    category: 'Downloader',
    params: ['url'],
    async run(req, res) {
        const { url } = req.query;
        if (!url) return res.status(400).json({ status: false, error: 'Url is required' });
        try {
            const fay = await ytmp3(url)
            res.status(200).json({
                status: true,
                data: JSON.parse(fay)
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}
