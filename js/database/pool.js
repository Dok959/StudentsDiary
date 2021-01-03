const mysql = require("mysql2")
require('dotenv').config()

// создание пула подключений
function createPool() {
    const pool = mysql.createPool({
        connectionLimit: 5,
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PASSWORD, 
        database: process.env.DATABASE
    })
}

exports.pool = createPool