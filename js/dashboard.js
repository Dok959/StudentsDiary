const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
const lessonAndTime = {
    1: '8:30',
    2: '10:15',
    3: '12:00',
    4: '13:45',
    5: '15:20',
    6: '16:55',
    7: '18:30',
    8: '20:05',
}

// Адаптивный список дней
function formation(){
    const nowDay = new Date();
    let now = nowDay.getDay();
    let indexDay = 0;
    for (let index = 0; index < 7; index += 1) {
        if (now === 7){
            now -= 7;
        }
        const element = days[now];

        nowDay.setDate(nowDay.getDate() + indexDay);
        if (indexDay === 0){
            indexDay = 1;
        }
        const year = nowDay.getFullYear();
        let month = nowDay.getMonth() + 1;
        if (month < 10) {
            month = `0${month}`;
        }
        let day = nowDay.getDate();
        if (day < 10) {
            day = `0${day}`;
        }
        const dateInfo = `${day}.${month}.${year}`;

        const node = `<div class="wrapper">
                <div id="bord-day">
                    <details open>
                        <summary>
                            <div>
                                <div id="bord-day-title">
                                    <h2 class="day-title">${element}</h2>
                                    <h5 class="date-title">${dateInfo}</h5>
                                </div>
                                <div id="bord-day-title" style="padding-top: 5px">
                                    <h5 class="date-title">Количество дел на день</h5>
                                    <h5 id="count-day-${now}" class="date-title">0</h5>
                                </div>
                            </div>
                        </summary>
                        <div class="list-tasks" id="day-${now}">

                        </div>
                    </details>

                </div>
            </div>`;

        $('#dashboard-main').append(node);

        now += 1;
    }
}

// Получение задач на неделю
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
        idOwner: cookie,
        idProject: null,
        startDate,
        endDate,
    });

    taskList.list.clearTasks();
    removeWindow('.task');
    taskList.getTasks(data);
}

// Получение мероприятий на неделю
async function gettingListEvents(){
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
        table: 'ALL-EVENTS',
        idOwner: cookie,
        startDate,
        endDate,
    });

    taskList.eventList.clearEvents();
    removeWindow('.event');
    taskList.getEvents(data);
}

// Отрисовка информации о парах
function creatingASchedule(role, week, raspisanieQuerry, lastDate = null) {
    const raspisanie = new DOMParser()
    .parseFromString(raspisanieQuerry, 'text/html')
    .getElementsByClassName('table_style')[0];

    const now = new Date();
    let day; let date;
    for (let i = 2, row; i < raspisanie.rows.length; i += 1) {
        row = raspisanie.rows[i];

        if (row.cells.length === 4){
            day = row.cells[0].textContent;
            // определяем индекс дня
            for (let index = 0; index < days.length; index += 1) {
                if (days[index] === day){
                    date = index;
                }
            }

            if (date < now.getDay()) {
                week === 'td_style2_ch' ? 'td_style2_zn' : 'td_style2_ch';
            }
            else{
                week === 'td_style2_ch' ? 'td_style2_ch' : 'td_style2_zn';
            }
        }

        let stardDate; let endDate;
        if (lastDate !== null){
            // получение начала занятий
            stardDate = new Date(`${lastDate.slice(5,7)}.${lastDate.slice(2,4)}.${lastDate.slice(8,12)}`);

            // получение окончания занятий
            endDate = new Date(`${lastDate.slice(19,21)}.${lastDate.slice(16,18)}.${lastDate.slice(22,26)}`);
        }

        let para; let predmet = null; let teacher = null; let auditoria; let group;
        // набор данных о паре
        for (let j = 0, col; j < row.cells.length; j += 1) {
            col = row.cells[j];

            if ((row.cells.length === 4 && j === 1) || (row.cells.length === 3 && j === 0)){
                para = col.textContent;
            }
            else if (role === 1){
                if (col === row.getElementsByClassName(week)[0]) {
                    predmet = col.getElementsByClassName('naz_disc').item(0);
                    if (predmet !== null && lastDate !== null) {
                        const today = new Date(new Date().setDate(new Date().getDate() + (7-date + 1))).setHours(0,0,0,0);

                        if (today - stardDate >= 0 && endDate - today >= 0){
                            predmet = predmet.textContent;
                            teacher = col.getElementsByClassName('segueTeacher')[0] ? col.getElementsByClassName('segueTeacher')[0].textContent : null;
                            auditoria = col.getElementsByClassName('segueAud')[0] ? col.getElementsByClassName('segueAud')[0].textContent : null;
                        }
                        else{
                            predmet = null;
                        }
                    }
                }
            }
            else if (role === 2){
                if ((row.cells.length === 4 && week === 'td_style2_ch' && j === 2) ||
                    (row.cells.length === 3 && week === 'td_style2_ch' && j === 1)){

                    group = col.getElementsByClassName('segueGrup').item(0);
                    if (group !== null){
                        group = group.textContent;
                    }

                    auditoria = col.getElementsByClassName('segueAud').item(0);
                    if (auditoria !== null){
                        auditoria = auditoria.textContent;
                    }

                    const element = col.outerHTML;
                    if (element.length > 45){
                        const startIndexPredmet = element.indexOf('</b>', 50) + 4;
                        const endIndexPredmet = element.indexOf('<br>', startIndexPredmet);
                        predmet = element.substring(startIndexPredmet, endIndexPredmet);
                        const startIndexTime = element.lastIndexOf ('<br>') + 4;
                        const dateLession = element.substring(startIndexTime, element.length-5);

                        // получение начала занятий
                        stardDate = new Date(`${dateLession.slice(5,7)}.${dateLession.slice(2,4)}.${dateLession.slice(8,12)}`);

                        // получение окончания занятий
                        endDate = new Date(`${dateLession.slice(19,21)}.${dateLession.slice(16,18)}.${dateLession.slice(22,26)}`);

                        // определение текущей даты
                        const today = new Date(new Date().setDate(new Date().getDate() + + (7-date + 1))).setHours(0,0,0,0);

                        if (today - stardDate < 0 || endDate - today < 0){
                            predmet = null;
                        }
                    }
                }
                else if ((row.cells.length === 4 && week === 'td_style2_zn' && j === 3) ||
                    (row.cells.length === 3 && week === 'td_style2_zn' && j === 2)){
                    group = col.getElementsByClassName('segueGrup').item(0);
                    if (group !== null){
                        group = group.textContent;
                    }

                    auditoria = col.getElementsByClassName('segueAud').item(0);
                    if (auditoria !== null){
                        auditoria = auditoria.textContent;
                    }

                    const element = col.outerHTML;
                    if (element.length > 45){
                        const startIndexPredmet = element.indexOf('</b>', 50) + 4;
                        const endIndexPredmet = element.indexOf('<br>', startIndexPredmet);
                        predmet = element.substring(startIndexPredmet, endIndexPredmet);
                        const startIndexTime = element.lastIndexOf ('<br>') + 4;
                        const dateLession = element.substring(startIndexTime, element.length-5);

                        // получение начала занятий
                        stardDate = new Date(`${dateLession.slice(5,7)}.${dateLession.slice(2,4)}.${dateLession.slice(8,12)}`);

                        // получение окончания занятий
                        endDate = new Date(`${dateLession.slice(19,21)}.${dateLession.slice(16,18)}.${dateLession.slice(22,26)}`);

                        // определение текущей даты
                        const today = new Date(new Date().setDate(new Date().getDate() + + (7-date + 1))).setHours(0,0,0,0);

                        if (today - stardDate < 0 || endDate - today < 0){
                            predmet = null;
                        }
                    }
                }
            }
        }

        if (predmet !== null) {
            // определяем столбец для вывода
            listTaks = document.getElementById(`day-${date}`);

            let bottom = '';
            if (teacher !== null){
                bottom = `<span class="list-task-label" id="teacher">
                    Преподаватель - ${teacher}
                </span>`
            }
            else if (group !== undefined){
                bottom = `<span class="list-task-label" id="teacher">
                    Группа - ${group}
                </span>`
            }

            const node = `<div class="list-task no-clik">
                    <div class="list-task-details">
                        <div class="center">
                            <span class="list-task-label">
                                В ${lessonAndTime[para]}
                            </span>
                            <span class="list-task-label" id="para">
                                Пара № ${para}
                            </span>
                            ${auditoria !== null ? `<span class="list-task-label" id="auditoria">
                                Аудитория ${auditoria}
                            </span>` : ''}
                        </div>
                        <span class="list-task-label" id="predmet">
                            ${predmet}
                        </span>
                        ${bottom !== null ? bottom : ''}
                    </div>
                </div>`;

            $(listTaks).append(node);
        }
    }

    counterToElement();
}

// Проверка расписания
async function checkRaspisanie() {
    try {
        // определяем является ли пользователь привязанным к университету
        let data = JSON.stringify({
            code: 4,
            table: 'SETTINGS',
            idOwner: cookie,
        });

        // выполняем запрос
        let result = await getResourse(data);

        const {role, university} = result[0];
        let group;
        if (result[0].group === null){
            const {firstName, lastName, patronymic} = result[0];
            group = `${lastName}_${firstName.slice(0, 1)}.${patronymic.slice(0, 1)}.`;
        }
        else{
            group = result[0].group;
        }

        // проверка на наличие даннных
        if (role !== null || university !== null || group !== null) {
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

                response.onerror = () => {
                    console.log('Ошибка доступа к сайту')
                };
            };

            // парсим ответ
            response.onload = async function resLoad() {
                if (response.status === 200) {
                    const raspisanieQuerry = await response.response;
                    // определяем неделю
                    let week = raspisanieQuerry.indexOf('ЗНАМЕНАТЕЛЬ');
                    const now = new Date().getDay(); // если день = воскресенье получение расписания следующей недели
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
                    if (role === 2){
                        creatingASchedule(role, week, raspisanieQuerry);
                    }
                    else{
                        const timing = new DOMParser()
                        .parseFromString(raspisanieQuerry, 'text/html')
                        .getElementsByClassName('paud_date')[0].innerHTML;

                        creatingASchedule(role, week, raspisanieQuerry, timing);

                        // // получение начала занятий
                        // const startYear = Number.parseInt(timing.slice(8, 12), 10)
                        // const startMonth = Number.parseInt(timing.slice(5, 7), 10)
                        // const startDay = Number.parseInt(timing.slice(2, 4), 10)

                        // // получение окончания занятий
                        // const endYear = Number.parseInt(timing.slice(22, 26), 10)
                        // const endMonth = Number.parseInt(timing.slice(19, 21), 10)
                        // const endDay = Number.parseInt(timing.slice(16, 18), 10)

                        // // определение текущей даты
                        // now = new Date();
                        // const nowYear = now.getFullYear();
                        // const nowMonth = now.getMonth() + 1;
                        // const nowDay = now.getDate();

                        // if (nowYear >= startYear && nowYear <= endYear){
                        //     if (nowMonth >= startMonth && nowMonth <= endMonth){
                        //         if (nowDay >= startDay || nowDay <= endDay){
                        //             creatingASchedule(role, week, raspisanieQuerry);
                        //         }
                        //     }
                        // }
                    }
                }
            };
        }
    } catch (error) {
        /* empty */
    }
}

// Считаем количество дел на день
counterToElement = () => {
    document.getElementById(`count-day-0`).textContent = $(`#day-0`).children().length;
    document.getElementById(`count-day-1`).textContent = $(`#day-1`).children().length;
    document.getElementById(`count-day-2`).textContent = $(`#day-2`).children().length;
    document.getElementById(`count-day-3`).textContent = $(`#day-3`).children().length;
    document.getElementById(`count-day-4`).textContent = $(`#day-4`).children().length;
    document.getElementById(`count-day-5`).textContent = $(`#day-5`).children().length;
    document.getElementById(`count-day-6`).textContent = $(`#day-6`).children().length;
};

// Действия при полной загрузке странцы
document.addEventListener('DOMContentLoaded', () => {
    formation();
    checkRaspisanie();
    gettingListTasks();
    gettingListEvents();
})