const pool = require('./pool');


// code: 1 - insert, 2 - update, 3 - delete, 4 - select
async function query(code, table, args) {
    let query = '';
    if (code === 1) {
        query = `INSERT INTO ${table} () VALUES (DEFAULT`;
        args.forEach(element => {
            query += `, '${element}'`;
        });
        query += ');';
        console.log(query);
        pool.execute(query, (err, results) => {
            if (err) {
                throw err;
            }
            else {
                console.log('В базу добавлена новая запись');
            }
        })
        return query;
    }

    else if (code === 4) {
        // получение названий полей в искомой таблице
        query = `SHOW columns FROM ${table};`;

        let request = await pool.execute(query);
        // парсинг результата и взятие 0 массива
        let response = JSON.parse(JSON.stringify(request[0]));

        let fields = new Array(); // массив для полей таблицы

        // перебор полей таблицы
        Object.keys(response).forEach(key => {
            fields.push(`${response[key].Field}`);
        });

        // формирование основного запроса
        query = `SELECT * FROM USERS WHERE`;
        for (let field = 1; field < fields.length; field++) {
            for (let element = field - 1; element < args.length; element++) {
                query += ` ${fields[field]} = '${args[element]}' and`;
                break;
            };
        };
        query = query.substr(0, query.length - 4);
        query += ';';

        let result = {};

        request = await pool.execute(query);
        response = JSON.parse(JSON.stringify(request[0]))[0];

        if (response === undefined) {
            result.el = undefined;
            return result;
        }

        Object.keys(response).forEach(key => {
            result[key] = response[key];
        });
        return result;
    }
}

module.exports = query;