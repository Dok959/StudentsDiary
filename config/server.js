// модуль отвечающий за создание и подключение сервера

//считывание конфига и подгрузка библиотек
require('dotenv').config()
const http = require("http")
const url = require("url")

function start(route, handle) {
    function onRequest(request, response) {
        let pathname = url.parse(request.url).pathname //может попробовать const
        console.log("Выполняется запрос по адресу: " + pathname)

        route(handle, pathname, response)
    }

    // определение порта
    const PORT = process.env.PORT

    http.createServer(onRequest).listen(PORT, () => {
        //секретно, только для отладки
        console.log(require('dotenv').config())
        console.log(`Server has been started on ${PORT} ...`)
    })
}

exports.start = start
