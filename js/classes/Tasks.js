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

    localUpdateTask(id, title, description, date, time, period) {
        id = Number.parseInt(id, 10);
        const task = this.getIdTask(id);
        task.setTitle(title)
        task.setDescription(description)
        task.setTime(time)
        task.setPeriod(period)

        const oldDate = task.getDate();
        if (oldDate !== date){
            removeWindow();

            task.setDate(date);
            removeDashbordElement(id);

            // проверка сильного изменения сроков
            if (date === null){
                taskList.renderTasks([task]);
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
        else{
            removeDashbordElement(id);
            taskList.renderTasks([task]);
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
        removeWindow();
    };
}