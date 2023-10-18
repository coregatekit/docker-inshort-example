const mysql = require("mysql2");
const waitPort = require("wait-port");

let pool;

async function init() {
  const host = process.env.MYSQL_HOST || "localhost";
  await waitPort({
    host,
    port: 3306,
    timeout: 10000,
    waitForDns: true,
  });

  pool = mysql.createConnection({
    connectionLimit: 5,
    host: host,
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASS || "secret_pw",
    database: process.env.MYSQL_DB || "example3",
    charset: "utf8mb4",
  });

  return new Promise((acc, rej) => {
    pool.query(
      `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      name varchar(100),
      username varchar(100),
      password varchar(100),
      CONSTRAINT username_unique UNIQUE (username)
    )`,
      (err) => {
        if (err) return rej(err);
        console.log("Connected to databases.");
        acc(pool);
      }
    );
  });
}

async function getAllUsers() {
  return new Promise((acc, rej) => {
    pool.query(`select * from users`, (err, rows) => {
      if (err) return rej(err);
      acc(rows);
    });
  });
}

async function getUser(id) {
  return new Promise((acc, rej) => {
    pool.query(`select * from users where id = ? limit 1`, [id], (err, row) => {
      if (err) return rej(err);
      acc(row);
    });
  });
}

async function createUser(data) {
  return new Promise((acc, rej) => {
    const sql = "INSERT INTO users (name, username, password) VALUES (?,?,?)";
    pool.query(sql, [data.name, data.username, data.password], (err, row) => {
      if (err) return rej(err);
      acc(row);
    });
  });
}

async function updateUser(id, data) {
  return new Promise((acc, rej) => {
    const sql =
      "UPDATE users set name = COALESCE(?, name), username = COALESCE(?,username), password = COALESCE(?,password) WHERE id = ?";
    pool.query(
      sql,
      [data.name, data.username, data.password, id],
      (err, result) => {
        if (err) return rej(err);
        acc(result);
      }
    );
  });
}

async function deleteUser(id) {
  return new Promise((acc, rej) => {
    const sql = "DELETE FROM users WHERE id = ?";
    pool.query(sql, [id], (err, row) => {
      if (err) return rej(err);
      acc();
    })
  });
}

module.exports = {
  init,
  getUser,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
};
