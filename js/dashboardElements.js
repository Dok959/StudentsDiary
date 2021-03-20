class FetchData {
    getResourse = async (url, options) => {
        const res = await fetch(url, options);

        if (!res.ok) {
            throw new Error('Произошла ошибка: ' + res.status);
        }

        return res.json();
    }

    getElements = data => this.getResourse('./database/buildingQueryForDB', {
        method: 'POST',
        body: data,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })
}

class Bord {
    constructor({ listElements }) {
        this.fetchData = new FetchData();
        this.list = new Tasks({});
        this.elements = {
            listElements: document.querySelector(listElements)
        };
    }

    getTasks(data) {
        this.fetchData.getElements(data)
            .then(data => {
                for (let element in data) {
                    this.list.addTask(data[element])
                };
                this.showTasks()
            });
    }

    showTasks() {
        $('.task__empty').remove();
        $('li').remove();

        if (this.list.tasks.length !== 0)
            this.renderTasks(this.list.tasks);
        else
            emptyTasks({ title: 'Дел на горизонте не видно' });
    }

    renderTasks(tasks) {
        tasks.forEach((element) => {

            let title = element.title;
            if (title && title.length > 70) {
                title = title.slice(0, 55) + '...';
            }

            let description = element.description;
            if (description && description.length > 70) {
                description = description.slice(0, 56) + '...';
            }

            let date = element.date;
            let expired = '';
            if (date) {
                date = new Date(date);
                let year = date.getFullYear()
                let month = date.getMonth()
                let day = date.getDate()

                date = (day < 10 ? '0' + day : day)
                    + '.' + (month < 9 ? '0' + (month + 1) : month + 1)
                    + '.' + year;

                // выделение просроченных задач
                let now = new Date();
                if (year <= now.getFullYear()) {
                    if (month <= now.getMonth()) {
                        if (day < now.getDate()) {
                            expired = 'expired';
                        }
                    }
                }
            }

            let node = `<li>
                            <article class="task ${expired}">
                                <div class="row">
                                    <a class="task__ready" href="javascript:taskReady(${element.id})">
                                        <img class="link__element__img" src="/img/pac1/ready1.png" alt="Выполнено">
                                    </a>
                                    <div class="task__wrapper">
                                        <a class="link__task" href="javascript:openTask(${element.id})">
                                            <header class="task__header">
                                                <h3 class="task__title">
                                                    ${title ? title : 'Без названия ...'}
                                                </h3>
                                                <span class="task__description">
                                                    ${description ? description : ''}
                                                </span>
                                            </header>
                                        </a>
                                        <time class="task__time">
                                            ${date ? date : ''}
                                        </time>
                                        <a class="task__more" href="#">
                                            <img class="link__element__img" src="/img/pac1/more1.svg" alt="Дополнительно">
                                        </a>
                                    </div>
                                </div>
                            </article>
                        </li>`;

            $('.bord__list').append(node);
        })
    }
};

class Tasks {
    constructor({ tasks = [] } = {}) {
        this.tasks = tasks;
    }

    addTask = element => {
        this.tasks.push(new Task(element));
    }

    clearTasks({ tasks = [] } = {}) {
        this.tasks = tasks;
    }

    getIdTask = id => {
        for (let element = 0; element < this.tasks.length; element++) {
            if (this.tasks[element].id == id) {
                return this.tasks[element];
            }
        }
    }

    localUpdateTask = (id, title, description, date, time, period) => {
        let task = this.getIdTask(id);
        task.setTitle(title);
        task.setDescription(description);
        task.setDate(date);
        task.setTime(time);
        task.setPeriod(period);

        let now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth();
        let day = now.getDate();
        if (date === null && $(".inbox").is(':hidden')) {
            taskList.list.localDeleteTask(id);
            $('.element__info').remove();
        }
        else if (year <= date.slice(0, 4)) {
            if (month <= date.slice(5, 7)) {
                if (day < date.slice(8, 10) && $(".upcoming").is(':hidden')) {
                    taskList.list.localDeleteTask(id);
                    $('.element__info').remove();
                }
                else if (day >= date.slice(8, 10) && $(".today").is(':hidden')) {
                    taskList.list.localDeleteTask(id);
                    $('.element__info').remove();
                }
                // !!! БАГ; не удаётся перерисовать дату без закрытия окна
                // else if (day == date.slice(8, 10) && $(".today").is(':visible')) {
                //$('.element__info').remove();
                // }
            }
        }

        taskList.showTasks();
    }

    localDeleteTask = id => {
        let index;
        for (let element = 0; element < this.tasks.length; element++) {
            if (this.tasks[element].id == id) {
                index = element;
                break;
            }
        };
        this.tasks.splice(index, 1);
        taskList.showTasks();
    }
}

class Task {
    constructor({ id, id_owner, id_project = '', title = '', description = '', date = '', time = '', period = null }) {
        this.id = id;
        this.id_owner = id_owner;
        this.id_project = id_project;
        this.title = title;
        this.description = description;
        this.date = date;
        this.time = time;
        this.period = period;
    };

    getTitle() {
        return this.title;
    };

    setTitle(title) {
        this.title = title;
    };

    setDescription(description) {
        this.description = description;
    };

    setDate(date) {
        this.date = date;
    };

    setTime(time) {
        this.time = time;
    };

    setPeriod(period) {
        this.period = period;
    };
};

// открытие окна с выбранной задачей
openTask = id => {
    taskList.list.tasks.forEach(element => {
        if (element.id === id) {
            // $(".element__info").show(); // тестовая штука
            renderTask(element);
            // openDescription();
        }
    })
}

// в процессе доработки
async function renderTask({ id, id_project = '', title, description = '', date, time = '',
    period = null } = {}) {
    if (date != null) {
        let dates = new Date(date);
        let year = dates.getFullYear();
        let month = dates.getMonth() + 1;
        if (month < 10) {
            month = '0' + month;
        }
        let day = dates.getDate();
        if (day < 10) {
            day = '0' + day;
        }
        date = year + "-" + month + "-" + day;
    }

    let frequency;
    if (period !== null) {
        // набор для проверки повторяемости задачи
        let data = JSON.stringify({
            'code': 4,
            'table': 'REPETITION',
            'id': period
        });

        let fetchData = new FetchData();
        period = await fetchData.getElements(data);
        frequency = period[0].frequency;
        period = period[0].period;
    }

    $('.element__info').remove();
    let node = `
        <div class="element__info" id="task">
            <form class="element__task" name="${id}" method="get">

                <div class="element__info__block">
                    <textarea class="element__task__area title" type="text" name="title" placeholder="Название" maxlength=100>${title}</textarea>
                </div>

                <div class="element__btn">
                    <a type="submit" id="updateElement" href="javascript:updateTask()">
                        <span>Изменить</span>
                    </a>
                    <a type="submit" id="readyElement" href="javascript:taskReady()">
                        <span>Выполнено</span>
                    </a>
                    <a type="submit" id="deleteElement" href="javascript:deleteTask()">
                        <span>Удалить</span>
                    </a>
                </div>

                <div class="element__info__more">
                    <nav class="element__menu">
                        <a class="link__element tab" id="close" href="javascript:openSubtasks()">
                            <span class="link__description link_tab">
                                Подзадачи
                            </span>
                        </a>

                        <a class="link__element tab" href="javascript:openDescription()">
                            <span class="link__description link_tab">
                                Описание
                            </span>
                        </a>

                        <a class="link__element tab" href="javascript:openAction()">
                            <span class="link__description link_tab">
                                Действия
                            </span>
                        </a>
                    </nav>

                    <div class="element__bord">
                        <div class="element__info__block" id="subtasks">
                            <div class="block__subtasks">
                                <a class="add__subtasks" href="javascript:addSubtasks()">
                                    <img class="link__element__img" src="/img/pac1/add_subtasks.png" alt="Укажите действия">
                                    <span class="add__subtasks__text">Укажите действия</span>
                                </a>
                            </div>
                        </div>

                        <div class="element__info__block" id="description">
                            <textarea class="element__task__area description" type="text" name="description" placeholder="Описание" maxlength=600>${description ? description : ''}</textarea>
                        </div>

                        <div class="element__info__block" id="action">
                            <div class="date">
                                <label class="date__title">Укажите срок выполнения задачи</label>
                                <div class="date__and__time__block">
                                    <div class="date__and__time">
                                        <a href="javascript:clearElement('date')" class="clear date__clear"></a>
                                        <input class="datetime-local" type="date" name="date" value="${date ? date : ''}">
                                    </div>
                                    <div class="date__and__time">
                                        <a href="javascript:clearElement('time')" class="clear time__clear"></a>
                                        <input class="datetime-local time" type="time" name="time" value="${time ? time : ''}">
                                    </div>
                                </div>
                            </div>

                            <div class="repetition">
                                <div class="repetition__block">
                                    <label>Будет ли повторение задачи</label>
                                    <div class="repetition__elements">
                                        <div class="repetition__element">
                                            <input class="radio" type="radio" name="repetition" value="yes" ${period ? 'checked' : ''} onchange="javascript:changeRepetition()">
                                            <label>Да</label>
                                        </div>
                                        <div class="repetition__element">
                                            <input class="radio" type="radio" name="repetition" value="no" ${period ? '' : 'checked'} onchange="javascript:changeRepetition()">
                                            <label>Нет</label>
                                        </div>
                                    </div>
                                </div>

                                <div class="select__block">
                                    <select name="frequency">
                                        <option value="1">Каждый</option>
                                        <option value="2">Через</option>
                                    </select>

                                    <select name="unit">
                                        <option value="1">День</option>
                                        <option value="2">Неделю</option>
                                        <option value="3">Месяц</option>
                                        <option value="4">Год</option>
                                    </select>
                                </div>
                            </div>

                            <div class="priority__block">
                                <label>Укажите приоритет задачи</label>
                                <select name="priority" class="priority__select__block">
                                    <option value="1">Высший</option>
                                    <option value="2">Средний</option>
                                    <option value="3">Низкий</option>
                                    <option value="4" selected>Нет</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>`

    $('.bord').append(node);

    if (frequency !== undefined) {
        changeRepetition();
        document.getElementsByName('frequency')[0].value = frequency;
        document.getElementsByName('unit')[0].value = period;
    }
    else {
        document.getElementsByName('frequency')[0].value = 1;
        document.getElementsByName('unit')[0].value = 1;
    }

    if (description === '') {
        openAction();
    }
    else {
        openDescription();
    }
}

function renderPeriod(frequency, period) {
    console.log(frequency);
    console.log(period);
    document.getElementsByName('frequency')[0].value = frequency;
    document.getElementsByName('unit')[0].value = period;
}

function openSubtasks() {
    try {
        let element = document.getElementById('description');
        element.setAttribute('style', 'display: none; margin: 0;');
        element = document.getElementById('action');
        element.setAttribute('style', 'display: none; margin: 0;');
        element = document.getElementById('subtasks');
        element.setAttribute('style', 'display: flex; margin: 0 auto 10px;');
    } catch (error) { }
}

function openDescription() {
    try {
        let element = document.getElementById('subtasks');
        element.setAttribute('style', 'display: none; margin: 0;');
        element = document.getElementById('action');
        element.setAttribute('style', 'display: none; margin: 0;');
        element = document.getElementById('description');
        element.setAttribute('style', 'display: flex; margin: 0 auto 10px;');
    } catch (error) { }
}

function openAction() {
    try {
        let element = document.getElementById('subtasks');
        element.setAttribute('style', 'display: none; margin: 0;');
        element = document.getElementById('description');
        element.setAttribute('style', 'display: none; margin: 0;');
        element = document.getElementById('action');
        element.setAttribute('style', 'display: flow-root; margin: 0 auto 10px;');

        element = document.getElementsByName('date')[0];
        let date = new Date();
        let month = date.getMonth() + 1;
        if (month < 9) {
            month = '0' + month;
        }
        let day = date.getDate();
        if (day < 10) {
            day = '0' + day;
        }
        date = date.getFullYear() + "-" + month + "-" + day;
        element.setAttribute('min', `${date}`);

        changeRepetition();
    } catch (error) { }
}

function addSubtasks() {
    let element = document.getElementsByClassName('add__subtasks');
    element.setAttribute('style', 'display: none;');
}

function changeRepetition() {
    let radios = document.getElementsByClassName('radio');
    for (var i = 0; i < radios.length; i++) {
        if (radios[i].checked === true && i === 0) {
            let element = document.getElementsByClassName('select__block')[0];
            element.setAttribute('style', 'display: flex;');
            break;
        }
        else {
            let element = document.getElementsByClassName('select__block')[0];
            element.setAttribute('style', 'display: none;');
        }
    }
}

// обновление в базе
async function updateTask() {
    let flag = true; // отвечает за валидность изменённых данных
    let id = getTask();

    let title = document.getElementsByName('title')[0];
    // проверка на пустоту
    checkLength(title) ? title = title.value : flag = false;

    let description = document.getElementsByName('description')[0].value;
    if (description === null) {
        description = null;
    }

    // дата
    let date = document.getElementsByName('date')[0];
    flag = await checkValidation(date);
    date = document.getElementsByName('date')[0].value ?
        document.getElementsByName('date')[0].value : null;

    // время
    let time = document.getElementsByName('time')[0].value ?
        document.getElementsByName('time')[0].value : null;

    // если время задано, а дата нет, то она будет установлена на сегодня
    if (time !== null && date === null) {
        let now = new Date();
        date = now.getFullYear() + '-' +
            ((now.getMonth() + 1) < 10 ? '0' + (now.getMonth() + 1) : (now.getMonth() + 1)) + '-' + (now.getDate() < 10 ? '0' + (now.getDate()) : (now.getDate()));
    }

    // повторяется ли задача и если да то когда
    let frequency = null;
    let period = null;
    let radios = document.getElementsByClassName('radio');
    for (var i = 0; i < radios.length; i++) {
        if (radios[i].checked === true && i === 0) { // если установлено повторение
            if (date === null && document.getElementsByName('unit')[0].value !== null) {
                console.log('+');
                frequency = document.getElementsByName('frequency')[0].value;
                let now = new Date();
                date = now.getFullYear() + '-' +
                    ((now.getMonth() + 1) < 10 ? '0' + (now.getMonth() + 1) : (now.getMonth() + 1)) + '-' + (now.getDate() < 10 ? '0' + (now.getDate()) : (now.getDate()));
                period = document.getElementsByName('unit')[0].value;
            }
            else if (date !== null && document.getElementsByName('unit')[0].value !== null) {
                console.log('-');
                frequency = document.getElementsByName('frequency')[0].value;
                period = document.getElementsByName('unit')[0].value;
            }
        }
    }

    // если все ок, сохраняем
    if (flag) {
        removeValidation(); // удаление ошибочного выделения;

        // формируем набор для проверки периодичности задачи
        let data = JSON.stringify({
            'code': 4,
            'table': 'REPETITION',
            'frequency': frequency,
            'period': period,
        });

        let fetchData = new FetchData();
        period = await fetchData.getElements(data);
        period = period[0] ? period[0].id : null;

        // обновление данных локально
        taskList.list.localUpdateTask(id, title, description, date, time, period);

        // формируем набор для отправки на сервер
        data = JSON.stringify({
            'code': 2,
            'table': 'TASKS',
            'id': Number.parseInt(id),
            'title': title,
            'description': description,
            'date': date,
            'time': time,
            'period': period
        });

        fetchData = new FetchData();
        fetchData.getElements(data);
    }
}

// проверка валидности
async function checkValidation(element) {
    let flag = true; // отвечает за валидность изменённых данных

    // если дата не задана
    if (element.value === '') {
        return flag;
    }

    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth();
    let day = now.getDate();
    if (year <= Number.parseInt(element.value.slice(0, 4))) {
        if (month <= Number.parseInt(element.value.slice(5, 7))) {
            if (day > Number.parseInt(element.value.slice(8, 10))) {
                flag = false;
                generateError(element);
            }
        }
        else {
            flag = false;
            generateError(element);
        }
    }
    else {
        flag = false;
        generateError(element);
    }

    return flag;
}

// выполнение задачи в базе
async function taskReady(id_task = null) {
    let id = id_task ? id_task : getTask();

    let date = new Date();
    let month = date.getMonth() + 1;
    if (month < 9) {
        month = '0' + month;
    }
    let day = date.getDate();
    if (day < 10) {
        day = '0' + day;
    }
    date = date.getFullYear() + "-" + month + "-" + day;

    if ($(".upcoming").is(':hidden')) {
        // удаление задачи локально
        taskList.list.localDeleteTask(id);
        $('.element__info').remove();
    }
    else {
        // обновление задачи локально
        // taskList.list.localUpdateTask(id);
        $('.element__info').remove();
    }

    // формируем набор для отправки на сервер
    let data = JSON.stringify({
        'code': 1,
        'table': 'HISTORY',
        'id_owner': cookie,
        'date': date,
        'id': Number.parseInt(id)
    });

    let fetchData = new FetchData();
    fetchData.getElements(data);

    if ($(".upcoming").is(':visible')) {
        upcoming();
    }
}


function deleteTask() {
    let id = getTask();

    // обновление данных локально
    taskList.list.localDeleteTask(id);
    $('.element__info').remove();

    // формируем набор для отправки на сервер
    let data = JSON.stringify({
        'code': 3,
        'table': 'TASKS',
        'id': Number.parseInt(id)
    });

    let fetchData = new FetchData();
    fetchData.getElements(data);
}

// сброс даты и времени
function clearElement(name) {
    document.getElementsByName(name)[0].value = null;
}

function getTask() {
    let task = document.forms[0].name;
    return task;
}

const taskList = new Bord({
    listElem: '.bord__list'
})

//нужно ли сохранение при закрытии области задачи?

// проверка нажатия вне выбранной задачи
document.addEventListener('click', function (event) {
    try {
        let node = document.getElementById('task');
        if (!node.contains(event.target)) {
            $('.element__info').remove();
        }
    } catch (error) { }
});