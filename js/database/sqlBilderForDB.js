const pool = require('./pool');


// code: 1 - insert, 2 - update, 3 - delete, 4 - select
async function buildingQueryForDB(args) {
    let query = '';
    let request, response;
    let result = {};
    if (args.code === 1) {
        args.code = 4;
        request = await buildingQueryForDB(args);
        if (request[0] === undefined) { // если записи не существует
            query = `INSERT INTO ${args.table} () VALUES (`;

            if (args.table === 'USERS' || args.table === 'TASKS') { // геренация id пользователя
                query += 'DEFAULT, ';
            };

            for (let element in args) { // формирование запроса
                if (element === 'id_project' || element === 'date' || element === 'time' || element === 'period') { 
                    if (args[element] === null) {
                        query += `DEFAULT, `;
                    }
                    else {
                        query += `'${args[element]}', `;
                    }
                }
                else if (element !== 'code' && element !== 'table' && element !== 'id') {
                    query += `'${args[element]}', `;
                };
            };

            if (args.table === 'HISTORY') { // геренация количества выполненных задач
                query += 'DEFAULT, ';
            };

            query = query.substring(0, query.length - 2);
            query += ');';

            console.log('Запрос на добавление: ' + query);
            // выполняем запрос к базе и обрабатываем результат
            await pool.execute(query);

            // если создаётся пользователь, то создастся информация о его настройках
            if (args.table === 'USERS') {
                request = await buildingQueryForDB(args);
                response = JSON.parse(JSON.stringify(request[0]));
                let id_owner = response.id;
                query = `INSERT INTO SETTINGS () VALUES (` + id_owner + ', NULL, NULL, NULL, DEFAULT);';
                await pool.execute(query);

                return buildingQueryForDB(args);
            }
            // если создалась запись об активности, то происходит проверка повторяемости задачи
            else if (args.table === 'HISTORY') {
                args.code = 3;
                args.table = 'TASKS';
                return await buildingQueryForDB(args);
            };

            result.el = undefined;
            return result;
        }
        else {
            // если запись об активности уже есть
            if (args.table === 'HISTORY') {
                args.count = request[0].count + 1;
                args.code = 2;
                return await buildingQueryForDB(args);
            }
            return request;
        };
    }
    else if (args.code === 2) {
        // только для таблицы настроек
        // требуется приписка лимит, так как нет первичного ключа.
        //UPDATE SETTINGS SET first_name = 'Doktor' where id_owner = 12 Limit 1

        query = `UPDATE ${args.table} SET `;

        for (let element in args) {
            if (element !== 'code' && element !== 'table' && element !== 'id' && element !== 'id_owner') {
                const iSValue = eval('args.' + `${element}`);
                // if (iSValue === null) {
                //     query += `${element} is ${iSValue}, `;
                // }
                if (iSValue === null) {
                    query += `${element} = DEFAULT, `;
                }
                else {
                    query += `${element} = '${iSValue}', `;
                };
            };
        };

        query = query.substring(0, query.length - 2);

        if (args.table === 'HISTORY') {
            query += ` WHERE id_owner = '${args.id_owner}' and date = '${args.date}';`;
        }
        else {
            query += ` WHERE id = '${args.id}';`;
        };
        console.log('Запрос на обновление: ' + query);
        request = await pool.execute(query);

        if (args.table === 'HISTORY') { // проверка периодчиности и удаление выполненной задачи
            delete args.count;
            delete args.date;
            args.code = 3;
            args.table = 'TASKS';

            return await buildingQueryForDB(args);
        };

        result.el = undefined;
        return result;
    }
    else if (args.code === 3) {

        // проверка повторимости задач
        if (args.table === 'TASKS') {
            args.code = 4;
            result = await buildingQueryForDB(args);

            // если повторяется задача
            if (result[0].period !== null) {
                args.code = 4;
                args.table = 'REPETITION';
                let task_id = args.id;
                let id_owner = args.id_owner;
                let date = new Date(result[0].date);
                delete args.id_owner;
                args.id = result[0].period;

                result = await buildingQueryForDB(args);

                // определяем периодичность
                if (result[0].period !== null) {
                    let frequency = result[0].frequency;
                    let period = result[0].period;

                    // увеличение даты
                    if (frequency === 2 && period === 1) {
                        date.setDate(date.getDate() + 2);
                    }
                    else {
                        if (period === 1) {
                            date.setDate(date.getDate() + 1);
                        }
                        else if (period === 2) {
                            date.setDate(date.getDate() + 7);
                        }
                        else if (period === 3) {
                            date.setMonth(date.getMonth() + 1);
                        }
                        else if (period === 4) {
                            date.setFullYear(date.getFullYear() + 1);
                        };
                    };

                    // определение новой даты
                    let year = date.getFullYear();
                    let month = date.getMonth() + 1;
                    if (month < 9) {
                        month = '0' + month;
                    }
                    let day = date.getDate();
                    if (day < 10) {
                        day = '0' + day;
                    }
                    date = year + '-' + month + '-' + day;

                    args.code = 2;
                    args.table = 'TASKS';
                    args.id = task_id;
                    args.id_owner = id_owner;
                    args.date = date;

                    // обновление задачи, так она повторяется
                    return await buildingQueryForDB(args);
                }
            };
        };

        query = `DELETE FROM ${args.table} WHERE `;

        for (let element in args) {
            if (element !== 'code' && element !== 'table') {
                const iSValue = eval('args.' + `${element}`);
                if (iSValue === null) {
                    query += `${element} is ${iSValue} and `;
                }
                else {
                    query += `${element} = '${iSValue}' and `;
                }
            };
        };
        query = query.substring(0, query.length - 5);
        query += ';';
        console.log('Запрос на удаление: ' + query);

        request = await pool.execute(query);

        result.el = undefined;
        return result;
    }
    else if (args.code === 4) {
        // получение названий полей в искомой таблице
        query = `SHOW columns FROM ${args.table};`;

        request = await pool.execute(query);
        // парсинг результата и взятие 0 массива
        response = JSON.parse(JSON.stringify(request[0]));

        let fields = new Array(); // массив для полей таблицы

        // перебор полей таблицы
        Object.keys(response).forEach(key => {
            fields.push(`${response[key].Field}`);
        });

        // формирование основного запроса
        query = `SELECT * FROM ${args.table} WHERE`;
        fields.forEach(element => {
            if (args.hasOwnProperty(element)) {
                const iSValue = eval('args.' + `${element}`);
                if (iSValue === null) {
                    query += ` ${element} is ${iSValue} and`;
                }
                else {
                    if (element === 'date') {
                        if (args.table === 'HISTORY') {
                            query += ` ${element} = '${iSValue}' and`;
                        }
                        else {
                            query += ` ${element} <= '${iSValue}' and`;
                        }
                    }
                    else {
                        query += ` ${element} = '${iSValue}' and`;
                    }
                };
            };
        });
        if (args.hasOwnProperty('startDate') && args.hasOwnProperty('endDate')) {
            query += ` date BETWEEN '${args.startDate}' and '${args.endDate}' and`;
        };
        query = query.substr(0, query.length - 4);
        // сортировка по возрастанию дат
        if (args.table === 'TASKS' && (args.date !== null || args.startDate !== undefined)) {
            query += ' ORDER BY date'
        }
        query += ';';
        console.log('Запрос на поиск: ' + query);

        request = await pool.execute(query);
        response = JSON.parse(JSON.stringify(request[0]));

        if (response.length === 0) {
            result.el = undefined;
            return result;
        };

        Object.keys(response).forEach(key => {
            result[key] = response[key];
        });
        return result;
    }
}

module.exports = buildingQueryForDB;