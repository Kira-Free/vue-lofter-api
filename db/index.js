const mysql = require('mysql')
let db=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'root',
    database:'lofter'
})
db.connect()
module.exports=db
