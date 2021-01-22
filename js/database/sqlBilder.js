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

        pool.execute(query)
            .then( (res) => {
                // парсинг результата и взятие 0 массива
                var rows = JSON.parse(JSON.stringify(res[0]))[0];

                // перебор элементов
                Object.keys(rows).forEach(key => {
                    console.log(key + ': ' + rows[key])
                })

                return r;
            })
            .catch(console.log);

        // const res = await pool.execute("SELECT id FROM USERS WHERE login = 'admin'");
        // console.log(res)
        // return res;

        // pool.execute(query).then(step1);
        // pool.execute(query, step1);

        // console.log('---')
        // return { 'id': 1};


        // получение названий полей в искомой таблице
        // let fields = new Array();
        // try {
        //     let results = await pool.execute(query);
        //     console.log(results[0])

        //     for (let i = 0; i < results[0].length; i++) {
        //         console.log(results[i])
        //         fields.push(`${results[i].Field}`);
        //     }
        //     console.log(fields)

        //     // формирование основного запроса
        //     query = `SELECT * FROM ${table} WHERE`;
        //     for (let field = 1; field < fields.length; field++) {
        //         for (let element = field - 1; element < args.length; element++) {
        //             query += ` ${fields[field]} = '${args[element]}' and`;
        //             break;
        //         }
        //     };
        //     query = query.substr(0, query.length-4);
        //     query += ';';

        //     console.log(query)
        //     try {
        //         results = await pool.execute(query);

        //         console.log('+++')
        //         console.log(results[0])
        //         console.log(results[0].id)
        //         return { 'id': results[0].id};
        //         // return JSON.stringify({ 'id': results[0].id});

        //     } catch (error) {
        //         throw error;
        //     }

        // } catch (error) {
        //     throw error;
        // }
    }
}

async function step1(error, results) {
    if (error) {
        throw error;
    } else {
        let fields = new Array();
        for (let i = 0; i < results.length; i++) {
            fields.push(`${results[i].Field}`);
        }

        // формирование основного запроса
        query = `SELECT * FROM USERS WHERE`;
        // for (let field = 1; field < fields.length; field++) {
        //     for (let element = field - 1; element < args.length; element++) {
        //         query += ` ${fields[field]} = '${args[element]}' and`;
        //         break;
        //     }
        // };
        // query = query.substr(0, query.length-4);
        // query += ';';
        query += ` login = 'admin' and password = 'admin';`;
        return pool.execute(query, step2);
    }
};

async function step2(error, results) {
    if (error) { 
        throw error;
    }
    else{
        console.log('+++')
        return { 'id': results[0].id};
        // return JSON.stringify({ 'id': results[0].id});
    }
};


module.exports = query;