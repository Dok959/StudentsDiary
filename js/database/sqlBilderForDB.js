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
            query = `INSERT INTO ${args.table} () VALUES (DEFAULT`;

            for (let element in args) {
                if (element !== 'code' && element !== 'table') {
                    query += `, '${args[element]}'`;
                };
            };
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
            }

            return buildingQueryForDB(args);
        }
        else { // если запись уже есть
            return request;
        };
    }
    else if (args.code === 2) {
        // только для таблицы настроек
        // требуется приписка лимит, так как нет первичного ключа.
        //UPDATE SETTINGS SET first_name = 'Doktor' where id_owner = 12 Limit 1

        query = `UPDATE ${args.table} SET `;

        for (let element in args) {
            if (element !== 'code' && element !== 'table' && element !== 'id') {
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
        query += ` WHERE id = '${args.id}';`;

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
                        query += ` ${element} < '${iSValue}' and`;
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

        // let result = {};

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