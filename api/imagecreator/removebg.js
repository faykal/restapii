const axios = require('axios');
const FormData = require('form-data');
const { fromBuffer } = require('file-type');
const qs = require('qs');

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
		return err
	}
}

const tool = [ 'removebg', 'enhance', 'upscale', 'restore', 'colorize' ];

const pxpic = {
 upload: async (filePath) => {
  const buffer = filePath
  const { ext, mime } = (await fromBuffer(buffer)) || {};
  const fileName = Date.now() + "." + ext;

  const folder = "uploads";
  const responsej = await axios.post("https://pxpic.com/getSignedUrl", { folder, fileName }, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  const { presignedUrl } = responsej.data;

  await axios.put(presignedUrl, buffer, {
    headers: {
      "Content-Type": mime,
    },
  });

  const cdnDomain = "https://files.fotoenhancer.com/uploads/";
  const sourceFileUrl = cdnDomain + fileName;

  return sourceFileUrl;
  },
  create: async (filePath, tools) => {
    if (!tool.includes(tools)) { 
        return `Pilih salah satu dari tools ini: ${tool.join(', ')}`; 
    }
    const url = await pxpic.upload(filePath);
    let data = qs.stringify({
      'imageUrl': url,
      'targetFormat': 'png',
      'needCompress': 'no',
      'imageQuality': '100',
      'compressLevel': '6',
      'fileOriginalExtension': 'png',
      'aiFunction': tools,
      'upscalingLevel': ''
    });

    let config = {
      method: 'POST',
      url: 'https://pxpic.com/callAiFunction',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Android 10; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/png,image/svg+xml,*/*;q=0.8',
        'Content-Type': 'application/x-www-form-urlencoded',
        'accept-language': 'id-ID'
      },
      data: data
    };

    const api = await axios.request(config);
    return api.data;
  }
}

module.exports = {
    name: 'Remove Background',
    desc: 'Remove background from image',
    category: 'Image Creator',
    params: ['url'],
    async run(req, res) {
       const { url } = req.query;
            if (!url) {
                return res.status(400).json({ status: false, error: 'Url is required' });
            }
        try {
            let image = await getBuffer(url)
            const result = await pxpic.create(image, "removebg")
            res.status(200).json({
                status: true,
                data: result.resultImageUrl
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}