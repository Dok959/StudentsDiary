class Bord {
    constructor({ listElements }) {
        this.list = new Tasks({});
        this.elements = {
            listElements: document.querySelector(listElements),
        };
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
        $('.task__empty').remove();
        $('.element_task').remove();

        if (this.list.tasks.length !== 0) this.renderTasks(this.list.tasks);
        else emptyTasks({ title: 'Дел на горизонте не видно' });
    }


    renderTasks(tasks) {
        let dateDay = null;
        tasks.forEach((element) => {
            // формируем и выводим разделитель на будущие даты
            if ($('.upcoming').is(':visible')) {
                if (dateDay === null || dateDay !== element.date) {
                    dateDay = new Date(element.date);
                    const day = dateDay.getDate();
                    let month = dateDay.getMonth() + 1;
                    month = month > 10 ? month : `0${month}`;
                    const year = dateDay.getFullYear();
                    const node = `<li class="element_task">
                        <span><h3>Планы на ${day}.${month}.${year}</h3></span>
                    </li>`;

                    $('.bord__list').append(node);
                }
            }

            let {title} = element;
            if (title && title.length > 70) {
                title = `${title.slice(0, 55)}...`;
            }

            let {description} = element;
            if (description && description.length > 70) {
                description = `${description.slice(0, 56)}...`;
            }

            let {date} = element;
            let expired = '';
            if (date) {
                date = new Date(date);
                const year = date.getFullYear();
                const month = date.getMonth();
                const day = date.getDate();

                date =
                    `${day < 10 ? `0${day}` : day}.${month < 9 ? `0${month + 1}` : month + 1}.${year}`;

                // выделение просроченных задач
                const now = new Date();
                if (year === now.getFullYear()) {
                    if (month < now.getMonth()) {
                        expired = 'expired';
                    }
                    else if (month === now.getMonth()){
                        if (day < now.getDate()) {
                            expired = 'expired';
                        }
                    }
                }
                else if (year < now.getFullYear()){
                    expired = 'expired';
                }
            }

            const node = `<li class="element_task">
                            <article class="task ${expired}">
                                <div class="row">
                                    <a class="task__ready" href="javascript:taskReady(${
                                        element.id
                                    })">
                                        <img class="link__element__img" src="/img/ready.svg" alt="Выполнено">
                                    </a>
                                    <div class="task__wrapper">
                                        <a class="link__task" href="javascript:openTask(${
                                            element.id
                                        })">
                                            <header class="task__header">
                                                <h3 class="task__title">
                                                    ${
                                                        title || 'Без названия ...'
                                                    }
                                                </h3>
                                                <span class="task__description">
                                                    ${
                                                        description || ''
                                                    }
                                                </span>
                                            </header>
                                        </a>
                                        <time class="task__time">
                                            ${date || ''}
                                        </time>

                                    </div>
                                </div>
                            </article>
                        </li>`;

            $('.bord__list').append(node);
        });
    }
}