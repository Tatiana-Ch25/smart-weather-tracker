//--------------------
// 1.    GEOCODING API
// Convert a city name into geographical coordinates
//--------------------

export async function getCityCoordinates(city) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en`;

    const response = await fetch(url);

    if(!response.ok) {
        throw new Error("HTTP error: " + response.status);
    }

    const data = await response.json();

   
    if(!data.results || data.results.length === 0) {
        return null;
    }

    const latitude = data.results[0].latitude;
    const longitude = data.results[0].longitude;

    return {
        latitude, 
        longitude,
        city: data.results[0].name,
        country: data.results[0].country
    };

}

//-----------------------------
// 2. WEATHER FORECAST API
// Fetch weather data using geographical coordinates
//-------------------------------

export async function getWeatherData(latitude, longitude) {

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=4&timezone=auto`;

    const response = await fetch(url);

    if(!response.ok) {
        throw new Error("HTTP error: " + response.status);
    }

    const data = await response.json();

    return data;

} 



