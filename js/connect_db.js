const pool = require('./database/pool')

let query = 'SELECT Count(*) FROM users'

console.log(process.cwd())

pool.query(query, (err, results, fields)=>{
    console.log(err)
    console.log(results)
    //console.log(fields)
})

pool.execute('SELECT Count(*) FROM users',
  function(err, results, fields) {
    console.log(err)
    console.log(results) // собственно данные
    //console.log(fields) // мета-данные полей 
});
   
// connection.end()
