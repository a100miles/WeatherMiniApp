const express = require('express');
const app = express();
const port = 3000;
const API_KEY = process.env.OPENWEATHER_API

app.get('/', (req, res) => {
    
})

app.listen(port, ()=> {
    console.log("http://localhost:3000")
});