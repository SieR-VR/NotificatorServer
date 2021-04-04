var router = require('express')
var app = router();

var mysql = require('mysql');
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "shdngus0512",
    database: "Jinsung"
})

connection.connect();

app.get('/', function(req, res) {
    res.send("Hello world!");
})

app.get('/203.json', function(req, res) {
    var q = "SELECT * FROM TimeTable203"
    connection.query(q, function(err, result, fields) {
        if(err) res.send(err);
        else {
            console.log(result);
            res.send(result);
        }
    }) 
})

app.listen(8888, function() {
    console.log("server starting with 8888")
})