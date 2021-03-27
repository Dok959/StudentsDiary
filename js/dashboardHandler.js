const cookie = getCookie(document.cookie, 'USER');

document.addEventListener("DOMContentLoaded", function () {
    today();
    $('.menu-burger__header').click(function () {
        $('.menu-burger__header').toggleClass('open-menu');
        $('.menu').toggleClass('open__menu');
    });
    checkRaspisanie();
});

// Входящие
function inbox() {
    // закрытие иных вкладок
    closeAndOpenTitle(".inbox", [".today", ".upcoming", ".request_search"]);

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
    closeAndOpenTitle(".today", [".inbox", ".request_search", ".upcoming"]);
    
    // определяем текущую дату
    const now = new Date();
    // Запрашиваем день недели вместе с коротким форматом даты
    var options = { weekday: 'long', month: 'short', day: 'numeric' };
    let date = now.toLocaleDateString('ru-RU', options);
    date = date[0].toUpperCase() + date.slice(1);
    
    // открытие нужной вкладки
    getDateToday(date);

    // формируем набор данных
    date = now.getFullYear() + '-' + ((now.getMonth() + 1) < 10 ? 
        '0' + (now.getMonth() + 1) : (now.getMonth() + 1)) + '-' + now.getDate();

    // устанавливаем минимальную дату поиска по дате
    let element = document.getElementsByClassName('date__picker')[0];
    element.setAttribute('min', `${date}`);
    element.setAttribute('value', `${date}`);
    
    const data = JSON.stringify({
        'code': 4,
        'table': 'TASKS',
        'id_owner': cookie,
        'date': date
    });

    taskList.list.clearTasks();
    taskList.getTasks(data);
};

// Отображение сегоднящней даты
function getDateToday(date) {
    $(".today").html('Сегодня, ' + date);
};

// Предстоящие
function upcoming() {
    closeAndOpenTitle(".upcoming", [".inbox", ".today", ".request_search"]);

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
        'code': 4,
        'table': 'TASKS',
        'id_owner': cookie,
        'startDate': startDate,
        'endDate': endDate
    });

    taskList.list.clearTasks();
    taskList.getTasks(data);
};

// Проверка расписания
async function checkRaspisanie() {
    try {
        // определяем является ли пользователь привязанным к университету
        let data = JSON.stringify({
            'code': 4,
            'table': 'SETTINGS',
            'id_owner': cookie
        });

        // выполняем запрос
        let result = await performanceQuery(data);

        let role = result[0].role; // код роли
        let university = result[0].university; // код универа
        let group = result[0].group; // код группы


        // проверяем университет и узнаем первичный путь
        data = JSON.stringify({
            'code': 4,
            'table': 'UNIVERSITIES',
            'id': university
        });

        result = await performanceQuery(data);

        let address_main = result[0].address; // первичный электронный адрес


        // проверяем роль пользователя и формируем остаток пути
        data = JSON.stringify({
            'code': 4,
            'table': 'ROLES',
            'id': role
        });

        result = await performanceQuery(data);

        let address = result[0].address; // вторичный электронный адрес
        let address_res = address_main + address + group; // истоговый путь к сайту расписания


        // по полученным данным делаем запрос к сайту
        response = new XMLHttpRequest();
        await response.open('POST', 'https://' + address_res);
        response.send();

        // переотправка если произошла ошибка
        response.onerror = async function() {
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
                if (week === -1) {
                    week = 'td_style2_ch'
                }
                else {
                    week = 'td_style2_zn'
                };

                // получаем пары на неделю
                let raspisanie = new DOMParser().parseFromString(result, "text/html")
                    .getElementsByClassName("table_style")[0];
                console.log(raspisanie);
            };
        };
    } catch (error) {
        return;
    }
};

// Функция реализующая запрос и парсинг результата 
async function performanceQuery(data) {
    // посылаем запрос
    let response = await fetch('./database/buildingQueryForDB', {
        method: 'POST',
        body: data,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });

    if (response.ok) {
        const result = await response.json();
        return result;
    }
    else {
        return;
    }
}

// Поиск по дате
function search() {
    closeAndOpenTitle(".request_search", [".inbox", ".today", ".upcoming"]);

    let date = document.getElementsByClassName('date__picker')[0].value;
    $(".request_search").html('Поиск на ' + 
        date.slice(8) + '.' + date.slice(5, 7) + '.' + date.slice(0, 4));

    const data = JSON.stringify({
        'code': 4,
        'table': 'TASKS',
        'id_owner': cookie,
        'date': '=' + date
    });

    taskList.list.clearTasks();
    taskList.getTasks(data);
}

// Поиск по дате
function searchForm() {
    
}

// Поиск по дате
function createForm() {
    let element = document.getElementsByClassName('create__form')[0];
    element.setAttribute('style', 'display: block;');
}

// Функция для открытия и закрытия заголовков вкладок
function closeAndOpenTitle(nameOpen, [nameSloce1, nameSloce2, nameSloce3]){
    $(nameSloce1).hide();
    $(nameSloce2).hide();
    $(nameSloce3).hide();
    $(".element__info").hide();
    $(nameOpen).show();
}

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