class Bord {
    constructor() {
        this.list = new Tasks({});
    }

    async getTasks(data) {
        await getResourse(data).then((res) => {
            for (const element in res) {
                if ({}.hasOwnProperty.call(res, element)) {
                    this.list.addTask(res[element]);
                }
            }
        });
        this.showTasks();
    }

    showTasks() {
        // скрытие областей открытых элементов
        // $('.task__empty').remove();
        // $('.element_task').remove();

        this.renderTasks(this.list.tasks);
    }


    renderTasks(tasks) {
        tasks.forEach((element) => {
            let {title, date} = element;
            if (title.length > 70) {
                title = `${title.slice(0, 55)}...`; // укоротить скорее всего
            }

            date = new Date(date).getDay();
            console.log(date)

            // нужен механизм чтобы указать столбец для вывода
            const taskList = document.getElementById(date);
            console.log(taskList)

            const node = `<a href="#" class="list-task">
                    <div class="list-task-details">
                        <span class="list-task-label">
                            Задача 5
                        </span>
                    </div>
                </a>`;

            $(taskList).append(node);
        });
    }
}