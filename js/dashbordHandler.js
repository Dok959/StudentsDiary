// может передавать код вкладки, задачи которой нужны 
async function checkTasks(code, table, args) {

    // сериализуем данные в json
    let user = JSON.stringify({
        'code': code,
        'table': table,
        'id_owner': document.cookie
    });
    console.log(user)
    // посылаем запрос на адрес "./database/sqlBilder"
    // let response = await fetch('./database/sqlBilder', {
    //     method: 'POST',
    //     body: user,
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Accept': 'application/json'
    //     }
    // })

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