const axios = require('axios');
const cheerio = require('cheerio');
 
async function getSecurityToken() {
  const { data: html } = await axios.get('https://evoig.com/', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
 
  const $ = cheerio.load(html);
  const token =
    $('script:contains("ajax_var")')
      .html()
      ?.match(/"security"\s*:\s*"([a-z0-9]{10,})"/i)?.[1] ||
    html.match(/"security"\s*:\s*"([a-z0-9]{10,})"/i)?.[1] ||
    null;
 
  if (!token) throw new Error('Gomen ne~ Aku nggak nemu token security-nya 😔');
  return token;
}
 
async function evoig(url) {
  if (!url || !url.includes('instagram.com')) {
    throw new Error('Masukkan URL Instagram yang bener, sensei bodoh!! 😤');
  }
 
  const token = await getSecurityToken();
  const form = new URLSearchParams();
  form.append('action', 'ig_download');
  form.append('security', token);
  form.append('ig_url', url);
 
  const { data } = await axios.post('https://evoig.com/wp-admin/admin-ajax.php', form, {
    headers: {
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'origin': 'https://evoig.com',
      'referer': 'https://evoig.com/',
      'user-agent': 'Mozilla/5.0',
      'x-requested-with': 'XMLHttpRequest'
    }
  });
 
  const result = data?.data?.data?.[0];
  if (!result || !result.link) {
    throw new Error('Aduh~ Link-nya nggak ketemu, onee-chan 😵‍💫');
  }
 
  return {
    type: result.type,
    thumb: result.thumb,
    url: result.link
  };
}

module.exports = {
    name: 'Instagram V4',
    desc: 'Download video/image on instagram',
    category: 'Downloader',
    params: ['url'],
    async run(req, res) {
        const { url } = req.query;
        if (!url) return res.status(400).json({ status: false, error: 'Url is required' });
        
        try {
            const results = await evoig(url);
            res.status(200).json({
                status: true,
                data: results
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}