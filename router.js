const express = require('express');
const fs = require('fs');
const { setCookie, getCookie } = require('./js/cookies/cookies');
const buildingQueryForDB = require('./js/database/sqlBilderForDB');

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

// переводящий обработчик для регистрации и авторизации пользователя
router.post('/queryForUser', jsonParser, async function (request, response) {
    await buildingQueryForDB(request.body)
        .then(result => {
            console.log(result), // необходимо защифровать id пользователя
                response.send(result) // возврат информации на страницу запроса
        })
        .catch(error => console.log(error));
});

// обработчик для попадания на рабочую область приложения
router.use('/dashbord(.html)?', jsonParser, async function (request, response) {
    if (await checkUser(request)) {
        response.render('dashbord', {
            user: getCookie(request.headers.cookie, 'LOGIN') // сюда передавать имя или ник пользователя
        });
    }
    else {
        response.redirect('/');
    };
});

// обработчик для отправки запросов к базе
router.post('/database/buildingQueryForDB', jsonParser, async function (request, response) {
    if (!request.body)
        return response.sendStatus(400);
    // console.log(request.body);

    await buildingQueryForDB(request.body)
        .then(result => {
            // console.log(result),
            response.send(result) // возврат информации на страницу запроса
        })
        .catch(error => console.log(error));
});

// проверка существования такого пользователя на текущий момент
async function checkUser(request) {
    return await buildingQueryForDB({
        'code': 4,
        'table': 'USERS',
        'id': getCookie(request.headers.cookie, 'USER')
    })
        .then(result => {
            if (result[0] !== undefined) {
                return true;
            }
            else {
                return false;
            };
        })
        .catch(error => console.log(error));
}


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