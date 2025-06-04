const fetch = require('node-fetch')

const snapins = async (urlIgPost) => {
    const headers = {
        "content-type": "application/x-www-form-urlencoded",
    }
 
    const response = await fetch("https://snapins.ai/action.php", {
        headers,
        "body": "url=" + encodeURIComponent(urlIgPost),
        "method": "POST"
    })
 
    if (!response.ok) throw Error (`gagal mendownload informasi. ${response.status} ${response.statusText}`)
    
    const json = await response.json()
 
    const name = json.data?.[0]?.author?.name || "(no name)"
    const username = json.data?.[0]?.author?.username || "(no username)"
    
    let images = []
    let videos = []
 
    json.data.map(v => {
        if (v.type == "image"){
            images.push(v.imageUrl)
        }else if (v.type == "video"){
            videos.push(v.videoUrl)
        }
    })
 
    return {name, username, images, videos}
}

module.exports = {
    name: 'Instagram V2',
    desc: 'Download video/image/stories on instagram',
    category: 'Downloader',
    params: ['url'],
    async run(req, res) {
        const { url } = req.query;
        if (!url) return res.status(400).json({ status: false, error: 'Url is required' });
        
        try {
            const results = await snapins(url);
            res.status(200).json({
                status: true,
                data: results
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}
