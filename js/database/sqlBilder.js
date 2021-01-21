const pool = require('./pool');


// code: 1 - insert, 2 - update, 3 - delete, 4 - select
function query(code, table, args) {
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
        let addQuery = `SHOW columns FROM ${table};`;
        let fields = new Array();
        pool.execute(addQuery, (err, results)=>{
            if (err) { 
                throw err;
            }
            else{
                for (let i = 0; i < results.length; i++) {
                    fields.push(`${results[i].Field}`);
                }
            }

            // формирование основного запроса
            query = `SELECT * FROM ${table} WHERE`;
            for (let field = 1; field < fields.length; field++) {
                for (let element = field - 1; element < args.length; element++) {
                    query += ` ${fields[field]} = '${args[element]}' and`;
                    break;
                }
            };
            query = query.substr(0, query.length-4);
            query += ';';
            console.log(query);
            pool.execute(query, (err, results)=>{
                if (err) { 
                    throw err;
                }
                else{
                    console.log('Из базы получена запись');
                    console.log(results[0].id);
                }
            })
        })
        return query;
    }
}

module.exports = query;