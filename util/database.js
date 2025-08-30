const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'tools_for_tasks',
    password: 'Kloc0004'
});

module.exports = pool.promise();