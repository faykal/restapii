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
            const fay = await axios.get(`https://api.kenshiro.cfd/api/ai/bard?text=${text}`)
                res.status(200).json({
                    status: true,
                    result: fay.data.data
                });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}