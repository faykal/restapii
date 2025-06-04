const axios = require("axios")
const cheerio = require('cheerio');

function extractUrl(url) {
    let match = url.match(/\/(hd|dl|mp3)\/([A-Za-z0-9+/=]+)/);
    if (match && match[2]) {
        let link = match[2];
        return Buffer.from(link, 'base64').toString('utf-8');
    }
    return url;
}

function musicaldown(url) {
    const cfg = {
        headers: {
            'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
        }
    }
    return new Promise(async (resolve, reject) => {
        try {
            await axios.get('https://musicaldown.com/id/download', cfg).then(async (res) => {
                const $ = cheerio.load(res.data)
                const url_name = $('#link_url').attr('name')
                const ko = $('#submit-form > div')
                const token = ko.find('div.inputbg input[type=hidden]:nth-child(2)')
                const verify = ko.find('div.inputbg input[type=hidden]:nth-child(3)')
                let data = {
                    [url_name]: url,
                    [token.attr('name')]: token.attr('value'),
                    verify: verify.attr('value')
                }

                let pageDl = await axios.post('https://musicaldown.com/id/download', new URLSearchParams(data), {
                    headers: {
                        ...cfg.headers,
                        cookie: res.headers['set-cookie'].join('; ')
                    }
                })

                const $$ = cheerio.load(pageDl.data)
                let isSlide = $$('div.card-image')

                if (isSlide.length === 0) {
                    let getPageMusic = await axios.post('https://musicaldown.com/id/mp3', '', {
                        headers: {
                            ...cfg.headers,
                            cookie: res.headers['set-cookie'].join('; ')
                        }
                    })
                    const exMs = cheerio.load(getPageMusic.data)
                    const audio = exMs('a[data-event="mp3_download_dclick"]').attr('href')
                    resolve({
                        status: true,
                        type: 'video',
                        desc: $$('.video-desc.white-text').text().trim(),
                        author: $$('.video-author.white-text b').text().trim(),
                        thumbnail: $$('.video-header.bg-overlay').attr('style').match(/url\((.*?)\)/)[1],
                        authorimg: $$('.img-area img').attr('src'),
                        video: extractUrl($$('a[data-event="mp4_download_click"]').attr('href')),
                        video_hd: extractUrl($$('a[data-event="hd_download_click"]').attr('href')),
                        video_wm: extractUrl($$('a[data-event="watermark_download_click"]').attr('href')),
                        audio
                    })
                } else {
                    let image = [];
                    isSlide.each((_, e) => {
                        image.push($$(e).find("img").attr("src"))
                    })
                    let audio = extractUrl($$('a[data-event="mp3_download_click"]').attr('href'))
                    let getToken = pageDl.data.match(/ data: '(.*?)'\n/)[1]
                    let vidSlide = await axios.post('https://mddown.xyz/slider', new URLSearchParams({
                        data: getToken
                    }), cfg)
                    resolve({
                        status: true,
                        type: 'slide',
                        image,
                        video: vidSlide.data.url,
                        audio
                    })
                }
            })
        } catch (e) {
            resolve({
                status: false,
                mess: `Failed to download, with message: ${e.message}`
            })
        }
    })
}

module.exports = {
    name: 'TikTok V2',
    desc: 'Download video/image on tiktok',
    category: 'Downloader',
    params: ['url'],
    async run(req, res) {
        const { url } = req.query;
        if (!url) return res.status(400).json({ status: false, error: 'Url is required' });
        try {
            const results = await musicaldown(url);
            res.status(200).json({
                status: true,
                data: results
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}