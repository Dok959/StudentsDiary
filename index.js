const http = require('http')
const fs = require('fs')
const path = require('path')

const server = http.createServer((req, res)=>{
    
    // получаем путь до открываемого файла
    let filePath = path.join(__dirname, 'html', req.url === '/' ? 'index.html' : req.url)
    const ext = path.extname(filePath) // расширение
    
    // определяем тип файла
    let contentType = 'text/html'
    switch (ext){
        case '.css':
            contentType = 'text/css'
            break
        case '.js':
            contentType = 'text/javascript'
            break
        default:
            contentType = 'text/html'
    }
    
    if(!ext){
        filePath += '.html'
    }

    //открытие файла по созданному пути
    fs.readFile(filePath, (err, content) => {
        if(err){
            fs.readFile(path.join(__dirname, 'html', 'error.html'), (err, data)=>{
                if(err){
                    res.writeHead(500)
                    res.end('Error')
                } else{
                    res.writeHead(200, {
                        'Content-Type': contentType
                    })
                    res.end(data)
                }
            })
        } else{
            res.writeHead(200, {
                'Content-Type': contentType
            })
            res.end(content)
        }
    })

})

// определение порта
const PORT = process.env.PORT || 3000

// запуск сервера
server.listen(PORT, ()=>{
    console.log(`Server has been started on ${PORT} ...`)
})