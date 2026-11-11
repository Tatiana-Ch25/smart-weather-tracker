//----------------1. Import API functions--------------------

import { getCityCoordinates, getWeatherData } from "./api.js";

//---------------- 2. Application state -------------------------
let currentWeatherData = null;
let currentUnit = "C";

//-------------- 3. Select DOM elements----------------------

//------------ Search form and city input--------------------
const cityInput = document.querySelector('#city-input');
const searchForm = document.querySelector('#city-search');

//-------------Elements displaying the city and country------------------
const cityNameElement = document.querySelector('#city-name');
const countryNameElement = document.querySelector('#country-name');
const errorMessageElement = document.querySelector('#error-message');

//------------Current weather elements------------------------
const temperatureElement = document.querySelector('#temperature');
const temperatureUnitElement = document.querySelectorAll('.temperature-unit');
const weatherDescriptionElement = document.querySelector('#weather-description');
const feelsLikeElement = document.querySelector('#feels-like');

//-------------Additional Weather details----------------------- 
const windSpeedElement = document.querySelector('#wind-speed');
const humidityElement = document.querySelector('#humidity');
const visibilityElement = document.querySelector('#visibility');

//-------------------------Weather icon----------------------
const weatherIconElement = document.querySelector('.weather-icon');

//---------------------Forecast weather cards--------------------
const forecastDays = document.querySelectorAll('.forecast-day');
const forecastIcons = document.querySelectorAll('.forecast-icon');
const forecastHighs = document.querySelectorAll('.forecast-high');
const forecastDescriptions = document.querySelectorAll('.forecast-description');
const forecastLows = document.querySelectorAll('.forecast-low');

//-------------------Select temperature unit controls------------
const celsiusButton = document.querySelector('#celsius-button');
const fahrenheitButton = document.querySelector('#fahrenheit-button');

//----------------4. Weather lookup objects--------------------------
// Map WMO weather codes to descriptions
const weatherDescriptions = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snowfall",
    73: "Moderate snowfall",
    75: "Heavy snowfall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    97: "Heavy thunderstorm",
    99: "Thunderstorm with heavy hail"
};

//------------------Map WMO weather codes to Bootstrap icon classes-------------------
const weatherIcons = {
    0: "bi-sun",
    1: "bi-sun",
    2: "bi-cloud-sun",
    3: "bi-cloud",
    45: "bi-cloud-fog",
    48: "bi-cloud-fog",
    51: "bi-cloud-drizzle",
    53: "bi-cloud-drizzle",
    55: "bi-cloud-drizzle",
    56: "bi-cloud-drizzle",
    57: "bi-cloud-drizzle",
    61: "bi-cloud-rain",
    63: "bi-cloud-rain",
    65: "bi-cloud-rain-heavy",
    66: "bi-cloud-rain",
    67: "bi-cloud-rain-heavy",
    71: "bi-cloud-snow",
    73: "bi-cloud-snow",
    75: "bi-cloud-snow",
    77: "bi-snow",
    80: "bi-cloud-rain",
    81: "bi-cloud-rain",
    82: "bi-cloud-rain-heavy",
    85: "bi-cloud-snow",
    86: "bi-cloud-snow",
    95: "bi-cloud-lightning-rain",
    96: "bi-cloud-lightning-rain",
    97: "bi-cloud-lightning-rain",
    99: "bi-cloud-lightning-rain"
};

//-----------------5. Helper functions--------------------------------
//-------------------convert C unit to F-----------------------
function celsiusToFahrenheit(celsius) {
    return (celsius * 9 ) / 5 + 32;
}

//----------------Update temperature unit controls-------------------
function updateTemperatureUnitUI() {
    const unitSymbol = currentUnit === "C" ? "°C" : "°F";

    temperatureUnitElement.forEach(element => {
        element.textContent = unitSymbol;
    });

    celsiusButton.classList.toggle("btn-primary", currentUnit === "C");
    celsiusButton.classList.toggle("btn-outline-primary", currentUnit !== "C");

    fahrenheitButton.classList.toggle("btn-primary", currentUnit === "F");
    fahrenheitButton.classList.toggle("btn-outline-primary", currentUnit !== "F");

    celsiusButton.setAttribute("aria-pressed", currentUnit === "C");
    fahrenheitButton.setAttribute("aria-pressed", currentUnit === "F");
}
//-------------- 6. Handle city search and fetch weather data----------

searchForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    errorMessageElement.textContent = "";
   
    const city = cityInput.value.trim();

    if(city === "") {
        errorMessageElement.textContent = "Please enter a city name.";
        return;
    }

    try {
         const coordinates = await getCityCoordinates(city);

        if(!coordinates) {
            errorMessageElement.textContent = "City not found. Please check the spelling and try again."
            
            return;
        }

        const weatherData = await getWeatherData(
            coordinates.latitude,
            coordinates.longitude
        );

        currentWeatherData = weatherData;
        currentUnit = "C";

        updateTemperatureUnitUI();

        //----------------- Display weather data in the DOM---------------

        cityNameElement.textContent = coordinates.city;
        countryNameElement.textContent = coordinates.country;

        temperatureElement.textContent = weatherData.current.temperature_2m.toFixed(1);
        feelsLikeElement.textContent = weatherData.current.apparent_temperature.toFixed(1);
        
        windSpeedElement.textContent = `${weatherData.current.wind_speed_10m} km/h`;
        humidityElement.textContent = `${weatherData.current.relative_humidity_2m}%`;
        visibilityElement.textContent = `${(weatherData.current.visibility / 1000).toFixed(1)} km`;


        weatherDescriptionElement.textContent = weatherDescriptions[weatherData.current.weather_code] ?? "Unknown weather";

        weatherIconElement.className = `bi ${weatherIcons[weatherData.current.weather_code] ?? "bi-cloud"} weather-icon`;
        
        cityInput.value = "";

        //---------------Display forecast data in the DOM--------------------
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        for(let i = 0; i < forecastDays.length; i++) {
            const apiIndex = i + 1;
            forecastDays[i].textContent = days[new Date(weatherData.daily.time[apiIndex]).getDay()];
        }

        for(let i = 0; i < forecastIcons.length; i++) {
            const apiIndex = i + 1;
            forecastIcons[i].className = `bi ${weatherIcons[weatherData.daily.weather_code[apiIndex]] ?? "bi-cloud"} forecast-icon`; 
        }

        for(let i = 0; i < forecastHighs.length; i++) {
            const apiIndex = i + 1; 
            forecastHighs[i].textContent = weatherData.daily.temperature_2m_max[apiIndex].toFixed(1);
        }

        for(let i = 0; i < forecastLows.length; i++) {
            const apiIndex = i + 1;
            forecastLows[i].textContent = weatherData.daily.temperature_2m_min[apiIndex].toFixed(1);
        }

        for(let i = 0; i < forecastDescriptions.length; i++) {
            const apiIndex = i + 1;
            forecastDescriptions[i].textContent = weatherDescriptions[weatherData.daily.weather_code[apiIndex]] ?? "Unknown weather";
        }

    } catch (error) {
        console.error("Something went wrong:", error);
        errorMessageElement.textContent = "Unable to retrieve weather data. Please try again."
    }

});

//-------------------7. Handle temperature unit selection -----------------------

//---------------------Fahrenheit listener-----------------
fahrenheitButton.addEventListener('click', function() {
    if (!currentWeatherData) return;

    currentUnit = "F";
    updateTemperatureUnitUI();

   const fahrenheit = celsiusToFahrenheit(currentWeatherData.current.temperature_2m);
   temperatureElement.textContent = fahrenheit.toFixed(1);

   const feelsLikeFahrenheit = celsiusToFahrenheit(currentWeatherData.current.apparent_temperature);
   feelsLikeElement.textContent = feelsLikeFahrenheit.toFixed(1);

    for(let i = 0; i < forecastHighs.length; i++) {
        const apiIndex = i + 1;     
        const forecastHighsFahrenheit = celsiusToFahrenheit(currentWeatherData.daily.temperature_2m_max[apiIndex]);
        forecastHighs[i].textContent = forecastHighsFahrenheit.toFixed(1);
    }
        
    for(let i = 0; i < forecastLows.length; i++) {
        const apiIndex = i + 1;
        const forecastLowsFahrenheit = celsiusToFahrenheit(currentWeatherData.daily.temperature_2m_min[apiIndex]);
        forecastLows[i].textContent = forecastLowsFahrenheit.toFixed(1);
    }
});

//-------------------Celsius Listener-----------------------------
celsiusButton.addEventListener('click', function () {
    if (!currentWeatherData) return;

    currentUnit = "C";
    updateTemperatureUnitUI();

    temperatureElement.textContent = currentWeatherData.current.temperature_2m.toFixed(1);

    feelsLikeElement.textContent = currentWeatherData.current.apparent_temperature.toFixed(1);

    for(let i = 0; i < forecastHighs.length; i++) {
        const apiIndex = i + 1;     
        forecastHighs[i].textContent = currentWeatherData.daily.temperature_2m_max[apiIndex].toFixed(1);
    }
        
    for(let i = 0; i < forecastLows.length; i++) {
        const apiIndex = i + 1;
        forecastLows[i].textContent = currentWeatherData.daily.temperature_2m_min[apiIndex].toFixed(1);
    }

});