const { search, ytmp3, ytmp4, ytdlv2, channel } = require('@vreden/youtube_scraper');
module.exports = {
    name: 'YouTube Video',
    desc: 'Video download',
    category: 'Downloader',
    params: ['url'],
    async run(req, res) {
        const { url } = req.query;
        if (!url) return res.status(400).json({ status: false, error: 'Url is required' });
        try {
            const fay = await ytmp4(url)
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
