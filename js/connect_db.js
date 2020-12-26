const mysql = require("mysql2");
 
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: 'studentsdiary'
});
 
function con(){
    connection.query("Select count(*) from users",
    function(err, results) {
      if(err) console.log(err);
      else console.log(results);
    });
   
    connection.end();
}
