const axios = require("axios")
 
function convertEpochToDate(epoch) {
  return new Date(parseInt(epoch) * 1000).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
}
 
async function cekAkunFreeFire(uid, region = 'id', key = 'FFwlx') {
  try {
    const endpoint = 'https://client-hlgamingofficial.vercel.app/api/ff-hl-gaming-official-api-account-v2-latest/account'
    const headers = {
      'Content-Type': 'application/json',
      'Origin': 'https://www.hlgamingofficial.com',
      'Referer': 'https://www.hlgamingofficial.com/',
      'User-Agent': 'Mozilla/5.0'
    }
 
    const body = { uid, region, key }
    const { data } = await axios.post(endpoint, body, { headers })
 
    if (!data?.AccountInfo) throw new Error("ga ada respon, mungkin uid/region salah")
 
    const {
      AccountInfo,
      AccountProfileInfo,
      GuildInfo,
      captainBasicInfo,
      creditScoreInfo,
      petInfo,
      socialinfo
    } = data
 
    const info = {
      status: true,
      uid,
      nickname: AccountInfo.AccountName,
      level: AccountInfo.AccountLevel,
      exp: AccountInfo.AccountEXP,
      like: AccountInfo.AccountLikes,
      region: AccountInfo.AccountRegion,
      title: AccountInfo.Title,
      seasonId: AccountInfo.AccountSeasonId,
      releaseVersion: AccountInfo.ReleaseVersion,
      createTime: convertEpochToDate(AccountInfo.AccountCreateTime),
      lastLogin: convertEpochToDate(AccountInfo.AccountLastLogin),
      rank: {
        battleRoyale: {
          max: AccountInfo.BrMaxRank,
          point: AccountInfo.BrRankPoint,
          show: AccountInfo.ShowBrRank
        },
        clashSquad: {
          max: AccountInfo.CsMaxRank,
          point: AccountInfo.CsRankPoint,
          show: AccountInfo.ShowCsRank
        }
      },
      diamondCost: AccountInfo.DiamondCost,
      outfitIDs: AccountProfileInfo?.EquippedOutfit || [],
      skillIDs: AccountProfileInfo?.EquippedSkills || [],
      weapons: captainBasicInfo?.EquippedWeapon || [],
      creditScore: creditScoreInfo?.creditScore || 0,
      signature: socialinfo?.AccountSignature || '-',
      guild: GuildInfo?.GuildID ? {
        id: GuildInfo.GuildID,
        name: GuildInfo.GuildName,
        owner: GuildInfo.GuildOwner,
        level: GuildInfo.GuildLevel,
        members: GuildInfo.GuildMember,
        capacity: GuildInfo.GuildCapacity
      } : null,
      pet: petInfo?.id ? {
        id: petInfo.id,
        name: petInfo.name,
        level: petInfo.level,
        exp: petInfo.exp,
        selectedSkill: petInfo.selectedSkillId,
        skin: petInfo.skinId
      } : null
    }
 
    return info
 
  } catch (e) {
    return {
      status: false,
      message: 'Gagal mengambil data akun.',
      error: e?.response?.data || e.message
    }
  }
}

module.exports = {
    name: 'FreeFire V2',
    desc: 'Get info freefire account',
    category: 'Stalk',
    params: ['id'],
    async run(req, res) {
            try {
                const { id } = req.query;
                if (!id) return res.status(400).json({ status: false, error: 'Id is required' });
                const fay = await cekAkunFreeFire(id)
                res.status(200).json({
                    status: true,
                    data: fay
                });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}