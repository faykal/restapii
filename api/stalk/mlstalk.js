const axios = require('axios');

async function mobapay(uid, zone) {
  try {
    const { data } = await axios.get('https://api.mobapay.com/api/app_shop', {
      headers: {
        'content-type': 'application/json'
      },
      params: {
        app_id: 100000,
        game_user_key: uid,
        game_server_key: zone,
        country: 'ID',
        language: 'en',
        shop_id: 1001
      }
    });

    if (!data.data || !data.data.shop_info) {
      throw new Error('Data tidak ditemukan');
    }

    const first_recharge = data.data.shop_info.good_list.filter(item => item.label && item.label.caption === '首充商品角标').map(item => ({
      title: item.title,
      available: !item.goods_limit.reached_limit
    }));

    const first_recharge2 = data.data.shop_info.shelf_location && data.data.shop_info.shelf_location[0] && data.data.shop_info.shelf_location[0].goods.filter(item => item.label && item.label.caption === '首充商品角标').map(item => ({
      title: item.title,
      available: !item.goods_limit.reached_limit
    }));

    return {
      first_recharge: [...first_recharge, ...(first_recharge2 || [])]
    };
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

module.exports = {
  name: 'Mobile Legends',
  desc: 'Get info ml account',
  category: 'Stalk',
  params: ['id', 'zone'],
  async run(req, res) {
    try {
      const { id, zone } = req.query;

      if (!id) return res.status(400).json({ status: false, error: 'Id is required' });
      if (!zone) return res.status(400).json({ status: false, error: 'Zone is required' });

      const fay = await axios.get(`https://dev.luckycat.my.id/api/stalker/mobile-legend?users=${id}&servers=${zone}`);
      const resp = await mobapay(id, zone);

      const result = { ...fay.data.data, ...resp };

      res.status(200).json({ 
        status: true, 
        result 
    });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  }
};