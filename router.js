const express = require('express');
const fs = require('fs');

const router = express.Router();

// определяем обработчик для ведения лога вызовов сервера
router.use(function(request, response, next){
     
    let now = new Date();
    let hour = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    let data = `${hour}:${minutes}:${seconds} ${request.method} ${request.url} ${request.get('user-agent')}`;
    fs.appendFile('server.log', data + '\n', function(){});
    next();

});

// подключение статических файлов данных (css, js, img ...)
router.use(express.static(__dirname));


// требуется указывать все пути, иначе будет ошибка

// определяем обработчик для маршрута '/'
router.get('/' || '/index(.html)?', function(request, response){
     
    // отправляем ответ
    response.sendFile(__dirname + "/html" + "/homePage.html");
});

// определяем обработчик для маршрута '/'
router.get('/foo', function(request, response){
     
    // отправляем ответ
    response.status(404).send(`Ресурс не найден`);
});

// определяем обработчик для маршрута '/'
router.post('/foo', function(request, response){
     
    // отправляем ответ
    response.redirect(301, __dirname + "/html" + "/error.html")
});


module.exports = router;