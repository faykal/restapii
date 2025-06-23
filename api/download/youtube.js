const axios = require("axios");
const crypto = require('crypto');

async function saveTube(ytUrl, targetFormat) {

  const jantung = {
    'content-type': 'application/json',
    'referer': 'https://yt.savetube.me/',
    'origin': 'https://yt.savetube.me'
  };

  const formats = ['144', '240', '360', '480', '720', '1080', 'mp3'];

  const ambilId = url => {
    const pola = [
      /v=([a-zA-Z0-9_-]{11})/, /embed\/([a-zA-Z0-9_-]{11})/,
      /\/v\/([a-zA-Z0-9_-]{11})/, /shorts\/([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/
    ];
    for (let p of pola) {
      const hasil = url.match(p);
      if (hasil) return hasil[1];
    }
    return null;
  };

  const ambil = async (url, body = null) => {
    if (body) {
      return (await axios.post(url, body, { headers: jantung })).data;
    } else {
      return (await axios.get(url, { headers: jantung })).data;
    }
  };

  const bukaRahasia = async base64 => {
    const kunci = Buffer.from('C5D58EF67A7584E4A29F6C35BBC4EB12', 'hex');
    const isi = Buffer.from(base64, 'base64');
    const iv = isi.slice(0, 16);
    const enkrip = isi.slice(16);
    const alat = crypto.createDecipheriv('aes-128-cbc', kunci, iv);
    const hasil = Buffer.concat([alat.update(enkrip), alat.final()]);
    return JSON.parse(hasil.toString());
  };

  try {
    if (!ytUrl) return 'error: ' + JSON.stringify({ error: 'URL kosong' }, null, 2);
    if (!formats.includes(targetFormat))
      return 'error: ' + JSON.stringify({ error: 'Format tidak didukung', supported: formats }, null, 2);

    const videoId = ambilId(ytUrl);
    if (!videoId)
      return 'error: ' + JSON.stringify({ error: 'Gagal ambil ID video' }, null, 2);

    const node = (await ambil('https://media.savetube.me/api/random-cdn')).cdn;
    const meta = await ambil(`https://${node}/v2/info`, { url: `https://www.youtube.com/watch?v=${videoId}` });
    const data = await bukaRahasia(meta.data);

    const unduh = await ambil(`https://${node}/download`, {
      id: videoId,
      downloadType: targetFormat === 'mp3' ? 'audio' : 'video',
      quality: targetFormat === 'mp3' ? '128' : targetFormat,
      key: data.key
    });

    const hasil = {
      id: videoId,
      title: data.title || 'Tanpa Judul',
      format: targetFormat,
      type: targetFormat === 'mp3' ? 'audio' : 'video',
      thumbnail: data.thumbnail || `https://i.ytimg.com/vi/${videoId}/0.jpg`,
      duration: data.duration,
      quality: targetFormat === 'mp3' ? '128' : targetFormat,
      url: unduh.data.downloadUrl
    };

    return hasil;
  } catch (e) {
    const err = e.response?.data || e.message;
    return 'error: ' + JSON.stringify(err, null, 2);
  }
}

module.exports = {
    name: 'YouTube',
    desc: 'Format: 144, 240, 360, 480, 720, 1080, mp3',
    category: 'Downloader',
    params: ['url','format'],
    async run(req, res) {
        const { url, format } = req.query;
        if (!url || !format) return res.status(400).json({ status: false, error: 'Url is required' });
        try {
            const fay = await saveTube(url, format)
            res.status(200).json({
                status: true,
                data: fay
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}
