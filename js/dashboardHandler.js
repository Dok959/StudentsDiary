const cookie = getCookie(document.cookie, 'USER');

document.addEventListener('DOMContentLoaded', async function () {
    today();
    $('.menu-burger__header').click(function () {
        $('.menu-burger__header').toggleClass('open-menu');
        $('.menu').toggleClass('open__menu');
    });
    await checkRaspisanie();

    // функция отвечающая за скрытие и отображение даты на задачах при изменении размера экрана
    $(window).resize(function () { 
        let element = document.getElementsByClassName('block__raspisanie')[0];
        element = getComputedStyle(element).display;
        if (element === 'block' && window.innerWidth <= 1040) {
            elements = document.getElementsByClassName('task__time');
            for (let index = 0; index < elements.length; index++) {
                elements[index].setAttribute('style', 'display: none;');
            }
        }
        else if (element === 'block' && window.innerWidth > 1040) {
            elements = document.getElementsByClassName('task__time');
            for (let index = 0; index < elements.length; index++) {
                elements[index].setAttribute('style', 'display: inline-block;');
            }
        }
    });

    visibleTime();
});

// функция отвечающая за скрытие и отображение даты на задачах при изменении размера экрана
function visibleTime() { 
    let element = document.getElementsByClassName('block__raspisanie')[0];
    element = getComputedStyle(element).display;
    if (element === 'block' && window.innerWidth <= 1040) {
        elements = document.getElementsByClassName('task__time');
        for (let index = 0; index < elements.length; index++) {
            elements[index].setAttribute('style', 'display: none;');
        }
    }
    else if (element === 'block' && window.innerWidth > 1040) {
        elements = document.getElementsByClassName('task__time');
        for (let index = 0; index < elements.length; index++) {
            elements[index].setAttribute('style', 'display: inline-block;');
        }
    }
}

// Входящие
function inbox() {
    // закрытие иных вкладок
    closeAndOpenTitle('.inbox', ['.today', '.upcoming', '.request_search']);

    // формируем набор данных
    const data = JSON.stringify({
        code: 4,
        table: 'TASKS',
        id_owner: cookie,
        id_project: null,
        date: null,
    });

    taskList.list.clearTasks();
    taskList.getTasks(data);
}

// Сегодня
function today() {
    closeAndOpenTitle('.today', ['.inbox', '.request_search', '.upcoming']);

    // определяем текущую дату
    const now = new Date();
    // Запрашиваем день недели вместе с коротким форматом даты
    var options = { weekday: 'long', month: 'short', day: 'numeric' };
    let date = now.toLocaleDateString('ru-RU', options);
    date = date[0].toUpperCase() + date.slice(1);

    // открытие нужной вкладки
    getDateToday(date);

    // формируем набор данных
    date =
        now.getFullYear() +
        '-' +
        (now.getMonth() + 1 < 10
            ? '0' + (now.getMonth() + 1)
            : now.getMonth() + 1) +
        '-' +
        now.getDate();

    // устанавливаем минимальную дату поиска по дате
    let element = document.getElementsByClassName('date__picker')[0];
    element.setAttribute('min', `${date}`);
    element.setAttribute('value', `${date}`);

    const data = JSON.stringify({
        code: 4,
        table: 'TASKS',
        id_owner: cookie,
        date: date,
    });

    taskList.list.clearTasks();
    taskList.getTasks(data);
}

// Отображение сегоднящней даты
function getDateToday(date) {
    $('.today').html('Сегодня, ' + date);
}

// Предстоящие
function upcoming() {
    closeAndOpenTitle('.upcoming', ['.inbox', '.today', '.request_search']);

    // формируем набор данных
    let now = new Date();
    now.setDate(now.getDate() + 1);
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    let day = now.getDate();
    // определение начальной даты
    const startDate = year + '-' + month + '-' + day;

    // определение конечной даты
    now.setDate(now.getDate() + 6);
    year = now.getFullYear();
    month = now.getMonth() + 1;
    day = now.getDate();
    const endDate = year + '-' + month + '-' + day;

    const data = JSON.stringify({
        code: 4,
        table: 'TASKS',
        id_owner: cookie,
        startDate: startDate,
        endDate: endDate,
    });

    taskList.list.clearTasks();
    taskList.getTasks(data);
}

// Проверка расписания
async function checkRaspisanie() {
    try {
        $('.day').remove();
        $('.day__element').remove();

        // определяем является ли пользователь привязанным к университету
        let data = JSON.stringify({
            code: 4,
            table: 'SETTINGS',
            id_owner: cookie,
        });

        // выполняем запрос
        let result = await performanceQuery(data);

        let role = result[0].role; // код роли
        let university = result[0].university; // код универа
        let group = result[0].group; // код группы

        // проверка на наличие даннных
        if (role !== null || university !== null || group !== null) {
            // если данные указаны то отрисовать область
            let element = document.getElementsByClassName(
                'block__raspisanie'
            )[0];
            element.setAttribute('style', 'display: inline-block;');

            // проверяем университет и узнаем первичный путь
            data = JSON.stringify({
                code: 4,
                table: 'UNIVERSITIES',
                id: university,
            });

            result = await performanceQuery(data);

            let address_main = result[0].address; // первичный электронный адрес

            // проверяем роль пользователя и формируем остаток пути
            data = JSON.stringify({
                code: 4,
                table: 'ROLES',
                id: role,
            });

            result = await performanceQuery(data);

            let address = result[0].address; // вторичный электронный адрес
            let address_res = address_main + address + group; // истоговый путь к сайту расписания

            // по полученным данным делаем запрос к сайту
            response = new XMLHttpRequest();
            await response.open('POST', 'https://' + address_res);
            response.send();

            // переотправка если произошла ошибка
            response.onerror = async function () {
                await response.open('POST', 'http://' + address_res);
                response.send();
            };

            // парсим ответ
            response.onload = async function () {
                // console.log(response);
                if (response.status === 200) {
                    let result = await response.response;
                    // определяем неделю
                    let week = result.indexOf('ЗНАМЕНАТЕЛЬ');
                    let now = new Date().getDay(); // если день = воскресенье получение расписания следующей недели
                    if (week === -1) {
                        week = 'td_style2_ch';
                        if (now === 0) {
                            week = 'td_style2_zn';
                        }
                    } else {
                        week = 'td_style2_zn';
                        if (now === 0) {
                            week = 'td_style2_ch';
                        }
                    }

                    // получаем пары на неделю
                    let raspisanie = new DOMParser()
                        .parseFromString(result, 'text/html')
                        .getElementsByClassName('table_style')[0];

                    let day, dayOld;
                    for (var i = 2, row; (row = raspisanie.rows[i]); i++) {
                        let para, predmet, teacher, auditoria;
                        for (var j = 0, col; (col = row.cells[j]); j++) {
                            if (
                                j < 2 &&
                                col.getElementsByClassName('naz_disc')[0] ===
                                    undefined
                            ) {
                                para = col.textContent;
                                para =
                                    para.length > 2
                                        ? ((day = para), (para = undefined))
                                        : para;
                            } else if (
                                col === row.getElementsByClassName(week)[0]
                            ) {
                                predmet = col.getElementsByClassName(
                                    'naz_disc'
                                )[0];
                                if (predmet !== undefined) {
                                    predmet = predmet.textContent;
                                    teacher = col.getElementsByClassName(
                                        'segueTeacher'
                                    )[0].textContent;
                                    auditoria = col.getElementsByClassName(
                                        'segueAud'
                                    )[0].textContent;
                                }
                            }
                        }

                        if (predmet !== undefined) {
                            if (dayOld === undefined || dayOld !== day) {
                                let node = `<li class="day"><span class="title">${day}</span></li>`;
                                $('.raspisanie').append(node);
                                dayOld = day;
                            }
                            node = `<li class="day__element">
                                    <div class="schedule__item">
                                        <div class="item__title">
                                            <span class="para">Пара № ${para}</span>
                                            <span class="auditoria">Аудитория ${auditoria}</span>
                                        </div>
                                            <span class="predmet">${predmet}</span>
                                            <span class="teacher">${teacher}</span>
                                    </div>
                                </li>`;
                            $('.raspisanie').append(node);
                        }
                    }
                }
            };
        }
    } catch (error) {
        return;
    }
}

// Функция реализующая запрос и парсинг результата
async function performanceQuery(data) {
    // посылаем запрос
    let response = await fetch('./database/buildingQueryForDB', {
        method: 'POST',
        body: data,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
    });

    if (response.ok) {
        const result = await response.json();
        return result;
    } else {
        return;
    }
}

// Поиск по дате
function search() {
    closeAndOpenTitle('.request_search', ['.inbox', '.today', '.upcoming']);

    // получение даты с основного поля
    let date = document.getElementsByClassName('date__picker')[0].value;

    // если активно дополнительное то получить с него
    try {
        let node = document.getElementsByClassName('search__form')[0];
        date = document.getElementsByClassName('date__picker')[1].value;
        node.setAttribute('style', 'display: none;');
    } catch (error) {}

    $('.request_search').html(
        'Поиск на ' +
            date.slice(8) +
            '.' +
            date.slice(5, 7) +
            '.' +
            date.slice(0, 4)
    );

    const data = JSON.stringify({
        code: 4,
        table: 'TASKS',
        id_owner: cookie,
        date: '=' + date,
    });

    taskList.list.clearTasks();
    taskList.getTasks(data);
}

// Обработка формы поиска по дате
function searchForm() {
    let element = document.getElementsByClassName('search__form')[0];
    element.setAttribute('style', 'display: block;');

    let date = new Date();
    let month = date.getMonth() + 1;
    if (month < 9) {
        month = '0' + month;
    }
    let day = date.getDate();
    if (day < 10) {
        day = '0' + day;
    }
    date = date.getFullYear() + '-' + month + '-' + day;
    element = document.getElementsByClassName('date__picker')[1];
    element.setAttribute('min', `${date}`);
    element.setAttribute('value', `${date}`);
}

// Отрисовка формы для создания элементов
function createForm() {
    let element = document.getElementsByClassName('create__form')[0];
    element.setAttribute('style', 'display: block;');
}

// Функция для открытия и закрытия блока расписания
function openOrCloseFormRaspisanie() {
    let element = document.getElementsByClassName('btn__raspisanie')[0];
    let value = element.getAttribute('value');
    if (value === true.toString()){
        element.setAttribute('value', 'false');
        element = document.getElementsByClassName('block__raspisanie')[0];
        element.setAttribute('style', 'display: none;');

        element = document.getElementById('add_element');
        element.setAttribute('value', getComputedStyle(element).right);
        element.setAttribute('style', 'right: 1%;');
    }
    else{
        element.setAttribute('value', 'true');
        element = document.getElementsByClassName('block__raspisanie')[0];
        element.setAttribute('style', 'display: flex;');

        element = document.getElementById('add_element');
        value = element.getAttribute('value');
        element.setAttribute('value', '');
        element.setAttribute('style', `right: ${value}px;`);
    }
}

// Функция для открытия и закрытия заголовков вкладок
function closeAndOpenTitle(nameOpen, [nameSloce1, nameSloce2, nameSloce3]) {
    $(nameSloce1).hide();
    $(nameSloce2).hide();
    $(nameSloce3).hide();
    $('.element__info').hide();
    $(nameOpen).show();
}

// отображение отсутствия задач
function emptyTasks(element) {
    $('.bord__list').html(
        '<div class="task__empty">' +
            '<div class="task__empty__title">' +
            '<h1>' +
            element.title +
            '</h1>' +
            '</div>' +
            '</div>'
    );
}

// Настройки
function settings() {
    window.location.href = 'personPage';
}
