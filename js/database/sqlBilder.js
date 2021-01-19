const pool = require('./pool')

// code: 1 - insert, 2 - update, 3 - delete, 4 - select
function query (code, table, args){
    if (code === 1){
        let query = `INSERT INTO ${table} VALUES (${args})`
        console.log(query)
        return query
    }
}

module.exports = query;
// exports.query = {query()}