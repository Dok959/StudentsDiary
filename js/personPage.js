const cookie = getCookie(document.cookie, 'USER');
let user;

class User{
    constructor({
        idOwner, userCode, firstName = null, lastName = null,
        patronymic = null, theme, role = null, university = null, group = null,
    }) {
        this.idOwner = idOwner;
        this.userCode = userCode;
        this.firstName = firstName;
        this.lastName = lastName;
        this.patronymic = patronymic;
        this.theme = theme;
        this.role = role;
        this.university = university;
        this.group = group;
    }

    setUserCode(userCode){
        this.userCode = userCode;
    }

    getUserCode(){
        return this.userCode;
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

// Возврат к основной странице
function returnDashboard() {
    window.location.href = '/dashboard';
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
    document.getElementById('user-name').textContent = user.firstName || 'Пользователь';
    document.getElementById('user-code').textContent = user.userCode;
    document.getElementsByName('user-code').item(0).value = user.userCode;
    document.getElementsByName('lastName').item(0).value = user.lastName;
    document.getElementsByName('firstName').item(0).value = user.firstName;
    document.getElementsByName('patronymic').item(0).value = user.patronymic;
    document.getElementsByName('role').item(0).value = user.role === null ? 10 : user.role;
    document.getElementsByName('university').item(0).value = user.university === null ? 10 : user.university;
    document.getElementsByName('group').item(0).value = user.group;
}

// Обновление локальных данных
function updateUserFields(userCode, firstName, lastName, patronymic, theme, role = 10, university = 10, group) {
    user.setUserCode(userCode);
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

// Выделение ошибок
function generateError(element) {
    $(element).addClass('error');
    return false;
}

// Проверка маски
function checkMask(args) {
    if (/[\\/;.'']/.test(args.value)) {
        return generateError(args);
    }
    return true;
}

// Проверка длины
function checkLength(args, flag = true) {
    if (flag === true && args.value.length < 5) {
        return generateError(args);
    }
    if (flag === false && (args.value.length > 10 || args.value.length < 5)) {
        return generateError(args);
    }
    return true;
}

// Удаление ошибок
function removeValidation(element) {
    $(element).removeClass('error');
    return true;
}

// Сохранение изменений
// todo прописать получение куки, 2 раз
async function userUpdate() {
    const table = await checkOpenTab();
    const userTest = {
        code: 2,
        table,
    };

    let flagUserCode = true; let flagGroup = true; let flagPassword = true;
    if (table === 'SETTINGS'){
        userTest.idOwner = '1';// cookie;
        userTest.firstName = document.getElementsByName('firstName').item(0).value;
        userTest.lastName = document.getElementsByName('lastName').item(0).value;
        userTest.patronymic = document.getElementsByName('patronymic').item(0).value;

        const userCode = document.getElementsByName('user-code').item(0);
        flagUserCode = checkLength(userCode, false) ? removeValidation(userCode) : false;
        if (flagUserCode === true){ // проверка отсутствия значения в базе
            userTest.userCode = userCode.value;
            const userCodeOld = user.getUserCode();
            if (userCode.value !== userCodeOld){
                const data = JSON.stringify({code: 4, table, userCode: userCode.value});
                const result = await getResourse(data);
                if (result[0] !== undefined){
                    flagUserCode = false;
                    generateError(userCode);
                }
                else{
                    removeValidation(userCode);
                }
            }
        }

        const university = document.getElementsByName('university').item(0).value;
        const role = document.getElementsByName('role').item(0).value;
        if (Number.parseInt(university, 10) !== 10 && Number.parseInt(role, 10) !== 10){
            userTest.university = university;
            userTest.role = role;
            const group = document.getElementsByName('group').item(0);
            flagGroup = checkLength(group) ? removeValidation(group) : false;
            userTest.group = group.value;
        }
        else{
            userTest.university = null;
            userTest.role = null;
            userTest.group = null;
        }
    }
    else if(table === 'USERS'){
        userTest.id = '1';// cookie;

        const password = document.getElementsByName('password').item(0);
        const passwordRepeat = document.getElementsByName('repeat-password').item(0);
        if (password.value === passwordRepeat.value){
            flagPassword = checkLength(password) ? (checkMask(password) && removeValidation(password)) : false;
            userTest.password = password.value;
        }
        else{
            flagPassword = false;
        }
    }

    if (flagUserCode === true && flagGroup === true && flagPassword === true){
        if (table === 'SETTINGS'){
            updateUserFields(userTest.userCode, userTest.firstName, userTest.lastName, userTest.patronymic,
                null, userTest.role, userTest.university, userTest.group);
        }
        else if (table === 'USERS'){
            document.getElementsByName('password').item(0).value = null;
            document.getElementsByName('repeat-password').item(0).value = null;
        }
        const data = JSON.stringify(userTest);
        await getResourse(data);

        alert('Информация успешно обновлена');
    }
}

// Действия при полной загрузке странцы
document.addEventListener('DOMContentLoaded', () => {
    uploadUserSettings();
})

// Слушатель
document.addEventListener('click', (event) => {
    try {
        const university = document.getElementsByName('university').item(0).value;
        if (Number.parseInt(university, 10) === 10){
            document.getElementsByName('role').item(0).disabled = true;
            document.getElementsByName('group').item(0).disabled = true;
        }
        else{
            document.getElementsByName('role').item(0).disabled = false;
            const role = document.getElementsByName('role').item(0).value;
            if (Number.parseInt(role, 10) === 10){
                document.getElementsByName('group').item(0).disabled = true;
            }
            else{
                document.getElementsByName('group').item(0).disabled = false;
            }
        }
    } catch (error) {
        /* empty */
    }
})