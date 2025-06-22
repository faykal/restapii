const axios = require('axios');
const FormData = require('form-data');
const cheerio = require('cheerio');

async function Nonce() {
   const { data } = await axios.get("https://photostylelab.com/photo-styles/gta")
   const $ = cheerio.load(data);
   return $("#akismet_comment_nonce").val();
}

async function imageTogta(urlImage) {
   const NonceFunction = await Nonce();
   
   const ress = await axios.get(urlImage, {
      responseType: "arraybuffer"
   })
   
   const ext = urlImage.endsWith(".png") ? "jpg" : "jpeg"
   
   const form = new FormData();
   form.append("action", "photo_style_convert")
   form.append("image_data", Buffer.from(ress.data), `${Date.now()}_convert_.${ext}`)
   form.append("photo_style_converter_nonce", NonceFunction)
   form.append("photo_style_name", "GTA")
   form.append("model_type", "default")
   form.append("additional_prompt", "")
   
   const headers = {
      headers: {
         ...form.getHeaders()
      }
   }
   
   const { data } = await axios.post("https://photostylelab.com/wp-admin/admin-ajax.php", form, headers)
   
   return data;
}

module.exports = {
  name: 'Image To Gta',
  desc: 'Convert image to ghibli style',
  category: 'Image Creator',
  params: ['url'],
  async run(req, res) {
    try {
      const { url } = req.query;
      if (!url) {
        return res.status(400).json({ status: false, error: 'Url is required' });
      }

      const resp = await imageTogta(url);
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