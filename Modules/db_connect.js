const mysql = require('mysql2');

const pool = mysql.createPool({
  // 名字怎樣都可以
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5,
  // 最大連線數
  queueLimit: 0,
  // 允許排隊人數
});

module.exports = pool.promise();
	// exports，這邊記得要用mysql2的promise()。