const axios = require('axios');
const cheerio = require('cheerio');

class SpotMate {
  constructor() {
    this._cookie = null;
    this._token = null;
  }

  async _visit() {
    try {
      const response = await axios.get('https://spotmate.online/en', {
        headers: {
          'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36',
        },
      });

      const setCookieHeader = response.headers['set-cookie'];
      if (setCookieHeader) {
        this._cookie = setCookieHeader
          .map((cookie) => cookie.split(';')[0])
          .join('; ');
      }

      const $ = cheerio.load(response.data);
      this._token = $('meta[name="csrf-token"]').attr('content');

      if (!this._token) {
        throw new Error('Token CSRF tidak ditemukan.');
      }

      console.log('Berhasil mendapatkan cookie dan token.');
    } catch (error) {
      throw new Error(`Gagal mengunjungi halaman: ${error.message}`);
    }
  }

  async info(spotifyUrl) {
    if (!this._cookie || !this._token) {
      await this._visit();
    }

    try {
      const response = await axios.post(
        'https://spotmate.online/getTrackData',
        { spotify_url: spotifyUrl },
        {
          headers: this._getHeaders(),
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Gagal mendapatkan info track: ${error.message}`);
    }
  }

  async convert(spotifyUrl) {
    if (!this._cookie || !this._token) {
      await this._visit();
    }

    try {
      const response = await axios.post(
        'https://spotmate.online/convert',
        { urls: spotifyUrl },
        {
          headers: this._getHeaders(),
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Gagal mengonversi track: ${error.message}`);
    }
  }

  clear() {
    this._cookie = null;
    this._token = null;
    console.log('Cookie dan token telah dihapus.');
  }

  _getHeaders() {
    return {
      'authority': 'spotmate.online',
      'accept': '*/*',
      'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'content-type': 'application/json',
      'cookie': this._cookie,
      'origin': 'https://spotmate.online',
      'referer': 'https://spotmate.online/en',
      'sec-ch-ua': '"Not A(Brand";v="8", "Chromium";v="132"',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36',
      'x-csrf-token': this._token,
    };
  }
}

module.exports = {
    name: 'Spotify',
    desc: 'Download song on spotify',
    category: 'Downloader',
    params: ['url'],
    async run(req, res) {
        const { url } = req.query;
        if (!url) return res.status(400).json({ status: false, error: 'Url is required' });
        try {
            const spotMate = new SpotMate();
            const trackInfo = await spotMate.info(url);
            const convertResult = await spotMate.convert(url);      
            res.status(200).json({
                status: true,
                data: {
                url: convertResult.url, 
                title: trackInfo.album.name
                }
            });
            spotMate.clear();
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}
