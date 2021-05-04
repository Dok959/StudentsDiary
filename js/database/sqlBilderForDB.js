const pool = require('./pool');

// flag = true ищет в списке друзей; false - всех
async function parseListUsers(flag, elements = {}, idNoOwner = null) {
    const response = {}

    if (Object.keys(elements).length > 0 && flag === true){
        for (key in elements) {
            if ({}.hasOwnProperty.call(elements, key)) {
                const data = {
                    code: 4,
                    table: 'SETTINGS',
                    idOwner: elements[key].idSender === idNoOwner ?
                        elements[key].idRecipient : elements[key].idSender,
                };

                const result = await buildingQueryForDB(data);
                const element = result[0];
                response[key] = element;
                // renderListUsers(elements)
            }
        }
        // !

        // Object.keys(elements).forEach((key) = async () => {
        //     console.log('+')
        //     console.log(key)
        //     console.log(elements[key]);
        //     console.log(elements[key].idSender === idNoOwner)
        //     const data = JSON.stringify({
        //         code: 4,
        //         table: 'SETTINGS',
        //         idOwner: elements[key].idSender === idNoOwner ?
        //             elements[key].idSender : elements[key].idRecipient,
        //     });
        //     console.log(data)

        //     const result = await buildingQueryForDB(data)
        //     console.log(result)
        //     // renderListUsers(elements)
        // });
    }
    else if (Object.keys(elements).length > 0 && flag === false){
        for (key in elements) {
            if ({}.hasOwnProperty.call(elements, key)) {
                response[key] = elements[key];
            }
        }

        // for (key in elements) {
        //     if ({}.hasOwnProperty.call(elements, key)) {
        //         const data = {
        //             code: 4,
        //             table: 'SETTINGS',
        //             idOwner: elements[key].idSender === idNoOwner ?
        //                 elements[key].idRecipient : elements[key].idSender,
        //         };

        //         const result = await buildingQueryForDB(data);
        //         const element = result[0];
        //         response[key] = element;
        //         // renderListUsers(elements)
        //     }
        // }
    }
    else if (flag === true){
        response.title = 'Список друзей пуст';
    }
    else{
        response.title = 'Пользователь не обнаружен';
    }
    // console.log(response)

    return response;
}

// code: 1 - insert, 2 - update, 3 - delete, 4 - select
// eslint-disable-next-line consistent-return
buildingQueryForDB = async (args) => {
    let query = '';
    let request; let response;
    let result = {};
    if (args.code === 1) {
        args.code = 4;
        request = await buildingQueryForDB(args);
        if (request[0] === undefined) {
            // если записи не существует
            query = `INSERT INTO ${args.table} () VALUES (`;

            if (args.table === 'USERS' || args.table === 'TASKS' || args.table === 'INVITE_TO_FRIENDS' || args.table === 'FRIENDS') {
                // геренация id пользователя
                query += 'DEFAULT, ';
            }

            for (const element in args) {
                // формирование запроса
                if (
                    element === 'idProject' ||
                    element === 'date' ||
                    element === 'time' ||
                    element === 'period'
                ) {
                    if (args[element] === null) {
                        query += `DEFAULT, `;
                    } else {
                        query += `'${args[element]}', `;
                    }
                } else if (
                    element !== 'code' &&
                    element !== 'table' &&
                    element !== 'id'
                ) {
                    query += `'${args[element]}', `;
                }
            }

            if (args.table === 'HISTORY') {
                // геренация количества выполненных задач
                query += 'DEFAULT, ';
            }

            query = query.substring(0, query.length - 2);
            query += ');';

            console.log(`Запрос на добавление: ${query}`);
            // выполняем запрос к базе и обрабатываем результат
            await pool.execute(query);

            // если создаётся пользователь, то создастся информация о его настройках
            if (args.table === 'USERS') {
                request = await buildingQueryForDB(args);
                response = JSON.parse(JSON.stringify(request[0]));
                const idOwner = response.id;
                query =
                    `INSERT INTO SETTINGS () VALUES (${idOwner}, DEFAULT, DEFAULT, DEFAULT, DEFAULT,
                        DEFAULT, DEFAULT, DEFAULT, DEFAULT);`;
                await pool.execute(query);

                return buildingQueryForDB(args);
            }
            // если создалась запись об активности, то происходит проверка повторяемости задачи
            if (args.table === 'HISTORY') {
                args.code = 3;
                args.table = 'TASKS';
                return buildingQueryForDB(args);
            }

            result.el = undefined;
            return result;
        }

        // если запись об активности уже есть
        if (args.table === 'HISTORY') {
            args.count = request[0].count + 1;
            args.code = 2;
            return buildingQueryForDB(args);
        }
        return request;
    }
    if (args.code === 2) {
        // только для таблицы настроек
        // требуется приписка лимит, так как нет первичного ключа.
        // UPDATE SETTINGS SET first_name = 'Doktor' where idOwner = 12 Limit 1

        query = `UPDATE ${args.table} SET `;

        for (const element in args) {
            if (
                element !== 'code' &&
                element !== 'table' &&
                element !== 'id' &&
                element !== 'idOwner'
            ) {
                const iSValue = args[element];
                if (element === 'group') {
                    if (iSValue !== null){
                        query += `\`group\` = '${iSValue}', `;
                    }
                    else{
                        query += `\`group\` = DEFAULT, `;
                    }
                }
                else if (iSValue === null || iSValue === '') {
                    query += `${element} = DEFAULT, `;
                }
                else {
                    query += `${element} = '${iSValue}', `;
                }
            }
        }

        query = query.substring(0, query.length - 2);

        if (args.table === 'HISTORY') {
            query += ` WHERE idOwner = '${args.idOwner}' and date = '${args.date}';`;
        }
        else if (args.table === 'SETTINGS') {
            query += ` WHERE idOwner = '${args.idOwner}';`;
        }
        else {
            query += ` WHERE id = '${args.id}';`;
        }
        console.log(`Запрос на обновление: ${query}`);
        request = await pool.execute(query);

        if (args.table === 'HISTORY') {
            // проверка периодчиности и удаление выполненной задачи
            delete args.count;
            delete args.date;
            args.code = 3;
            args.table = 'TASKS';

            return buildingQueryForDB(args);
        }

        result.el = undefined;
        return result;
    }
    if (args.code === 3) {
        // проверка повторимости задач
        if (args.table === 'TASKS') {
            args.code = 4;
            result = await buildingQueryForDB(args);

            // если повторяется задача
            if (result[0].period !== null) {
                args.code = 4;
                args.table = 'REPETITION';
                const taskId = args.id;
                const {idOwner} = args;
                let date = new Date(result[0].date);
                delete args.idOwner;
                args.id = result[0].period;

                result = await buildingQueryForDB(args);

                // определяем периодичность
                if (result[0].period !== null) {
                    const {frequency, period } = result[0];

                    // увеличение даты
                    if (frequency === 2 && period === 1) {
                        date.setDate(date.getDate() + 2);
                    } else if (period === 1) {
                            date.setDate(date.getDate() + 1);
                        } else if (period === 2) {
                            date.setDate(date.getDate() + 7);
                        } else if (period === 3) {
                            date.setMonth(date.getMonth() + 1);
                        } else if (period === 4) {
                            date.setFullYear(date.getFullYear() + 1);
                        }

                    // определение новой даты
                    const year = date.getFullYear();
                    let month = date.getMonth() + 1;
                    if (month < 9) {
                        month = `0${month}`;
                    }
                    let day = date.getDate();
                    if (day < 10) {
                        day = `0${day}`;
                    }
                    date = `${year}-${month}-${day}`;

                    args.code = 2;
                    args.table = 'TASKS';
                    args.id = taskId;
                    args.idOwner = idOwner;
                    args.date = date;

                    // обновление задачи, так она повторяется
                    return buildingQueryForDB(args);
                }
            }
        }

        query = `DELETE FROM ${args.table} WHERE `;

        for (const element in args) {
            if (element !== 'code' && element !== 'table' && element !== 'flag') {
                const iSValue = args[element];
                if (iSValue === null) {
                    query += `${element} is ${iSValue} and `;
                } else {
                    query += `${element} = '${iSValue}' and `;
                }
            }
        }
        query = query.substring(0, query.length - 5);
        query += ';';
        console.log(`Запрос на удаление: ${query}`);

        request = await pool.execute(query);

        if (Object.prototype.hasOwnProperty.call(args, 'flag') && args.flag === true){
            args.code = 1;
            args.table = 'FRIENDS';
            delete args.flag;
            return buildingQueryForDB(args);
        }
        result.el = undefined;
        return result;
    }
    if (args.code === 4) {
        // получение названий полей в искомой таблице
        query = `SHOW columns FROM ${args.table};`;

        request = await pool.execute(query);
        // парсинг результата и взятие 0 массива
        response = JSON.parse(JSON.stringify(request[0]));

        const fields = new Array(); // массив для полей таблицы

        // перебор полей таблицы
        Object.keys(response).forEach((key) => {
            fields.push(`${response[key].Field}`);
        });

        // формирование основного запроса
        query = `SELECT * FROM ${args.table} WHERE`;
        fields.forEach((element) => {
            if (Object.prototype.hasOwnProperty.call(args, element)) {
                if (element !== 'idSender' && element !== 'idRecipient' && element !== 'flag' && element !== 'addressee'){
                    const iSValue = args[element];
                    if (iSValue === null) {
                        query += ` ${element} is ${iSValue} and`;
                    } else {
                        query += ` ${element} = '${iSValue}' and`;
                    }
                }
            }
        });

        if (Object.prototype.hasOwnProperty.call(args, 'startDate') &&
            Object.prototype.hasOwnProperty.call(args, 'endDate')) {
            query += ` date BETWEEN '${args.startDate}' and '${args.endDate}' and`;
        }
        else if (Object.prototype.hasOwnProperty.call(args, 'dateFirst') &&
            Object.prototype.hasOwnProperty.call(args, 'dateSecond')) {
            query += ` date is ${args.dateFirst} or date <= '${args.dateSecond}' and`;
        }
        else if (Object.prototype.hasOwnProperty.call(args, 'idSender') &&
            Object.prototype.hasOwnProperty.call(args, 'idRecipient') &&
            Object.prototype.hasOwnProperty.call(args, 'addressee')) {
            query += ` (idSender = ${args.idSender} and idRecipient = ${args.addressee}) or (idSender = ${args.addressee} and idRecipient = ${args.idSender}) and`;
        }
        else if (Object.prototype.hasOwnProperty.call(args, 'idSender') &&
            Object.prototype.hasOwnProperty.call(args, 'idRecipient')) {
            query += ` idSender = ${args.idSender} and idRecipient = ${args.idRecipient} and`;
        }
        else if (Object.prototype.hasOwnProperty.call(args, 'idRecipient')) {
            query += ` idRecipient = ${args.idRecipient} and`;
        }
        query = query.substr(0, query.length - 4);
        // сортировка по возрастанию дат
        if (args.table === 'TASKS' && (args.date !== null || args.startDate !== undefined)) {
            query += ' ORDER BY date, - time DESC';
        }

        query += ';';
        console.log(`Запрос на поиск: ${query}`);

        request = await pool.execute(query);
        response = JSON.parse(JSON.stringify(request[0]));

        if (response.length === 0) {
            if (args.flag !== undefined){
                return parseListUsers(args.flag);
            }

            result.el = undefined;
            return result;
        }

        Object.keys(response).forEach((key) => {
            result[key] = response[key];
        });

        if (args.flag !== undefined){
            return parseListUsers(args.flag, result, Number.parseInt(args.idSender || args.idRecipient, 10));
        }

        return result;
    }
}

module.exports = buildingQueryForDB;
