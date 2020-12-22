//считывание конфига и подгрузка библиотек
require('dotenv').config()
const http = require('http')
const fs = require('fs')
const path = require('path')

// создание сервера
const server = http.createServer((req, res) => {

    // получаем дефолтный путь до открываемого файла
    let filePath = path.join(__dirname, 'html', req.url === '/' ? 'index.html' : req.url)
    const ext = path.extname(filePath) // определяем расширение открываемого файла

    // определяем тип открываемого файла
    let contentType = 'text/html'
    switch (ext) {
        case '.css':
            contentType = 'text/css'
            filePath = path.join(__dirname, req.url) // формируем новый путь до файла
            break
        case '.js':
            contentType = 'text/javascript'
            filePath = path.join(__dirname, req.url)
            break
        default:
            contentType = 'text/html'
    }

    // вопрос в необходимости нижеуказанного
    if (!ext) {
        filePath += '.html'
    }

    //открытие файла по созданному пути
    fs.readFile(filePath, (err, content) => {
        if (err) {
            fs.readFile(path.join(__dirname, 'html', 'error.html'), (err, data) => {
                if (err) {
                    res.writeHead(500)
                    res.end('Error')
                } else {
                    res.writeHead(200, {
                        'Content-Type': contentType
                    })
                    res.end(data) // закрываем ответ
                }
            })
        } else {
            // res.writeHead(200, {
            //     'Content-Type': contentType
            // })
            res.statusCode = 200;
            res.setHeader('Content-Type', contentType);
            res.end(content)
        }
    })

})

// определение порта
const PORT = process.env.PORT

// запуск сервера
server.listen(PORT, () => {
    //секретно, только для отладки
    console.log(require('dotenv').config())
    console.log(`Server has been started on ${PORT} ...`)
})


// какое-то расширение в Google вызывает ошибки в консоли, но они не влияют на сайт 