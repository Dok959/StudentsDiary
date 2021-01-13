// const bilder = require('./database/sqlBilder')
// import { query} from './database/sqlBilder';

// const bilder = require('./database/sqlBilder.mjs')

function handlerReg() {
    const login = document.forms.reg.login
    const password = document.forms.reg.password

    const args = [login, password]

    removeValidation()

    checkFieldsPresence(args)

    checkMask(args)

    checkLength(args)

    checkErrors(args)
}

function checkFieldsPresence(args) {
    for (var i = 0; i < args.length; i++) {
        if (!args[i].value) {
            generateError(args[i])
        }
    }
}

function checkMask(args) {
    for (var i = 0; i < args.length; i++) {
        if (!/(\s+)|((?!\W|@#))|[\\\/;.'']/.test(args[i].value))
            generateError(args[i])
    }
}

function checkLength(args) {
    for (var i = 0; i < args.length; i++) {
        if (args[i].value.length < 5)
            generateError(args[i])
    }
}

function generateError(element) {
    element.className = 'error'
    element.setAttribute('style', 'color:red; border-color: red;')
    return
}

function removeValidation() {
    const errors = document.forms.reg.querySelectorAll('.error')

    for (var i = 0; i < errors.length; i++) {
        errors[i].className = ''
        errors[i].setAttribute('style', 'color:black; border-color: internal-light-dark(rgb(118, 118, 118), rgb(133, 133, 133));')
    }
}

async function checkErrors(args) {
    const errors = document.forms.reg.querySelectorAll('.error')

    if (errors.length === 0) {
        //const bilder = require('./database/sqlBilder')
        let response = await fetch('./database/sqlBilder', {
            method: 'POST',
            body: {
                    'login': args[0].value,
                    'password': args[1].value
                }
            //'name=Vasya'
        })

        if (response.ok) { // если HTTP-статус в диапазоне 200-299
            // получаем тело ответа (см. про этот метод ниже)
            // let json = await response.text();
            alert("Запрос выполнен: " + response.status);
          } else {
            alert("Ошибка HTTP: " + response.status);
          }

        // bilder.query(1, 'users', args)

        //конект к базе данных
    }
}