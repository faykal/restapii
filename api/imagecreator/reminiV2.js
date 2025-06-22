const axios = require('axios');
const FormData = require('form-data');

const VALID_RASIO = {
  "4": 4,
  "2": 2
};

async function imgUpscale(urlImage, rasio) {
  if (!Object.keys(VALID_RASIO).includes(rasio)) {
    throw new Error(`Please input a valid upscale ratio: ${Object.keys(VALID_RASIO).join(", ")}`);
  }

  const ressBuff = await axios.get(urlImage, {
    responseType: "arraybuffer",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9"
    }
  });

  const form = new FormData();
  form.append("myfile", Buffer.from(ressBuff.data), `${Date.now()}_upscale.jpg`);
  form.append("scaleRadio", rasio);

  const { data } = await axios.post("https://get1.imglarger.com/api/UpscalerNew/UploadNew", form, {
    headers: {
      ...form.getHeaders(),
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "Accept": "application/json, text/plain, */*",
      "Origin": "https://imgupscaler.com",
      "Referer": "https://imgupscaler.com/"
    }
  });

  const code = data.data.code;
  const payload = {
    code: code,
    scaleRadio: rasio
  };

  let result;
  do {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const { data: res } = await axios.post("https://get1.imglarger.com/api/UpscalerNew/CheckStatusNew", payload, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Content-Type": "application/json",
        "Accept": "application/json, text/plain, */*",
        "Origin": "https://imgupscaler.com",
        "Referer": "https://imgupscaler.com/"
      }
    });
    result = res;
  } while (result.data.status !== "success");

  return result;
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

      const resp = await imgUpscale(url, "4");
      res.status(200).json({ 
        status: true,
         data: { 
            url: resp
         }
        });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  }
};
