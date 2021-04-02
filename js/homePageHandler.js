function generateError(element) {
    element.className = 'error';
    element.setAttribute('style', 'color:red; border-color: red;');
}

function checkFieldsPresence(args) {
    for (let i = 0; i < args.length; i += i + 1) {
        if (!args[i].value) {
            generateError(args[i]);
        }
    }
}

function checkMask(args) {
    for (let i = 0; i < args.length; i += i + 1) {
        if (/[\\/;.'']/.test(args[i].value)) {
            generateError(args[i]);
        }
    }
}

function checkLength(args) {
    for (let i = 0; i < args.length; i += i + 1) {
        if (args[i].value.length < 5) {
            generateError(args[i]);
        }
    }
}

function removeValidation(form) {
    const errors = form.querySelectorAll('.error');

    for (let i = 0; i < errors.length; i += i + 1) {
        errors[i].className = '';
        errors[i].setAttribute(
            'style',
            'color:black; border-color: internal-light-dark(rgb(118, 118, 118), rgb(133, 133, 133));'
        );
    }
}

async function checkErrors(code, table, form, args) {
    const errors = form.querySelectorAll('.error');

    if (errors.length === 0) {
        // сериализуем данные в json
        const user = JSON.stringify({
            code,
            table,
            login: args[0].value,
            password: args[1].value,
        });
        // посылаем запрос
        const response = await fetch('./queryForUser', {
            method: 'POST',
            body: user,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        });

        if (response.ok) {
            const result = await response.json();
            if (result[0] !== undefined) {
                setCookie('USER', result[0].id, {
                    secure: false,
                    'max-age': 3600,
                });
                setCookie('LOGIN', args[0].value, {
                    secure: false,
                    'max-age': 3600,
                });
                window.location.href = 'dashboard'; // переадресация на рабочую область
            } else {
                alert(
                    'Указанный пользователь не найден.\nПроверьте корректность данных или зарегистрируйтесь!'
                );
            }
        } else {
            alert(
                `Произошла ошибка подключения к серверу.\nКод ошибки: ${
                    response.status}`
            );
        }
    }
}

function handlerReg() {
    const code = 1;
    const table = 'USERS';
    const {login} = document.forms.reg;
    const {password} = document.forms.reg;

    const args = [login, password];

    removeValidation(document.forms.reg);

    checkFieldsPresence(args);

    checkMask(args);

    checkLength(args);

    checkErrors(code, table, document.forms.reg, args);
}

function handlerAuth() {
    const code = 4;
    const table = 'USERS';
    const {login} = document.forms.auth;
    const {password} = document.forms.auth;

    const args = [login, password];

    removeValidation(document.forms.auth);

    checkFieldsPresence(args);

    checkMask(args);

    checkLength(args);

    checkErrors(code, table, document.forms.auth, args);
}