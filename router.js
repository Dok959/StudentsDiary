const express = require('express');
const fs = require('fs');
const sqlBilderForUSer = require('./js/database/sqlBilderForUser');
const { setCookie, getCookie } = require('./js/cookies/cookies');
const sqlBilderForTasks = require('./js/database/sqlBilderForTasks');

const router = express.Router();

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

// создаем парсер для данных в формате json
const jsonParser = express.json();


// Обработчики на маршруты

// определяем обработчик для маршрута на главную страницу, '/'
router.get('/' || '/index(.html)?' || '/homePage(.html)?', function (request, response) {
    // отправляем ответ
    response.sendFile(__dirname + "/html" + "/homePage.html");
});

// обработчик для отправки запросов к базе
router.post('/database/sqlBilderForUser', jsonParser, async function (request, response) {
    if (!request.body)
        return response.sendStatus(400);
    console.log(request.body);

    await sqlBilderForUSer(request.body.code, request.body.table,
        [request.body.login, request.body.password])
        .then(result => {
            console.log(result),
                response.send(result)// перенаправление на основную страницу
        })
        .catch(error => console.log(error))
});

// обработчик для попадания на рабочую область приложения
router.use('/dashbord(.html)?', jsonParser, function (request, response) {
    if (getCookie(request.headers.cookie, 'USER')) {
        // получить данные от базы и передать их в представление
        response.render('dashbord', {
            user: 'Александр'
        });
    }
    else {
        response.redirect(301, __dirname + "/html" + "/");
    }
});

// обработчик для рабочей области приложения
router.post('/database/sqlBilderForTasks', jsonParser, async function (request, response) {
    if (getCookie(request.headers.cookie, 'USER')) {
        if (!request.body)
            return response.sendStatus(400);
        console.log(request.body);

        await sqlBilderForTasks(request.body)
            .then(result => {
                console.log(result),
                response.send(result)// возврат информации на страницу запроса
            })
            .catch(error => console.log(error))
    }
    else {
        response.redirect(301, __dirname + "/html" + "/");
    }
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