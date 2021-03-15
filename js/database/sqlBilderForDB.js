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

            if (args.table === 'USERS'){
                query += 'DEFAULT, '
            }

            for (let element in args) {
                if (element !== 'code' && element !== 'table' && element !== 'id') {
                    query += `'${args[element]}', `;
                };
            };

            if (args.table === 'HISTORY'){
                query += 'DEFAULT, '
            }

            query = query.substring(0, query.length - 2);
            query += ');';

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
            
            return result.el = undefined;
        }
        else { // если запись уже есть
            if (args.table === 'HISTORY'){
                args.count = request[0].count + 1;
                args.code = 2;
                return buildingQueryForDB(args);
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
                if (iSValue === null) {
                    query += `${element} is ${iSValue}, `;
                }
                else {
                    query += `${element} = '${iSValue}', `;
                }
            };
        };
        query = query.substring(0, query.length - 2);
        if (args.table === 'HISTORY') {
            query += ` WHERE id_owner = '${args.id_owner}' and date = '${args.date}';`;
        }
        else{
            query += ` WHERE id = '${args.id}';`;
        }

        request = await pool.execute(query);

        if (args.table === 'HISTORY') {
            delete args.count;
            args.code = 3;
            args.table = 'TASKS';
            
            return buildingQueryForDB(args);
        }

        result.el = undefined;
        return result;
    }
    else if (args.code === 3) {
        
        if (args.table === 'TASKS'){
            console.log(args);

            return result.el = undefined;
            // не доделано
        }

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
        console.log(query)

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
        query += ';';

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