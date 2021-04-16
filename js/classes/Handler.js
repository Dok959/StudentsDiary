// Поиск по дате
function search() {
    // получение даты с основного поля
    let date = document.getElementsByClassName('date__picker')[0].value;

    // если активно дополнительное то получить с него
    try {
        const node = document.getElementsByClassName('search__form')[0];
        date = document.getElementsByClassName('date__picker')[1].value;
        node.setAttribute('style', 'display: none;');
    } catch (error) {
        /* empty */
    }

    $('.request_search').html(
        `Поиск на ${date.slice(8)}.${date.slice(5, 7)}.${date.slice(0, 4)}`
    );

    const data = JSON.stringify({
        code: 4,
        table: 'TASKS',
        id_owner: cookie,
        date: `=${date}`,
    });

    taskList.list.clearTasks();
    taskList.getTasks(data);
}

// Обработка формы поиска по дате
function searchForm() {
    let element = document.getElementsByClassName('search__form')[0];
    element.setAttribute('style', 'display: block;');

    let date = new Date();
    let month = date.getMonth() + 1;
    if (month < 9) {
        month = `0${month}`;
    }
    let day = date.getDate();
    if (day < 10) {
        day = `0${day}`;
    }
    date = `${date.getFullYear()  }-${month}-${day}`;
    element = document.getElementsByClassName('date__picker').item(1);
    element.setAttribute('min', `${date}`);
    element.setAttribute('value', `${date}`);
}