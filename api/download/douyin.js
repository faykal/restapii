const cheerio = require("cheerio");
async function douyin(url) {
    const apiUrl = "https://lovetik.app/api/ajaxSearch";
    const formBody = new URLSearchParams();
    formBody.append("q", url);
    formBody.append("lang", "id");
 
    const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Accept": "*/*",
            "X-Requested-With": "XMLHttpRequest"
        },
        body: formBody.toString()
    });
 
    const data = await response.json();
    if (data.status !== "ok") {
        throw new Error("Failed to fetch video data");
    }
 
    const $ = cheerio.load(data.data);
    const title = $("h3").text();
    const thumbnail = $(".image-tik img").attr("src");
    const duration = $(".content p").text();
    const dl = [];
 
    $(".dl-action a").each((i, el) => {
        dl.push({
            text: $(el).text().trim(),
            url: $(el).attr("href")
        });
    });
 
    return {
        title,
        thumbnail,
        duration,
        dl
    };
}

module.exports = {
    name: 'Douyin',
    desc: 'Download on douyin',
    category: 'Downloader',
    params: ['url'],
    async run(req, res) {
        const { url } = req.query;
        if (!url) return res.status(400).json({ status: false, error: 'Url is required' });
        
        try {
            const results = await douyin(url);
            res.status(200).json({
                status: true,
                data: results
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}