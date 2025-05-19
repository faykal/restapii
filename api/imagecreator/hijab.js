const axios = require('axios');
module.exports = {
    name: 'To Hijab',
    desc: 'Make a photo wearing a hijab',
    category: 'Image Creator',
    params: ['url'],
    async run(req, res) {
    const { url } = req.query;
    if (!url) {
        return res.status(400).json({ status: false, error: 'Url is required' });
        }
    try {
    const apiUrl = `https://api.nekorinn.my.id/tools/to-hijab?imageUrl=${encodeURIComponent(url)}`;
    const response = await axios.get(apiUrl, {
    responseType: 'arraybuffer'
    });
      res.set('Content-Type', 'image/png');
      res.send(response.data);
        } catch (error) {
            res.status(500).json({ status: false, message: 'Gagal mengakses API to-hijab', error: error.message });
        }
    }
}