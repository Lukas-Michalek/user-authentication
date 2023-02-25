const express = require('express');
const app = express();
const { pool } = require('./config/dbConfig');

const PORT = process.env.PORT || 4000;


// Middleware

// This will tell our app to use ejs view engine to render all the files
app.set('view engine','ejs');

// This piece of middleware allows us to send details from the Front End such as name, email and password details to our server
app.use(express.urlencoded({extended:false}))


// Main Routes

app.get('/', (request,response) => {
    response.render("index");
});

app.get('/users/register', (request, response) => {
    response.render("register");
});

app.get('/users/login', (request,response) => {
    response.render("login");
});

app.get('/users/dashboard', (request,response) => {
    response.render("dashboard", { user: 'Luke'});
});



app.post('/users/register', (request, response) => {
    const { name, email, password, password2} = request.body;

    // for testing purposes if the information are being sent correctly from front end
    console.log({
        name,
        email,
        password,
        password2
    })

    // Form Validation => If we are getting any errors in the form, these will be pushed into errors array
    let errors = [];

    //1. Validation check => All form fields are entered
    if(!name || !email || !password || !password2){
        errors.push({message:'Please enter all fields.'});
    };

    //2. Validation check => Password length
    if(password.length < 6){
        errors.push({message: 'Password needs to be at least 6 characters'});
    };

    //3. Validation check => Passwords must match
    if(password != password2){
        errors.push({message: 'Passwords must match!'});
    };

    // If there are any errors, redirect user to register route and pass errors array
    if(errors.length > 0){
        response.render('register', { errors });
    }

})


app.listen(PORT, () => {
    console.log(`Server is listening in ${PORT}`);
});