const fetch = require("node-fetch")

async function getWeatherInfo(location) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=060a6bcfa19809c2cd4d97a212b19273`;
    let res = await fetch(url);
    if (!res.ok) {
      console.log('Data cuaca tidak tersedia');
      return null;
    }
    let json = await res.json();
    const windSpeedKmH = json.wind.speed * 3.6; // konversi m/s ke km/jam
    return {
      location: json.name,
      country: json.sys.country,
      weather: json.weather[0].description,
      currentTemp: `${json.main.temp} °C`,
      maxTemp: `${json.main.temp_max} °C`,
      minTemp: `${json.main.temp_min} °C`,
      humidity: `${json.main.humidity} %`,
      windSpeed: `${windSpeedKmH.toFixed(2)} km/jam`
    };
  } catch (error) {
    console.error('[❗] Terjadi kesalahan saat mengambil data cuaca:', error);
    return null;
  }
}

module.exports = {
    name: 'Cuaca',
    desc: 'Search info cuaca',
    category: 'Search',
    params: ['kota'],
    async run(req, res) {
        try {
            const { kota } = req.query;
            if (!kota) return res.status(400).json({ status: false, error: 'Query is required' });
            const fay = await getWeatherInfo(kota)
            res.status(200).json({
                status: true,
                data: fay
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}
