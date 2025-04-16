const API_KEY = '51016e3e4f8041d38eb193817251604';
const BASE_URL = 'https://api.weatherapi.com/v1';
const weatherForm = document.getElementById('weatherForm');
const cityInput = document.getElementById('cityInput');
const weatherResult = document.getElementById('weatherResult');
const forecastDiv = document.getElementById('forecast');

// Typewriter effect for input placeholder with multiple words
const placeholderWords = [
    "Enter city name",
    "Search weather",
    "Type any city",
    "Check forecast",
    "Find temperature"
];
let wordIndex = 0;
let typeIndex = 0;
let typingForward = true;

function typePlaceholder() {
    const currentWord = placeholderWords[wordIndex];
    if (typingForward) {
        typeIndex++;
        if (typeIndex > currentWord.length) {
            typingForward = false;
            setTimeout(typePlaceholder, 1200); // pause at end
            return;
        }
    } else {
        typeIndex--;
        if (typeIndex < 0) {
            typingForward = true;
            wordIndex = (wordIndex + 1) % placeholderWords.length;
            setTimeout(typePlaceholder, 600); // pause at start
            return;
        }
    }
    cityInput.setAttribute('placeholder', currentWord.slice(0, typeIndex));
    setTimeout(typePlaceholder, 90);
}
typePlaceholder();

// Heading text typewriter animation
const headingText = document.querySelector('.heading-text');
const headingPhrases = [
    'Weather Forecast',
    'Live Weather Updates',
    'Your City Weather',
    'Forecast & Temperature',
    'Check Weather Instantly'
];
let headingWordIndex = 0;
let headingCharIndex = 0;
let headingTypingForward = true;

function typeHeading() {
    const currentPhrase = headingPhrases[headingWordIndex];
    if (headingTypingForward) {
        headingCharIndex++;
        if (headingCharIndex > currentPhrase.length) {
            headingTypingForward = false;
            setTimeout(typeHeading, 1200);
            return;
        }
    } else {
        headingCharIndex--;
        if (headingCharIndex < 0) {
            headingTypingForward = true;
            headingWordIndex = (headingWordIndex + 1) % headingPhrases.length;
            setTimeout(typeHeading, 600);
            return;
        }
    }
    headingText.textContent = currentPhrase.slice(0, headingCharIndex);
    setTimeout(typeHeading, 90);
}
typeHeading();

weatherForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (!city) return;
    weatherResult.innerHTML = 'Loading...';
    forecastDiv.innerHTML = '';
    try {
        // Fetch current weather
        const weatherRes = await fetch(`${BASE_URL}/current.json?key=${API_KEY}&q=${encodeURIComponent(city)}`);
        if (!weatherRes.ok) throw new Error('City not found');
        const weatherData = await weatherRes.json();
        displayCurrentWeather(weatherData);
        // Fetch 5-day forecast (WeatherAPI provides 3-day forecast on free tier)
        const forecastRes = await fetch(`${BASE_URL}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(city)}&days=5`);
        if (!forecastRes.ok) throw new Error('Forecast not found');
        const forecastData = await forecastRes.json();
        displayForecast(forecastData);
    } catch (err) {
        weatherResult.innerHTML = `<span style='color:red;'>${err.message}</span>`;
    }
});

function getWeatherAnimation(condition, isNight) {
    const cond = condition.toLowerCase();
    if (isNight) {
        // Animated moon icon
        return `<div class="weather-anim moon">
            <div class="moon-core"></div>
            <div class="moon-crater crater1"></div>
            <div class="moon-crater crater2"></div>
        </div>`;
    } else if (cond.includes('sun') || cond.includes('clear')) {
        return `<div class="weather-anim sun">
            <div class="sun-core"></div>
            <div class="sun-ray ray1"></div>
            <div class="sun-ray ray2"></div>
            <div class="sun-ray ray3"></div>
            <div class="sun-ray ray4"></div>
            <div class="sun-ray ray5"></div>
            <div class="sun-ray ray6"></div>
            <div class="sun-ray ray7"></div>
            <div class="sun-ray ray8"></div>
        </div>`;
    } else if (cond.includes('cloud')) {
        return `<div class="weather-anim cloud"><div class="cloud-main"></div><div class="cloud-shadow"></div></div>`;
    } else if (cond.includes('rain')) {
        return `<div class="weather-anim rain"><div class="cloud-main"></div><div class="rain-drop drop1"></div><div class="rain-drop drop2"></div><div class="rain-drop drop3"></div></div>`;
    } else {
        return '';
    }
}

function displayCurrentWeather(data) {
    // WeatherAPI returns is_day: 1 (day), 0 (night)
    const isNight = data.current.is_day === 0;
    const anim = getWeatherAnimation(data.current.condition.text, isNight);
    // Get location-based time using WeatherAPI's localtime
    const localTime = data.location.localtime; // format: '2025-04-17 21:30'
    const timeString = localTime ? localTime.split(' ')[1].slice(0,5) : '';
    weatherResult.innerHTML = `
        <h2>${data.location.name}, ${data.location.country}</h2>
        <p><strong>${data.current.condition.text}</strong></p>
        ${anim}
        <img src="${data.current.condition.icon}" alt="icon" />
        <p>Temperature: ${data.current.temp_c}°C</p>
        <p>Humidity: ${data.current.humidity}%</p>
        <p>Wind: ${data.current.wind_kph} kph</p>
        <p style="margin-top:10px;color:#2266aa;font-weight:600;">Current Time in ${data.location.name}: ${timeString}</p>
    `;
}

function displayForecast(data) {
    if (!data.forecast || !data.forecast.forecastday) {
        forecastDiv.innerHTML = '<span style="color:red;">No forecast data available.</span>';
        return;
    }
    forecastDiv.innerHTML = '<h3>Forecast</h3>';
    data.forecast.forecastday.forEach(day => {
        forecastDiv.innerHTML += `
            <div class="forecast-day">
                <strong>${day.date}</strong><br />
                <img src="${day.day.condition.icon}" alt="icon" />
                ${day.day.condition.text}<br />
                Temp: ${day.day.avgtemp_c}°C, Humidity: ${day.day.avghumidity}%
            </div>
        `;
    });
}
