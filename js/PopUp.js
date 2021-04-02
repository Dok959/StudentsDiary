function PopUpHideAuthorization() {
    $('.authorization').hide();
}

function PopUpHideRegistration() {
    $('.registration').hide();
}

function PopUpShowRegistration() {
    PopUpHideAuthorization();
    $('.registration').show();
    $('.registration .login').focus();
}

function PopUpShowAuthorization() {
    PopUpHideRegistration();
    $('.authorization').show();
    $('.authorization .login').focus();
}

// Отрисовка формы
function PopUpShow() {
    $('.b-popup').show();
    PopUpShowRegistration();
}

// Скрытие формы
function PopUpHide() {
    $('.b-popup').hide();
}
