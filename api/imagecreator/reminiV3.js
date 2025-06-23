const axios = require('axios');
 
async function upscale(imageUrl) {
  try {
    const imageResponse = await axios.get(imageUrl, {
      responseType: 'arraybuffer'
    })
    const base64Image = `data:image/jpeg;base64,${Buffer.from(imageResponse.data).toString('base64')}`
 
    const upscaleResponse = await axios.post('https://www.upscale-image.com/api/upscale', {
      image: base64Image,
      model: 'fal-ai/esrgan',
      width: 1200,
      height: 1200
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://www.upscale-image.com',
        'Referer': 'https://www.upscale-image.com'
      }
    })
 
    const { upscaledImageUrl, width, height, fileSize } = upscaleResponse.data
 
    if (!upscaledImageUrl) throw new Error('ga ada respon sensei!')
 
    return {
      url: upscaledImageUrl,
      width,
      height,
      fileSize: formatBytes(fileSize)
    }
 
  } catch (err) {
    throw new Error(`Upscale gagal: ${err?.response?.data?.message || err.message}`)
  }
}
 
function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
}

module.exports = {
  name: 'Remini V3',
  desc: 'Remini from image',
  category: 'Image Creator',
  params: ['url'],
  async run(req, res) {
    try {
      const { url } = req.query;
      if (!url) {
        return res.status(400).json({ status: false, error: 'Url is required' });
      }
      const resp = await upscale(url);
      res.status(200).json({ 
        status: true,
         data: resp
        });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  }
};