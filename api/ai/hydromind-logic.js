const axios = require('axios');
const FormData = require('form-data');

module.exports = {
    name: 'HydroMind With Logic',
    desc: 'Chat with hydromind custom logic',
    category: 'AI',
    params: ['text', 'logic'],
    async run(req, res) {
        try {
            const { text, logic } = req.query;
            if (!text || !logic) return res.status(400).json({ status: false, error: 'Text and Logic is required' });
            
            const form = new FormData();
            form.append('content', text);
            form.append('model', '@custom/models');
            form.append('system', logic);
            const { data } = await axios.post('https://mind.hydrooo.web.id/v1/chat/', form, {
                headers: {
                    ...form.getHeaders(),
                }
            })
            res.status(200).json({
                status: true,
                result: data.result
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}