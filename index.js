// Точка входа приложения
const path = require('path')

//подключение модулей
let filePath = path.join(__dirname, '/config/server')
const server = require(filePath)

filePath = path.join(__dirname, '/config/pathParse')
const parser = require(filePath)

filePath = path.join(__dirname, '/config/responseHandler')
const responseHandlers = require(filePath)


// запуск сервера
server.start(__dirname, parser.pathParse, responseHandlers.route)