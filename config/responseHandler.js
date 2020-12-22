// модуль отвечающий за вызов требуемого файла

const fs = require('fs')
const path = require('path')

//определение маршрутов
function route(response, filePath, contentType) {
    
    //открытие файла по созданному пути
    fs.readFile(filePath, (err, content) => {
        if (err){
            fs.readFile(path.join(__dirname, '../html', 'error.html'), (err, data) => {
                if (err) {
                    response.writeHead(500)
                    response.end('Error')
                } else {
                    response.writeHead(200, {
                        'Content-Type': contentType
                    })
                    response.end(data) // закрываем ответ
                }
            })
        } else {
            response.writeHead(200, {
                'Content-Type': contentType
            })
            response.end(content)
        }
    })
}

exports.route = route