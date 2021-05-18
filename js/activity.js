const cookie = getCookie(document.cookie, 'USER');

// Возврат к основной странице
function returnDashboard() {
    window.location.href = '/dashboard';
}

// Формирование графика
function renderActivity(date, mas = [0, 0]){
    const ctx = document.getElementById('myChart').getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Количество запланированных дел', 'Количество выполненных дел'],
            datasets: [{
                label: 'Объем планов',
                data: mas,
                backgroundColor: [
                    'rgb(30, 106, 204, 1)',
                    'rgb(0, 239, 209, 1)'
                ],
                hoverOffset: 4,
            },]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: `Активность на ${date}`
                },
            },
        }
    });
}

// Механизм запросов
async function getResourse (data) {
    options = {
        method: 'POST',
        body: data,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
    }

    const res = await fetch('./database/buildingQueryForDB', options);

    if (!res.ok) {
        throw new Error(`Произошла ошибка: ${res.status}`);
    }

    const result = await res.json()
    return result;
};

// Запросы для формирования графика
async function requestActivity() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const date = `${year}-${month}-${day}`;
    const datePrint = `${day > 9 ? day : `0${day}`}.${month > 9 ? month : `0${month}`}.${year}`;

    const task = JSON.stringify({
        code: 4,
        table: 'TASKS',
        idOwner: cookie,
        date,
    });

    const myEvent = JSON.stringify({
        code: 4,
        table: 'EVENTS',
        idOwner: cookie,
        date,
    });

    const inviteEvent = JSON.stringify({
        code: 4,
        table: 'PARTICIPANTS',
        idOwner: cookie,
        date,
    });

    const data = JSON.stringify({
        code: 4,
        table: 'HISTORY',
        idOwner: cookie,
        date,
    });

    let appointed = 0; let carriedOut = 0;
    let result = await getResourse(task);

    if (Object.keys(result).length > 0){
        appointed += Object.keys(result).length;
    }

    result = await getResourse(myEvent)
    if (Object.keys(result).length > 0){
        appointed += Object.keys(result).length;
    }

    result = await getResourse(inviteEvent)
    if (Object.keys(result).length > 0){
        appointed += Object.keys(result).length;
    }

    result = await getResourse(data)
    if (Object.keys(result).length > 0){
        carriedOut += Number.parseInt(result[0].count, 10);
    }

    renderActivity(datePrint, [appointed, carriedOut])
}

// Действия при полной загрузке странцы
document.addEventListener('DOMContentLoaded', () => {
    requestActivity();
})