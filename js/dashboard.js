const cookie = getCookie(document.cookie, 'USER');
const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
const taskList = new Bord();
const closeTag = '.window-overlay';


// Адаптивный список дней
function formation(){
    const nowDay = new Date();
    let now = nowDay.getDay();
    for (let index = 0; index < 7; index += 1) {
        if (now === 7){
            now -= 7;
        }
        const element = days[now];

        const node = `<div class="wrapper">
                <div id="bord-day">
                    <div id="bord-day-title">
                        <h2 class="day-title">${element}</h2>
                    </div>

                    <div class="list-tasks" id="day-${now}">

                    </div>
                </div>
            </div>`;

        $('#dashboard-main').append(node);

        now += 1;
    }
}

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

// Получение задач на неделю
// todo прописать получение куки, 1 раз
function gettingListTasks(){
    // определение сроков
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    let day = now.getDate();
    // формирование начальной даты
    const startDate = `${year}-${month}-${day}`;

    // формирование конечной даты
    now.setDate(now.getDate() + 6);
    year = now.getFullYear();
    month = now.getMonth() + 1;
    day = now.getDate();
    const endDate = `${year}-${month}-${day}`;

    // формируем набор данных
    const data = JSON.stringify({
        code: 4,
        table: 'TASKS',
        idOwner: '1',// cookie,
        idProject: null,
        startDate,
        endDate,
    });

    taskList.list.clearTasks();
    taskList.getTasks(data);
}

// Закрытие открытых окон
function closeOpenWindow() {
    const elements = document.querySelectorAll(closeTag);
    elements.forEach(element => {
        element.remove();
    });
}

// Удаление задачи с панели
function removeDashbordTask(id) {
    const element = document.getElementById(id);
    element.remove();
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

// сброс даты и времени
function clearElement() {
    document.getElementById('date').value = null;
    document.getElementById('time').value = null;
}

// получение задачи с формы
function getTask() {
    const task = document.getElementById('window').getAttribute('name');
    return task;
}

// обновление задачи
async function updateTask() {
    let availabilityTitle = true; // флаг проверки названия
    const id = getTask();

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

    // если все ок, сохраняем
    if (availabilityTitle && availabilityDate) {
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
}

// Открытие выбранной задачей
selectTask = (id) => {
    let task;
    taskList.list.tasks.forEach((element) => {
        if (element.id === id) {
            task = element;
        }
    });
    return task;
};

// выполнение задачи в базе
// todo прописать получение куки, 2 раза
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
        idOwner: 1, // cookie,
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
            idOwner: 1, // cookie,
            id,
        });

        const result = await getResourse(dataElement);
        taskList.list.localUpdateTask(id, null,null,
            result[0].date, null,null);
    }
}

// удаление задачи
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

// Отрисовка задачи
async function renderTask({
    id, idProject = '', title, description = '', date, time = '', period = null, } = {}) {

    closeOpenWindow();

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
                    <a href="javascript:closeOpenWindow()" class="icon-close"></a>

                    <div class="card-detail-window">
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
                                        <a href="javascript:updateTask()" class="link-button">Изменить</a>
                                        <a href="javascript:taskReady()" class="link-button">Выполнено</a>
                                        <a href="javascript:deleteTask()" class="link-button">Удалить</a>
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
                                        <textarea class="card-detail-description" type="text" id="description" placeholder="Описание задачи" maxlength=600>${description || ''}</textarea>
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

// Открытие выбранной задачей
openTask = (id) => {
    taskList.list.tasks.forEach((element) => {
        if (element.id === id) {
            renderTask(element);
        }
    });
};

// Действия при полной загрузке странцы
document.addEventListener('DOMContentLoaded', () => {
    formation();
    gettingListTasks();
})

// проверка нажатия вне выбранной задачи
document.addEventListener('click', (event) => {
    try {
        const node = document.getElementById('window');
        if (!node.contains(event.target)) {
            closeOpenWindow();
        }
    } catch (error) {
        /* empty */
    }
})