module.exports = {
    name: 'Android1',
    desc: 'Search modded game on android1',
    category: 'Search',
    params: ['q'],
    async run(req, res) {
        const { q } = req.query;
        if (!q) return res.status(400).json({ status: false, error: 'Query is required' });
        
        try {
            const result = await scrape.android1.search(q);
            res.status(200).json({
                status: true,
                result
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}