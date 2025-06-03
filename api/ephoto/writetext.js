const axios = require("axios")
const cheerio = require('cheerio');
const FormData = require('form-data')

async function ephoto(command, texk) {
    const links = {
        glitchtext: 'https://en.ephoto360.com/create-digital-glitch-text-effects-online-767.html',
        writetext: 'https://en.ephoto360.com/write-text-on-wet-glass-online-589.html',
        advancedglow: 'https://en.ephoto360.com/advanced-glow-effects-74.html',
        logomaker: 'https://en.ephoto360.com/free-bear-logo-maker-online-673.html',
        pixelglitch: 'https://en.ephoto360.com/create-pixel-glitch-text-effect-online-769.html',
        neonglitch: 'https://en.ephoto360.com/create-impressive-neon-glitch-text-effects-online-768.html',
        flagtext: 'https://en.ephoto360.com/nigeria-3d-flag-text-effect-online-free-753.html',
        flag3dtext: 'https://en.ephoto360.com/free-online-american-flag-3d-text-effect-generator-725.html',
        deletingtext: 'https://en.ephoto360.com/create-eraser-deleting-text-effect-online-717.html',
        sandsummer: 'https://en.ephoto360.com/write-in-sand-summer-beach-online-576.html',
        makingneon: 'https://en.ephoto360.com/making-neon-light-text-effect-with-galaxy-style-521.html',
        royaltext: 'https://en.ephoto360.com/royal-text-effect-online-free-471.html'
    };
    
    const url = links[command];
    let form = new FormData();
    let gT = await axios.get(url, { headers: { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36" }});
    let $ = cheerio.load(gT.data);
    let token = $("input[name=token]").val();
    let build_server = $("input[name=build_server]").val();
    let build_server_id = $("input[name=build_server_id]").val();
    form.append("text[]", texk);
    form.append("token", token);
    form.append("build_server", build_server);
    form.append("build_server_id", build_server_id);
    let res = await axios.post(url, form, { headers: { Accept: "*/*", "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36", cookie: gT.headers["set-cookie"]?.join("; "), ...form.getHeaders()}})
    let $$ = cheerio.load(res.data);
    let json = JSON.parse($$("input[name=form_value_input]").val());
    json["text[]"] = json.text;
    delete json.text
    let { data } = await axios.post("https://en.ephoto360.com/effect/create-image", new URLSearchParams(json), { headers: { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36", cookie: gT.headers["set-cookie"].join("; ")}});
    return build_server + data.image
}

module.exports = {
    name: 'Writetext',
    desc: 'Image marker',
    category: 'Ephoto marker',
    params: ['text'],
    async run(req, res) {
        try {
    const { text } = req.query;
    if (!text) return res.status(400).json({ status: false, error: 'Text is required' });
            const imageUrl = await ephoto('writetext', `${text}`);
            const response = await axios.get(imageUrl, { responseType: 'arraybuffer' })
            res.writeHead(200, {
                'Content-Type': 'image/jpg',
            });
            res.end(response.data);
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
};
