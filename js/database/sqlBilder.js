const pool = require('./pool');


// code: 1 - insert, 2 - update, 3 - delete, 4 - select
async function query(code, table, args, callback) {
    let query = '';
    if (code === 1) {
        query = `INSERT INTO ${table} () VALUES (DEFAULT`;
        args.forEach(element => {
            query += `, '${element}'`;
        });
        query += ');';
        console.log(query);
        pool.execute(query, (err, results)=>{
            if (err) { 
                throw err;
            }
            else{
                console.log('В базу добавлена новая запись');
            }
        })
        return query;
    }

    else if (code === 4) {
        // получение названий полей в искомой таблице
        query = `SHOW columns FROM ${table};`;

        // let result = {};

        pool.execute(query)
            .then( (res) => {
                // парсинг результата и взятие 0 массива
                const rows = JSON.parse(JSON.stringify(res[0]));

                let fields = new Array(); // массив для полей таблицы

                // перебор полей таблицы
                Object.keys(rows).forEach(key => {
                    fields.push(`${rows[key].Field}`);
                })

                // формирование основного запроса
                query = `SELECT * FROM USERS WHERE`;
                for (let field = 1; field < fields.length; field++) {
                    for (let element = field - 1; element < args.length; element++) {
                        query += ` ${fields[field]} = '${args[element]}' and`;
                        break;
                    }
                };
                query = query.substr(0, query.length-4);
                query += ';';

                // let result = {};

                pool.execute(query)
                    .then( (res) => {
                        // парсинг результата и взятие 0 массива
                        const rows = JSON.parse(JSON.stringify(res[0]))[0];
                        // возможно, если потребуется вернуть список элементов, то произойдет ошибка, будет вернут один

                        let result = {};
                        // перебор элементов результата
                        Object.keys(rows).forEach(key => {
                            result[key] = rows[key]
                        })

                        return result;
                    })
                
                console.log(result)
                Object.keys(result).forEach(key => {
                    console.log(key + ": " + result[key])
                })
                return result;
            })
            .catch(console.log);

        Object.keys(result).forEach(key => {
            console.log(key + ": " + result[key])
        })
        return JSON.stringify(result); // возврат на обработчик идёт отсюда
        
        // const res = await pool.execute("SELECT id FROM USERS WHERE login = 'admin'");
        // console.log(res)
        // return res;

        // pool.execute(query).then(step1);
        // pool.execute(query, step1);

        // console.log('---')
        // return { 'id': 1};
    }
}

module.exports = query;