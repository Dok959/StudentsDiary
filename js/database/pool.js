require('dotenv').config(); // нужна только для тестирования
const mysql = require('mysql2');

// создание пула подключений
function createPool() {
    const pool = mysql.createPool({
        connectionLimit: 5,
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE,
    });

    return pool.promise();
}

module.exports = createPool();
