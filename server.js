const express = require('express')
const app = express()
const { pool } = require('./config/dbConfig')
const queries = require('./config/queries')
const bcrypt = require('bcrypt')
const session = require('express-session')
const flash = require('express-flash')
const passport = require('passport')

const initializePassport = require('./config/passportConfig')

initializePassport(passport)

const PORT = process.env.PORT || 4000
const session_secret = process.env.SESSION_SECRET

// Middleware

// This will tell our app to use ejs view engine to render all the files
app.set('view engine', 'ejs')

// This piece of middleware allows us to send details from the Front End such as name, email and password details to our server



app.use(express.urlencoded({ extended: false }))

app.use(
    session({
        secret: session_secret,

        resave: false,

        saveUninitialized: false,
    })
)

app.use(passport.initialize())

app.use(passport.session())

app.use(flash())

// Main Routes
app.get('/', (request, response) => {
    response.render('index')
})


// checkAuthenticated => when user that is logged in would want to access login or register route, will be automaticly redirected back to dashboard as he is already registered and logged in
app.get('/users/register', checkAuthenticated, (request, response) => {
    response.render('register')
})

app.get('/users/login', checkAuthenticated, (request, response) => {
    response.render('login')
})


// checkNotAuthenticated => when user is at this route middleware checks if he is authenitcated before moving to (req, res) section. In other words user that is not authenticated(logged in) cannot access dashboard or any other site except login and register without logging in first
app.get('/users/dashboard', checkNotAuthenticated, (req, res) => {  
    res.render('dashboard', { user: 'user' });
})


// request.logOut() is a function that we get in passport
app.get('/users/logout', (request, response, next) => {
    request.logOut(function(error){
        if (error) return next(error);
        
        request.flash('success_msg','You have successfuly logged out!');
        response.redirect('/users/login');
       
    })
})

app.post('/users/register', async (request, response) => {
    const { name, email, password, password2 } = request.body

    // for testing purposes if the information are being sent correctly from front end
    console.log({
        name,
        email,
        password,
        password2,
    })

    // Form Validation => If we are getting any errors in the form, these will be pushed into errors array
    let errors = []

    //1. Validation check => All form fields are entered
    if (!name || !email || !password || !password2) {
        errors.push({ message: 'Please enter all fields.' })
    }

    //2. Validation check => Password length
    if (password.length < 6) {
        errors.push({ message: 'Password needs to be at least 6 characters' })
    }

    //3. Validation check => Passwords must match
    if (password != password2) {
        errors.push({ message: 'Passwords must match!' })
    }

    // If there are any errors, redirect user to register route and pass errors array
    if (errors.length > 0) {
        response.render('register', { errors })
    }

    // If there are no errors and user filled the form correctly thus form validation has passed
    else {
        // not that bcrypt is ASYNC function and therefore the whole POST method needs to be made ASYNC

        // bcrypt.hash([what i want to hash],[how many rounds]) -> the larger number of rounds the more complex the algorythm but the more time it takes to generate hash
        let hashedPassword = await bcrypt.hash(password, 10)
        console.log(hashedPassword)

        // Check if user already exists
        pool.query(queries.checkEmail, [email], (error, results) => {
            if (error) {
                throw error
            }

            console.log(results.rows)

            // if the query finds match so there is already user with that email
            if (results.rows.length > 0) {
                errors.push({ message: 'Email alrady used by other user.' })
                response.render('register', { errors })
            }
            // or if there is no user in database with that email, we will register the user
            else {
                pool.query(
                    queries.addNewUser,
                    [name, email, hashedPassword],
                    (error, results) => {
                        if (error) {
                            throw error
                        }

                        console.log(results.rows)

                        // sends flash message to login page
                        request.flash(
                            'success_msg',
                            `${name}, you are now registered. Please Log In.`
                        )

                        response.redirect('/users/login')
                    }
                )
            }
        })
    }
})

// what failureFlash: true does is that if we can not authenticate, express will render one of the false messages in passportConfig usch as {message: "Email is not registered / User does no exist."} or { message: "Password is not correct!"});

app.post(
    '/users/login',
    passport.authenticate('local', {
        successRedirect: '/users/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true,
    })
)

// If user is logged in => is authenticated he will be automatically redirected to dashboard, where if he is not the middleware will simple jump to next middleware(so he wont be blocked from accessing what he wants)
function checkAuthenticated(request, response, next){
    if(request.isAuthenticated()){
        return response.redirect('/users/dashboard')
    };
    next();
}


// In this case if user is authenticared(logged in) the middleware will move on to next middleware, but if he is not logged in he will be automatically redirected t ologin
function checkNotAuthenticated(request, response, next){
    if(request.isAuthenticated()){
        return next();
    }

    response.redirect('/users/login');
}



app.listen(PORT, () => {
    console.log(`Server is listening in ${PORT}`)
})
