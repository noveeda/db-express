require("dotenv").config();
const env = process.env;

const development = {
  username: env.DB_USER,
  //env.DB_USER은 불러오고자 하는 데이터의 키값이므로 자유롭게 이름설정이 가능하다.
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  host: env.DB_HOST,
  dialect: "mariadb",
  //port: env.mariadb_PORT
};

const production = {
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  host: env.DB_HOST,
  dialect: "mariadb",
  //port: env.mariadb_PORT
};

const test = {
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME_TEST,
  host: env.DB_HOST,
  dialect: "mariadb",
  //port: env.mariadb_PORT
};

module.exports = { development, production, test };
