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

                let now = new Date();
                if (year >= now.getFullYear()) {
                    if (month >= now.getMonth()) {
                        if (day < now.getDate()) {
                            expired = 'expired';
                        }
                    }
                    else {
                        expired = 'expired';
                    }
                }
                else {
                    expired = 'expired';
                }
            }

            let node = `<li>
                            <article class="task ${expired}">
                                <div class="row">
                                    <a class="task__ready" href="#">
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

    localUpdateTask = (id, title, description) => {
        let task = this.getIdTask(id);
        task.setTitle(title);
        task.setDescription(description);
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
    constructor({ id, id_owner, id_project = '', title = '', description = '', date = '' }) {
        this.id = id;
        this.id_owner = id_owner;
        this.id_project = id_project;
        this.title = title;
        this.description = description;
        this.date = date;
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
};

// открытие окна с выбранной задачей
openTask = id => {
    taskList.list.tasks.forEach(element => {
        if (element.id === id) {
            $(".element__info").show(); // тестовая штука
            // renderTask(element);
            openDescription();
        }
    })
}

// в процессе доработки
function renderTask({ id, id_project = '', title, description = '', date = '' } = {}) {
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
                    <a type="submit" id="readyElement" href="#">
                        <span>Выполнено</span>
                    </a>
                    <a type="submit" id="deleteElement" href="javascript:deleteTask()">
                        <span>Удалить</span>
                    </a>
                </div>

                <div class="element__info__more">
                    <nav class="element__menu">
                        <a class="link__element tab" href="javascript:openSubtasks()">
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
                            <textarea class="element__task__area subtasks" type="text" name="subtasks" placeholder="Подзадачи" maxlength=600>dasdasd</textarea>
                        </div>

                        <div class="element__info__block" id="description">
                            <textarea class="element__task__area description" type="text" name="description" placeholder="Описание" maxlength=600>${description ? description : ''}</textarea>
                        </div>

                        <div class="element__info__block" id="action">
                            <div class="date">
                                <label>Укажите срок выполнения задачи</label>
                                <input class="datetime-local" type="datetime-local" name="date">
                            </div>
                            <div class="repetition">
                                <div class="repetition__block">
                                    <label>Будет ли повторение задачи</label>
                                    <div class="repetition__elements">
                                        <div class="repetition__element">
                                            <input class="radio" type="radio" name="repetition" value="yes" onchange="javascript:changeRepetition()">
                                            <label>Да</label>
                                        </div>
                                        <div class="repetition__element">
                                            <input class="radio" type="radio" name="repetition" value="no" checked onchange="javascript:changeRepetition()">
                                            <label>Нет</label>
                                        </div>
                                    </div>
                                </div>

                                <div class="select__block">
                                    <select name="frequency">
                                        <option value="1" selected>Каждый</option>
                                        <option value="2">Через</option>
                                    </select>

                                    <select name="unit">
                                        <option value="1" selected>День</option>
                                        <option value="2">Неделю</option>
                                        <option value="3">Месяц</option>
                                        <option value="4">Год</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>`

    $('.bord').append(node);
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
    } catch (error) { }
}

function changeRepetition () {
    let radios = document.getElementsByClassName('radio');
    for (var i = 0; i < radios.length; i++){
        if (radios[i].checked === true && i === 0){
            let element = document.getElementsByClassName('select__block')[0];
            element.setAttribute('style', 'display: flex;');
            break;
        }
        else{
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

    // если все ок, сохраняем
    if (flag) {
        removeValidation(); // удаление ошибочного выделения
        // обновление данных локально
        taskList.list.localUpdateTask(id, title, description);

        // формируем набор для отправки на сервер
        let data = JSON.stringify({
            'code': 2,
            'table': 'TASKS',
            'id': Number.parseInt(id),
            'title': title,
            'description': description
        });

        let fetchData = new FetchData();
        fetchData.getElements(data);
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