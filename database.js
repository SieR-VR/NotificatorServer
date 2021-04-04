const MySql = require('mysql');

var db_info = {
    host: 'localhost',
    port: '3306',
    user: 'sier',
    password: 'shdngus0512',
    database: 'Jinsung'
}

module.exports = {
    init: function() {
        return MySql.createConnection(db_info);
    },
    connect: function(conn) {
        conn.connect(function(err) {
            if(err) console.error(err);
            else console.log('asdf');
        })
    }
}