const sqlite3 = require('sqlite3').verbose()

const DBSOURCE = 'db.sqlite'

let db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    console.error(err.message)
    throw err
  } else {
    console.log('Connected to databases.')
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name text,
      username text,
      password text,
      CONSTRAINT username_unique UNIQUE (username)
    )`)
  }
})

module.exports = db