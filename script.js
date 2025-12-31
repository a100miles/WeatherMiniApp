const dotenv = require('dotenv');
const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');
dotenv.config();

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// const ADDRESS = "Prospekt Mangilik Yel., Astana 020000"
const API_KEY = process.env.OPENWEATHER_API;
const URL = "https://api.openweathermap.org/data/2.5/weather";
const {Client} = require("@googlemaps/google-maps-services-js");
const News = require('newsapi');
const NEWS_API = process.env.NEWS_API; 
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

    return {
            city: data.name,
            temp: data.main.temp,
            feelsLike: data.main.feels_like,
            description: data.weather[0].description,
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            icon: data.weather[0].icon,
            coordinates: {
                lat: data.coord.lat,
                lon: data.coord.lon,
            },
            windSpeed: data.wind.speed,
            countryCode: data.sys.country,
            rainLast3h: data.rain ? data.rain["3h"] : 0
    };
    
}

async function getMapByCity(lat, lon) {
    return `https://www.google.com/maps?q=${lat},${lon}&output=embed`;
}

async function getNewsByCountry(countryCode) {
    const response = await fetch(
        `https://newsapi.org/v2/top-headlines?country=${countryCode}&category=entertainment&pageSize=3&apiKey=${process.env.NEWS_API}`
    );
    if (!response.ok) {
        throw new Error("Failed to fetch news!");
    }
    const data = await response.json();
    return data.articles.map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source
    }));
}

app.get('/', (req, res) => {
    fs.readFile('./templates/index.html', 'utf-8', (error, data) =>{
        if (error) {
            return res.status(404).send('File not found');
        }
        res.send(data);
    });
});

app.post('/weather', async (req, res) => {
    try {
        const city = req.body.city;
        const weather = await getWeatherByCity(city);
        const mapUrl = await getMapByCity(
            weather.coordinates.lat, 
            weather.coordinates.lon);
        const news = await getNewsByCountry(weather.countryCode);

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght,GRAD@0,17..18,600,-50..200;1,17..18,600,-50..200&display=swap" rel="stylesheet">
                <link rel="stylesheet" href="styles.css">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB" crossorigin="anonymous">
                <title>1GID</title>
            </head>
            <body class="text-bg-dark">
                <ul class="nav p-4">
                    <li class="nav-item">
                        <a class="nav-link active" aria-current="page" href="#">1GID</a>
                    </li>
                </ul>

                <div class="container mt-5">
                    <div class="row">
                        <div class="col">
                            <h1 class="fw-bolder">Weather in ${weather.city} <img src="https://openweathermap.org/img/wn/${weather.icon}@2x.png"></h1>
                            <p class="fw-medium">Temperature: ${weather.temp} °C</p>
                            <p class="fw-medium">Feels-like: ${weather.feelsLike} °C</p>
                            <p class="fw-medium">Humidity: ${weather.humidity}</p>
                            <p class="fw-medium">Pressure: ${weather.pressure}</p>
                            <p class="fw-medium">Rain volume for the last 3 hours: ${weather.rainLast3h}</p>
                            <p class="fw-medium">Coordinates: ${weather.coordinates}</p>
                            <p class="fw-medium">Country code: ${weather.countryCode}</p>
                            <p class="fw-medium">${weather.description}</p>
                        </div>
                        <div class="col">
                            <iframe
                                width="600"
                                height="400"
                                src="${mapUrl}"
                                style="border:0;"
                                allowfullscreen=""
                                loading="lazy">
                            </iframe>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col">
                            <h4 class="fw-bold m-3">Entertainment News</h4>

                            ${news.map(n => `
                                <div class="card text-bg-dark mb-3">
                                    <div class="card-body">
                                        <h6 class="card-title">${n.title}</h6>
                                        <p class="card-text small">${n.description ?? ""}</p>
                                        <a href="${n.url}" target="_blank"
                                            class="btn btn-sm btn-outline-light">
                                            Read more (${n.source})
                                        </a>
                                    </div>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                </div>
            </body>
            </html>
            `);
        } catch (error) {
            res.status(500).send(error.message);
        }
});

app.listen(port, ()=>{
    console.log("Server running on http://localhost:3000");
});
