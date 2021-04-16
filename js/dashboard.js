const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

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
                    <details open>
                        <summary>
                            <div id="bord-day-title">
                                <h2 class="day-title">${element}</h2>
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
    removeWindow('.task');
    taskList.getTasks(data);
}

// Проверка расписания
// todo прописать получение куки
async function checkRaspisanie() {
    try {
        // определяем является ли пользователь привязанным к университету
        let data = JSON.stringify({
            code: 4,
            table: 'SETTINGS',
            idOwner: 1, // cookie,
        });

        // выполняем запрос
        let result = await getResourse(data);

        const {role, university, group} = result[0];

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
                                let weekNext = week;
                                let date;
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
                                            weekNext = week === 'td_style2_ch' ? 'td_style2_zn' : 'td_style2_ch';
                                        }
                                        else{
                                            weekNext = week === 'td_style2_ch' ? 'td_style2_ch' : 'td_style2_zn';
                                        }
                                    }

                                    let para; let predmet; let teacher; let auditoria;
                                    // набор данных о паре
                                    for (let j = 0, col; j < row.cells.length; j += 1) {
                                        col = row.cells[j];

                                        if ((row.cells.length === 4 && j === 1) || (row.cells.length === 3 && j === 0)){
                                            para = col.textContent;
                                        }

                                        if (col === row.getElementsByClassName(weekNext)[0]) {
                                            predmet = col.getElementsByClassName('naz_disc').item(0);
                                            if (predmet !== null) {
                                                predmet = predmet.textContent;
                                                teacher = col.getElementsByClassName('segueTeacher')[0].textContent;
                                                auditoria = col.getElementsByClassName('segueAud')[0].textContent;
                                            }
                                        }
                                    }

                                    if (predmet !== null) {
                                        // определяем столбец для вывода
                                        listTaks = document.getElementById(`day-${date}`);

                                        const node = `<div class="list-task no-clik">
                                                <div class="list-task-details">
                                                    <div class="center">
                                                        <span class="list-task-label" id="para">
                                                            Пара № ${para}
                                                        </span>
                                                        <span class="list-task-label" id="auditoria">
                                                            Аудитория ${auditoria}
                                                        </span>
                                                    </div>
                                                    <span class="list-task-label" id="predmet">
                                                        ${predmet}
                                                    </span>
                                                    <span class="list-task-label" id="teacher">
                                                        Преподаватель - ${teacher}
                                                    </span>
                                                </div>
                                            </div>`;

                                        $(listTaks).append(node);
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

// Действия при полной загрузке странцы
document.addEventListener('DOMContentLoaded', () => {
    formation();
    checkRaspisanie();
    gettingListTasks();
})