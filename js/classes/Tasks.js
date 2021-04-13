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

    getIdTask(id) {
        for (let element = 0; element < this.tasks.length; element += 1) {
            if (this.tasks[element].id === id) {
                return this.tasks[element];
            }
        }
        return false;
    };

    async localUpdateTask(id, title, description, date, time, period) {
        id = Number.parseInt(id, 10);
        const task = await this.getIdTask(id);
        title ? task.setTitle(title) : null;
        description ? task.setDescription(description) : null;
        time ? task.setTime(time) : null;
        period ? task.setPeriod(period) : null;

        const oldDate = task.getDate();
        if (oldDate !== date){
            date ? task.setDate(date) : null;
            removeDashbordTask(id);

            // проверка сильного изменения сроков
            if (date === null){
                this.localDeleteTask(id);
            }
            else{
                const startDate = new Date(new Date().setHours(0, 0, 0, 0));
                const endDate = new Date().setDate(startDate.getDate() + 6);
                date = new Date(date);

                if (startDate <= date && date <= endDate){
                    taskList.renderTasks([task]);
                }
                else{
                    this.localDeleteTask(id);
                }
            }
        }
    };

    localDeleteTask(id) {
        let index;
        for (let element = 0; element < this.tasks.length; element += 1) {
            if (this.tasks[element].id === id) {
                index = element;
                break;
            }
        }
        this.tasks.splice(index, 1);
        closeOpenWindow();
    };
}