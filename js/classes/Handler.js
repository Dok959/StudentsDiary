const cookie = getCookie(document.cookie, 'USER');

// Функция для открытия и закрытия заголовков вкладок
function closeAndOpenTitle(nameOpen, [nameSloce1, nameSloce2, nameSloce3]) {
    $(nameSloce1).hide();
    $(nameSloce2).hide();
    $(nameSloce3).hide();
    $('.element__info').hide();
    $(nameOpen).show();
}

// Функция отвечающая за перерисовку значка добавления
function reRenderIconAddElements(flag){
    const element = document.getElementById('add_element');
    if (flag){
        element.setAttribute('value', getComputedStyle(element).right);
        element.setAttribute('style', 'right: 3%;');
    }
    else{
        const value = element.getAttribute('value');
        element.setAttribute('value', '');
        element.setAttribute('style', `right: ${value}px;`);
    }
}

// функция отвечающая за скрытие и отображение даты на задачах при изменении размера экрана
function visibleTime() {
    let element = document.getElementsByClassName('block__raspisanie')[0];
    element = getComputedStyle(element).display;
    if (element === 'block' && window.innerWidth <= 1040) {
        elements = document.getElementsByClassName('task__time');
        for (let index = 0; index < elements.length; index += 1) {
            elements[index].setAttribute('style', 'display: none;');
        }
    }
    else if (element === 'block' && window.innerWidth > 1040) {
        elements = document.getElementsByClassName('task__time');
        for (let index = 0; index < elements.length; index += 1) {
            elements[index].setAttribute('style', 'display: inline-block;');
        }
    }
    else if (element === 'none'){
        reRenderIconAddElements(true);
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

// Отображение сегоднящней даты
function getDateToday(date) {
    $('.today').html(`Сегодня, ${date}`);
}

// Сегодня
function today() {
    closeAndOpenTitle('.today', ['.inbox', '.request_search', '.upcoming']);

    // определяем текущую дату
    const now = new Date();
    // Запрашиваем день недели вместе с коротким форматом даты
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    let date = now.toLocaleDateString('ru-RU', options);
    date = date[0].toUpperCase() + date.slice(1);

    // открытие нужной вкладки
    getDateToday(date);

    // формируем набор данных
    date =
        `${now.getFullYear()}-${now.getMonth() + 1 < 10 ? `0${now.getMonth() + 1}`
            : now.getMonth() + 1}-${now.getDate() < 10 ? `0${now.getDate()}` : now.getDate()}`;

    // устанавливаем минимальную дату поиска по дате
    const element = document.getElementsByClassName('date__picker')[0];
    element.setAttribute('min', `${date}`);
    element.setAttribute('value', `${date}`);

    const data = JSON.stringify({
        code: 4,
        table: 'TASKS',
        id_owner: cookie,
        date,
    });

    taskList.list.clearTasks();
    taskList.getTasks(data);
}

// Предстоящие
function upcoming() {
    closeAndOpenTitle('.upcoming', ['.inbox', '.today', '.request_search']);

    // формируем набор данных
    const now = new Date();
    now.setDate(now.getDate() + 1);
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    let day = now.getDate();
    // определение начальной даты
    const startDate = `${year}-${month}-${day}`;

    // определение конечной даты
    now.setDate(now.getDate() + 6);
    year = now.getFullYear();
    month = now.getMonth() + 1;
    day = now.getDate();
    const endDate = `${year}-${month}-${day}`;

    const data = JSON.stringify({
        code: 4,
        table: 'TASKS',
        id_owner: cookie,
        startDate,
        endDate,
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
        let result = await getResourse(data);

        const {role} = result[0]; // код роли
        const {university} = result[0]; // код универа
        const {group} = result[0]; // код группы

        // проверка на наличие даннных
        if (role !== null || university !== null || group !== null) {
            // если данные указаны то отрисовать область
            const element = document.getElementsByClassName('block__raspisanie')[0];
            element.setAttribute('style', 'display: inline-block;');

            // проверяем университет и узнаем первичный путь
            data = JSON.stringify({
                code: 4,
                table: 'UNIVERSITIES',
                id: university,
            });

            result = await getResourse(data);

            const addressMain = result[0].address; // первичный электронный адрес

            // проверяем роль пользователя и формируем остаток пути
            data = JSON.stringify({
                code: 4,
                table: 'ROLES',
                id: role,
            });

            result = await getResourse(data);

            const {address} = result[0]; // вторичный электронный адрес
            const addressRes = addressMain + address + group; // истоговый путь к сайту расписания

            // по полученным данным делаем запрос к сайту
            response = new XMLHttpRequest();
            await response.open('POST', `https://${addressRes}`);
            response.send();

            // переотправка если произошла ошибка
            response.onerror = async function resError() {
                await response.open('POST', `http://${addressRes}`);
                response.send();
            };

            // парсим ответ
            response.onload = async function resLoad() {
                // console.log(response);
                if (response.status === 200) {
                    const raspisanieQuerry = await response.response;
                    // определяем неделю
                    let week = raspisanieQuerry.indexOf('ЗНАМЕНАТЕЛЬ');
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

                    // получаем сроки актуальности пар
                    const timing = new DOMParser()
                        .parseFromString(raspisanieQuerry, 'text/html')
                        .getElementsByClassName('paud_date')[0].innerHTML;

                    // получение начала занятий
                    const startYear = Number.parseInt(timing.slice(8, 12), 10)
                    const startMonth = Number.parseInt(timing.slice(5, 7), 10)
                    const startDay = Number.parseInt(timing.slice(2, 4), 10)

                    // получение окончания занятий
                    const endYear = Number.parseInt(timing.slice(22, 26), 10)
                    const endMonth = Number.parseInt(timing.slice(19, 21), 10)
                    const endDay = Number.parseInt(timing.slice(16, 18), 10)

                    // определение текущей даты
                    now = new Date();
                    const nowYear = now.getFullYear();
                    const nowMonth = now.getMonth() + 1;
                    const nowDay = now.getDate();

                    if (nowYear >= startYear && nowYear <= endYear){
                        if (nowMonth >= startMonth && nowMonth <= endMonth){
                            if (nowDay >= startDay || nowDay <= endDay){
                                // получаем пары на неделю
                                const raspisanie = new DOMParser()
                                .parseFromString(raspisanieQuerry, 'text/html')
                                .getElementsByClassName('table_style')[0];

                                let day; let dayOld;
                                for (let i = 2, row; i < raspisanie.rows.length; i += 1) {
                                    row = raspisanie.rows[i];
                                    let para; let predmet; let teacher; let auditoria;
                                    for (let j = 0, col; j < row.cells.length; j += 1) {
                                        col = row.cells[j];
                                        if (j < 2 && col.getElementsByClassName('naz_disc')[0] === undefined ) {
                                            para = col.textContent;
                                            para = para.length > 2 ? ((day = para), (para = undefined)) : para;
                                        } else if (col === row.getElementsByClassName(week)[0]) {
                                            predmet = col.getElementsByClassName('naz_disc').item(0);
                                            if (predmet !== undefined) {
                                                predmet = predmet.textContent;
                                                teacher = col.getElementsByClassName('segueTeacher')[0].textContent;
                                                auditoria = col.getElementsByClassName('segueAud')[0].textContent;
                                            }
                                        }
                                    }

                                    if (predmet !== undefined) {
                                        if (dayOld === undefined || dayOld !== day) {
                                            const node = `<li class="day"><span class="title">${day}</span></li>`;
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
                        }
                    }
                }
            };
        }
    } catch (error) {
        /* empty */
    }
}

// Поиск по дате
function search() {
    closeAndOpenTitle('.request_search', ['.inbox', '.today', '.upcoming']);

    // получение даты с основного поля
    let date = document.getElementsByClassName('date__picker')[0].value;

    // если активно дополнительное то получить с него
    try {
        const node = document.getElementsByClassName('search__form')[0];
        date = document.getElementsByClassName('date__picker')[1].value;
        node.setAttribute('style', 'display: none;');
    } catch (error) {
        /* empty */
    }

    $('.request_search').html(
        `Поиск на ${date.slice(8)}.${date.slice(5, 7)}.${date.slice(0, 4)}`
    );

    const data = JSON.stringify({
        code: 4,
        table: 'TASKS',
        id_owner: cookie,
        date: `=${date}`,
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
        month = `0${month}`;
    }
    let day = date.getDate();
    if (day < 10) {
        day = `0${day}`;
    }
    date = `${date.getFullYear()  }-${month}-${day}`;
    element = document.getElementsByClassName('date__picker').item(1);
    element.setAttribute('min', `${date}`);
    element.setAttribute('value', `${date}`);
}

// Отрисовка формы для создания элементов
function createForm() {
    const element = document.getElementsByClassName('create__form')[0];
    element.setAttribute('style', 'display: block;');
}

// Функция для открытия и закрытия блока расписания
function openOrCloseFormRaspisanie() {
    let element = document.getElementsByClassName('raspisanie')[0];
    if (element.innerText.trim() !== ''){
        element = document.getElementsByClassName('btn__raspisanie').item(0);
        const value = element.getAttribute('value');
        if (value === true.toString()){
            element.setAttribute('value', 'false');
            element = document.getElementsByClassName('block__raspisanie').item(0);
            element.setAttribute('style', 'display: none;');
            reRenderIconAddElements(true);
        }
        else{
            element.setAttribute('value', 'true');
            element = document.getElementsByClassName('block__raspisanie').item(0);
            element.setAttribute('style', 'display: block;');
            reRenderIconAddElements(false);
        }
    }
}

// отображение отсутствия задач
async function emptyTasks(element) {
    await $('.bord__list').html(
        `${'<div class="task__empty">' +
            '<div class="task__empty__title">' +
            '<h1>'}${
            element.title
            }</h1>` +
            `</div>` +
            `</div>`
    );
}

// Действия при полной загрузке странцы
document.addEventListener('DOMContentLoaded', async () => {
    today();
    $('.menu-burger__header').click(() => {
        $('.menu-burger__header').toggleClass('open-menu');
        $('.menu').toggleClass('open__menu');
    });
    await checkRaspisanie();
    // let flagVisible = true;

    /* функция отвечающая за скрытие и отображение даты на задачах при изменении размера экрана,
        а также за отрисовки разных элементов страницы */
    // $(window).resize(() => {
    //     let element = document.getElementsByClassName('block__raspisanie')[0];
    //     element = getComputedStyle(element).display;
    //     if (window.innerWidth <= 1040) {
    //         elements = document.getElementsByClassName('task__time');
    //         for (let index = 0; index < elements.length; index += 1) {
    //             elements[index].setAttribute('style', 'display: none;');
    //         }
    //     }
    //     else if (window.innerWidth > 1040) {
    //         elements = document.getElementsByClassName('task__time');
    //         for (let index = 0; index < elements.length; index += 1) {
    //             elements[index].setAttribute('style', 'display: inline-block;');
    //         }
    //     }

    //     if (element === 'block' && window.innerWidth < 900 && flagVisible === true) {
    //         elements = document.getElementsByClassName('menu__element__title');
    //         for (let index = 0; index < elements.length; index += 1) {
    //             elements[index].setAttribute('style', 'display: none;');
    //         }
    //         elements = document.getElementsByClassName('link__description');
    //         for (let index = 0; index < elements.length; index += 1) {
    //             elements[index].setAttribute('style', 'display: none;');
    //         }
    //         element = document.getElementsByClassName('search__title').item(0);
    //         element.setAttribute('style', 'display: none;');
    //         element = document.getElementsByClassName('picker').item(0);
    //         element.setAttribute('style', 'display: none;');
    //         element = document.getElementsByClassName('search_image').item(0);
    //         element.setAttribute('style', 'display: block;');
    //         element = document.getElementsByClassName('search__title').item(1);
    //         element.setAttribute('style', 'display: none;');

    //         element = document.getElementsByClassName('img__raspisanie').item(0);
    //         element.setAttribute('style', 'display: block;');

    //         element = document.getElementsByClassName('bottom__menu__element').item(0);
    //         element.setAttribute('style', 'left: 2%;');
    //         flagVisible = false;
    //     }
    //     else if (window.innerWidth >= 900 && flagVisible === false){
    //         elements = document.getElementsByClassName('menu__element__title');
    //         for (let index = 0; index < elements.length; index += 1) {
    //             elements[index].setAttribute('style', 'display: flex;');
    //         }
    //         elements = document.getElementsByClassName('link__description');
    //         for (let index = 0; index < elements.length; index += 1) {
    //             elements[index].setAttribute('style', 'display: block;');
    //         }
    //         element = document.getElementsByClassName('search__title').item(0);
    //         element.setAttribute('style', 'display: block;');
    //         element = document.getElementsByClassName('picker').item(0);
    //         element.setAttribute('style', 'display: block;');
    //         element = document.getElementsByClassName('search_image').item(0);
    //         element.setAttribute('style', 'display: none;');
    //         element = document.getElementsByClassName('search__title').item(1);
    //         element.setAttribute('style', 'display: none;');

    //         element = document.getElementsByClassName('img__raspisanie').item(0);
    //         element.setAttribute('style', 'display: none;');

    //         element = document.getElementsByClassName('bottom__menu__element').item(0);
    //         element.setAttribute('style', 'left: 3%;');
    //         flagVisible = true;
    //     }

    //     if (element === 'block' && window.innerWidth <= 600 && flagVisible === false){
    //         elements = document.getElementsByClassName('link__img');
    //         for (let index = 0; index < elements.length; index += 1) {
    //             elements[index].setAttribute('style', 'display: flex;');
    //         }
    //     }

    //     if (window.innerWidth <= 400){
    //         elements = document.getElementsByClassName('menu__element__title');
    //         for (let index = 0; index < elements.length; index += 1) {
    //             elements[index].setAttribute('style', 'display: flex;');
    //         }
    //         elements = document.getElementsByClassName('link__description');
    //         for (let index = 0; index < elements.length; index += 1) {
    //             elements[index].setAttribute('style', 'display: block;');
    //         }
    //         elements = document.getElementsByClassName('link__img');
    //         for (let index = 0; index < elements.length; index += 1) {
    //             elements[index].setAttribute('style', 'display: none;');
    //         }
    //         element = document.getElementsByClassName('search_image').item(0);
    //         element.setAttribute('style', 'display: block;');
    //         element = document.getElementsByClassName('search__title').item(1);
    //         element.setAttribute('style', 'display: flex;');
    //     }
    //     else if (window.innerWidth > 400 && window.innerWidth <= 500 && flagVisible === true){
    //         elements = document.getElementsByClassName('link__img');
    //         for (let index = 0; index < elements.length; index += 1) {
    //             elements[index].setAttribute('style', 'display: block;');
    //         }
    //         element = document.getElementsByClassName('search__title').item(0);
    //         element.setAttribute('style', 'display: none;');
    //         element = document.getElementsByClassName('picker').item(0);
    //         element.setAttribute('style', 'display: none;');
    //         element = document.getElementsByClassName('search_image').item(0);
    //         element.setAttribute('style', 'display: flex; flex-direction: row-reverse; '+
    //             'padding-left: 5px;');
    //         element = document.getElementsByClassName('search__title').item(1);
    //         element.setAttribute('style', 'display: block;');
    //     }
    //     else if (window.innerWidth > 400 && window.innerWidth <= 500 && flagVisible === false){
    //         elements = document.getElementsByClassName('menu__element__title');
    //         for (let index = 0; index < elements.length; index += 1) {
    //             elements[index].setAttribute('style', 'display: none;');
    //         }
    //         elements = document.getElementsByClassName('link__description');
    //         for (let index = 0; index < elements.length; index += 1) {
    //             elements[index].setAttribute('style', 'display: none;');
    //         }
    //         elements = document.getElementsByClassName('link__img');
    //         for (let index = 0; index < elements.length; index += 1) {
    //             elements[index].setAttribute('style', 'display: block;');
    //         }
    //         element = document.getElementsByClassName('search__title').item(1);
    //         element.setAttribute('style', 'display: none;');
    //         element = document.getElementsByClassName('search_image').item(0);
    //         element.setAttribute('style', 'padding-left: 0px;');
    //     }

    //     if (window.innerWidth > 500 && window.innerWidth <= 600 && flagVisible === false){
    //         element = document.getElementsByClassName('search_image').item(0);
    //         element.setAttribute('style', 'display: block;');
    //         element = document.getElementsByClassName('img__search').item(0);
    //         element.setAttribute('style', 'display: block;');
    //     }
    //     else if (window.innerWidth >= 500 && window.innerWidth <= 600 && flagVisible === true){
    //         element = document.getElementsByClassName('search__title').item(1);
    //         element.setAttribute('style', 'display: none;');
    //         element = document.getElementsByClassName('search_image').item(0);
    //         element.setAttribute('style', 'padding-left: 0px;');
    //     }
    // });

    visibleTime();
});


// Настройки
function settings() {
    window.location.href = 'personPage';
}
