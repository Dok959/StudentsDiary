const pool = require('./pool');


// code: 1 - insert, 2 - update, 3 - delete, 4 - select
async function buildingQueryForDB(args) {
    let query = '';
    let request, response;
    if (args.code === 1){
        args.code = 4;
        request = await buildingQueryForDB(args);
        if (request[0] === undefined){ // если записи не существует
            query = `INSERT INTO ${args.table} () VALUES (DEFAULT`;

            for (let element in args) {
                if (element !== 'code' && element !== 'table'){
                    query += `, '${args[element]}'`;
                }
            };
            query += ');';
            console.log(query);

            // выполняем запрос к базе и обрабатываем результат
            await pool.execute(query)
                .then(result => console.log('В базу добавлена новая запись'))
                .catch(error => console.log(error));
            return buildingQueryForDB(args);
        }
        else{ // если запись уже есть
            return buildingQueryForDB(args);
        };
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
                const iSValue = eval('args.'+`${element}`);
                if (iSValue === null){
                    query += ` ${element} is ${iSValue} and`;
                }
                else{
                    query += ` ${element} = '${iSValue}' and`;
                }

            };
        });
        query = query.substr(0, query.length - 4);
        query += ';';

        let result = {};

        request = await pool.execute(query);
        response = JSON.parse(JSON.stringify(request[0]));

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

module.exports = buildingQueryForDB;