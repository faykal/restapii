const axios = require('axios');

async function gpt(prompt, model = 'chatgpt4') {
    try {
        const model_list = {
            chatgpt4: {
                api: 'https://stablediffusion.fr/gpt4/predict2',
                referer: 'https://stablediffusion.fr/chatgpt4'
            },
            chatgpt3: {
                api: 'https://stablediffusion.fr/gpt3/predict',
                referer: 'https://stablediffusion.fr/chatgpt3'
            }
        };
        if (!prompt) throw new Error('Prompt is required');
        if (!model_list[model]) throw new Error(`List available models: ${Object.keys(model_list).join(', ')}`);

        const hmm = await axios.get(model_list[model].referer);
        const { data } = await axios.post(model_list[model].api, {
            prompt: prompt
        }, {
            headers: {
                accept: '*/*',
                'content-type': 'application/json',
                origin: 'https://stablediffusion.fr',
                referer: model_list[model].referer,
                cookie: hmm.headers['set-cookie'].join('; '),
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Mobile Safari/537.36'
            }
        });

        return data.message;
    } catch (error) {
        console.error(error.message);
        throw new Error('No result found');
    }
}

module.exports = {
    name: 'Gpt4',
    desc: 'Talk with gpt4',
    category: 'Artificial Intelligence',
    params: ['text'],
    async run(req, res) {
            try {
            const { text } = req.query;
            if (!text) {
                return res.status(400).json({ status: false, error: 'Text is required' });
            }
            const resp = await gpt(text, 'chatgpt4');
            res.status(200).json({
                status: true,
                data: resp
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}