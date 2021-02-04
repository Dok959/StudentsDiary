const cookie = getCookie(document.cookie, 'USER');

document.addEventListener("DOMContentLoaded", function () {
    today();
});

// Входящие
function inbox() {
    // закрытие иных названий вкладок
    $(".today").hide();
    $(".upcoming").hide();

    // открытие нужной вкладки
    $(".inbox").show();

    // формируем набор данных
    const data = JSON.stringify({
        'code': 4,
        'table': 'TASKS',
        'id_owner': cookie,
        'id_project': null,
        'date': null
    });
    checkTasks(data);
};

// Сегодня
function today() {
    // закрытие иных названий вкладок
    $(".inbox").hide();
    $(".upcoming").hide();

    // определяем текущую дату
    const now = new Date();
    // Запрашиваем день недели вместе с коротким форматом даты
    var options = { weekday: 'short', month: 'short', day: 'numeric' };
    let date = now.toLocaleDateString('ru-RU', options);
    date = date[0].toUpperCase() + date.slice(1);

    // открытие нужной вкладки
    $(".today").show();
    getDateToday(date);

    // формируем набор данных
    date = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
    const data = JSON.stringify({
        'code': 4,
        'table': 'TASKS',
        'id_owner': cookie,
        'date': date
    });
    checkTasks(data);
};
// если задача на день и без проекта, то её отображать и в inbox, иначе тут и в проетке
// возможно сделать запрос к проектам еще

// отображение сегоднящней даты
function getDateToday(date) {
    $(".today").html('Сегодня, ' + date);
};

// Предстоящие
function upcoming() {
    // закрытие иных названий вкладок
    $(".inbox").hide();
    $(".today").hide();

    // открытие нужной вкладки
    $(".upcoming").show();

    // формируем набор данных
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const startDate = year + '-' + month + '-' + day;
    const endDate = year + '-' + month + '-' + (day + 5);

    const data = JSON.stringify({
        'code': 4,
        'table': 'TASKS',
        'id_owner': cookie,
        'startDate': startDate,
        'endDate': endDate
    });
    checkTasks(data);
};

// может передавать код вкладки, задачи которой нужны 
async function checkTasks(data) {
    console.log(data);

    let response = await fetch('./database/buildingQueryForDB', {
        method: 'POST',
        body: data,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });

    if (response.ok) { // если HTTP-статус в диапазоне 200-299
        const result = await response.json();
        console.log(result);
        if (!result.el) {
            if (result[0] !== undefined) {
                for (let element in result) {
                    getTasks(result[element]);
                };
            }
            else {
                getTasks({ title: 'Задач на горизонте не видно' });
            };
            // alert("Получено");
        }
        else {
            alert("Ничего ...");
        };
    } else {
        alert("Ошибка" + response.status);
    };
};

// отображение задачи
function getTasks(element) {
    $(".bord__tasks").html('<div class="bord__element">' +
        '<div class="bord__element__title">' +
        '<a class="link__element__ready" href="#">' +
        '<img class="link__element__img" src="/img/pac1/ready.png" alt="Выполнено">' +
        '</a>' +
        '<a class="link__bord__element" href="#">' +
        element.title +
        '</a>' +
        '</div>' +
        '<a class="link__element__cancel" href="#">' +
        '<img class="link__element__img" src="/img/pac1/trash.png" alt="Удалить задачу">' +
        '</a>' +
        '</div>');
};