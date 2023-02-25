const LocaStrategy = require('passport-local').Strategy;
const { pool } = require('./dbConfig');
const queries = require('./queries');
const bcrypt = require('bcrypt');

function initialize(passport){

    const authenticateUser = (email,password, done) => {
        // query database if user exists
        pool.query(queries.checkEmail, [email], (error, results) => {
            if(error) throw error;

            console.log(results.rows);

            // If there is such user, it will pass in the user object to the user const from database. The results always return list and We want the first item of that list => user
            if (results.rows.length > 0){
                const user = results.rows[0];


                // Now we need to compare password users placed into input field of login form with the one that is already stored in database. Function isMatch compares these passports and returns True if they match

                bcrypt.compare(password, user.password, (error, isMatch) => {
                    if(error) throw error;

                    // if passwords match return done where null means there was no error, and the second parameter is the user itself.               
                    if(isMatch){
                        return done(null,user);

                        // So what done function does is to store returned user and store it in the session cookie object for us to use in our app
                    }
                    else{
                        //if the password is incorrect, return done with no application error AKA null, 
                        return done(null, false, { message: "Password is not correct!"});
                    }                    
                });
            
            // If there are no users found in the database
            } else{
                return done(null, false, {message: "Email is not registered / User does no exist."})
            }
             
        });
    };

    passport.use( new LocaStrategy({
        usernameField: 'email',
        passwordField: 'password',   // note that we have already call password input field 'password
        }, authenticateUser)
    );

    // passport.serializeUser takes the user and it stores user id in the session
    passport.serializeUser((user,done) => done(null, user.id));


    
    // passport.deserializeUser uses id stored in cookie from passport.serializeUser to obtain the user details from databse and store the full obejct into the session when we navigate our page on our application 
    passport.deserializeUser((id, done) => {
        pool.query(queries.selectUserById, [id], (error, results) => {
            if(error) throw error;

            return done(null, results.rows[0]);
        })
    })    
}


module.exports = initialize;


