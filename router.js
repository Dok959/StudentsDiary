const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const sqlBilder = require('./js/database/sqlBilder');

const router = express.Router();

// создаем парсер для данных application/x-www-form-urlencoded
const urlencodedParser = bodyParser.urlencoded({ extended: false });

// подключение парсера тела запроса
// router.use(bodyParser.urlencoded({ extended: true }));
// router.use(bodyParser.json());

// определяем обработчик для ведения лога вызовов сервера
router.use(function (request, response, next) {

    let now = new Date();
    let hour = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    let data = `${hour}:${minutes}:${seconds} ${request.method} ${request.url} ${request.get('user-agent')}`;
    fs.appendFile('server.log', data + '\n', function () { });
    next();

});

// подключение статических файлов данных (css, js, img ...)
router.use(express.static(__dirname));


// требуется указывать все пути, иначе будет ошибка

// определяем обработчик для маршрута '/'
router.get('/' || '/index(.html)?' || '/homePage(.html)?', function (request, response) {

    // отправляем ответ
    response.sendFile(__dirname + "/html" + "/homePage.html");
});

// создаем парсер для данных в формате json
const jsonParser = express.json();

// обработчик для ....
router.post('/database/sqlBilder', jsonParser, function (request, response) {
    if (!request.body) return response.sendStatus(400);
    console.log(request.body);
    sqlBilder(1, 'USERS', [request.body.login, request.body.password]);
    // response.send(`${request.body.login} - ${request.body.password}`);
});

// определяем обработчик для маршрута '/'
router.get('/foo', function (request, response) {

    // отправляем ответ
    response.status(404).send(`Ресурс не найден`);
});

// определяем обработчик для маршрута '/'
router.post('/foo', function (request, response) {

    // постоянная переадресация
    response.redirect(301, __dirname + "/html" + "/error.html");
});


module.exports = router;