const axios = require('axios');

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

async function anim() {
        try {
            const data = `https://img12.pixhost.to/images/507/570627648_skyzopedia.jpg`
            const response = await getBuffer(data)
            return response
        } catch (error) {
            throw error;
        }
    }
module.exports = {
    name: 'Waifu',
    desc: 'Waifu random image',
    category: 'Random',
    async run(req, res) {
        try {
            const pedo = await anim();
            res.writeHead(200, {
                'Content-Type': 'image/png',
                'Content-Length': pedo.length,
            });
            res.end(pedo);
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
};

