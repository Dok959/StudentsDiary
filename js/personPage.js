const cookie = getCookie(document.cookie, 'USER');
let user;

class User{
    constructor({
        idOwner, firstName = null, lastName = null,
        patronymic = null, theme, role = null, university = null, group = null,
    }) {
        this.idOwner = idOwner;
        this.firstName = firstName;
        this.lastName = lastName;
        this.patronymic = patronymic;
        this.theme = theme;
        this.role = role;
        this.university = university;
        this.group = group;
    }

    setFirstName(firstName){
        this.firstName = firstName;
    }

    setLastName(lastName){
        this.lastName = lastName;
    }

    setPatronymic(patronymic){
        this.patronymic = patronymic;
    }

    setTheme(theme){
        this.theme = theme;
    }

    setRole(role){
        this.role = role;
    }

    setUniversity(university){
        this.university = university;
    }

    setGroup(group){
        this.group = group;
    }
}

// Выход
function exit() {
    deleteCookie('USER');
    window.location.href = '/';
}

// Оборажение вкладок
function renderTab(tag) {
    $('#settings').removeClass('visible');
    $('#profile').removeClass('visible');
    $('#friends').removeClass('visible');
    $(`#${tag}`).addClass('visible');
}

// Оборажение вкладок
async function checkOpenTab() {
    let table = null;
    table = $('#settings').hasClass('visible') ? 'SETTINGS' : null;
    if (table !== null){
        return table;
    }

    table = $("#profile").hasClass('visible') ? 'USERS' : null;
    if (table !== null){
        return table;
    }

    return table;
}

// Оборажение вкладок
function renderFieldsTab() {
    document.getElementsByName('lastName').item(0).value = user.lastName;
    document.getElementsByName('firstName').item(0).value = user.firstName;
    document.getElementsByName('patronymic').item(0).value = user.patronymic;
    document.getElementsByName('role').item(0).value = user.role;
    document.getElementsByName('university').item(0).value = user.university;
    document.getElementsByName('group').item(0).value = user.group;
}

// Обновление локальных данных
function updateUserFields(firstName, lastName, patronymic, theme, role, university, group) {
    user.setFirstName(firstName);
    user.setLastName(lastName);
    user.setPatronymic(patronymic);
    user.setTheme(theme);
    user.setRole(role);
    user.setUniversity(university);
    user.setGroup(group);

    renderFieldsTab();
}

// Механизм запросов
async function getResourse(data) {
    options = {
        method: 'POST',
        body: data,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
    }

    const res = await fetch('./database/buildingQueryForDB', options);

    if (!res.ok) {
        throw new Error(`Произошла ошибка: ${res.status}`);
    }

    const result = await res.json()
    return result;
};

// Получение настроек пользователя
// todo прописать получение куки, 1 раз
async function uploadUserSettings() {
    const data = JSON.stringify({
        code: 4,
        table: 'SETTINGS',
        idOwner: '1',// cookie,
    });

    const result = await getResourse(data);
    user = new User(result[0]);
    renderFieldsTab();
}

// Сохранение изменений
// todo прописать получение куки, 2 раз, добавить валидацию
async function userUpdate() {
    const table = await checkOpenTab();
    const userTest = {
        code: 2,
        table,
    };

    if (table === 'SETTINGS'){
        userTest.idOwner = '1';// cookie;
        userTest.firstName = document.getElementsByName('firstName').item(0).value;
        userTest.lastName = document.getElementsByName('lastName').item(0).value;
        userTest.patronymic = document.getElementsByName('patronymic').item(0).value;
        userTest.role = document.getElementsByName('role').item(0).value;
        userTest.university = document.getElementsByName('university').item(0).value;
        userTest.group = document.getElementsByName('group').item(0).value;
        // data.lastName = document.getElementsByName('lastName').item(0);

        updateUserFields(userTest.firstName, userTest.lastName, userTest.patronymic,
            null, userTest.role, userTest.university, userTest.group);
    }
    else if(table === 'USERS'){
        userTest.id = '1';// cookie;
        userTest.password = document.getElementsByName('password').item(0).value;
    }

    const data = JSON.stringify(userTest);

    await getResourse(data);
}

// Действия при полной загрузке странцы
document.addEventListener('DOMContentLoaded', () => {
    uploadUserSettings();
})