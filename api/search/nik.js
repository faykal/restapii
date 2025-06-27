const axios = require('axios');

async function nikParse(nik) {
    try {
        const provincesRes = await axios.get('https://emsifa.github.io/api-wilayah-indonesia/api/provinces.json');
        const provinces = Object.fromEntries(provincesRes.data.map(p => [p.id, p.name.toUpperCase()]));

        nik = nik.toString();
        if (nik.length !== 16 || !provinces[nik.slice(0, 2)]) throw new Error('NIK tidak valid: panjang atau kode provinsi salah');

        const provinceId = nik.slice(0, 2);
        const regenciesRes = await axios.get(`https://emsifa.github.io/api-wilayah-indonesia/api/regencies/${provinceId}.json`);
        const regencies = Object.fromEntries(regenciesRes.data.map(r => [r.id, r.name.toUpperCase()]));

        if (!regencies[nik.slice(0, 4)]) throw new Error('NIK tidak valid: kode kabupaten/kota salah');

        const regencyId = nik.slice(0, 4);
        const districtsRes = await axios.get(`https://emsifa.github.io/api-wilayah-indonesia/api/districts/${regencyId}.json`);
        const districts = Object.fromEntries(districtsRes.data.map(d => [d.id.slice(0, -1), `${d.name.toUpperCase()}`]));

        if (!districts[nik.slice(0, 6)]) throw new Error('NIK tidak valid: kode kecamatan salah');

        const province = provinces[provinceId];
        const city = regencies[regencyId];
        const subdistrict = districts[nik.slice(0, 6)];
        const day = parseInt(nik.slice(6, 8));
        const month = parseInt(nik.slice(8, 10));
        const yearCode = nik.slice(10, 12);
        const uniqCode = nik.slice(12, 16);

        const gender = day > 40 ? 'PEREMPUAN' : 'LAKI-LAKI';
        const birthDay = day > 40 ? (day - 40).toString().padStart(2, '0') : day.toString().padStart(2, '0');
        const birthYear = yearCode < new Date().getFullYear().toString().slice(-2) ? `20${yearCode}` : `19${yearCode}`;
        const birthDate = `${birthDay}/${month.toString().padStart(2, '0')}/${birthYear}`;
        const birth = new Date(birthYear, month - 1, birthDay);

        if (isNaN(birth.getTime())) throw new Error('Tanggal lahir tidak valid');

        const today = new Date();
        let years = today.getFullYear() - birth.getFullYear();
        let months = today.getMonth() - birth.getMonth();
        let remainingDays = today.getDate() - birth.getDate();
        if (remainingDays < 0) {
            remainingDays += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
            months--;
        }
        if (months < 0) {
            months += 12;
            years--;
        }
        const age = `${years} Tahun ${months} Bulan ${remainingDays} Hari`;

        let ageCategory = '';
        if (years < 12) ageCategory = 'Anak-anak';
        else if (years < 18) ageCategory = 'Remaja';
        else if (years < 60) ageCategory = 'Dewasa';
        else ageCategory = 'Lansia';

        const nextBirthday = new Date(today.getMonth() < month - 1 ? today.getFullYear() : today.getFullYear() + 1, month - 1, birthDay);
        const timeDiff = nextBirthday - today;
        const monthsLeft = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 30));
        const daysLeft = Math.floor((timeDiff % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
        const birthdayCountdown = `${monthsLeft} Bulan ${daysLeft} Hari`;

        const baseDate = new Date(1970, 0, 2);
        const diffDays = Math.floor((birth - baseDate + 86400000) / (1000 * 60 * 60 * 24));
        const pasaranIndex = Math.round((diffDays % 5) * 2) / 2;
        const pasaranNames = ['Wage', 'Kliwon', 'Legi', 'Pahing', 'Pon'];
        const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const birthDateFull = `${birthDay} ${monthNames[month - 1]} ${birthYear}`;
        const pasaran = `${dayNames[birth.getDay()]} ${pasaranNames[pasaranIndex] || ''}, ${birthDay} ${monthNames[month - 1]} ${birthYear}`;

        let zodiac = '';
        if ((month === 1 && day >= 20) || (month === 2 && day < 19)) zodiac = 'Aquarius';
        else if ((month === 2 && day >= 19) || (month === 3 && day < 21)) zodiac = 'Pisces';
        else if ((month === 3 && day >= 21) || (month === 4 && day < 20)) zodiac = 'Aries';
        else if ((month === 4 && day >= 20) || (month === 5 && day < 21)) zodiac = 'Taurus';
        else if ((month === 5 && day >= 21) || (month === 6 && day < 22)) zodiac = 'Gemini';
        else if ((month === 6 && day >= 21) || (month === 7 && day < 23)) zodiac = 'Cancer';
        else if ((month === 7 && day >= 23) || (month === 8 && day < 23)) zodiac = 'Leo';
        else if ((month === 8 && day >= 23) || (month === 9 && day < 23)) zodiac = 'Virgo';
        else if ((month === 9 && day >= 23) || (month === 10 && day < 24)) zodiac = 'Libra';
        else if ((month === 10 && day >= 24) || (month === 11 && day < 23)) zodiac = 'Scorpio';
        else if ((month === 11 && day >= 23) || (month === 12 && day < 22)) zodiac = 'Sagitarius';
        else if ((month === 12 && day >= 22) || (month === 1 && day < 20)) zodiac = 'Capricorn';

        const regencyType = city.includes('KOTA') ? 'Kota' : 'Kabupaten';
        const areaCode = `${provinceId}.${regencyId.slice(2)}.${nik.slice(4, 6)}`;

        return {
            nik,
            kelamin: gender,
            lahir: birthDate,
            lahir_lengkap: birthDateFull,
            provinsi: {
                kode: provinceId,
                nama: province
            },
            kotakab: {
                kode: regencyId,
                nama: city,
                jenis: regencyType
            },
            kecamatan: {
                kode: nik.slice(0, 6),
                nama: subdistrict
            },
            kode_wilayah: areaCode,
            nomor_urut: uniqCode,
            tambahan: {
                pasaran,
                usia: age,
                kategori_usia: ageCategory,
                ultah: `${birthdayCountdown} Lagi`,
                zodiak: zodiac
            }
        };
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = {
    name: 'Nik Parse',
    desc: 'Search nik',
    category: 'Search',
    params: ['q'],
    async run(req, res) {
            try {
                const { q } = req.query;
                if (!q) return res.status(400).json({ status: false, error: 'Query is required' });
                const resp = await nikParse(q)
                res.status(200).json({
                    status: true,
                    data: resp
                });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}