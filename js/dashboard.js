const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
const nowDay = new Date();
const taskList = new Bord();
const closeTag = '.open-window'

// Адаптивный список дней
// TODO убрать формирование пустых тестовых задач и добавить больше задач в базу
function formation(){
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
                        <a href="#" class="list-task">
                            <div class="list-task-details">
                                <span class="list-task-label">
                                    Задача 1
                                </span>
                            </div>
                        </a>
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
function gettingListTasks(){
    // определение сроков
    const now = nowDay;
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

// Открытие выбранной задачей
openTask = (id) => {
    taskList.list.tasks.forEach((element) => {
        if (element.id === id) {
            console.log(id)
            // renderTask(element);
        }
    });
};

// Действия при полной загрузке странцы
document.addEventListener('DOMContentLoaded', () => {
    formation();
    gettingListTasks();
})