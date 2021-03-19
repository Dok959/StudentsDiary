const cookie = getCookie(document.cookie, 'USER');

document.addEventListener("DOMContentLoaded", function () {
    today();
    $('.menu-burger__header').click(function () {
        $('.menu-burger__header').toggleClass('open-menu');
        $('.menu').toggleClass('open__menu');
    });
});

// Входящие
function inbox() {
    // закрытие иных вкладок
    $(".today").hide();
    $(".upcoming").hide();
    $(".element__info").hide();

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

    taskList.list.clearTasks();
    taskList.getTasks(data);
};

// Сегодня
function today() {
    // закрытие иных вкладок
    $(".inbox").hide();
    $(".upcoming").hide();
    $(".element__info").hide();

    // определяем текущую дату
    const now = new Date();
    // Запрашиваем день недели вместе с коротким форматом даты
    var options = { weekday: 'long', month: 'short', day: 'numeric' };
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

    taskList.list.clearTasks();
    taskList.getTasks(data);
};

// отображение сегоднящней даты
function getDateToday(date) {
    $(".today").html('Сегодня, ' + date);
};

// Предстоящие
function upcoming() {
    // закрытие иных названий вкладок
    $(".inbox").hide();
    $(".today").hide();
    $(".element__info").hide();

    // открытие нужной вкладки
    $(".upcoming").show();

    // формируем набор данных
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const startDate = year + '-' + month + '-' + (day + 1);
    const endDate = year + '-' + month + '-' + (day + 6);

    const data = JSON.stringify({
        'code': 4,
        'table': 'TASKS',
        'id_owner': cookie,
        'startDate': startDate,
        'endDate': endDate
    });

    taskList.list.clearTasks();
    taskList.getTasks(data);
};

// отображение отсутствия задач
function emptyTasks(element) {
    $(".bord__list")
        .html('<div class="task__empty">' +
            '<div class="task__empty__title">' +
            '<h1>' +
            element.title +
            '</h1>' +
            '</div>' +
            '</div>');
};

// Настройки
function settings() {
    window.location.href = 'personPage';
};