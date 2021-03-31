//Функция отображения PopUp
function PopUpShow() {
    $('.b-popup').show();
    PopUpShowRegistration();
}

function PopUpShowAuthorization() {
    PopUpHideRegistration();
    $('.authorization').show();
    $('.authorization .login').focus();
}

function PopUpShowRegistration() {
    PopUpHideAuthorization();
    $('.registration').show();
    $('.registration .login').focus();
}

function PopUpHideAuthorization() {
    $('.authorization').hide();
}

function PopUpHideRegistration() {
    $('.registration').hide();
}

//Функция скрытия PopUp
function PopUpHide() {
    $('.b-popup').hide();
}
