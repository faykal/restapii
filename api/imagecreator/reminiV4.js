const axios = require("axios")
const FormData = require('form-data')
 
async function upscale(imageUrl, resolution = '1080p', enhance = true) {
  if (!/^https?:\/\/.+\.(jpe?g|png|webp|gif)$/i.test(imageUrl))
    throw new Error('ga valid, dasar senpai bodoh!')
 
  if (!['480p', '720p', '1080p', '2k', '4k'].includes(resolution.toLowerCase()))
    throw new Error('Resolusi ga valid: pilih 480p, 720p, 1080p, 2k, 4k')
 
  const { data: imageBuffer } = await axios.get(imageUrl, { responseType: 'arraybuffer' })
 
  const form = new FormData()
  form.append('image', imageBuffer, { filename: 'image.jpg' })
  form.append('resolution', resolution.toLowerCase())
  form.append('enhance', enhance.toString())
 
  const { data } = await axios.post(
    'https://upscale.cloudkuimages.guru/hd.php',
    form,
    {
      headers: {
        ...form.getHeaders(),
        origin: 'https://upscale.cloudkuimages.guru',
        referer: 'https://upscale.cloudkuimages.guru/',
      },
      maxBodyLength: Infinity,
    }
  )
 
  if (data?.status !== 'success') throw new Error('Upscale gagal: ' + JSON.stringify(data))
 
  const result = data.data
  return {
    url: result.url,
    filename: result.filename,
    original: result.original,
    resolution_from: result.original_resolution,
    resolution_to: result.resolution_now,
    enhanced: result.enhanced,
    size_before: result.original_size,
    size_after: result.new_size
  }
}

module.exports = {
  name: 'Remini V4',
  desc: 'Remini from image',
  category: 'Image Creator',
  params: ['url'],
  async run(req, res) {
    try {
      const { url } = req.query;
      if (!url) {
        return res.status(400).json({ status: false, error: 'Url is required' });
      }
      const resp = await upscale(url, '4k', true);
      res.status(200).json({ 
        status: true,
        data: resp
    });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  }
};