class Task {
    constructor (param){
        this.id = param.id;
        this.id_owner = param.id_owner;
        this.id_project = param.id_project;
        this.title = param.title;
        this.description = param.description;
        this.date = param.date;
    };

    getTitle(){
        return this.title;
    };

    setTitle(title){
        this.title = title;
    };
};

class Tasks {
    constructor({ tasks = [] } = {}) {
        this.tasks = tasks;
    }

    addTask(element) {
        const task = new Task(element);
        this.tasks.push(task); // требуется добавлять в конец
    }

    deleteTask(id) {

    }
}

class Bord {
    constructor({ listElements }) {
        this.tasks = new Tasks({});
        this.elements = {
            listElements: document.querySelector(listElements)
        }
    }
}

const bord = new Bord({
    listElements: '.bord__list'
})

console.log('bord:')
console.log(bord)