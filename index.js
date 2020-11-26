// главный файл приложения
const path = require('path')

let filePath = path.join(__dirname, "server")
const server = require(filePath);

// запуск сервера
server.start();