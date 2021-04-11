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
        // скрытие открытых элементов
        closeOpenWindow();

        this.renderTasks(this.list.tasks);
    }

    renderTasks(tasks) {
        tasks.forEach((element) => {
            const {id} = element;
            let {title, date} = element;
            if (title.length > 70) {
                title = `${title.slice(0, 55)}...`;
            }

            date = new Date(date).getDay();

            // определяем столбец для вывода
            const taskList = document.getElementById(`day-${date}`);

            const node = `<a href="javascript:openTask(${id})" class="list-task">
                    <div class="list-task-details">
                        <span class="list-task-label">
                            ${title}
                        </span>
                    </div>
                </a>`;

            $(taskList).append(node);
        });
    }
}