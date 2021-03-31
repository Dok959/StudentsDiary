// проверка длины входящей строки
function checkLength(args) {
    let str = args.value;
    if (str.length <= 0) {
        generateError(args);
        return false;
    } else {
        return true;
    }
}

// проверка валидности
async function checkValidation(element) {
    let flag = true; // отвечает за валидность изменённых данных

    // если дата не задана
    if (element.value === '') {
        return flag;
    }

    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth();
    let day = now.getDate();
    if (year <= Number.parseInt(element.value.slice(0, 4))) {
        if (month <= Number.parseInt(element.value.slice(5, 7))) {
            if (day > Number.parseInt(element.value.slice(8, 10))) {
                flag = false;
                generateError(element);
            }
        } else {
            flag = false;
            generateError(element);
        }
    } else {
        flag = false;
        generateError(element);
    }

    return flag;
}

// подключение ошибок полям
function generateError(element) {
    element.classList.add('error');
    return;
}

// удаление ошибок у полей
function removeValidation() {
    const errors = document.querySelectorAll('.error');

    for (var i = 0; i < errors.length; i++) {
        errors[i].classList.remove('error');
    }
}
