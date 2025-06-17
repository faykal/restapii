const axios = require('axios');
const cheerio = require('cheerio');

function formatSize(bytes) {
  if (!bytes) return '';
  const kb = bytes / 1024;
  const mb = kb / 1024;
  return mb >= 1 ? `${mb.toFixed(2)} MB` : `${kb.toFixed(2)} KB`;
}

async function mediafireDownloader(url) {
  if (!url.includes('mediafire.com')) throw new Error('URL bukan Mediafire');

  const { data } = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });

  const $ = cheerio.load(data);
  const dl = $('#downloadButton').attr('href');
  if (!dl) throw new Error('Gagal ambil link download');

  let title = $('div.download_file_title > h1').text().trim() || decodeURIComponent(url.split('/').slice(-2, -1)[0]);
  title = title.replace(/\+/g, ' ');
  const type = title.split('.').pop();

  let size = '';
  try {
    const head = await axios.head(dl);
    const length = parseInt(head.headers['content-length']);
    size = formatSize(length);
  } catch {}

  return { title, size, type, downloadLink: dl };
}

module.exports = {
    name: 'Mediafire',
    desc: 'Download file on mediafire',
    category: 'Downloader',
    params: ['url'],
    async run(req, res) {
        try {
            const { url } = req.query;
            if (!url) return res.status(400).json({ status: false, error: 'Url is required' });
            const fay = await mediafireDownloader(url)
            res.status(200).json({
                status: true,
                data: fay
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}
