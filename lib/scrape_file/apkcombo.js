const axios = require('axios');
const cheerio = require('cheerio');

const Proxy = (url) =>
    url ? `https://translate.google.com/translate?sl=en&tl=fr&hl=en&u=${encodeURIComponent(url)}&client=webapp` : "";

class apkCombo {
    search = async function search(query) {
        const searchUrl = `https://apkcombo.app/search/${encodeURIComponent(query.replace(" ", "-"))}`;
        const proxySearchUrl = Proxy(searchUrl);

        try {
            const response = await axios.get(proxySearchUrl);
            const res = response.data;
            const $ = cheerio.load(res);
            const results = [];

            $("a.l_item").each(function (index, element) {
                const name = $(element).find("span.name").text();
                const link = $(element).attr("href")
                    .replace("https://apkcombo-app.translate.goog/", "https://apkcombo.app/")
                    .replace("/?_x_tr_sl=en&_x_tr_tl=fr&_x_tr_hl=en&_x_tr_pto=wapp", "");
                const author = $(element).find("span.author").text();
                const rating = $(element).find("span.description span:nth-child(2)").text().replace(' ★', '');
                const downloaded = $(element).find("span.description span:nth-child(1)").text();
                const size = $(element).find("span.description span:nth-child(3)").text();
                const linkD = link + '/download/apk'

                results.push({
                    name,
                    author,
                    rating,
                    downloaded,
                    size,
                    link: linkD
                });
            });

            return results;
        } catch (error) {
            throw new Error(error.message);
        }
    }
    
    download = async function download(url) {
        const proxyUrl = Proxy(url);
        try {
            const response = await axios.get(proxyUrl);
            const res = response.data;
            const $ = cheerio.load(res);

            const downloadLink = $("ul.file-list li a.variant").attr("href");
            let { data: buffer } = await axios.get(downloadLink, {
                responseType: "arraybuffer"
            });

            return {
                downloadLink,
                buffer
            };
        } catch (error) {
            throw new Error(error.message);
        }
    }
};

module.exports = new apkCombo()