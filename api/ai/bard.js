const axios = require("axios")
module.exports = {
    name: 'Bard',
    desc: 'Talk with bard ai',
    category: 'Artificial Intelligence',
    params: ['text'],
    async run(req, res) {
        const { text } = req.query;
        if (!text) return res.status(400).json({ status: false, error: 'Text is required' });
        try {
            const fay = await axios.get(`https://api.siputzx.my.id/api/ai/bard?query=${text}`)
                res.status(200).json({
                    status: true,
                    data: fay.data.data
                });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}
