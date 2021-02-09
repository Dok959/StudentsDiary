const express = require('express');
const fs = require('fs');
const { setCookie, getCookie, deleteCookie } = require('./js/cookies/cookies');
const buildingQueryForDB = require('./js/database/sqlBilderForDB');
const NodeRSA = require('node-rsa');
const key = new NodeRSA({ b: 512 }); // создание обработчика генерации шифрованых данных

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
    response.sendFile(__dirname + '/html' + '/homePage.html');
});

// переводящий обработчик для регистрации и авторизации пользователя
router.post('/queryForUser', jsonParser, async function (request, response) {
    await buildingQueryForDB(request.body)
        .then(result => {
            result[0].id = key.encrypt(result[0].id, 'base64'), // шифруем id
                response.send(result) // возврат информации на страницу запроса
        })
        .catch(error => console.log(error));
});

// обработчик для попадания на рабочую область приложения
router.use('/dashbord(.html)?', jsonParser, async function (request, response) {
    await checkUser(request)
        .then(result => {
            if (result) {
                let userName;
                if (result === undefined) {
                    userName = getCookie(request.headers.cookie, 'LOGIN');
                }
                else {
                    userName = result;
                };

                // вывод имени пользователя или его логина при приветствие
                response.render('dashbord', {
                    user: userName,
                });
            }
            else {
                response.redirect('/');
            };
        }
        );
});

// обработчик для отправки запросов к базе
router.post('/database/buildingQueryForDB', jsonParser, async function (request, response) {
    if (request.body.id_owner) { // если пользователь авторизован, то парсим его hash
        request.body.id_owner = key.decrypt(getCookie(request.headers.cookie, 'USER'), 'utf8');
    };
    console.log(request.body)
    await buildingQueryForDB(request.body)
        .then(result => {
            console.log(result),
                response.send(result)
        })
        .catch(error => console.log(error));
});

// обработчик для попадания на рабочую область приложения
router.use('/personPage(.html)?', jsonParser, async function (request, response) {    
    if (await checkUser(request)) {
        response.sendFile(__dirname + '/html' + '/personPage.html');
    }
    else {
        response.redirect('/');
    };
});

// проверка существования такого пользователя на текущий момент
async function checkUser(request) {
    try {
        let user = {
            'code': 4,
            'table': 'USERS',
            'id': key.decrypt(getCookie(request.headers.cookie, 'USER'), 'utf8')
        };

        let settingsUser = {
            'code': 4,
            'table': 'SETTINGS',
            'id': key.decrypt(getCookie(request.headers.cookie, 'USER'), 'utf8')
        };

        return await buildingQueryForDB(user)
            .then(result => {
                if (result[0] !== undefined) {
                    return buildingQueryForDB(settingsUser)
                        .then(settings => {
                            return settings[0].first_name
                        });
                }
                else {
                    return false;
                };
            })
            .catch(error => console.log(error));
    } catch (error) {
        return false;
    };
};


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