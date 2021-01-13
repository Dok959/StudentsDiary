// модуль отвечающий за создание и подключение сервера

//считывание конфига и подгрузка библиотек
require('dotenv').config()
const http = require('http')
const url = require('url')

function start(dirname, parser, handle) {
    function onRequest(request, response) {
        const pathname = url.parse(request.url).pathname
        console.log('Выполняется запрос по адресу: ' + pathname)

        // console.log('Строка запроса: ' + request.body)

        switch (request.method) {
            case 'POST':
                console.log('Метод POST')
                console.log(request.body)
                parser(dirname, pathname, response, handle)
                break
            default:
                console.log('Метод GET')
                parser(dirname, pathname, response, handle)
        }
    }

    // определение порта
    const PORT = process.env.PORT

    // создание сервера
    http.createServer(onRequest).listen(PORT, () => {
        //секретно, только для отладки
        console.log(require('dotenv').config())
        console.log(`Server has been started on ${PORT} ...`)
    })
}

exports.start = start
