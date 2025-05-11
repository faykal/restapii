module.exports = {
    name: 'Apkcombo',
    desc: 'Search app on apkcombo',
    category: 'Search',
    params: ['q'],
    async run(req, res) {
        const { q } = req.query;
        if (!q) return res.status(400).json({ status: false, error: 'Query is required' });
        
        try {
            const result = await scrape.apkcombo.search(q);
            res.status(200).json({
                status: true,
                result
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}