function createForm() {
    const node = `<div class="window-overlay">
            <div class="window" id="window">
                <div class="window-wrapper">
                    <a href="javascript:removeWindow()" class="icon-close"></a>

                    <h3 class="card-detail-item-header">Регистрация</h3>
                    <div class="card-detail-action">
                        <label>Логин:</label>
                        <input type="text" name="login" placeholder="ElonMusk" inputmode="latin-name" autofocus required>
                        <label>Пароль:</label>
                        <input type="password" name="password" placeholder="1234567890" inputmode="verbatim" required>
                        <a id="btn" class="link-button"
                            href="javascript:registration()">Зарегистрироваться
                        </a>
                        <a id="btn" class="link-button"
                            href="javascript:swapForm()">Хотите авторизоваться?
                        </a>

                        <a id="btn" class="link-button btn-invizible"
                            href="javascript:authorization()">Авторизоваться
                        </a>
                        <a id="btn" class="link-button btn-invizible"
                            href="javascript:swapForm()">Хотите зарегистрироваться?
                        </a>
                    </div>
                </div>
            </div>
        </div>`;

    $('body').append(node);
}

function swapForm() {
    const title = document.getElementsByClassName('card-detail-item-header').item(0);
    title.textContent === 'Регистрация' ? title.innerHTML = 'Авторизация' : title.innerHTML = 'Регистрация';
    const elements = document.querySelectorAll('#btn');
    elements.forEach(element => {
        $(element).toggleClass('btn-invizible');
    })
}

function generateError(element) {
    element.classList.add('error');
}

function checkFieldsPresence(args) {
    for (let i = 0; i < args.length; i += i + 1) {
        if (!args[i].value) {
            generateError(args[i]);
        }
    }
}

function checkMask(args) {
    for (let i = 0; i < args.length; i += i + 1) {
        if (/[\\/;.'']/.test(args[i].value)) {
            generateError(args[i]);
        }
    }
}

function checkLength(args) {
    for (let i = 0; i < args.length; i += i + 1) {
        if (args[i].value.length < 5) {
            generateError(args[i]);
        }
    }
}

function removeValidation() {
    const errors = document.querySelectorAll('.error');

    for (let i = 0; i < errors.length; i += i + 1) {
        errors[i].classList.remove('error');
    }
}

async function checkErrors(code, table, args) {
    const errors = document.querySelectorAll('.error');

    if (errors.length === 0) {
        const user = JSON.stringify({
            code,
            table,
            login: args[0].value,
            password: args[1].value,
        });

        const response = await fetch('./queryForUser', {
            method: 'POST',
            body: user,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        });

        if (response.ok) {
            const result = await response.json();
            if (result[0] !== undefined) {
                setCookie('USER', result[0].id, {
                    secure: false,
                    'max-age': 3600,
                });
                setCookie('LOGIN', args[0].value, {
                    secure: false,
                    'max-age': 3600,
                });
                window.location.href = 'dashboard';
            } else {
                alert(
                    `Указанный пользователь не найден.\nПроверьте корректность данных или зарегистрируйтесь!`
                );
            }
        } else {
            alert(
                `Произошла ошибка подключения к серверу.\nКод ошибки: ${
                    response.status}`
            );
        }
    }
}

function registration() {
    const code = 1;
    const table = 'USERS';
    const login = document.getElementsByName('login').item(0);
    const password = document.getElementsByName('password').item(0);

    removeValidation();

    checkFieldsPresence([login, password]);

    checkMask([login, password]);

    checkLength([login, password]);

    checkErrors(code, table, [login, password]);
}

function authorization() {
    const code = 4;
    const table = 'USERS';
    const login = document.getElementsByName('login').item(0);
    const password = document.getElementsByName('password').item(0);

    removeValidation();

    checkFieldsPresence([login, password]);

    checkMask([login, password]);

    checkLength([login, password]);

    checkErrors(code, table, [login, password]);
}

// Закрытие окон
function removeWindow(tag = '.window-overlay') {
    const elements = document.querySelectorAll(tag);
    elements.forEach(element => {
        element.remove();
    });
}

// Проверка нажатия вне выбранной задачи
document.addEventListener('click', (event) => {
    try {
        const node = document.getElementById('window');
        if (!node.contains(event.target)) {
            removeWindow();
        }
    } catch (error) {
        /* empty */
    }
})