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
        removeWindow();

        this.renderTasks(this.list.tasks);
    }

    renderTasks(tasks) {
        tasks.forEach((element) => {
            const {id} = element;
            let {title, date} = element;
            if (title.length > 70) {
                title = `${title.slice(0, 55)}...`;
            }

            if (date === null){
                date = null;
            }
            else{
                date = new Date(date);
                if (date < new Date().setDate(new Date().getDate() - 1)){
                    date = -1;
                }
                else{
                    date = date.getDay();
                }
            }

            // определяем столбец для вывода
            const taskList = document.getElementById(`day-${date}`);

            const node = `<a href="javascript:openTask(${id})" class="task list-task" id="${id}">
                    <div class="list-task-details">
                        <span class="list-task-label task-title">
                            ${title}
                        </span>
                    </div>
                </a>`;

            $(taskList).append(node);
        });
    }
}