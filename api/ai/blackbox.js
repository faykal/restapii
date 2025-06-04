const axios = require('axios');

async function blackbox(message) {
    try {
        const { data } = await axios.post(`https://www.blackbox.ai/api/chat`, {
            messages: [
                {
                    role: 'user',
                    content: message,
                    id: null
                }
            ],
            agentMode: {},
            id: null,
            previewToken: null,
            userId: null,
            codeModelMode: true,
            trendingAgentMode: {},
            isMicMode: false,
            userSystemPrompt: null,
            maxTokens: 1024,
            playgroundTopP: null,
            playgroundTemperature: null,
            isChromeExt: false,
            githubToken: '',
            clickedAnswer2: false,
            clickedAnswer3: false,
            clickedForceWebSearch: false,
            visitFromDelta: false,
            isMemoryEnabled: false,
            mobileClient: false,
            userSelectedModel: null,
            validated: '00f37b34-a166-4efb-bce5-1312d87f2f94',
            imageGenerationMode: false,
            webSearchModePrompt: false,
            deepSearchMode: false,
            domains: null,
            vscodeClient: false,
            codeInterpreterMode: false,
            customProfile: {
                name: '',
                occupation: '',
                traits: [],
                additionalInfo: '',
                enableNewChats: false
            },
            webSearchModeOption: {
                autoMode: true,
                webMode: false,
                offlineMode: false
            },
            session: null,
            isPremium: false,
            subscriptionCache: null,
            beastMode: false,
            reasoningMode: false,
            designerMode: false,
            workspaceId: '',
            asyncMode: false
        }, {
            headers: {
                accept: '*/*',
                'content-type': 'application/json',
                origin: 'https://www.blackbox.ai',
                referer: 'https://www.blackbox.ai/',
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
            }
        });

        return data;
    } catch (error) {
        console.error(error.message);
        throw new Error('No result found');
    }
};

module.exports = {
    name: 'BlackBox',
    desc: 'Talk with blackbox ai',
    category: 'Artificial Intelligence',
    params: ['text'],
    async run(req, res) {
            try {
            const { text } = req.query;
            if (!text) {
                return res.status(400).json({ status: false, error: 'Text is required' });
            }
            const resp = await blackbox(text);
            res.status(200).json({
                status: true,
                data: resp
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}