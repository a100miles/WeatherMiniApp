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
    const query = countryCode === "KZ" ? "Kazakhstan" : countryCode;

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

async function getMovieTrivia() {
    const response = await fetch(
        "https://opentdb.com/api.php?amount=5&category=11"
    );

    if (!response.ok) {
        throw new Error("Failed to fetch trivia!");
    }

    const data = await response.json();

    return data.results.map(q => ({
        question: q.question,
        correct: q.correct_answer,
        answers: [...q.incorrect_answers, q.correct_answer]
            .sort(() => Math.random() - 0.5)
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
        const mapUrl = await getMapByCity(weather.coordinates.lat, weather.coordinates.lon);
        const news = await getNewsByCountry(weather.countryCode);
        const trivia = await getMovieTrivia();

        res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>1GID | ${weather.city}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
            color: #e0e0e0;
            min-height: 100vh;
        }
        .weather-icon {
            filter: drop-shadow(0 4px 10px rgba(0,0,0,0.5));
        }
        .card-custom {
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 16px;
            transition: transform 0.3s ease;
        }
        .card-custom:hover {
            transform: translateY(-5px);
        }
        .nav-brand {
            font-size: 1.8rem;
            font-weight: 700;
        }
        .map-container {
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.4);
        }
    </style>
</head>
<body>
    <nav class="navbar navbar-dark bg-dark bg-opacity-50 backdrop-blur">
        <div class="container">
            <a class="navbar-brand nav-brand" href="/">1GID</a>
            <a href="/" class="btn btn-outline-light rounded-pill"><i class="bi bi-house"></i> Home</a>
        </div>
    </nav>

    <div class="container my-5">
        <!-- Weather + Map Row -->
        <div class="row g-5 mb-5">
            <div class="col-lg-6">
                <div class="card-custom shadow-lg p-5 h-100">
                    <div class="d-flex align-items-center mb-4">
                        <img src="https://openweathermap.org/img/wn/${weather.icon}@4x.png" alt="${weather.description}" class="weather-icon me-3" style="width: 100px;">
                        <div>
                            <h1 class="display-5 fw-bold mb-0">${weather.city}, ${weather.countryCode}</h1>
                            <p class="text-capitalize fs-4 text-white-50">${weather.description}</p>
                        </div>
                    </div>
                    <div class="row text-center text-lg-start">
                        <div class="col-6 col-lg-12">
                            <h2 class="display-4 fw-bold">${weather.temp}°C</h2>
                            <p class="text-white-50">Feels like ${weather.feelsLike}°C</p>
                        </div>
                        <div class="col-6 col-lg-12">
                            <ul class="list-unstyled fs-5">
                                <li><i class="bi bi-droplet"></i> Humidity: ${weather.humidity}%</li>
                                <li><i class="bi bi-speedometer2"></i> Pressure: ${weather.pressure} hPa</li>
                                <li><i class="bi bi-wind"></i> Wind: ${weather.windSpeed} m/s</li>
                                ${weather.rainLast3h > 0 ? `<li><i class="bi bi-cloud-rain"></i> Rain (3h): ${weather.rainLast3h} mm</li>` : ''}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-lg-6">
                <div class="map-container">
                    <iframe
                        width="100%"
                        height="450"
                        src="${mapUrl}"
                        style="border:0;"
                        allowfullscreen=""
                        loading="lazy">
                    </iframe>
                </div>
            </div>
        </div>

        <!-- News -->
        <h3 class="mb-4"><i class="bi bi-newspaper me-2"></i>Entertainment News</h3>
        <div class="row g-4 mb-5">
            ${news.map(n => `
                <div class="col-md-4">
                    <div class="card-custom shadow h-100 p-4">
                        <h5 class="fw-semibold">${n.title}</h5>
                        <p class="small text-white-50">${n.description || 'No description available.'}</p>
                        <a href="${n.url}" target="_blank" class="btn btn-outline-light btn-sm mt-auto">
                            Read more <i class="bi bi-box-arrow-up-right"></i>
                        </a>
                    </div>
                </div>
            `).join("")}
        </div>

        <!-- Movie Trivia -->
        <h3 class="mb-4"><i class="bi bi-film me-2"></i>Movie Trivia Challenge</h3>
        <div class="row g-4">
            ${trivia.map((t, i) => `
                <div class="col-lg-6">
                    <div class="card-custom shadow p-4">
                        <p class="fw-semibold fs-5">${i + 1}. ${t.question}</p>
                        <div class="mt-3">
                            ${t.answers.map(a => `
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="radio" name="q${i}" id="q${i}_${a}">
                                    <label class="form-check-label" for="q${i}_${a}">${a}</label>
                                </div>
                            `).join("")}
                        </div>
                        <div class="mt-3 p-3 bg-success bg-opacity-20 rounded">
                            <small class="text-success fw-semibold">Correct: ${t.correct}</small>
                        </div>
                    </div>
                </div>
            `).join("")}
        </div>
    </div>
</body>
</html>
        `);
    } catch (error) {
        res.status(500).send(`
            <!DOCTYPE html>
            <html><body class="bg-dark text-white text-center p-5">
                <h1>Error</h1>
                <p>${error.message}</p>
                <a href="/" class="btn btn-light mt-3">Back to home</a>
            </body></html>
        `);
    }
});

//rest api testing
app.use(express.json()); 

app.get('/api/weather', async (req, res) => {
    const city = req.query.city;
    if (!city) {
        return res.status(400).json({ error: "Parameter 'city' is required" });
    }
    try {
        const weather = await getWeatherByCity(city);
        res.status(200).json({
            success: true,
            data: weather
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message || "Failed to fetch weather"
        });
    }
});

app.get('/api/news', async (req, res) => {
    let countryCode = req.query.country || 'us';
    if (countryCode.length !== 2) {
        return res.status(400).json({ error: "Invalid country code. Use 2-letter ISO code." });
    }
    try {
        const news = await getNewsByCountry(countryCode.toLowerCase());
        res.status(200).json({
            success: true,
            data: news
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message || "Failed to fetch news"
        });
    }
});

app.get('/api/trivia', async (req, res) => {
    try {
        const trivia = await getMovieTrivia();
        res.status(200).json({
            success: true,
            data: trivia
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message || "Failed to fetch trivia"
        });
    }
});


app.listen(port, ()=>{
    console.log("Server running on http://localhost:3000");
});
