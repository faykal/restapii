const cheerio = require('cheerio');
const CryptoJS = require('crypto-js') ;

const allInOneDownloader = {
  getToken: async function () {
    const req = await fetch("https://allinonedownloader.com/");
    if (!req.ok) return null;
    
    const res = await req.text();
    const $ = cheerio.load(res);
    const token = $("#token").val();
    const url = $("#scc").val();
    const cookie = req.headers.get('set-cookie');
    
    return {
      token,
      url,
      cookie
    };
  },
  
  generateHash: function (url, token) {
    const key = CryptoJS.enc.Hex.parse(token);
    const iv = CryptoJS.enc.Hex.parse('afc4e290725a3bf0ac4d3ff826c43c10');
	const encrypted = CryptoJS.AES.encrypt(url, key, {
	  iv,
	  padding: CryptoJS.pad.ZeroPadding
	});
	const urlhash = encrypted.toString();
	
	return urlhash;
  },
  
  download: async function (url) {
    const conf = await allInOneDownloader.getToken();
    if (!conf) return { error: "Gagal mendapatkan token dari web.", result: {} };
    
    const { token, url: path, cookie } = conf;
    
    const hash = allInOneDownloader.generateHash(url, token);
    
    const data = new URLSearchParams();
    data.append('url', url);
    data.append('token', token);
    data.append('urlhash', hash);
    
    const req = await fetch(`https://allinonedownloader.com${path}`, {
      method: "POST",
      headers: {
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "en-US,en;q=0.9,id-ID;q=0.8,id;q=0.7,as;q=0.6",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Cookie": `crs_ALLINONEDOWNLOADER_COM=blah; ${cookie}`,
        "Dnt": "1",
        "Origin": "https://allinonedownloader.com",
        "Referer": "https://allinonedownloader.com/",
        "Sec-Ch-Ua": `"Not-A.Brand";v="99", "Chromium";v="124"`,
        "Sec-Ch-Ua-Mobile": "?1",
        "Sec-Ch-Ua-Platform": `"Android"`,
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
        "X-Requested-With": "XMLHttpRequest"
      },
      body: data
    });
    
    if (!req.ok) return { error: "Terjadi kesalahan saat melakukan request", result: {} };
    
    let json;
    try {
      json = await req.json();
    } catch (e) {
      console.error(e);
      return { error: e.message, result: {} };
    }
    
    return {
      input_url: url,
      source: json.source,
      result: {
        title: json.title,
        duration: json.duration,
        thumbnail: json.thumbnail,
        thumb_width: json.thumb_width,
        thumb_height: json.thumb_height,
        videoCount: json.videoCount,
        imageCount: json.imageCount,
        downloadUrls: json.links
      },
      error: null
    };
  }
};

module.exports = {
    name: 'Aio',
    desc: 'All In One Downloader',
    category: 'Downloader',
    params: ['url'],
    async run(req, res) {
        const { url } = req.query;
            if (!url) {
                return res.status(400).json({ status: false, error: 'Url is required' });
            }
        try {
            const results = await allInOneDownloader.download(url);
            res.status(200).json({
                status: true,
                data: results
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}
