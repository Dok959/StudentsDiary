const cookie = getCookie(document.cookie, 'USER');

function inbox() {
    // закрытие иных названий вкладок
    $(".inbox").show();
    $(".today").hide();
    $(".upcoming").hide();

    // формируем набор данных
    const data = JSON.stringify({
        'code': 4,
        'table': 'TASKS',
        'id_owner': cookie,
        'id_project': null,
        'date': null
    });
    checkTasks(data);
}

function today() {
    // закрытие иных названий вкладок
    $(".today").show();
    $(".inbox").hide();
    $(".upcoming").hide();

    // формируем набор данных
    const now = new Date();
    const date = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
    const data = JSON.stringify({
        'code': 4,
        'table': 'TASKS',
        'id_owner': cookie,
        'date': date
    });
    checkTasks(data);
    // если задача на день и без проекта, то её отображать и в inbox, иначе тут и в проетке
    // возможно сделать запрос к проектам еще
}

function upcoming() { // недоделано
    // закрытие иных названий вкладок
    $(".upcoming").show();
    $(".inbox").hide();
    $(".today").hide();

    // формируем набор данных
    const now = new Date();
    const date = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
    // checkTasks(4, 'TASKS', date);
}

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
            alert("Получено");
        }
        else {
            alert("Ничего ...");
        };
    } else {
        alert("Ошибка" + response.status);
    };
}

// получение куки
function getCookie(request, name) {
    let matches = request.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}