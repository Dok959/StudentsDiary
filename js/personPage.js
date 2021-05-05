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

// Взаимодействие с селектами
function enableOrDisableGroup() {
    const university = document.getElementsByName('university').item(0).value;
        if (Number.parseInt(university, 10) === 10){
            document.getElementsByName('role').item(0).disabled = true;
            document.getElementsByName('group').item(0).disabled = true;
        }
        else{
            document.getElementsByName('role').item(0).disabled = false;
            const role = document.getElementsByName('role').item(0).value;
            if (Number.parseInt(role, 10) === 10 || Number.parseInt(role, 10) === 2){
                document.getElementsByName('group').item(0).disabled = true;
            }
            else{
                document.getElementsByName('group').item(0).disabled = false;
            }
        }
}

// Возврат к основной странице
function returnDashboard() {
    window.location.href = '/dashboard';
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

// Очиска областей
function removeWindow(tag = closeTag) {
    const elements = document.querySelectorAll(tag);
    elements.forEach(element => {
        element.remove();
    });
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

// Рендер списка пользователей
// flag отвечает за то что пользователи есть в списке друзей
// todo
function renderListUsers(elements, area, flag = true) {
    document.getElementById(`${area.substr(1)}`)
        .setAttribute('style','border-color: #1e6acc');
    let tag;
    if (area === '#search-invitations'){
        tag = '#invitationsUser';
    }
    else{
        tag = '#foundUser';
    }
    removeWindow(tag);

    let node;
    if (elements.title !== undefined){
        node = `<div id="foundUser" class="foundUser">
            <span>${elements.title}</span>
        </div>`;
        $(area).append(node);
    }
    else{
        for (key in elements) {
            if ({}.hasOwnProperty.call(elements, key)) {
                let title;
                if (elements[key].lastName !== null){
                    title = elements[key].lastName;
                    if (elements[key].firstName !== null){
                        title += ` ${elements[key].firstName.slice(0,1)}.`;
                        if (elements[key].patronymic !== null){
                            title += ` ${elements[key].patronymic.slice(0,1)}.`;
                        }
                    }
                }
                else if (elements[key].firstName !== null){
                    title = elements[key].firstName;
                }
                else{
                    title = elements[key].userCode;
                }

                // todo сформировать строку для фио не более 90px, примерно, чтобы было ровно.

                if (area === '#search-invitations'){
                    node = `<div id="invitationsUser" class="foundUser">
                    <span>${title}</span>
                    <a href="#" class="user-action-link">Профиль</a>
                    <a href="javascript:requestInvite('${elements[key].idOwner}', true)" class="user-action-link">Принять</a>
                    <a href="javascript:requestInvite('${elements[key].idOwner}', false)" class="user-action-link">Отклонить</a>
                    </div>`;
                }
                else if (flag === false){
                    node = `<div id="foundUser" class="foundUser">
                        <span>${title}</span>
                        <a href="#" class="user-action-link">Профиль</a>
                        <a href="javascript:inviteToFriends('${elements[key].idOwner}')" class="user-action-link">Добавить в друзья</a>
                        <a href="#" class="user-action-link">Пригласить в ...</a>
                    </div>`;
                }
                else{
                    node = `<div id="foundUser" class="foundUser">
                        <span>${title}</span>
                        <a href="#" class="user-action-link">Профиль</a>
                        <a href="#" class="user-action-link">Пригласить в ...</a>
                    </div>`;
                }

                $(area).append(node);
            }
        }
    }
}

// Ответы на приглашения
// todo убрать записи которые были отвечены
async function requestInvite(idSender, flag){
    const data = JSON.stringify({
        code: 3,
        table: 'INVITE_TO_FRIENDS',
        idSender,
        idRecipient: cookie,
        flag,
    });

    await getResourse(data);

    removeWindow('#invitationsUser');
}

// Проверка на наличие приглашения
async function checkInvite(){
    const data = JSON.stringify({
        code: 4,
        table: 'INVITE_TO_FRIENDS',
        idRecipient: cookie,
        flag: true
    });

    const elements = await getResourse(data);
    if ({}.hasOwnProperty.call(elements, '0')){
        document.getElementById('check-invitations').setAttribute('style','display: block');
        renderListUsers(elements, '#search-invitations', false);
    }
    else{
        document.getElementById('check-invitations').setAttribute('style','display: none');
    }
}

// Проверка на наличие приглашения
async function checkFriends(){
    const data = JSON.stringify({
        code: 4,
        table: 'FRIENDS',
        idSender: cookie,
        idRecipient: cookie,
        flag: true
    });

    const elements = await getResourse(data);
    if ({}.hasOwnProperty.call(elements, '0')){
        document.getElementById('check-friends').setAttribute('style','display: block');
        renderListUsers(elements, '#list-friends', true);
    }
    else{
        document.getElementById('check-friends').setAttribute('style','display: none');
    }
}

// Оборажение вкладок
function renderTab(tag) {
    $('#settings').removeClass('visible');
    $('#profile').removeClass('visible');
    $('#friends').removeClass('visible');
    $(`#${tag}`).addClass('visible');

    if (tag === 'friends'){
        checkInvite();
        checkFriends();
    }
}

// Выделение ошибок
function generateError(element) {
    $(element).addClass('error');
    return false;
}

// Оборажение вкладок
function renderFieldsTab() {
    document.getElementById('user-name').textContent = user.firstName || 'Пользователь';
    document.getElementById('user-code').textContent = user.userCode;
    document.getElementsByName('user-code').item(0).value = user.userCode;
    if (user.userCode === null){
        generateError(document.getElementsByName('user-code').item(0));
    }
    document.getElementsByName('lastName').item(0).value = user.lastName;
    document.getElementsByName('firstName').item(0).value = user.firstName;
    document.getElementsByName('patronymic').item(0).value = user.patronymic;
    document.getElementsByName('role').item(0).value = user.role === null ? 10 : user.role;
    document.getElementsByName('university').item(0).value = user.university === null ? 10 : user.university;
    document.getElementsByName('group').item(0).value = user.group;

    enableOrDisableGroup();
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

// Получение настроек пользователя
async function uploadUserSettings() {
    const data = JSON.stringify({
        code: 4,
        table: 'SETTINGS',
        idOwner: cookie,
    });

    const result = await getResourse(data);
    user = new User(result[0]);
    renderFieldsTab();
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
async function userUpdate() {
    const table = await checkOpenTab();
    const userTest = {
        code: 2,
        table,
    };

    let flagUserCode = true; let flagGroup = true; let flagPassword = true;
    if (table === 'SETTINGS'){
        userTest.idOwner = cookie;
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
            if (Number.parseInt(role, 10) !== 2){ // не препод
                const group = document.getElementsByName('group').item(0);
                flagGroup = checkLength(group) ? removeValidation(group) : false;
                userTest.group = group.value;
            }
            else{
                userTest.group = null;
            }
        }
        else{
            userTest.university = null;
            userTest.role = null;
            userTest.group = null;
        }
    }
    else if(table === 'USERS'){
        userTest.id = cookie;

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

// Проверка на наличие в друзьях и отправка приглоса в друзья
async function inviteToFriends(idRecipient){
    const dataUser = JSON.stringify({
        code: 4,
        table: 'FRIENDS',
        idSender: cookie,
        idRecipient: cookie,
        addressee: idRecipient,
    });

    const check = await getResourse(dataUser);
    if (!{}.hasOwnProperty.call(check, '0')){
        const data = JSON.stringify({
            code: 1,
            table: 'INVITE_TO_FRIENDS',
            idSender: cookie,
            idRecipient,
        });

        getResourse(data);
    }
}

// Сохранение изменений
// ?
async function searchUser() {
    // removeWindow('#foundUser');
    const userCode = document.getElementsByName('search-user-code').item(0).value;
    if (userCode !== '' || null){
        const data = JSON.stringify({
            code: 4,
            table: 'SETTINGS',
            userCode,
            flag: false, // ?
        });

        const result = await getResourse(data);

        renderListUsers(result, '#search-result',false); // ?
    }
    else{
        document.getElementById('search-result').setAttribute('style','border-color: transparent')
    }
}

// Действия при полной загрузке странцы
document.addEventListener('DOMContentLoaded', () => {
    uploadUserSettings();
})

// Слушатель
document.addEventListener('click', (event) => {
    try {
        enableOrDisableGroup();
    } catch (error) {
        /* empty */
    }
})