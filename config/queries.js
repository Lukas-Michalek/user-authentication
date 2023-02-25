
const checkEmail = "SELECT * FROM users WHERE email = $1";
const addNewUser = 'INSERT INTO users(name, email, password) VALUES($1, $2, $3) RETURNING id, password';
const selectUserById = 'SELECT * FROM users WHERE id = $1';


module.exports = {
    checkEmail,
    addNewUser,
    selectUserById,
    

}