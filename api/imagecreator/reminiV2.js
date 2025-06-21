const axios = require('axios');
const FormData = require('form-data');

const getBuffer = async (url, options) => {
  try {
    options ? options : {}
    const res = await axios({
      method: "get",
      url,
      headers: {
        'DNT': 1,
        'Upgrade-Insecure-Request': 1
      },
      ...options,
      responseType: 'arraybuffer'
    })
    return res.data
  } catch (err) {
    console.error(err.message);
    throw new Error(err.message);
  }
}

async function imglarger(buffer, options = {}) {
  try {
    const { scale = '2', type = 'upscale' } = options;
    const config = {
      scales: ['2', '4'],
      types: { upscale: 13, enhance: 2, sharpener: 1 }
    };

    if (!Buffer.isBuffer(buffer)) throw new Error('Image buffer is required');
    if (!config.types[type]) throw new Error(`Available types: ${Object.keys(config.types).join(', ')}`);
    if (type === 'upscale' && !config.scales.includes(scale.toString())) throw new Error(`Available scales: ${config.scales.join(', ')}`);

    const form = new FormData();
    form.append('file', buffer, `rynn_${Date.now()}.jpg`);
    form.append('type', config.types[type].toString());
    if (!['sharpener'].includes(type)) form.append('scaleRadio', type === 'upscale' ? scale.toString() : '1');

    const maxRetries = 3;
    let retries = 0;
    while (retries < maxRetries) {
      try {
        const { data: p } = await axios.post('https://photoai.imglarger.com/api/PhoAi/Upload', form, {
          headers: {
            ...form.getHeaders(),
            accept: 'application/json, text/plain, */*',
            origin: 'https://imglarger.com',
            referer: 'https://imglarger.com/',
            'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
          }
        });

        if (!p.data.code) throw new Error('Upload failed - no code received');

        while (true) {
          const { data: r } = await axios.post('https://photoai.imglarger.com/api/PhoAi/CheckStatus', {
            code: p.data.code,
            type: config.types[type]
          }, {
            headers: {
              accept: 'application/json, text/plain, */*',
              'content-type': 'application/json',
              origin: 'https://imglarger.com',
              referer: 'https://imglarger.com/',
              'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
            }
          });

          if (r.data.status === 'waiting') {
            await new Promise(resolve => setTimeout(resolve, 5000));
          } else if (r.data.status === 'success') {
            return r.data.downloadUrls[0];
          } else {
            throw new Error('Gagal memproses gambar');
          }
        }
      } catch (error) {
        if (error.response && error.response.status === 502) {
          retries++;
          await new Promise(resolve => setTimeout(resolve, 5000));
        } else {
          throw error;
        }
      }
    }
    throw new Error('Gagal setelah beberapa kali percobaan');
  } catch (error) {
    console.error(error.message);
    throw new Error(error.message);
  }
}

module.exports = {
  name: 'Remini V2',
  desc: 'Remini from image',
  category: 'Image Creator',
  params: ['url'],
  async run(req, res) {
    try {
      const { url } = req.query;
      if (!url) {
        return res.status(400).json({ status: false, error: 'Url is required' });
      }

      let image = await getBuffer(url);
      const resp = await imglarger(image, { scale: '4' });
      res.status(200).json({ status: true, data: { url: resp } });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  }
};
