class Bord {
    constructor() {
        this.list = new Tasks({});
        this.eventList = new Events({});
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
        let oldDay = null;
        tasks.forEach((element) => {
            const {id} = element;
            let {title, date, time} = element;
            let initialDate = null; let count = 0;
            if (title.length > 70) {
                title = `${title.slice(0, 55)}...`;
            }

            if (date === null){
                date = null;
            }
            else{
                date = new Date(date);
                if (date < new Date().setDate(new Date().getDate() - 1)){
                    initialDate = date;
                    date = -1;
                }
                else{
                    date = date.getDay();

                    try {
                        if (oldDay === null){
                            oldDay = date;
                            count = 0;
                            if (tasks.length !== 1){
                                document.getElementById(`count-day-${date}`).textContent = 0;
                            }
                        }

                        if (document.getElementById(`count-day-${date}`).textContent === 0 || oldDay !== date){
                            oldDay = date;
                            count = 0;
                        }
                        else{
                            count = Number.parseInt(document.getElementById(`count-day-${date}`).textContent > 0
                                ? document.getElementById(`count-day-${date}`).textContent : 0, 10);
                        }
                        document.getElementById(`count-day-${date}`).textContent = count + 1;
                    } catch (error) {
                        /* empty */
                    }
                }
            }

            if (time !== null){
                time = time.slice(0, 5);
            }
            if (initialDate !== null){
                const year = initialDate.getFullYear();
                let month = initialDate.getMonth() + 1;
                if (month < 10) {
                    month = `0${month}`;
                }
                let day = initialDate.getDate();
                if (day < 10) {
                    day = `0${day}`;
                }
                initialDate = `${day}.${month}.${year}`;
            }

            // определяем столбец для вывода
            const taskList = document.getElementById(`day-${date}`);
            const term = time ? `<h5 class="task-title-time">В ${time} у Вас назначено:</h5>` : '';
            const node = `<a href="javascript:openTask(${id})" class="task list-task" id="${id}">
                    <div class="list-task-details">
                        ${date === -1 ? `<h5 class="task-title-time">${initialDate} ${time ? `в ${time}`: ''} у Вас было назначено:</h5>`: term}
                        <span class="list-task-label task-title">
                            ${title}
                        </span>
                    </div>
                </a>`;

            $(taskList).append(node);
        });
    }

    async getEvents(data) {
        await getResourse(data).then((res) => {
            for (const element in res) {
                if ({}.hasOwnProperty.call(res, element)) {
                    this.eventList.addEvent(res[element]);
                }
            }
        });
        this.showEvents();
    }

    showEvents() {
        removeWindow();

        this.renderEvents(this.eventList.events);
    }

    // todo добавить ссылки на открытие, добавить стиль оформления
    renderEvents(events) {
        let oldDay = null;
        events.forEach((element) => {
            const {id} = element;
            let {title, date, time} = element;
            let count = 0;
            if (title.length > 70) {
                title = `${title.slice(0, 55)}...`;
            }

            date = new Date(date);
            date = date.getDay();

            try {
                if (oldDay === null){
                    oldDay = date;
                    count = 0;
                    if (events.length !== 1){
                        document.getElementById(`count-day-${date}`).textContent = 0;
                    }
                }

                if (document.getElementById(`count-day-${date}`).textContent === 0 || oldDay !== date){
                    oldDay = date;
                    count = 0;
                }
                else{
                    count = Number.parseInt(document.getElementById(`count-day-${date}`).textContent > 0
                        ? document.getElementById(`count-day-${date}`).textContent : 0, 10);
                }
                document.getElementById(`count-day-${date}`).textContent = count + 1;
            } catch (error) {
                /* empty */
            }

            if (time !== null){
                time = time.slice(0, 5);
            }

            // определяем столбец для вывода
            const eventsList = document.getElementById(`day-${date}`);
            const node = `<a href="#" class="event list-task" id="${id}">
                    <div class="list-task-details">
                        ${time ? `<h5 class="task-title-time">В ${time} у Вас назначено:</h5>` : ''}
                        <span class="list-task-label task-title">
                            ${title}
                        </span>
                    </div>
                </a>`;

            $(eventsList).append(node);
        });
    }
}