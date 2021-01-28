function inbox(){
    checkTasks(4, 'TASKS', null);
}

function today(){
    const now = new Date();
    const date = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
    checkTasks(4, 'TASKS', date);
}

// может передавать код вкладки, задачи которой нужны 
async function checkTasks(code, table, date) {

    // сериализуем данные в json
    let data = JSON.stringify({
        'code': code,
        'table': table,
        'id_owner': getCookie(document.cookie, 'USER'),
        'date': date
    });
    // let data = JSON.stringify({  // работает, значит это универсальный select для любой таблицы
    //     'code': code,
    //     'table': 'USERS',
    //     'login': 'admin',
    //     'password': 'admin'
    // });
    console.log(data)

    let response = await fetch('./database/sqlBilderForTasks', {
        method: 'POST',
        body: data,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })

    // if (response.ok) { // если HTTP-статус в диапазоне 200-299
    //     const result = await response.json();
    //     console.log(result);
    //     if (result.id) {
    //         alert("Получено");
    //     }
    //     else {
    //         alert("Ничего ...");
    //     }
    // } else {
    //     alert("Ошибка" + response.status);
    // };
}

// получение куки
function getCookie(request, name) {
    let matches = request.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}