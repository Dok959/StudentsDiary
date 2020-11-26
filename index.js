// главный файл приложения
const path = require('path')

//подключение модулей
let filePath = path.join(__dirname, "server")
const server = require(filePath);

filePath = path.join(__dirname, "router")
const router = require(filePath);

filePath = path.join(__dirname, "requestHandlers")
const requestHandlers = require(filePath);

// коллекция обработчиков запроса
const handle = {}
handle["/"] = requestHandlers.start;
handle["/start"] = requestHandlers.start;
handle["/upload"] = requestHandlers.upload;


// запуск сервера
server.start(router.route, handle);