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

// определяем обработчики для маршрута на главную страницу, '/'
router.get('/', function (request, response) {
    // отправляем ответ
    response.sendFile(__dirname + '/html' + '/homePage.html');
});

router.get('/index(.html)?', function (request, response) {
    console.log(request.url)
    // отправляем ответ
    response.redirect('/');
});

router.get('/homePage(.html)?', function (request, response) {
    // отправляем ответ
    response.redirect('/');
});


// промежуточный обработчик для регистрации и авторизации пользователя
router.post('/queryForUser', jsonParser, async function (request, response) {
    await buildingQueryForDB(request.body)
        .then(result => {
            result[0].id = key.encrypt(result[0].id, 'base64'), // шифруем id
                response.send(result) // возврат информации на страницу запроса
        })
        .catch(error => console.log(error));
});


// обработчики для попадания на рабочую область приложения
router.use('/dashboard(.html)?', jsonParser, async function (request, response) {
    await checkUser(request)
        .then(result => {
            if (result !== false) {
                let userName;
                if (result !== null) {
                    userName = result;
                }
                else {
                    userName = getCookie(request.headers.cookie, 'LOGIN');
                };

                // вывод имени пользователя или его логина при приветствие
                response.render('dashboard', {
                    user: userName,
                });
            }
            else {
                response.redirect('/');
            };
        });

    // вход для разработки
    // response.render('dashboard', {
    //     user: 'admin',
    // });
});

router.get('/dashboard(.hbs)?', function (request, response) {
    // отправляем ответ
    response.redirect('/dashboard');
});


// обработчик для отправки запросов к базе
router.post('/database/buildingQueryForDB', jsonParser, async function (request, response) {
    if (request.body.id_owner) { // если пользователь авторизован, то парсим его hash
        request.body.id_owner = key.decrypt(getCookie(request.headers.cookie, 'USER'), 'utf8');
    };

    // console.log('Запрос:')
    // console.log(request.body)

    await buildingQueryForDB(request.body)
        .then(result => {
            // console.log('Ответ:'),
            //     console.log(result),
            response.send(result)
        })
        .catch(error => console.log(error));
});


// обработчик для попадания на рабочую область приложения
router.use('/personPage(.html)?', jsonParser, async function (request, response) {
    await checkUser(request, false).then(res => {
        if (res !== false) {
            response.sendFile(__dirname + '/html' + '/personPage.html');
        }
        else {
            response.redirect('/');
        };
    });
});


// проверка начилия пользователя и его настроек 
// флаг равный false проверяет только существование пользователя
async function checkUser(request, flag = true) {
    try {
        let id_user = key.decrypt(getCookie(request.headers.cookie, 'USER'), 'utf8');
        let user = {
            'code': 4,
            'table': 'USERS',
            'id': id_user
        };

        let settingsUser = {
            'code': 4,
            'table': 'SETTINGS',
            'id_owner': id_user
        };

        return await buildingQueryForDB(user)
            .then(result => {
                if (result[0] !== undefined) {
                    if (flag) {

                        return buildingQueryForDB(settingsUser)
                            .then(settings => {
                                try {
                                    return settings[0].first_name;
                                } catch (error) {
                                    return null;
                                };
                            });
                    }
                    else {
                        return true;
                    }
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


// переадресация если страниц несуществует
router.use(function (request, response) {
    response.status(404).sendFile(__dirname + '/html' + '/error.html');
});

module.exports = router;