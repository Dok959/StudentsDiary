// выделение ошибочных данных в полях
function generateError(element) {
    element.classList.add('error');
}

// проверка длины входящей строки
function checkLength(args) {
    const str = args.value;
    if (str.length <= 0) {
        generateError(args);
        return false;
    }
    return true;
}

// проверка валидности
async function checkValidation(element) {
    let flag = true; // отвечает за валидность изменённых данных

    // если дата не задана
    if (element.value === '') {
        return flag;
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();
    if (year <= Number.parseInt(element.value.slice(0, 4), 10)) {
        if (month <= Number.parseInt(element.value.slice(5, 7), 10)) {
            if (day > Number.parseInt(element.value.slice(8, 10), 10)) {
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

// удаление ошибок у полей
function removeValidation() {
    const errors = document.querySelectorAll('.error');

    for (let i = 0; i < errors.length; i += i + 1) {
        errors[i].classList.remove('error');
    }
}
