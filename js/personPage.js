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

// Удаление приглашения
function removeInvite(id, flag = '') {
    const element = document.getElementById(flag+id).parentNode;
    element.remove();
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
function renderListUsers(elements, area, flag = true) {
    document.getElementById(`${area.substr(1)}`)
        .setAttribute('style','border-color: #1e6acc');
    let tag;
    if (area === '#search-invitations'){
        tag = '#invitationsUser';
    }
    else if ((area === '#search-result')){
        tag = '#foundUser';
    }
    else if ((area === '#list-friends')){
        tag = '#friendUser';
    }

    removeWindow(tag);

    let node;
    if (elements.title !== undefined){
        if (area === '#search-result'){
            node = `<div id="foundUser" class="foundUser">
                <span>${elements.title}</span>
            </div>`;
        }
        else{
            node = `<div id="friendUser" class="foundUser">
                <span>${elements.title}</span>
            </div>`;
        }
        $(area).append(node);
    }
    else{
        for (key in elements) {
            if ({}.hasOwnProperty.call(elements, key)) {
                let title = '';
                if (elements[key].lastName !== null){
                    title += `${elements[key].lastName} `;
                }
                if (elements[key].firstName !== null){
                    title += `${elements[key].firstName} `;
                }
                if (elements[key].patronymic !== null){
                    title += elements[key].patronymic;
                }
                if (title === '') {
                    title = elements[key].userCode;
                }

                if (area === '#search-invitations'){
                    node = `<div id="invitationsUser" class="foundUser">
                    <span id="${elements[key].idOwner}">${title}</span>
                    <a href="javascript:requestInviteForFriends('${elements[key].idOwner}', true)" class="user-action-link">Принять</a>
                    <a href="javascript:requestInviteForFriends('${elements[key].idOwner}', false)" class="user-action-link">Отклонить</a>
                    </div>`;
                }
                else if (area === '#search-result' && flag === false){
                    node = `<div id="foundUser" class="foundUser">
                        <span>${title}</span>
                        <a href="javascript:inviteToFriends('${elements[key].idOwner}')" class="user-action-link">Добавить в друзья</a>
                        <a href="javascript:formInviteForEvents('${elements[key].idOwner}')" class="user-action-link">Пригласить в ...</a>
                    </div>`;
                }
                else if (area === '#search-result' && flag === true){
                    node = `<div id="foundUser" class="foundUser">
                        <span>${title}</span>
                        <a href="javascript:formInviteForEvents('${elements[key].idOwner}')" class="user-action-link">Пригласить в ...</a>
                    </div>`;
                }
                else if (area === '#list-friends'){
                    node = `<div id="friendUser" class="foundUser">
                        <span>${title}</span>
                        <a href="javascript:formInviteForEvents('${elements[key].idOwner}')" class="user-action-link">Пригласить в ...</a>
                    </div>`;
                }

                $(area).append(node);
            }
        }
    }
}

// Проверка списка друзей
async function checkFriends(){
    const data = JSON.stringify({
        code: 4,
        table: 'FRIENDS',
        idSender: cookie,
        idRecipient: cookie,
        flag: true,
    });

    const elements = await getResourse(data);
    if (Object.keys(elements).length > 0){
        renderListUsers(elements, '#list-friends', true);
    }
}

// Ответы на приглашения
async function requestInviteForFriends(idSender, flag){
    const data = JSON.stringify({
        code: 3,
        table: 'INVITE_TO_FRIENDS',
        idSender,
        idRecipient: cookie,
        flag,
    });

    await getResourse(data);

    if (flag === true){
        checkFriends();
    }

    removeInvite(idSender);

    if (document.getElementById('search-invitations').childNodes.length < 1){
        document.getElementById('check-invitations').setAttribute('style','display:none')
    }
}

// Отрисовка списка приглашений на мероприятия
function renderListEvents(elements) {
    removeWindow('#foundEvent');

    let node;
    for (key in elements) {
        if ({}.hasOwnProperty.call(elements, key)) {
            const {id, title} = elements[key];

            node = `<div id="foundEvent" class="foundUser">
                <span id="event-${id}">${title}</span>
                <a href="javascript:requestInviteForEvents(${id}, true)" class="user-action-link">Принять</a>
                <a href="javascript:requestInviteForEvents(${id}, false)" class="user-action-link">Отклонить</a>
            </div>`;

            $('#invitations-to-events').append(node);
        }
    }
}

// Форма для приглаглашения на мероприятия
async function formInviteForEvents(idRecipient){
    // определение сроков
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    // формирование начальной даты
    const startDate = `${year}-${month}-${day}`;

    // формируем набор данных
    let data = JSON.stringify({
        code: 4,
        table: 'ALL-EVENTS',
        idOwner: cookie,
        startDate,
    });

    let result = await getResourse(data);

    const selectList = document.createElement("select");
    // `<select class="select" id="events-list"></select>`;
    console.log(Object.keys(result).length) // ? почему 0
    if (Object.keys(result).length > 0){
        for (key in result) {
            if ({}.hasOwnProperty.call(result, key)) {
                const {id, title} = result[key];

                const optionElement = document.createElement("option");

                optionElement.value = id;
                optionElement.text = title;
    
                // const list = `<option value="${id}">${title}</option>`;

                selectList.appendChild(optionElement);
                
                // $(selectList).append(list);

                // selectList.append(list)
                
                // list = `<div id="foundEvent" class="foundUser">
                //     <span id="event-${id}">${title}</span>
                //     <a href="javascript:inviteForEvents(idEvent, idRecipient)" class="user-action-link">Пригласить</a>
                // </div>`;
                console.log('+')
                console.log(selectList)
            }
        }
    }
    else{
        // 
    }
    selectList.id = "events-list";
    console.log(selectList)

    data = JSON.stringify({
        code: 4,
        table: 'SETTINGS',
        idOwner: idRecipient,
    });

    result = await getResourse(data);

    let title = '';
    if (result[0].lastName !== null){
        title += `${result[0].lastName} `;
    }
    if (result[0].firstName !== null){
        title += `${result[0].firstName} `;
    }
    if (result[0].patronymic !== null){
        title += result[0].patronymic;
    }
    if (title === '') {
        title = result[0].userCode;
    }


    const node = `<div class="window-overlay">
            <div class="window" id="create">
                <div class="window-wrapper">
                    <a href="javascript:removeWindow()" class="icon-close create"></a>

                    <div class="card-detail-data">
                        <div class="card-detail-item">
                            <h3 class="card-detail-item-header create-title">Выберите элемент который хотите создать</h3>
                            <div class="card-detail-action create">
                                ${title}<br>${selectList}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>`;

    await $('#dashboard-container').append(node);

}

// Отправка приглашений на мероприятия
// todo
async function inviteForEvents(idEvent, idRecipient){
    let data = JSON.stringify({
        code: 4,
        table: 'PARTICIPANTS',
        idEvent,
        idOwner: idRecipient,
    });

    let result = await getResourse(data);
    if (Object.keys(result).length === 0){
        data = JSON.stringify({
            code: 4,
            table: 'EVENTS',
            id,
            idOwner: idRecipient,
        });

        result = await getResourse(data);

        if (Object.keys(result).length === 0){
            data = JSON.stringify({
                code: 1,
                table: 'PARTICIPANTS',
                idEvent,
                idOwner: idRecipient,
                confirmation: 0,
            });
    
            await getResourse(data);
        }
    }
    else{
        //
    }
}

// Ответы на приглашения
async function requestInviteForEvents(idEvent, flag){
    let data;
    if (flag === true){
        data = JSON.stringify({
            code: 2,
            table: 'PARTICIPANTS',
            idEvent,
            idOwner: cookie,
            confirmation: 1,
        });
    }
    else{
        data = JSON.stringify({
            code: 3,
            table: 'PARTICIPANTS',
            idEvent,
            idOwner: cookie,
        });
    }

    await getResourse(data);

    removeInvite(idEvent, 'event-');

    if (document.getElementById('invitations-to-events').childNodes.length < 1){
        document.getElementById('check-invitations-for-events').setAttribute('style','display:none')
    }
}

// Проверка на наличие приглашения
async function checkInviteEvents(){
    const data = JSON.stringify({
        code: 4,
        table: 'PARTICIPANTS',
        idOwner: cookie,
        confirmation: false,
        searchInviteEvents: true,
    });

    const elements = await getResourse(data);
    if ({}.hasOwnProperty.call(elements, '0')){
        document.getElementById('check-invitations-for-events').setAttribute('style','display: block');
        renderListEvents(elements);
    }
    else{
        document.getElementById('check-invitations-for-events').setAttribute('style','display: none');
    }
}

// Проверка на наличие приглашения
async function checkInviteFriends(){
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

// Оборажение вкладок
function renderTab(tag) {
    $('#settings').removeClass('visible');
    $('#profile').removeClass('visible');
    $('#friends').removeClass('visible');
    $(`#${tag}`).addClass('visible');

    if (tag === 'friends'){
        checkInviteEvents();
        checkInviteFriends();
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

    if (user.userCode === null){
        document.getElementById('tab-friends').setAttribute('style','display:none');
    }
    else{
        document.getElementById('tab-friends').setAttribute('style','display:inline-block');
    }
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

    let check = await getResourse(dataUser);
    if (!{}.hasOwnProperty.call(check, '0')){
        let data = JSON.stringify({
            code: 4,
            table: 'INVITE_TO_FRIENDS',
            idSender: cookie,
            idRecipient: cookie,
            addressee: idRecipient,
        });

        check = await getResourse(data);

        if (!{}.hasOwnProperty.call(check, '0')){
            data = JSON.stringify({
                code: 1,
                table: 'INVITE_TO_FRIENDS',
                idSender: cookie,
                idRecipient,
                addFriend: true,
            });

            getResourse(data);
        }
    }
}

// Поиск пользователей
async function searchUser() {
    const userCode = document.getElementsByName('search-user-code').item(0).value;
    if (userCode !== '' || null){
        const search = JSON.stringify({
            code: 4,
            table: 'SETTINGS',
            userCode,
            flag: false,
        });

        const result = await getResourse(search);

        let elements = null;
        if (result[0] !== undefined){
            if (result[0].userCode !== user.getUserCode()){
                const data = JSON.stringify({
                    code: 4,
                    table: 'FRIENDS',
                    idSender: cookie,
                    idRecipient: cookie,
                    addressee: result[0].idOwner,
                });

                elements = await getResourse(data);

                if (Object.keys(elements).length > 0){
                    renderListUsers(result, '#search-result', true);
                }
                else{
                    renderListUsers(result, '#search-result', false);
                }
            }
            else{
                renderListUsers({title: 'Пользователь не обнаружен'}, '#search-result', false);
            }
        }
        else{
            renderListUsers(result, '#search-result', false);
        }
    }
    else{
        removeWindow('#foundUser');
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