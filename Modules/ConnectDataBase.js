const mySql = require("mysql2");
const pool = mySql.createPool({
    host: process.env.DB_HOST,
    user:  process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10, // 最大連線數
    queueLimit: 0 //排隊限制
})
module.exports =  pool.promise();