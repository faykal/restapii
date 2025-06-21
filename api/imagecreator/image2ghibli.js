const axios = require('axios');
const { randomUUID, randomBytes } = require('crypto');
const FormData = require('form-data');

async function generateGhibliStyleImage(url) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');
    const mime = response.headers['content-type'];

    const uuid = randomUUID();
    const ext = '.' + mime.split('/')[1];
    const filename = `Faykal_${randomBytes(4).toString('hex')}${ext}`;

    const form = new FormData();
    form.append('file', buffer, { filename, contentType: mime });

    const headers = {
      ...form.getHeaders(),
      'x-device-language': 'en',
      'x-device-platform': 'web',
      'x-device-uuid': uuid,
      'x-device-version': '1.0.44'
    };

    const uploadRes = await axios.post(
      'https://widget-api.overchat.ai/v1/chat/upload',
      form,
      { headers }
    );

    const { link, croppedImageLink, chatId } = uploadRes.data;
    const prompt = 'Ghibli Studio style, charming hand-drawn anime-style illustration.';
    const payload = {
      chatId,
      prompt,
      model: 'gpt-image-1',
      personaId: 'image-to-image',
      metadata: {
        files: [{ path: filename, link, croppedImageLink }]
      }
    };

    const genRes = await axios.post(
      'https://widget-api.overchat.ai/v1/images/generations',
      payload,
      { headers: { 'content-type': 'application/json' } }
    );

    if (genRes.data && genRes.data.data && genRes.data.data[0] && genRes.data.data[0].url) {
      const imageUrl = genRes.data.data[0].url;
      return imageUrl;
    } else {
      throw new Error('Gagal generate gambar');
    }
  } catch (err) {
    throw new Error(`Error: ${err.message}`);
  }
}

module.exports = {
  name: 'Image To Ghibli',
  desc: 'Convert image to ghibli style',
  category: 'Image Creator',
  params: ['url'],
  async run(req, res) {
    try {
      const { url } = req.query;
      if (!url) return res.status(400).json({ status: false, error: 'Url is required' });

      const imageUrl = await generateGhibliStyleImage(url);
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data, 'binary');

      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': buffer.length,
      });
      res.end(buffer);
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  }
};
