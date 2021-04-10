class Tasks {
    constructor({ tasks = []} = {}) {
        this.tasks = tasks;
    }

    addTask(element) {
        this.tasks.push(new Task(element));
    };

    clearTasks({ tasks = []} = {}) {
        this.tasks = tasks;
    }

    // ! Не тестировано
    getIdTask(id) {
        for (let element = 0; element < this.tasks.length; element += 1) {
            if (this.tasks[element].id === id) {
                return this.tasks[element];
            }
        }
        return false;
    };

    // ! Не тестировано
    localUpdateTask(id, title, description, date, time, period) {
        const task = this.getIdTask(id);
        task.setTitle(title);
        task.setDescription(description);
        task.setDate(date);
        task.setTime(time);
        task.setPeriod(period);

        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const day = now.getDate();
        if (date === null && $('.inbox').is(':hidden')) {
            taskList.list.localDeleteTask(id);
            $('.element__info').remove();
        } else if (year <= date.slice(0, 4)) {
            if (month <= date.slice(5, 7)) {
                if (day < date.slice(8, 10) && $('.upcoming').is(':hidden')) {
                    taskList.list.localDeleteTask(id);
                    $('.element__info').remove();
                } else if (
                    day >= date.slice(8, 10) &&
                    $('.today').is(':hidden')
                ) {
                    taskList.list.localDeleteTask(id);
                    $('.element__info').remove();
                }
                // !!! БАГ; не удаётся перерисовать дату без закрытия окна
                // else if (day == date.slice(8, 10) && $(".today").is(':visible')) {
                // $('.element__info').remove();
                // }
            }
        }

        taskList.showTasks();
    };

    // ! Не тестировано
    localDeleteTask(id) {
        let index;
        for (let element = 0; element < this.tasks.length; element += 1) {
            if (this.tasks[element].id === id) { // ==
                index = element;
                break;
            }
        }
        this.tasks.splice(index, 1);
        taskList.showTasks();
    };
}