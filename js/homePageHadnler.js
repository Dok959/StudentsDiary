let code = 1;
const table = 'USERS';

function handlerReg() {
    const login = document.forms.reg.login;
    const password = document.forms.reg.password;

    const args = [login, password];

    removeValidation(document.forms.reg);

    checkFieldsPresence(args);

    checkMask(args);

    checkLength(args);

    code = 1;
    checkErrors(code, table, document.forms.reg, args);
}

function handlerAuth() {
    const login = document.forms.auth.login;
    const password = document.forms.auth.password;

    const args = [login, password];

    removeValidation(document.forms.auth);

    checkFieldsPresence(args);

    checkMask(args);

    checkLength(args);

    code = 4;
    checkErrors(code, table, document.forms.auth, args);
}

function checkFieldsPresence(args) {
    for (var i = 0; i < args.length; i++) {
        if (!args[i].value) {
            generateError(args[i]);
        }
    }
}

function checkMask(args) {
    for (var i = 0; i < args.length; i++) {
        if (!/(\s+)|((?!\W|@#))|[\\\/;.'']/.test(args[i].value)) {
            generateError(args[i]);
        }
    }
}

function checkLength(args) {
    for (var i = 0; i < args.length; i++) {
        if (args[i].value.length < 5) {
            generateError(args[i]);
        }
    }
}

function generateError(element) {
    element.className = 'error';
    element.setAttribute('style', 'color:red; border-color: red;');
    return;
}

function removeValidation(form) {
    const errors = form.querySelectorAll('.error');

    for (var i = 0; i < errors.length; i++) {
        errors[i].className = '';
        errors[i].setAttribute('style', 'color:black; border-color: internal-light-dark(rgb(118, 118, 118), rgb(133, 133, 133));');
    }
}

async function checkErrors(form, args) {
    const errors = form.querySelectorAll('.error');

    if (errors.length === 0) {

        // сериализуем данные в json
        let user = JSON.stringify({ 'login': args[0].value, 'password': args[1].value });
        // посылаем запрос на адрес "./database/sqlBilder"
        let response = await fetch('./database/sqlBilder', {
            method: 'POST',
            body: user,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        if (response.ok) { // если HTTP-статус в диапазоне 200-299
            alert("Запрос выполнен: " + response.status);
        } else {
            alert("Ошибка HTTP: " + response.status);
        }

        // bilder.query(1, 'users', args)

        //конект к базе данных
    }
}