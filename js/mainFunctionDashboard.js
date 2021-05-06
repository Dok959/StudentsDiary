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
function removeDashbordTask(id) {
    const element = document.getElementById(id);
    element.remove();
}

// Закрытие окон, удаление задач
function removeWindow(tag = closeTag) {
    const elements = document.querySelectorAll(tag);
    elements.forEach(element => {
        element.remove();
    });
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

// Получение задачи с формы
function getTask() {
    const task = document.getElementById('window').getAttribute('name');
    return task;
}

async function cheskFields() {
    let availabilityTitle = true; // флаг проверки названия
    const id = getTask() || null;

    let title = document.getElementById('title');
    // проверка на пустоту
    checkLength(title) ? (title = title.value) : (availabilityTitle = false);

    const description = document.getElementById('description').value;

    // дата
    let date = document.getElementById('date');
    const availabilityDate = await checkValidation(date); // флаг проверки даты
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

    return {availabilityTitle, availabilityDate, id, title, description,
        date, time, frequency, period};
}

// Обновление задачи
async function updateTask() {
    const result = await cheskFields();
    const {availabilityTitle, availabilityDate, id, title,
        description, date, time, frequency} = result;
    let { period } = result;

    // если все ок, сохраняем
    if (availabilityTitle && availabilityDate) {
        let cheskTime = true;
        // проверка существования задач на это время
        if (date !== null && time !== null){
            // проверка существования задач на это время
            const data = JSON.stringify({
                code: 4,
                table: 'TASKS',
                idOwner: cookie,
                date,
                time,
            });

            cheskTime = await getResourse(data);
            if (cheskTime[0] !== undefined){
                cheskTime = !!(Object.keys(cheskTime[0]).length === 0);
            }
            else{
                cheskTime = true;
            }
        }

        if (cheskTime === true){
            removeValidation(); // удаление ошибочного выделения;

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

            getResourse(data);
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
    const id = Number.parseInt( getTask(), 10);

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
        idOwner: cookie,
        date,
        id,
    });

    await getResourse(data);

    // локально
    const task = selectTask(id);
    if (task.getPeriod() === null){ // удаление задачи
        removeDashbordTask(id);
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
        taskList.list.localUpdateTask(id, null,null,
            result[0].date, null,null);
    }
}

// Удаление задачи
function deleteTask() {
    const id = Number.parseInt(getTask(), 10);

    // обновление данных локально
    taskList.list.localDeleteTask(id);
    removeDashbordTask(id);

    // формируем набор для отправки на сервер
    const data = JSON.stringify({
        code: 3,
        table: 'TASKS',
        id,
    });

    getResourse(data);
}

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
    const result = await cheskFields();
    const {availabilityTitle, availabilityDate, title,
        description, date, time, frequency} = result;
    let { period } = result;

    // если все ок, сохраняем
    if (availabilityTitle && availabilityDate) {
        let cheskTime = true;
        // проверка существования задач на это время
        if (date !== null && time !== null){
            const data = JSON.stringify({
                code: 4,
                table: 'TASKS',
                idOwner: cookie,
                date,
                time,
            });

            cheskTime = await getResourse(data);
            if (cheskTime[0] !== undefined){
                cheskTime = !!(Object.keys(cheskTime[0]).length === 0);
            }
            else{
                cheskTime = true;
            }
        }

        if (cheskTime === true){

            removeValidation(); // удаление ошибочного выделения;

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

// Рендер списка пользователей
// flag отвечает за то что пользователи есть в списке друзей
function renderListUsers(elements, flag = true) {
    if (elements.title !== undefined){
        const node = `<div id="foundUser" class="foundUser">
            <span>${elements.title}</span>
        </div>`;

        $('#search').append(node);
    }
    else{
        for (key in elements) {
            if ({}.hasOwnProperty.call(elements, key)) {
                let node; let title;
                if (elements[key].lastName !== undefined){
                    title = elements[key].lastName;
                    if (elements[key].firstName !== undefined){
                        title += ` ${elements[key].firstName.slice(0,1)}.`;
                        if (elements[key].patronymic !== undefined){
                            title += ` ${elements[key].patronymic.slice(0,1)}.`;
                        }
                    }
                }
                else if (elements[key].firstName !== undefined){
                    title = elements[key].firstName;
                }
                else{
                    title = elements[key].userCode;
                }

                if (flag === false){
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

                $('#search').append(node);
            }
        }
    }
}

function inviteToFriends(idRecipient){
    const data = JSON.stringify({
        code: 1,
        table: 'INVITE_TO_FRIENDS',
        idSender: cookie,
        idRecipient,
    });

    getResourse(data);
}

// Поиск пользователей
// flag = true в списке друзей, false - во всех
async function searchUser() {
    removeWindow('#foundUser');
    const userCode = document.getElementsByName('userCode').item(0).value;
    if (userCode === '' || null){ // друзья пользователя
        const data = JSON.stringify({
            code: 4,
            table: 'FRIENDS',
            idSender: cookie,
            idRecipient: cookie,
            flag: true,
        });

        const result = await getResourse(data);
        console.log(result)
        renderListUsers(result); // передаём список в рендер
    }
    else{
        const data = JSON.stringify({
            code: 4,
            table: 'SETTINGS',
            userCode,
            flag: false,
        });

        const result = await getResourse(data);
        console.log(result);

        renderListUsers(result, false);

        // if (result[0] !== undefined){
        //     let title;
        //     if (result[0].lastName !== undefined){
        //         title = result[0].lastName;
        //         if (result[0].firstName !== undefined){
        //             title += ` ${result[0].firstName.slice(0,1)}.`;
        //             if (result[0].patronymic !== undefined){
        //                 title += ` ${result[0].patronymic.slice(0,1)}.`;
        //             }
        //         }
        //     }
        //     else if (result[0].firstName !== undefined){
        //         title = result[0].firstName;
        //     }
        //     else{
        //         title = result[0].userCode;
        //     }
            // todo вынести в функцию
            // const node = `<div id="foundUser" class="foundUser">
            //         <span>${title}</span>
            //         <a href="#" class="">Профиль</a>
            //         <a href="#" class="">Добавить в друзья</a>
            //         <a href="#" class="">Пригласить в ...</a>
            //     </div>`;
            // todo сделать панельку где рядом будут кнопки "профиль" с инфой, "добавить" приглос в др
            // todo "приглосить в ..." окно с приглашениями в проект, мероприятие и т.д.

            // todo кнопки отвечающие за добавление пользователя в друзья и приглашение его на мероприятие
            // todo в профили сделать вкладку куда будут прилетать приглосы, отображаться будет
            // todo    только когда они есть или когда юзер где-то участвует
            // todo    при нажатии на кнопку должна быть видна инфа пользователя: полное ФИО ...

            // todo    добавить визуальное отображение на основной странице, например колокольчик

        //     $('#search').append(node);
        // }
        // todo сюда добавить сообщение когда пользователей нет
    }
}

// Отрисовка мероприятия
// todo наверно нужен список участников или друзей
async function renderEvent({
    id, title, description = '', date, time = '', period = null, } = {},
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
            <div class="window ${id === undefined ? 'create-event' : ''}" id="window" name="${id}">
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
                                            `<a href="#" class="link-button">Сохранить</a>
                                            <a href="#" class="link-button">Отменить</a>`:
                                            `<a href="#" class="link-button">Изменить</a>
                                            <a href="#" class="link-button">Выполнено</a>
                                            <a href="#" class="link-button">Удалить</a>`}
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

                                ${id !== undefined ? `<div class="card-detail-item">
                                    <h3 class="card-detail-item-header">Пригласить</h3>
                                    <div class="description-edit card-detail-repeat">
                                        <input class="input" name="userCode" type="text" placeholder="user12345" maxlength=10>
                                        <a href="javascript:searchUser()" class="link-button">Найти</a>
                                    </div>
                                    <div class="invite-edit" id="search">
                                    </div>
                                </div>

                                <div class="card-detail-item">
                                    <h3 class="card-detail-item-header">Участники</h3>
                                    <div class="invite-edit" id="party">
                                    </div>
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

    id !== undefined ? searchUser() : null;
}

// Форма создания мероприятия
function createEvent() {
    renderEvent({}, true);
}

// Создание мероприятия
// todo не работает
async function readyCreateEvent() {

    const availabilityTitle =false;
    // если все ок, сохраняем
    if (availabilityTitle && availabilityDate) {
        // проверка существования задач на это время
        let data = JSON.stringify({
            code: 4,
            table: 'TASKS',
            idOwner: cookie,
            date,
            time,
        });

        let cheskTime = await getResourse(data);
        if (cheskTime[0] !== undefined){
            cheskTime = !!(Object.keys(cheskTime[0]).length === 0);
        }
        else{
            cheskTime = true;
        }

        if (cheskTime === true){

            removeValidation(); // удаление ошибочного выделения;

            // формируем набор для проверки периодичности задачи
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

            gettingListTasks();
        }
        else{
            generateError(document.getElementById('time'));
        }
    }
}

// Открытие выбранной задачей
openTask = (id) => {
    taskList.list.tasks.forEach((element) => {
        if (element.id === id) {
            renderTask(element);
        }
    });
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