const axios = require('axios');
module.exports = {
    name: 'Check Saldo',
    desc: 'Saldo from orkut',
    category: 'Order Kuota',
    params: ['merchant','keyorkut'],
    async run(req, res) {
        const { merchant, keyorkut } = req.query;
        if (!merchant) return res.status(400).json({ status: false, error: 'Merchant ID is required' });
        if (!keyorkut) return res.status(400).json({ status: false, error: 'Apikey Orderkuota is required' });
        try {
        const apiUrl = `https://gateway.okeconnect.com/api/mutasi/qris/${merchant}/${keyorkut}`;
        const response = await axios.get(apiUrl);
        const result = await response.data;
                // Check if data exists and get the latest transaction
        const latestTransaction = result.data && result.data.length > 0 ? result.data[0] : null;
                if (latestTransaction) {
         res.status(200).json({
            status: true, 
            result: {
            saldo_qris: latestTransaction.balance
            }
        })
        } else {
            res.json({ message: "No transactions found." });
        }
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}