const axios = require("axios");
const crypto = require('crypto');
 
async function timex() {
    try {
        const { data } = await axios.get('https://igram.world/msec');
        return Math.floor(data.msec * 1000);
    } catch (error) {
        console.error('Error fetching time:', error) 
    }
}
 
async function generateSignature(url, secretKey) {
    const time = await timex();
    const ab = Date.now() - (time ? Date.now() - time : 0);
    const hashString = `${url}${ab}${secretKey}`;
    const signature = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(hashString))
      .then(buffer => Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join(''));
 
    return { signature, ab, time };
}
 
async function igram(url) {
    const secretKey = '40a71e771b673e3a35200acdd331bbd616fc4ba76c6d77d821a25985e46fb488';
    const { signature, ab, time } = await generateSignature(url, secretKey);
 
    const requestData = {
        url: url,
        ts: ab, 
        _ts: `1739185248317`, 
        _tsc: time ? Date.now() - time : 0,
        _s: signature
    };
 
    const headers = {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://igram.world/',
  'authority': 'igram.world',
        'Origin': 'https://igram.world/'
    };
 
    try {
        const response = await axios.post('https://api.igram.world/api/convert', requestData, { headers });
        return response.data;
    } catch (error) {
        return { error: 'Error scraping data', details: error.response ? error.response.data : error.message };
    }
}

module.exports = {
    name: 'Instagram V3',
    desc: 'Download video/image/stories on instagram',
    category: 'Downloader',
    params: ['url'],
    async run(req, res) {
        const { url } = req.query;
        if (!url) return res.status(400).json({ status: false, error: 'Url is required' });
        
        try {
            const results = await igram(url);
            res.status(200).json({
                status: true,
                result: results
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}