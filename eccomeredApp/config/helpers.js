let Mysqli = require('mysqli')
 
// Incoming json
let conn = new Mysqli({
  host : 'localhost' , //  IP/domain name  
  post : 3306 , // Port, default 3306  
  user : 'root' , // user name  
  passwd : '' , // password   
  db : 'angularecommerce' //The  database can be specified or not [optional]  
})

let db = conn.emit(false, '');

module.exports = {
    database: db
};