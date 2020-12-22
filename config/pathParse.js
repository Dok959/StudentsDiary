// модуль отвечающий за формирование пути до открываемого файла, определения типа файла и расширения

const path = require('path')

function parse(dirname, pathname, response, handle) {
    // получаем дефолтный путь до открываемого файла
    let filePath = path.join(dirname, 'html', pathname === '/' ? 'index.html' : pathname)

    // определяем расширение открываемого файла
    const ext = path.extname(filePath)

    // определяем тип открываемого файла
    let contentType = 'text/html'

    // формируем новый путь до файла
    switch (ext) {
        case '.css':
            contentType = 'text/css'
            filePath = path.join(dirname, pathname)
            break
        case '.js':
            contentType = 'text/javascript'
            filePath = path.join(dirname, pathname)
            break
        default:
            contentType = 'text/html'
    }
    handle(response, filePath, contentType)
}

exports.pathParse = parse