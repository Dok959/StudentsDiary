// проверка длины входящей строки
function checkLength(args) {
    let str = args.value;
    if (str.length <= 0) {
        generateError(args);
        return false;
    }
    else {
        return true;
    }
};

// подключение ошибок полям
function generateError(element) {
    console.log(element)
    element.classList.add('error');
    return;
};

// удаление ошибок у полей
function removeValidation() {
    const errors = document.querySelectorAll('.error');

    for (var i = 0; i < errors.length; i++) {
        errors[i].classList.remove('error');
    };
};