const fetch = require('node-fetch')

let pint = async (query) => {
    const response = await fetch("https://www.pinterest.com/resource/BaseSearchResource/get/?data=" + encodeURIComponent('{"options":{"query":"' + encodeURIComponent(query) + '"}}'), {
        "headers": {
            "screen-dpr": "4",
            "x-pinterest-pws-handler": "www/search/[scope].js",
        },
        "method": "head"
    })
    if (!response.ok) throw Error (`error ${response.status} ${response.statusText}`)
    const rhl = response.headers.get("Link")
    if (!rhl) throw Error (`hasil pencarian ${query} kosong`)
    const links = [ ...rhl.matchAll(/<(.*?)>/gm)].map(v => v[1])
    return links
}

module.exports = {
    name: 'Pinterest',
    desc: 'Search image on pinterest',
    category: 'Search',
    params: ['q'],
    async run(req, res) {
            try {
                const { q } = req.query;
                if (!q) return res.status(400).json({ status: false, error: 'Query is required' });
                const fay = await pint(q)
                res.status(200).json({
                    status: true,
                    data: fay
                });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}
