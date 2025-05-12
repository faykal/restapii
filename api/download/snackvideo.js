const axios = require("axios");
const cheerio = require("cheerio");

async function search(q) {
        return new Promise(async (resolve, reject) => {
            await axios.get("https://www.snackvideo.com/discover/" + q)
                .then((a) => {
                    let $ = cheerio.load(a.data);
                    let content = $("#ItemList").text().trim();
                    if (!content) return reject({
                        msg: "Video tidak ditemukan !"
                    });
                    let json = JSON.parse(content);
                    let result = json.map((a) => a.innerHTML).map((a) => ({
                        title: a.name,
                        thumbnail: a.thumbnailUrl[0],
                        uploaded: new Date(a.uploadDate).toLocaleString(),
                        stats: {
                            watch: a.interactionStatistic[0].userInteractionCount,
                            likes: a.interactionStatistic[1].userInteractionCount,
                            comment: a.commentCount,
                            share: a.interactionStatistic[2].userInteractionCount,
                        },
                        author: {
                            name: a.creator.mainEntity.name,
                            alt_name: a.creator.mainEntity.alternateName,
                            bio: a.creator.mainEntity.description,
                            avatar: a.creator.mainEntity.image,
                            stats: {
                                likes: a.creator.mainEntity.interactionStatistic[0].userInteractionCount,
                                followers: a.creator.mainEntity.interactionStatistic[1].userInteractionCount
                            }
                        },
                        url: a.url
                    }))
                    resolve(result);
                })
                .catch((error) => {
                    reject({
                        msg: error.message
                    });
                });
        });
    }
async function download(url) {
        return new Promise(async (resolve, reject) => {
            await axios.get(url).then((a) => {
                let $ = cheerio.load(a.data);
                let result = {
                    metadata: {},
                    download: null
                }
                let json = JSON.parse($("#VideoObject").text().trim())
                result.metadata.title = json.name
                result.metadata.thumbnail = json.thumbnailUrl[0]
                result.metadata.uploaded = new Date(json.uploadDate).toLocaleString()
                result.metadata.comment = json.commentCount
                result.metadata.watch = json.interactionStatistic[0].userInteractionCount
                result.metadata.likes = json.interactionStatistic[1].userInteractionCount
                result.metadata.share = json.interactionStatistic[2].userInteractionCount
                result.metadata.author = json.creator.mainEntity.name
                result.download = json.contentUrl
                resolve(result);
            })
        })
    }

module.exports = {
    name: 'Snackvideo',
    desc: 'Download video on snackvideo',
    category: 'Downloader',
    params: ['url'],
    async run(req, res) {
        const { url } = req.query;
        if (!url) return res.status(400).json({ status: false, error: 'Url is required' });
        
        try {
            const results = await download(url);
            res.status(200).json({
                status: true,
                result: results.metadata
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}