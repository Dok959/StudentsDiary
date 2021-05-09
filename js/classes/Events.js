class Events {
    constructor({ events = []} = {}) {
        this.events = events;
    }

    addEvent(element) {
        this.events.push(new Event(element));
    };

    clearEvents({ events = []} = {}) {
        this.events = events;
    }

    getIdEvent(id) {
        for (let element = 0; element < this.events.length; element += 1) {
            if (this.events[element].id === id) {
                return this.events[element];
            }
        }
        return false;
    };

    // todo
    localUpdateEvent(id, title, description, date, time, period) {
        id = Number.parseInt(id, 10);
        const task = this.getIdTask(id);
        title ? task.setTitle(title) : null;
        description ? task.setDescription(description) : null;
        time ? task.setTime(time) : null;
        period ? task.setPeriod(period) : null;

        let oldDate = task.getDate();
        if (oldDate !== date){
            try{
                oldDate = new Date(oldDate).getDay();
                const count = Number.parseInt(document.getElementById(`count-day-${oldDate}`).textContent, 10);
                document.getElementById(`count-day-${oldDate}`).textContent = count - 1;
            } catch (error) {
                /* empty */
            }

            date ? task.setDate(date) : null;
            removeDashbordTask(id);

            // проверка сильного изменения сроков
            if (date === null){
                taskList.renderTasks([task]);
                // this.localDeleteTask(id);
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
            removeDashbordTask(id);
            taskList.renderTasks([task]);
        }
    };

    // todo
    localDeleteEvent(id) {
        try {
            let node = document.getElementById(id).parentNode.parentNode;
            node = node.getElementsByClassName('date-title').item(2);
            const count = Number.parseInt(node.textContent, 10);
            node.textContent = count - 1;
        } catch (error) {
            /* empty */
        }

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