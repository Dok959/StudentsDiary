async function requestToSchedule() {
    let response = new XMLHttpRequest();

    response.open('POST', 'https://raspisanie.asu.edu.ru/student/%D0%94%D0%98%D0%A241')
        // посылаем запрос
    // let response = await fetch('https://raspisanie.asu.edu.ru/student/%D0%94%D0%98%D0%A241', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Accept': 'application/json'
    //     }
    // });
    response.send()

    // 4. Этот код сработает после того, как мы получим ответ сервера
    response.onload = async function() {
        console.log(response)
        if (response.status !== 200) { // анализируем HTTP-статус ответа, если статус не 200, то произошла ошибка
            alert(`Ошибка ${response.status}`); // Например, 404: Not Found
        }
        else { // если всё прошло гладко, выводим результат
            let result = await response.response;
            let html = new DOMParser().parseFromString(result, "text/html")
                .getElementsByClassName("table_style")[0]
            // let html = $.parseHTML(result);
            console.log(html)
            // let f = html.find('table_style');
            // console.log(f)
            // let s = html.find('.table_style')
            // console.log(s)
        }
    };
}

function exit() {
    deleteCookie('USER');
    window.location.href = '/';
};