class FetchData {
    getResourse = async (url, options) => {
        const res = await fetch(url, options);

        if (!res.ok) {
            throw new Error('Произошла ошибка: ' + res.status);
        }

        // не уверен, что тут не упадёт если не будет базы
        return res.json();
    }

    getElements = data => this.getResourse('./database/buildingQueryForDB', {
        method: 'POST',
        body: data,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })
}

class Bord {
    constructor({ listElements }) {
        this.fetchData = new FetchData();
        this.list = new Tasks({});
        this.elements = {
            listElements: document.querySelector(listElements)
        };
    }

    getTasks(data) {
        this.fetchData.getElements(data)
            .then(data => {
                for (let element in data) {
                    this.list.addTask(data[element])
                };
                this.showTasks()
            });
    }

    showTasks() {
        $('.task__empty').remove();
        $('li').remove();

        if (this.list.tasks.length !== 0)
            this.renderTasks(this.list.tasks);
        else
            emptyTasks({ title: 'Дел на горизонте не видно' });
    }

    // доработать
    renderTasks(tasks) {
        tasks.forEach((element) => {

            let title = element.title;
            if (title && title.length > 70) {
                title = title.slice(0, 60) + '...';
            }

            let description = element.description;
            if (description && description.length > 70) {
                description = description.slice(0, 60) + '...';
            }

            let date = element.date;
            if (date) {
                date = date.slice(8, 10) + '.' + date.slice(5, 7) + '.' + date.slice(0, 4);
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
                                                    ${title ? title : 'Без названия ...'}
                                                </h3>
                                                <span class="task__description">
                                                    ${description ? description : ''}
                                                </span>
                                            </header>
                                        </a>
                                        <time class="task-author__add task__date">
                                            ${date ? date : ''}
                                        </time>
                                        <a class="task__more" href="#">
                                            <img class="link__element__img" src="/img/pac1/more1.svg" alt="Дополнительно">
                                        </a>
                                    </div>
                                </div>
                            </article>
                        </li>`;

            $('.bord__list').append(node);
        })
    }
};

class Tasks {
    constructor({ tasks = [] } = {}) {
        this.tasks = tasks;
    }

    addTask = element => {
        this.tasks.push(new Task(element));
    }

    clearTasks({ tasks = [] } = {}) {
        this.tasks = tasks;
    }
}

class Task {
    constructor({ id, id_owner, id_project = '', title = '', description = '', date = '' }) {
        this.id = id;
        this.id_owner = id_owner;
        this.id_project = id_project;
        this.title = title;
        this.description = description;
        this.date = date;
    };

    getTitle() {
        return this.title;
    };

    setTitle(title) {
        this.title = title;
    };
};


function openTask(id) {
    bord.tasks.forEach(element => {
        if (element.id === id) {
            console.log(element.title);
        }
    })
}


const taskList = new Bord({
    listElem: '.bord__list'
})