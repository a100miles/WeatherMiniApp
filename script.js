const dotenv = require('dotenv');
const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');
dotenv.config();

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const CITY = "Astana";
const ADDRESS = "Prospekt Mangilik Yel., Astana 020000"
const API_KEY = process.env.OPENWEATHER_API;
const URL = "https://api.openweathermap.org/data/2.5/weather";
const {Client} = require("@googlemaps/google-maps-services-js");
const { error } = require('console');
const client = new Client({});
const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_KEY;

app.use(express.urlencoded({extended: true}));

async function getWeatherByCity(city) {
    const params = new URLSearchParams({
        q: city,
        appid: API_KEY,
        units: "metric",
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

async function getMapByCity(address) {
    const response = await client.geocode({
        params: {
            address: address,
            key: GOOGLE_API_KEY,
        },
        timeout: 1000,
    });

    if (response.status === 200) {
        console.log(response.data.results[0].geometry.location);
    } 
}

app.get('/', (req, res) => {
    fs.readFile('/templates/index.html', 'utf-8', (error, data) =>{
        if (error) {
            return res.status(404).send('File not found');
        }
        res.send(data);
    });
});

app.listen(port, ()=>{
    console.log("Server running on http://localhost:3000");
});


// getWeatherByCity(CITY);
// getMapByCity(ADDRESS)