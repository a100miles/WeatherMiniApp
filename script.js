const dotenv = require('dotenv');
const express = require('express');
dotenv.config();

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const port = 3000;
const CITY = "Astana";
const API_KEY = process.env.OPENWEATHER_API;
const URL = "https://api.openweathermap.org/data/2.5/weather";

async function getWeatherByCity(city) {
    const params = new URLSearchParams({
        q: city,
        appid: API_KEY,
        units: "metric"
    });

    const response = await fetch(`${URL}?${params.toString()}`);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
    }

    const data = await response.json();
    console.log(`Weather in ${data.name}`);
    console.log(`Temperature: ${data.main.temp} °C`);
    console.log(`Feels like: ${data.main.feels_like} °C`);
}
// getWeatherByCity(CITY);
