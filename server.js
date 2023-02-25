const express = require('express');
const app = express();
const { pool } = require('./config/dbConfig');

const PORT = process.env.PORT || 4000;


// Middleware

// This will tell our app to use ejs view engine to render all the files
app.set('view engine','ejs');


// Main Routes

app.get('/', (request,response) => {
    response.render("index");
})

app.get('/users/register', (request, response) => {
    response.render("register")
})

app.get('/users/login', (request,response) => {
    response.render("login");
})

app.get('/users/dashboard', (request,response) => {
    response.render("dashboard", { user: 'Luke'});
})

app.listen(PORT, () => {
    console.log(`Server is listening in ${PORT}`);
})