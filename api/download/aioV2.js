const axios = require('axios');
const cheerio = require('cheerio');
const qs = require('qs');

/**
 * Scrape video info dari videoindir.com
 * @param {string} videoUrl - URL video YouTube (contoh: 'https://youtu.be/L7w9sgn81rE?si=nRdqgOLaG88VDkAv')
 */
async function scrapeVideoInfo(videoUrl) {
  try {
    // 1. Siapkan body form-urlencoded
    const postData = qs.stringify({
      action: 'vd_get_video_info',
      url: videoUrl
    });

    // 2. Kirim POST request
    const response = await axios.post(
      'https://www.videoindir.com/wp-admin/admin-ajax.php',
      postData,
      {
        headers: {
          'Accept': '/',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
          // header lain bisa ditambahkan sesuai kebutuhan
        },
        // biarkan cookie & credentials default
      }
    );

    const html = response.data;
    const $ = cheerio.load(html);

    // 3. Ambil title
    const title = $('h3').first().text().trim();

    // 4. Ambil URL thumbnail (base64)
    const thumb = $('img').first().attr('src');

    // 5. Ambil tombol-tombol download
    const downloads = [];
    $('#vd-video-buttons form').each((i, form) => {
      const $form = $(form);
      const action = $form.attr('action');
      const url = $form.find('input[name="url"]').val();
      const filename = $form.find('input[name="filename"]').val();
      const label = $form.find('button').text().trim();

      downloads.push({ url, filename, label });
    });

    return { title, downloads };

  } catch (err) {
    console.error('Gagal scrape:', err.message);
    throw err;
  }
}

module.exports = {
    name: 'Aio V2',
    desc: 'All In One Downloader',
    category: 'Downloader',
    params: ['url'],
    async run(req, res) {
        const { url } = req.query;
            if (!url) {
                return res.status(400).json({ status: false, error: 'Url is required' });
            }
        try {
            const results = await scrapeVideoInfo(url);
            res.status(200).json({
                status: true,
                data: results
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}