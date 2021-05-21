const cookie = getCookie(document.cookie, 'USER');
const taskList = new Bord();
const closeTag = '.window-overlay';

// Механизм запросов
async function getResourse (data) {
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

// Удаление задачи с панели
function removeDashbordElement(id,flag = true) {
    let element
    if (flag){
        element = document.getElementById(`task-${id}`);
    }
    else{
        element = document.getElementById(`event-${id}`);
    }
    element.remove();
}

// Закрытие окон, удаление задач
function removeWindow(tag = closeTag) {
    const elements = document.querySelectorAll(tag);
    elements.forEach(element => {
        element.remove();
    });

    if (tag === '.formToUser'){
        document.getElementById('window-back').id = 'window';
    }
}

// Включение и выключение выбора периодичности
function periodicityEnable() {
    const elements = document.querySelectorAll('select');
    elements.forEach(element => {
        element.setAttribute('style', 'display: initial');
    });
    $('#periodicityEnable').toggleClass('btn-invizible');
    $('#periodicityShutdown').toggleClass('btn-invizible');
}
function periodicityShutdown() {
    const elements = document.querySelectorAll('select');
    elements.forEach(element => {
        element.setAttribute('style', 'display: none');
    });
    $('#periodicityEnable').toggleClass('btn-invizible');
    $('#periodicityShutdown').toggleClass('btn-invizible');
}

// Сброс даты и времени
function clearElement() {
    document.getElementById('date').value = null;
    document.getElementById('time').value = null;
}

// Получение элемента с формы
function getElement(tag = 'window') {
    const element = document.getElementById(tag).getAttribute('name');
    return element;
}

// Валидация полей
async function cheskFields(flag = true) {
    let availabilityTitle = true; // флаг проверки названия
    const id = getElement() || null;

    let title = document.getElementById('title');
    // проверка на пустоту
    checkLength(title) ? (title = title.value) : (availabilityTitle = false);

    const description = document.getElementById('description').value;

    // дата
    let date = document.getElementById('date');
    let availabilityDate = await checkValidation(date); // флаг проверки даты
    date = date.value ? date.value : null;

    // время
    const time = document.getElementById('time').value
        ? document.getElementById('time').value
        : null;

    // если время задано, а дата нет, то она будет установлена на сегодня
    if (time !== null && date === null) {
        const nowDay = new Date();
        const year = nowDay.getFullYear();
        let month = nowDay.getMonth() + 1;
        if (month < 10) {
            month = `0${month}`;
        }
        let day = nowDay.getDate();
        if (day < 10) {
            day = `0${day}`;
        }
        date = `${year}-${month}-${day}`;
    }

    // повторяется ли задача и если да то когда
    let frequency = null;
    let period = null;
    if (document.getElementById('periodicityEnable').classList.contains('btn-invizible') === true) {
        if (date === null){
            const nowDay = new Date();
            const year = nowDay.getFullYear();
            let month = nowDay.getMonth() + 1;
            if (month < 10) {
                month = `0${month}`;
            }
            let day = nowDay.getDate();
            if (day < 10) {
                day = `0${day}`;
            }
            date = `${year}-${month}-${day}`;
        }
        frequency = document.getElementById('frequency').value;
        period = document.getElementById('period').value;
    }

    if (flag === false){
        availabilityDate = date !== null;
        if (availabilityDate === false){
            generateError(document.getElementById('date'))
        }
    }

    return {availabilityTitle, availabilityDate, id, title, description,
        date, time, frequency, period};
}

/* Функции задач */

// Обновление задачи
async function updateTask() {
    removeValidation(); // удаление ошибочного выделения;
    const result = await cheskFields();
    const {availabilityTitle, availabilityDate, id, title,
        description, date, time, frequency} = result;
    let { period } = result;

    // если все ок, сохраняем
    if (availabilityTitle && availabilityDate) {
        let cheskTime = true;
        if (date !== null && time !== null){
            // проверка существования задач на это время
            let data = JSON.stringify({
                code: 4,
                table: 'TASKS',
                idOwner: cookie,
                date,
                time,
            });

            cheskTime = await getResourse(data);
            if (cheskTime[0] !== undefined && cheskTime[0].id !== Number.parseInt(id, 10)){
                cheskTime = false;
            }
            else{
                // проверка существования мероприятий на это время
                data = JSON.stringify({
                    code: 4,
                    table: 'EVENTS',
                    idOwner: cookie,
                    date,
                    time,
                });

                cheskTime = await getResourse(data);
                cheskTime = cheskTime[0] === undefined;
            }

            if (cheskTime !== false){
                const taskDate = new Date (date);
                let hour = Number.parseInt(time.slice(0,2), 10)
                let min = Number.parseInt(time.slice(3,5), 10)
                taskDate.setHours(hour, min);

                taskList.eventList.events.forEach(element => {
                    if (element.time !== null){
                        const testDate = new Date (element.date.slice(0, 10));
                        testDate.setDate(testDate.getDate() + 1);
                        hour = Number.parseInt(element.time.slice(0,2), 10)
                        min = Number.parseInt(element.time.slice(3,5), 10)
                        testDate.setHours(hour, min);

                        if (taskDate - testDate > - (15 * 60 * 1000) && taskDate - testDate < 15 * 60 * 1000){
                            cheskTime = false;
                        }
                    }
                });

                taskList.list.tasks.forEach(element => {
                    if (element.id !== Number.parseInt(id, 10) && element.time !== null){
                        const testDate = new Date (element.date.slice(0, 10));
                        testDate.setDate(testDate.getDate() + 1);
                        hour = Number.parseInt(element.time.slice(0,2), 10)
                        min = Number.parseInt(element.time.slice(3,5), 10)
                        testDate.setHours(hour, min);

                        if (taskDate - testDate > - (15 * 60 * 1000) && taskDate - testDate < 15 * 60 * 1000){
                            cheskTime = false;
                        }
                    }
                });
            }
        }

        if (cheskTime === true){
            // формируем набор для проверки периодичности задачи
            data = JSON.stringify({
                code: 4,
                table: 'REPETITION',
                frequency,
                period,
            });

            period = await getResourse(data);
            period = period[0] ? period[0].id : null;

            // обновление данных локально
            taskList.list.localUpdateTask(
                id,
                title,
                description,
                date,
                time,
                period
            );

            // формируем набор для отправки на сервер
            data = JSON.stringify({
                code: 2,
                table: 'TASKS',
                id: Number.parseInt(id, 10),
                title,
                description,
                date,
                time,
                period,
            });

            await getResourse(data);
            
            const url = unescape(window.location.href);
            if (url.substring(url.lastIndexOf('/') + 1, url.length) === 'dashboard'){
                counterToElement();
            }
        }
        else{
            generateError(document.getElementById('time'));
        }
    }
}

// Поиск выбранной задачей
selectTask = (id) => {
    let task;
    taskList.list.tasks.forEach((element) => {
        if (element.id === id) {
            task = element;
        }
    });
    return task;
};

// Выполнение задачи в базе
async function taskReady() {
    const id = Number.parseInt( getElement(), 10);

    let date = new Date();
    let month = date.getMonth() + 1;
    if (month < 9) {
        month = `0${month}`;
    }
    let day = date.getDate();
    if (day < 10) {
        day = `0${day}`;
    }
    date = `${date.getFullYear()}-${month}-${day}`;

    // формируем набор для отправки на сервер
    const data = JSON.stringify({
        code: 1,
        table: 'HISTORY',
        nextTable: 'TASKS',
        idOwner: cookie,
        date,
        id,
    });

    await getResourse(data);

    // локально
    const task = selectTask(id);
    if (task.getPeriod() === null){ // удаление задачи
        removeDashbordElement(id);
        taskList.list.localDeleteTask(id);
    }
    else { // если задача повторяется, обновляем её
        const dataElement = JSON.stringify({
            code: 4,
            table: 'TASKS',
            idOwner: cookie,
            id,
        });

        const result = await getResourse(dataElement);
        taskList.list.localUpdateTask(id, result[0].title, result[0].description,
            result[0].date, result[0].time, result[0].period);
    }

    const url = unescape(window.location.href);
    if (url.substring(url.lastIndexOf('/') + 1, url.length) === 'dashboard'){
        counterToElement();
    }
}

// Удаление задачи
async function deleteTask() {
    const id = Number.parseInt(getElement(), 10);
    const task = selectTask(id);

    // формируем набор для отправки на сервер
    const data = JSON.stringify({
        code: 3,
        table: 'TASKS',
        id,
    });

    await getResourse(data);

    if (task.getPeriod() === null){ // удаление задачи
        taskList.list.localDeleteTask(id);
        removeDashbordElement(id, true);
    }
    else { // если задача повторяется, обновляем её
        const dataElement = JSON.stringify({
            code: 4,
            table: 'TASKS',
            idOwner: cookie,
            id,
        });

        const result = await getResourse(dataElement);
        taskList.list.localUpdateTask(id, result[0].title, result[0].description,
            result[0].date, result[0].time, result[0].period);
    }

    const url = unescape(window.location.href);
    if (url.substring(url.lastIndexOf('/') + 1, url.length) === 'dashboard'){
        counterToElement();
    }
}

// Отрисовка задачи
async function renderTask({
    id, idProject = '', title, description = '', date, time = '', period = null, } = {},
    flag = false) {

    removeWindow();

    const nowDay = new Date();
    let year = nowDay.getFullYear();
    let month = nowDay.getMonth() + 1;
    if (month < 10) {
        month = `0${month}`;
    }
    let day = nowDay.getDate();
    if (day < 10) {
        day = `0${day}`;
    }
    const minDate = `${year}-${month}-${day}`;

    if (date != null) {
        const dates = new Date(date);
        year = dates.getFullYear();
        month = dates.getMonth() + 1;
        if (month < 10) {
            month = `0${month}`;
        }
        day = dates.getDate();
        if (day < 10) {
            day = `0${day}`;
        }
        date = `${year}-${month}-${day}`;
    }

    let frequency;
    if (period !== null) {
        // набор для проверки повторяемости задачи
        const data = JSON.stringify({
            code: 4,
            table: 'REPETITION',
            id: period,
        });

        period = await getResourse(data);
        frequency = period[0].frequency;
        period = period[0].period;
    }

    const node = `<div class="window-overlay">
            <div class="window" id="window" name="${id}">
                <div class="window-wrapper">
                    <a href="javascript:removeWindow()" class="icon-close"></a>

                    <div class="task-card-detail-window">
                        <div class="window-detail-header">
                            <div class="window-title">
                                <textarea class="card-detail-header" type="text" id="title" placeholder="Название задачи" maxlength=100>${title || ''}</textarea>
                            </div>
                        </div>

                        <div class="window-main-col">
                            <div class="card-detail-data">
                                <div class="card-detail-item">
                                    <h3 class="card-detail-item-header">Действия с задачей</h3>
                                    <div class="card-detail-action">
                                        ${flag ?
                                            `<a href="javascript:readyCreateTask()" class="link-button">Сохранить</a>
                                            <a href="javascript:removeWindow()" class="link-button">Отменить</a>`:
                                            `<a href="javascript:updateTask()" class="link-button">Изменить</a>
                                            <a href="javascript:taskReady()" class="link-button">Выполнено</a>
                                            <a href="javascript:deleteTask()" class="link-button">Удалить</a>`}
                                    </div>
                                </div>

                                <div class="card-detail-item">
                                    <h3 class="card-detail-item-header">Срок</h3>
                                    <div class="card-detail-due-date">
                                        <input class="datetime-local" type="date" id="date" min="${minDate}" value="${date || ''}">
                                        <input class="datetime-local" type="time" id="time" value="${time || ''}">
                                        <a href="javascript:clearElement()" class="link-button">Сбросить</a>
                                    </div>
                                </div>

                                <div class="card-detail-item">
                                    <h3 class="card-detail-item-header">Повторение</h3>
                                    <div class="card-detail-repeat">
                                        <a href="javascript:periodicityEnable()" class="link-button" id="periodicityEnable">Задать</a>
                                        <select class="select" id="frequency">
                                            <option value="1">Каждый</option>
                                            <option value="2">Через</option>
                                        </select>

                                        <select class="select" id="period">
                                            <option value="1">День</option>
                                            <option value="2">Неделю</option>
                                            <option value="3">Месяц</option>
                                            <option value="4">Год</option>
                                        </select>
                                        <a href="javascript:periodicityShutdown()" class="link-button btn-invizible" id="periodicityShutdown">Очистить</a>
                                    </div>
                                </div>

                                <div class="card-detail-item">
                                    <h3 class="card-detail-item-header">Описание</h3>
                                    <div class="description-edit">
                                        <textarea class="task-card-detail-description" type="text" id="description" placeholder="Описание задачи" maxlength=600>${description || ''}</textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

    $('#dashboard-container').append(node);

    if (frequency !== undefined) {
        periodicityEnable();
        document.getElementById('frequency').value = frequency;
        document.getElementById('period').value = period;
    }
}

// Форма создания задач
function createTask() {
    renderTask({}, true);
}

// Создание задачи
async function readyCreateTask() {
    removeValidation(); // удаление ошибочного выделения;
    const result = await cheskFields();
    const {availabilityTitle, availabilityDate, title,
        description, date, time, frequency} = result;
    let { period } = result;

    // если все ок, сохраняем
    if (availabilityTitle && availabilityDate) {
        let cheskTime = true;
        // проверка существования задач на это время
        if (date !== null && time !== null){
            let data = JSON.stringify({
                code: 4,
                table: 'TASKS',
                idOwner: cookie,
                date,
                time,
            });

            cheskTime = await getResourse(data);
            if (cheskTime[0] !== undefined){
                cheskTime = false;
            }
            else{
                // проверка существования мероприятий на это время
                data = JSON.stringify({
                    code: 4,
                    table: 'EVENTS',
                    idOwner: cookie,
                    date,
                    time,
                });

                cheskTime = await getResourse(data);
                cheskTime = cheskTime[0] === undefined;
            }

            if (cheskTime !== false){
                const taskDate = new Date (date);
                let hour = Number.parseInt(time.slice(0,2), 10)
                let min = Number.parseInt(time.slice(3,5), 10)
                taskDate.setHours(hour, min);

                taskList.eventList.events.forEach(element => {
                    if (element.time !== null){
                        const testDate = new Date (element.date.slice(0, 10));
                        testDate.setDate(testDate.getDate() + 1);
                        hour = Number.parseInt(element.time.slice(0,2), 10)
                        min = Number.parseInt(element.time.slice(3,5), 10)
                        testDate.setHours(hour, min);

                        if (taskDate - testDate > - (15 * 60 * 1000) && taskDate - testDate < 15 * 60 * 1000){
                            cheskTime = false;
                        }
                    }
                });

                taskList.list.tasks.forEach(element => {
                    if (element.time !== null){
                        const testDate = new Date (element.date.slice(0, 10));
                        testDate.setDate(testDate.getDate() + 1);
                        hour = Number.parseInt(element.time.slice(0,2), 10)
                        min = Number.parseInt(element.time.slice(3,5), 10)
                        testDate.setHours(hour, min);

                        if (taskDate - testDate > - (15 * 60 * 1000) && taskDate - testDate < 15 * 60 * 1000){
                            cheskTime = false;
                        }
                    }
                });
            }
        }

        if (cheskTime === true){
            // формируем набор для проверки периодичности задачи
            let data = JSON.stringify({
                code: 4,
                table: 'REPETITION',
                frequency,
                period,
            });

            period = await getResourse(data);
            period = period[0] ? period[0].id : null;

            // формируем набор для отправки на сервер
            data = JSON.stringify({
                code: 1,
                table: 'TASKS',
                idOwner: cookie,
                idProject: null,
                title,
                description,
                date,
                time,
                period,
            });

            await getResourse(data);

            try {
                let node = document.getElementById(id).parentNode.parentNode;
                node = node.getElementsByClassName('date-title').item(2);
                const count = Number.parseInt(node.textContent, 10);
                node.textContent = count - 1;
            } catch (error) {
                /* empty */
            }

            gettingListTasks();
        }
        else{
            generateError(document.getElementById('time'));
        }
    }
}


/* Функции мероприятий */

// Рендер списка пользователей
// friends отвечает за связь пользователей
// 0 - не друзья, 1 - приглос вам, 2 - ваш приглос, 3 - друзья
// invite отвечает за возможность приглашения
// todo функции при отрисовке пользователя (-лей)
function renderListUsers(elements, friends = true, invite = true) {
    removeWindow('#foundUser');

    let node;
    if (elements.title !== undefined){
        node = `<div id="foundUser" class="foundUser">
            <span>${elements.title}</span>
        </div>`;
        $('#list-users').append(node);
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

                if (friends === 0){
                    node = `<div id="foundUser" class="foundUser">
                        <span>${title}</span>
                        <a href="javascript:inviteToFriends('${elements[key].idOwner}')" class="user-action-link">Добавить в друзья</a>
                        ${invite === true ? `<a href="javascript:invitationToTheEvent('${elements[key].idOwner}')" class="user-action-link">Пригласить на мероприятие</a>` : ''}
                    </div>`;
                }
                else if (friends === 1){
                    node = `<div id="foundUser" class="foundUser">
                        <span id="${elements[key].idOwner}">${title}</span>
                        <a href="javascript:inviteToFriends('${elements[key].idOwner}')" class="user-action-link">Добавить в друзья</a>
                        ${invite === true ? `<a href="javascript:invitationToTheEvent('${elements[key].idOwner}')" class="user-action-link">Пригласить на мероприятие</a>` : ''}
                    </div>`;
                }
                else if (friends === 2 || friends === 3){
                    node = `<div id="foundUser" class="foundUser">
                        <span id="${elements[key].idOwner}">${title}</span>
                        ${invite === true ? `<a href="javascript:invitationToTheEvent('${elements[key].idOwner}')" class="user-action-link">Пригласить на мероприятие</a>` : ''}
                    </div>`;
                }
                else if (friends === true){
                    node = `<div id="foundUser" class="foundUser">
                        <span id="${elements[key].idOwner}">${title}</span>
                    </div>`;
                }

                $('#list-users').append(node);
            }
        }
    }
}

// Поиск приглашенных и участников
async function searchUsers(flag = true) {
    const id = getElement('window-back');
    let result;
    if (flag === true){
        const search = JSON.stringify({
            code: 4,
            table: 'PARTICIPANTS',
            idEvent: id,
            confirmation: 1,
            flag: true,
            initialTable: 'PARTICIPANTS',
        });

        result = await getResourse(search);
    }
    else{
        const search = JSON.stringify({
            code: 4,
            table: 'PARTICIPANTS',
            idEvent: id,
            confirmation: 0,
            flag: true,
            initialTable: 'PARTICIPANTS',
        });

        result = await getResourse(search);
    }

    renderListUsers(result, true, false);
}

// Приглашение на мероприятие
async function invitationToTheEvent(idRecipient){
    const id = getElement('window-back');
    const data = JSON.stringify({
        code: 1,
        table: 'PARTICIPANTS',
        idEvent: id,
        idOwner: idRecipient,
        confirmation: 0,
    });

    await getResourse(data);
}

// Форма приглашения
// 1 - приглашения, 2 - отправленные, 3 - участники
function formToUser(action) {
    document.getElementById('window').id = 'window-back';
    let title; let area = '';
    if (action === 1){
        title = 'Пригласить пользователя';
        area = `<div class="card-detail-item">
            <h3 class="card-detail-item-header">Введете код пользователя</h3>
            <div class="card-detail-action">
                <input id="search-input" class="input" type="text" name="search-user-code" placeholder="user12345">
                <a href="javascript:searchUser()" class="link-button">Поиск</a>
            </div>
            <div id="list-users"></div>
        </div>`;
    }
    else if (action === 2){
        title = 'Отправленные приглашения';
        area = `<div class="card-detail-item">
            <div id="list-users"></div>
        </div>`;
    }
    else if (action === 3){
        title = 'Список участников';
        area = `<div class="card-detail-item">
            <div id="list-users"></div>
        </div>`;
    }

    const node = `<div class="window-overlay formToUser">
            <div class="window" id="workWithUsers">
                <div class="window-wrapper">
                    <a href="javascript:removeWindow('.formToUser')" class="icon-close usersForm"></a>
                    <div class="card-detail-item">
                        <h3 class="card-detail-item-header users-title">${title}</h3>
                        ${area}
                    </div>
                </div>
            </div>
        </div>`;

    $('#dashboard-container').append(node);

    if (action === 1){
        renderListUsers({title: 'Пользователь не обнаружен'}, true)
    }
    else {
        action === 2 ? searchUsers(false) : searchUsers(true)
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
        else{ // если есть приглашение то принимаем его
            data = JSON.stringify({
                code: 3,
                table: 'INVITE_TO_FRIENDS',
                idSender: idRecipient,
                idRecipient: cookie,
                flag: true,
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
            const checkUser = JSON.stringify({
                code: 4,
                table: 'SETTINGS',
                idOwner: cookie,
                userCode,
            });

            elements = await getResourse(checkUser);
            if (Object.keys(elements).length === 0){
                const id = getElement('window-back');
                const invited = JSON.stringify({
                    code: 4,
                    table: 'PARTICIPANTS',
                    idEvent: id,
                    idOwner: result[0].idOwner,
                });

                let res = await getResourse(invited);
                res = Object.keys(res).length === 0;

                let data = JSON.stringify({
                    code: 4,
                    table: 'FRIENDS',
                    idSender: cookie,
                    idRecipient: cookie,
                    addressee: result[0].idOwner,
                });

                elements = await getResourse(data);

                if (Object.keys(elements).length > 0){
                    renderListUsers(result, 3, res);
                }
                else{
                    data = JSON.stringify({
                        code: 4,
                        table: 'INVITE_TO_FRIENDS',
                        idSender: cookie,
                        idRecipient: result[0].idOwner,
                        addFriend: false,
                    });

                    elements = await getResourse(data);

                    if (Object.keys(elements).length !== 0 &&
                        Object.prototype.hasOwnProperty.call(elements[0], 'idSender')){
                        renderListUsers(result, 2, res);
                    }
                    else{
                        data = JSON.stringify({
                            code: 4,
                            table: 'INVITE_TO_FRIENDS',
                            idSender: result[0].idOwner,
                            idRecipient: cookie,
                            addFriend: false,
                        });

                        elements = await getResourse(data);

                        if (Object.keys(elements).length !== 0 &&
                            Object.prototype.hasOwnProperty.call(elements[0], 'idSender')){
                            renderListUsers(result, 1, res);
                        }
                        else{
                            renderListUsers(result, 0, res);
                        }
                    }
                }
            }
            else{
                renderListUsers({title: 'Пользователь не обнаружен'}, 0)
            }
        }
        else{
            renderListUsers(result, 0);
        }
    }
    else{
        renderListUsers({title: 'Пользователь не обнаружен'}, 0)
    }
}

// Отрисовка мероприятия
async function renderEvent({
    id, title, description = '', date, time = '', period = null, } = {},
    flag = false) {

    const checkEvent = JSON.stringify({
        code: 4,
        table: 'EVENTS',
        id,
        idOwner: cookie,
    });

    const result = await getResourse(checkEvent);
    const activiti = Object.keys(result).length === 1 ?
    `<a href="javascript:updateEvent()" class="link-button">Изменить</a>
    <a href="javascript:eventReady()" class="link-button">Проведено</a>
    <a href="javascript:deleteEvent()" class="link-button">Удалить</a>` :
    `<a href="javascript:eventVisited()" class="link-button">Посещено</a>`;

    removeWindow();

    const nowDay = new Date();
    let year = nowDay.getFullYear();
    let month = nowDay.getMonth() + 1;
    if (month < 10) {
        month = `0${month}`;
    }
    let day = nowDay.getDate();
    if (day < 10) {
        day = `0${day}`;
    }
    const minDate = `${year}-${month}-${day}`;

    if (date != null) {
        const dates = new Date(date);
        year = dates.getFullYear();
        month = dates.getMonth() + 1;
        if (month < 10) {
            month = `0${month}`;
        }
        day = dates.getDate();
        if (day < 10) {
            day = `0${day}`;
        }
        date = `${year}-${month}-${day}`;
    }

    let frequency;
    if (period !== null) {
        // набор для проверки повторяемости задачи
        const data = JSON.stringify({
            code: 4,
            table: 'REPETITION',
            id: period,
        });

        period = await getResourse(data);
        frequency = period[0].frequency;
        period = period[0].period;
    }

    const node = `<div class="window-overlay">
            <div class="window ${id === undefined ? 'create-event' : 'event-window'}" id="window" name="${id}">
                <div class="window-wrapper">
                    <a href="javascript:removeWindow()" class="icon-close"></a>

                    <div id="${id === undefined ? 'create-event' : ''}"class="event-card-detail-window">
                        <div class="window-detail-header">
                            <div class="window-title">
                                <textarea class="card-detail-header" type="text" id="title" placeholder="Название мероприятия" maxlength=100>${title || ''}</textarea>
                            </div>
                        </div>

                        <div class="window-main-col">
                            <div class="card-detail-data">
                                <div class="card-detail-item">
                                    <h3 class="card-detail-item-header">Действия с мероприятием</h3>
                                    <div class="card-detail-action">
                                        ${flag ?
                                            `<a href="javascript:readyCreateEvent()" class="link-button">Сохранить</a>
                                            <a href="javascript:removeWindow()" class="link-button">Отменить</a>`:
                                            activiti}
                                    </div>
                                </div>

                                <div class="card-detail-item">
                                    <h3 class="card-detail-item-header">Срок</h3>
                                    <div class="card-detail-due-date">
                                        <input class="datetime-local" type="date" id="date" min="${minDate}" value="${date || ''}">
                                        <input class="datetime-local" type="time" id="time" value="${time || ''}">
                                        <a href="javascript:clearElement()" class="link-button">Сбросить</a>
                                    </div>
                                </div>

                                <div class="card-detail-item">
                                    <h3 class="card-detail-item-header">Повторение</h3>
                                    <div class="card-detail-repeat">
                                        <a href="javascript:periodicityEnable()" class="link-button" id="periodicityEnable">Задать</a>
                                        <select class="select" id="frequency">
                                            <option value="1">Каждый</option>
                                            <option value="2">Через</option>
                                        </select>

                                        <select class="select" id="period">
                                            <option value="1">День</option>
                                            <option value="2">Неделю</option>
                                            <option value="3">Месяц</option>
                                            <option value="4">Год</option>
                                        </select>
                                        <a href="javascript:periodicityShutdown()" class="link-button btn-invizible" id="periodicityShutdown">Очистить</a>
                                    </div>
                                </div>

                                <div class="card-detail-item">
                                    <h3 class="card-detail-item-header">Описание</h3>
                                    <div class="description-edit">
                                        <textarea class="event-card-detail-description" type="text" id="description" placeholder="Описание мероприятия" maxlength=100>${description || ''}</textarea>
                                    </div>
                                </div>

                                ${id !== undefined ? `<div class="card-detail-action">
                                    <a href="javascript:formToUser(1)" class="link-button">Пригласить</a>
                                    <a href="javascript:formToUser(2)" class="link-button invited">Приглашены</a>
                                    <a href="javascript:formToUser(3)" class="link-button">Участники</a>
                                </div>` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

    $('#dashboard-container').append(node);

    if (frequency !== undefined) {
        periodicityEnable();
        document.getElementById('frequency').value = frequency;
        document.getElementById('period').value = period;
    }
}

// Форма создания мероприятия
function createEvent() {
    renderEvent({}, true);
}

// Создание мероприятия
async function readyCreateEvent() {
    removeValidation(); // удаление ошибочного выделения;
    const result = await cheskFields(false);
    const {availabilityTitle, availabilityDate, title,
        description, date, time, frequency} = result;
    let { period } = result;

    // если все ок, сохраняем
    if (availabilityTitle && availabilityDate) {
        let cheskTime = true;
        if (time !== null){
            // проверка существования задач на это время
            let data = JSON.stringify({
                code: 4,
                table: 'TASKS',
                idOwner: cookie,
                date,
                time,
            });

            cheskTime = await getResourse(data);
            if (cheskTime[0] !== undefined){
                cheskTime = false;
            }
            else{
                // проверка существования мероприятий на это время
                data = JSON.stringify({
                    code: 4,
                    table: 'EVENTS',
                    idOwner: cookie,
                    date,
                    time,
                });

                cheskTime = await getResourse(data);
                cheskTime = cheskTime[0] === undefined;
            }

            if (cheskTime !== false){
                const eventDate = new Date (date);
                let hour = Number.parseInt(time.slice(0,2), 10)
                let min = Number.parseInt(time.slice(3,5), 10)
                eventDate.setHours(hour, min);

                taskList.eventList.events.forEach(element => {
                    if (element.time !== null){
                        const testDate = new Date (element.date.slice(0, 10));
                        testDate.setDate(testDate.getDate() + 1);
                        hour = Number.parseInt(element.time.slice(0,2), 10)
                        min = Number.parseInt(element.time.slice(3,5), 10)
                        testDate.setHours(hour, min);

                        if (eventDate - testDate > - (15 * 60 * 1000) && eventDate - testDate < 15 * 60 * 1000){
                            cheskTime = false;
                        }
                    }
                });

                taskList.list.tasks.forEach(element => {
                    if (element.time !== null){
                        const testDate = new Date (element.date.slice(0, 10));
                        testDate.setDate(testDate.getDate() + 1);
                        hour = Number.parseInt(element.time.slice(0,2), 10)
                        min = Number.parseInt(element.time.slice(3,5), 10)
                        testDate.setHours(hour, min);

                        if (eventDate - testDate > - (15 * 60 * 1000) && eventDate - testDate < 15 * 60 * 1000){
                            cheskTime = false;
                        }
                    }
                });
            }
        }

        if (cheskTime === true){
            // формируем набор для проверки периодичности мероприятия
            data = JSON.stringify({
                code: 4,
                table: 'REPETITION',
                frequency,
                period,
            });

            period = await getResourse(data);
            period = period[0] ? period[0].id : null;

            // формируем набор для отправки на сервер
            data = JSON.stringify({
                code: 1,
                table: 'EVENTS',
                idOwner: cookie,
                title,
                description,
                date,
                time,
                period,
            });

            await getResourse(data);

            removeWindow();
            try {
                gettingListEvents();
            } catch (error) {
                /* empty */
            }
        }
        else{
            generateError(document.getElementById('time'));
        }
    }
}

// Выполнение мероприятия
async function eventReady() {
    const id = Number.parseInt(getElement(), 10);

    let date = new Date();
    let month = date.getMonth() + 1;
    if (month < 9) {
        month = `0${month}`;
    }
    let day = date.getDate();
    if (day < 10) {
        day = `0${day}`;
    }
    date = `${date.getFullYear()}-${month}-${day}`;

    // формируем набор для отправки на сервер
    const data = JSON.stringify({
        code: 1,
        table: 'HISTORY',
        nextTable: 'EVENTS',
        idOwner: cookie,
        date,
        id,
    });

    await getResourse(data);

    // обновление данных локально
    taskList.eventList.localDeleteEvent(id);
    removeDashbordElement(id, false);

    gettingListEvents();

    const url = unescape(window.location.href);
    if (url.substring(url.lastIndexOf('/') + 1, url.length) === 'dashboard'){
        counterToElement();
    }
}

// Обновление мероприятия
async function updateEvent() {
    removeValidation(); // удаление ошибочного выделения;
    const result = await cheskFields(false);
    const {availabilityTitle, availabilityDate, id, title,
        description, date, time, frequency} = result;
    let { period } = result;

    // если все ок, сохраняем
    if (availabilityTitle && availabilityDate) {
        let cheskTime = true;
        if (time !== null){
            // проверка существования задач на это время
            let data = JSON.stringify({
                code: 4,
                table: 'TASKS',
                idOwner: cookie,
                date,
                time,
            });

            cheskTime = await getResourse(data);
            if (cheskTime[0] !== undefined){
                cheskTime = false;
            }
            else{
                // проверка существования мероприятий на это время
                data = JSON.stringify({
                    code: 4,
                    table: 'EVENTS',
                    idOwner: cookie,
                    date,
                    time,
                });

                cheskTime = await getResourse(data);
                cheskTime = cheskTime[0] === undefined || cheskTime[0].id === Number.parseInt(id, 10);
            }

            if (cheskTime !== false){
                const eventDate = new Date (date);
                let hour = Number.parseInt(time.slice(0,2), 10)
                let min = Number.parseInt(time.slice(3,5), 10)
                eventDate.setHours(hour, min);

                taskList.eventList.events.forEach(element => {
                    if (element.time !== null && element.id !== Number.parseInt(id, 10)){
                        const testDate = new Date (element.date.slice(0, 10));
                        testDate.setDate(testDate.getDate() + 1);
                        hour = Number.parseInt(element.time.slice(0,2), 10)
                        min = Number.parseInt(element.time.slice(3,5), 10)
                        testDate.setHours(hour, min);

                        if (eventDate - testDate > - (15 * 60 * 1000) && eventDate - testDate < 15 * 60 * 1000){
                            cheskTime = false;
                        }
                    }
                });

                taskList.list.tasks.forEach(element => {
                    if (element.time !== null){
                        const testDate = new Date (element.date.slice(0, 10));
                        testDate.setDate(testDate.getDate() + 1);
                        hour = Number.parseInt(element.time.slice(0,2), 10)
                        min = Number.parseInt(element.time.slice(3,5), 10)
                        testDate.setHours(hour, min);

                        if (eventDate - testDate > - (15 * 60 * 1000) && eventDate - testDate < 15 * 60 * 1000){
                            cheskTime = false;
                        }
                    }
                });
            }
        }

        if (cheskTime === true){
            // формируем набор для проверки периодичности мероприятия
            data = JSON.stringify({
                code: 4,
                table: 'REPETITION',
                frequency,
                period,
            });

            period = await getResourse(data);
            period = period[0] ? period[0].id : null;

            // формируем набор для отправки на сервер
            data = JSON.stringify({
                code: 2,
                table: 'EVENTS',
                id: Number.parseInt(id, 10),
                idOwner: cookie,
                title,
                description,
                date,
                time,
                period,
            });

            await getResourse(data);

            removeWindow();
            gettingListEvents();
        }
        else{
            generateError(document.getElementById('time'));
        }
    }
}

// Удаление мероприятия
async function deleteEvent() {
    const id = Number.parseInt(getElement(), 10);

    // обновление данных локально
    taskList.eventList.localDeleteEvent(id);
    removeDashbordElement(id, false);

    // формируем набор для отправки на сервер
    const data = JSON.stringify({
        code: 3,
        table: 'EVENTS',
        id,
    });

    await getResourse(data);

    gettingListEvents();

    const url = unescape(window.location.href);
    if (url.substring(url.lastIndexOf('/') + 1, url.length) === 'dashboard'){
        counterToElement();
    }
}

// Посещение гостем мероприятие
async function eventVisited(){
    const id = Number.parseInt(getElement(), 10);

    let date = new Date();
    let month = date.getMonth() + 1;
    if (month < 9) {
        month = `0${month}`;
    }
    let day = date.getDate();
    if (day < 10) {
        day = `0${day}`;
    }
    date = `${date.getFullYear()}-${month}-${day}`;

    // обновление данных локально
    taskList.eventList.localDeleteEvent(id);
    removeDashbordElement(id, false);

    // формируем набор для отправки на сервер
    const data = JSON.stringify({
        code: 1,
        table: 'HISTORY',
        idOwner: cookie,
        date,
    });

    await getResourse(data);

    const removeInvite = JSON.stringify({
        code: 3,
        table: 'PARTICIPANTS',
        idEvent: id,
        idOwner: cookie,
    });

    await getResourse(removeInvite);

    await gettingListEvents();

    const url = unescape(window.location.href);
    if (url.substring(url.lastIndexOf('/') + 1, url.length) === 'dashboard'){
        counterToElement();
    }
}

/* Общие функции */
// Отрисовка формы для создания элементов
function createForm() {
    const node = `<div class="window-overlay">
            <div class="window" id="create">
                <div class="window-wrapper">
                    <a href="javascript:removeWindow()" class="icon-close create"></a>

                    <div class="card-detail-data">
                        <div class="card-detail-item">
                            <h3 class="card-detail-item-header create-title">Выберите элемент который хотите создать</h3>
                            <div class="card-detail-action create">
                                <a href="javascript:createTask()" class="link-button create-btn">Задача</a>
                                <a href="javascript:createEvent()" class="link-button create-btn">Мероприятие</a>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>`;

    // расположить после элемента "задача"
    // <a href="#" class="link-button create-btn">Проект</a>
    $('#dashboard-container').append(node);
}

// Открытие выбранных элементов
openElement = (id, flag = true) => {
    if (flag === true){
        taskList.list.tasks.forEach((element) => {
            if (element.id === id) {
                renderTask(element);
            }
        });
    }
    else{
        taskList.eventList.events.forEach((element) => {
            if (element.id === id) {
                renderEvent(element);
            }
        });
    }
};

// Проверка нажатия вне выбранной задачи
document.addEventListener('click', (event) => {
    try {
        const node = document.getElementById('window');
        if (!node.contains(event.target)) {
            removeWindow();
        }
    } catch (error) {
        /* empty */
    }
})