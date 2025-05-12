const RES = require("axios");

const models = {
  chatgpt4: "https://chatbot.nazirganz.space/api/chatgpt4o-api?prompt=",
  deepseek: "https://chatbot.nazirganz.space/api/deepseek-api?prompt=",
  metaai: "https://chatbot.nazirganz.space/api/metaai-api?prompt="
}

async function chatBotAi(p, m) {
  if (!Object.keys(models).includes(m)) {
    return `Model Yang Tersedia: ${Object.keys(model).join(", ")}`
  }
  let mdl = models[m]
  try {
    let { data } = await RES.get(mdl + encodeURIComponent(p))
    return {
      chat: data.result
    }
  } catch (e) {
    return `Error Dan Ini String Nya: ${e.message.toString()}`
  }
}

module.exports = {
    name: 'Chatbot',
    desc: 'Models: chatgpt4, deepseek, metaai',
    category: 'Artificial Intelligence',
    params: ['text', 'model'],
    async run(req, res) {
        try {
            const { text, model } = req.query;
            if (!text || !model) return res.status(400).json({ status: false, error: 'Text and Model is required' });
            const result = await chatBotAi(text, model)
            res.status(200).json({
                status: true,
                result
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}
