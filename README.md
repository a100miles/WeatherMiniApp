Astana IT University 

Name: Tamerlan Yessimov    
Group: SE-2420       

## Features
- Real-time weather data (OpenWeatherMap)
- Interactive Google Maps embed
- Entertainment news by country (NewsAPI)
- Movie trivia quiz (OpenTDB)

## APIs Used
1. OpenWeatherMap API
2. Google Maps Embed API
3. NewsAPI (server-side)
4. Open Trivia Database (category: Film)

## Setup Instructions
1. Clone the repository
2. Run `npm install`
3. Create `.env` file:
OPENWEATHER_API=your_openweather_key
NEWS_API=your_newsapi_key
GOOGLE_MAPS_KEY=your_google_key (optional for embed)
4. Run `node server.js`
5. Open http://localhost:3000

API testing using Postman:
## API Endpoints (for testing)
- GET /api/weather?city=Almaty
- GET /api/news?country=kz
- GET /api/trivia

OpenWeather API:
![Weather Success](/screenshots/image.png)

![Weather Missing City](/screenshots/image-1.png)

![Weather Not Found](/screenshots/image-2.png)

News API:
![News API](/screenshots/image-3.png)

Trivia API:
![Trivia API](/screenshots/image-4.png)

project/
├── script.js
├── package.json
├── .env
├── .gitignore
├── README.md
└── templates/
    └── index.html