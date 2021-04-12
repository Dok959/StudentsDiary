class Task {
    constructor({
        id, idOwner, idProject = '', title = '',
        description = '', date = '', time = '', period = null,
    }) {
        this.id = id;
        this.idOwner = idOwner;
        this.idProject = idProject;
        this.title = title;
        this.description = description;
        this.date = date;
        this.time = time;
        this.period = period;
    }

    getTitle() {
        return this.title;
    }

    setTitle(title) {
        this.title = title;
    }

    setDescription(description) {
        this.description = description;
    }

    getDate() {
        return this.date;
    }

    setDate(date) {
        this.date = date;
    }

    setTime(time) {
        this.time = time;
    }

    setPeriod(period) {
        this.period = period;
    }
}

// ! Не тестировано ничего
// выполнение задачи в базе
// async function taskReady(idTask = null) {
//     const id = idTask || getTask();

//     let date = new Date();
//     let month = date.getMonth() + 1;
//     if (month < 9) {
//         month = `0${month}`;
//     }
//     let day = date.getDate();
//     if (day < 10) {
//         day = `0${day}`;
//     }
//     date = `${date.getFullYear()}-${month}-${day}`;

//     if ($('.upcoming').is(':hidden')) {
//         // удаление задачи локально
//         taskList.list.localDeleteTask(id);
//         $('.element__info').remove();
//     } else {
//         $('.element__info').remove();
//     }

//     // формируем набор для отправки на сервер
//     const data = JSON.stringify({
//         code: 1,
//         table: 'HISTORY',
//         idOwner: cookie,
//         date,
//         id: Number.parseInt(id, 10),
//     });

//     getResourse(data);

//     if ($('.upcoming').is(':visible')) {
//         upcoming();
//     }
// }

async function createTask() {
    $('.element__info').remove();
    let element = document.getElementsByClassName('create__form')[0];
    element.setAttribute('style', 'display: none;');
    element = document.getElementsByClassName('search__form').item(0);
    element.setAttribute('style', 'display: none;');

    const node = `
        <div class="element__info" id="task">
            <form class="element__task" name="" method="get">

                <div class="element__info__block">
                    <textarea class="element__task__area title" type="text" name="title" placeholder="Название" maxlength=100></textarea>
                </div>

                <div class="element__btn">
                    <a type="submit" id="readyElement" href="javascript:readyCreateTask()">
                        <span>Создать</span>
                    </a>
                    <a type="submit" id="deleteElement" href="javascript:cancelCreateTask()">
                        <span>Отмена</span>
                    </a>
                </div>

                <div class="element__info__more">
                    <nav class="element__menu">
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
                        <div class="element__info__block" id="description">
                            <textarea class="element__task__area description" type="text" name="description" placeholder="Описание" maxlength=600></textarea>
                        </div>

                        <div class="element__info__block" id="action">
                            <div class="date">
                                <label class="date__title">Укажите срок выполнения задачи</label>
                                <div class="date__and__time__block">
                                    <div class="date__and__time">
                                        <a href="javascript:clearElement('date')" class="clear date__clear"></a>
                                        <input class="datetime-local" type="date" name="date" value="">
                                    </div>
                                    <div class="date__and__time">
                                        <a href="javascript:clearElement('time')" class="clear time__clear"></a>
                                        <input class="datetime-local time" type="time" name="time" value="">
                                    </div>
                                </div>
                            </div>

                            <div class="repetition">
                                <div class="repetition__block">
                                    <label class="repetition__elements">Будет ли повторение задачи</label>
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
                                <label class="priority__title">Укажите приоритет задачи</label>
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
        </div>`;

    $('.container').append(node);

    openAction();
}

async function readyCreateTask() {
    let availabilityTitle = true; // флаг проверки названия

    let title = document.getElementsByName('title')[0];
    // проверка на пустоту
    checkLength(title) ? (title = title.value) : (availabilityTitle = false);

    const description = document.getElementsByName('description')[0].value;

    // дата
    let date = document.getElementsByName('date')[0];
    const availabilityDate = await checkValidation(date); // флаг проверки даты
    date = document.getElementsByName('date')[0].value
        ? document.getElementsByName('date')[0].value
        : null;

    // время
    const time = document.getElementsByName('time')[0].value
        ? document.getElementsByName('time')[0].value
        : null;

    // если время задано, а дата нет, то она будет установлена на сегодня
    if (time !== null && date === null) {
        const now = new Date();
        date =
            `${now.getFullYear()}-${now.getMonth() + 1 < 10 ? `0${  now.getMonth() + 1}`
                : now.getMonth() + 1}-${now.getDate() < 10 ? `0${  now.getDate()}` : now.getDate()}`;
    }

    // повторяется ли задача и если да то когда
    let frequency = null;
    let period = null;
    const radios = document.getElementsByClassName('radio');
    for (let i = 0; i < radios.length; i += 1) {
        if (radios[i].checked === true && i === 0) {
            // если установлено повторение
            if (date === null && document.getElementsByName('unit')[0].value !== null) {
                console.log('+');
                frequency = document.getElementsByName('frequency')[0].value;
                const now = new Date();
                date =
                    `${now.getFullYear()}-${now.getMonth() + 1 < 10 ? `0${now.getMonth() + 1}`
                        : now.getMonth() + 1}-${now.getDate() < 10 ? `0${now.getDate()}` : now.getDate()}`;
                period = document.getElementsByName('unit')[0].value;
            } else if (date !== null && document.getElementsByName('unit')[0].value !== null) {
                console.log('-');
                frequency = document.getElementsByName('frequency')[0].value;
                period = document.getElementsByName('unit')[0].value;
            }
        }
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

        console.log(data);

        await getResourse(data);

        let now = new Date();
        now =
            `${now.getFullYear()}-${now.getMonth() + 1 < 10 ? `0${now.getMonth() + 1}`
                : now.getMonth() + 1}-${now.getDate() < 10 ? `0${now.getDate()}` : now.getDate()}`;
        if (date === null) {
            inbox();
        } else if (date === now) {
            today();
        } else if (date >= now) {
            upcoming();
        }
    }
}

function cancelCreateTask() {
    $('.element__info').remove();
    let element = document.getElementsByClassName('create__form')[0];
    element.setAttribute('style', 'display: none;');

    element = document.getElementsByClassName('search__form').item(0);
    element.setAttribute('style', 'display: none;');
}
