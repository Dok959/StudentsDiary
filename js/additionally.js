// Получение задач на неделю
function gettingListTasks(){
    // определение сроков
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    // формирование начальной даты
    const date = `${year}-${month}-${day}`;

    // формируем набор данных
    const data = JSON.stringify({
        code: 4,
        table: 'TASKS',
        idOwner: cookie,
        idProject: null,
        dateFirst: null,
        dateSecond: date,
    });

    taskList.list.clearTasks();
    removeWindow('.list-task');
    taskList.getTasks(data);
}

// Действия при полной загрузке странцы
document.addEventListener('DOMContentLoaded', () => {
    gettingListTasks();
})