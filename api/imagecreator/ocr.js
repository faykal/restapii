const axios = require('axios');

async function kallocr(url) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');
    const base64 = buffer.toString('base64');
    const res = await axios.post('https://docsbot.ai/api/tools/image-prompter', {
      type: 'text',
      image: base64
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const hasil = res.data;
    return typeof hasil === 'string' ? hasil.trim() : JSON.stringify(hasil, null, 2);
  } catch (error) {
    throw error;
  }
}

module.exports = {
  name: 'OCR',
  desc: 'OCR from image',
  category: 'Image Creator',
  params: ['url'],
  async run(req, res) {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ status: false, error: 'Url is required' });
    }
    try {
      const hasil = await kallocr(url);
      res.status(200).json({ status: true, data: hasil });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  }
}