const mariadb = require("mariadb");
require("dotenv").config();

// ✅ MariaDB 연결 풀 생성
const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10, //동시에 최대 10명 접속 가능
});

module.exports = pool;
