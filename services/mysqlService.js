const mysql = require('mysql2');
const config = require('../config/config');

const pool = mysql.createPool({
  host: config.MYSQL_HOST,
  user: config.MYSQL_USER,
  password: config.MYSQL_PASSWORD,
  database: config.MYSQL_DB,
});

const getUsers = (callback) => {
  pool.query('SELECT * FROM users', (err, results) => {
    if (err) throw err;
    callback(results);
  });
};

module.exports = { getUsers };
