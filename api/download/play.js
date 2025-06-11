const { search, ytmp3, ytmp4, ytdlv2, channel } = require('@vreden/youtube_scraper');
module.exports = {
    name: 'YouTube Play',
    desc: 'Play song on youtube',
    category: 'Downloader',
    params: ['q'],
    async run(req, res) {
        const { q } = req.query;
        if (!q) return res.status(400).json({ status: false, error: 'Url is required' });
        try {
            const result = await search(q)
            const link = result.results[0].url
            const fay = await ytmp3(link)
            res.status(200).json({
                status: true,
                data: {
                    metadata: fay.metadata,
                    download: fay.download
                }
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}
