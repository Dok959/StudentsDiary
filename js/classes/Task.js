class Task {
    constructor({
        id, idOwner, idProject = '', title = '',
        description = '', date = '', time = '', period = null,
    }) {
        this.id = id;
        this.idOwner = idOwner;
        this.idProject = idProject;
        this.title = title;
        this.description = description;
        this.date = date;
        this.time = time;
        this.period = period;
    }

    getTitle() {
        return this.title;
    }

    setTitle(title) {
        this.title = title;
    }

    setDescription(description) {
        this.description = description;
    }

    getDate() {
        return this.date;
    }

    setDate(date) {
        this.date = date;
    }

    setTime(time) {
        this.time = time;
    }

    setPeriod(period) {
        this.period = period;
    }

    getPeriod() {
        return this.period;
    }
}