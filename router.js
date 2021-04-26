const express = require('express');
const fs = require('fs');
const NodeRSA = require('node-rsa');
const { getCookie } = require('./js/cookies/cookies');
const buildingQueryForDB = require('./js/database/sqlBilderForDB');

const key = new NodeRSA({ b: 512 }); // создание обработчика генерации шифрованых данных

const router = express.Router();

// подключение статических файлов данных (css, js, img ...)
router.use(express.static(__dirname));

// создаем парсер для данных в формате json
const jsonParser = express.json();

// * Функции для работы маршрутизатора

// проверка начилия пользователя и его настроек
// flag флаг равный false проверяет только существование пользователя
async function checkUser(request, flag = true) {
    try {
        const idUser = key.decrypt(
            getCookie(request.headers.cookie, 'USER'),
            'utf8'
        );
        const user = {
            code: 4,
            table: 'USERS',
            id: idUser,
        };

        return await buildingQueryForDB(user)
            .then((result) => {
                if (result[0] !== undefined) {
                    if (flag) {
                        user.table = 'SETTINGS';
                        user.idOwner = idUser;
                        delete user.id;
                        return buildingQueryForDB(user).then((settings) => {
                            try {
                                return settings[0].firstName;
                            } catch (error) {
                                return null;
                            }
                        });
                    }
                    return true;
                }
                return false;
            })
            .catch((error) => console.log(error));
    } catch (error) {
        return false;
    }
}

// * МАРШРУТИЗАЦИЯ

// логер
// ! временно отключено
router.use((_request, _response, next) => {
    // const now = new Date();
    // const data = `${now} ${request.method} ${request.url}`;
    // fs.appendFile('server.log', `${data}\n`, () => {});
    next();
});

// путь на главную страницу, '/'
router.get('/', (_request, response) => {
    response.sendFile(`${__dirname}/html/homePage.html`);
});

router.get('/index(.html)?', (_request, response) => {
    response.redirect('/');
});

router.get('/homePage(.html)?', (_request, response) => {
    response.redirect('/');
});

// промежуточный обработчик для регистрации и авторизации пользователя
router.post('/queryForUser', jsonParser, async (request, response) => {
    await buildingQueryForDB(request.body)
        .then((result) => {
            if (result[0] !== undefined){ // если пользователь существует
                result[0].id = key.encrypt(result[0].id, 'base64'); // шифруем id
            }
            response.send(result); // возврат результата
        })
        .catch((error) => console.log(error));
});

// путь на рабочую область
router.use('/dashboard(.html)?', jsonParser, async (request, response) => {
    await checkUser(request).then((result) => {
        if (result !== false) {
            let userName;
            if (result !== null) {
                userName = result;
            } else {
                userName = getCookie(request.headers.cookie, 'LOGIN');
            }

            // вывод имени пользователя или его логина при приветствие
            response.render('dashboard', {
                user: userName,
            });
        } else {
            response.redirect('/');
        }
    });
});

router.get('/dashboard(.hbs)?', (_request, response) => {
    response.redirect('/dashboard');
});


// путь на дополнительную область
router.use('/additionally(.html)?', jsonParser, async (_request, response) => {
    response.render('additionally');
});

router.get('/additionally(.hbs)?', (_request, response) => {
    response.redirect('/additionally');
});


// обработчик для отправки запросов к базе
router.post(
    '/database/buildingQueryForDB',
    jsonParser,
    async (request, response) => {
        if (request.body.idOwner) {
            // если пользователь авторизован, то парсим его hash
            request.body.idOwner = key.decrypt(
                getCookie(request.headers.cookie, 'USER'),
                'utf8'
            );
        }

        // console.log('Запрос:');
        // console.log(request.body);

        await buildingQueryForDB(request.body)
            .then((result) => {
                // console.log('Ответ:'),
                //     console.log(result),
                response.send(result);
            })
            .catch((error) => console.log(error));
    }
);

// обработчик для попадания на рабочую область приложения
router.use('/personPage(.html)?', jsonParser, async (request, response) => {
    await checkUser(request, false).then((res) => {
        if (res !== false) {
            response.sendFile(`${__dirname}/html/personPage.html`);
        } else {
            response.redirect('/');
        }
    });
});

// переадресация если страниц несуществует
router.use((_request, response) => {
    response.status(404).sendFile(`${__dirname}/html/error.html`);
});

module.exports = router;
