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

    deleteTask(id) { // видимо не так
        this.tasks.pop(id)
    }

    // сделать метод очистки
    clearTasks(){ // не работает
        this.tasks.forEach(element => {
            this.tasks.deleteTask(element.id)
        })
    }

    renderTasks(){
        this.tasks.forEach(element => {

            let title = element.title;
            if (title && title.length > 70){
                title = title.slice(0, 60) + '...';
            }

            let description = element.description;
            if (description && description.length > 70){
                description = description.slice(0, 60) + '...'
            }
            
            // добавить форматирование для времени

            let node = `<li>
                            <article class="task">
                                <div class="row">
                                    <a class="task__ready" href="#">
                                        <img class="link__element__img" src="/img/pac1/ready1.png" alt="Выполнено">
                                    </a>
                                    <div class="task__wrapper">
                                        <a class="link__task" href="javascript:openTask(${element.id})">
                                            <header class="task__header">
                                                <h3 class="task__title">
                                                    ${
                                                        title ? title : 'Без названия ...'
                                                    }
                                                </h3>
                                                <span class="task__description">
                                                    ${
                                                        description ? description : ''
                                                    }
                                                </span>
                                            </header>
                                        </a>
                                        <time class="task-author__add task__date">11 января</time>
                                        <a class="task__more" href="#">
                                            <img class="link__element__img" src="/img/pac1/more1.svg" alt="Дополнительно">
                                        </a>
                                    </div>
                                </div>
                            </article>
                        </li>`;
            
            $('.bord__list').append(node);
        });
    }
}

class Bord {
    constructor({ listElements }) {
        this.tasks = new Tasks({});
        this.elements = {
            listElements: document.querySelector(listElements)
        }
    }
};

function openTask(id){
    bord.tasks.forEach(element => {
        if (element.id === id){
            console.log(element.title);
        }
    })
}