const express = require("express");
const app = express();
const PORT = 3000;
const db = require("./databases");
const md5 = require("md5");
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.json({ msg: "Example 2: Hello world from express" });
});

app.get("/users", (req, res, next) => {
  const sql = "select * from users";
  const params = [];
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      msg: "success",
      data: rows,
    });
  });
});

app.get("/users/:id", (req, res, next) => {
  const sql = "select * from users where id = ?";
  const params = [req.params.id];
  db.get(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: "User not found." });
      return;
    }
    res.json({
      msg: "success",
      data: row,
    });
  });
});

app.post("/users", (req, res, next) => {
  let errors = [];
  if (!req.body.password) {
    errors.push("No password specified");
  }
  if (!req.body.username) {
    errors.push("No username specified");
  }
  if (!req.body.name) {
    errors.push("No name specified");
  }
  if (errors.length) {
    res.status(400).json({ error: errors.join(",") });
    return;
  }

  const data = {
    name: req.body.name,
    username: req.body.username,
    password: md5(req.body.password),
  };
  const sql = "INSERT INTO users (name, username, password) VALUES (?,?,?)";
  const params = [data.name, data.username, data.password];
  db.run(sql, params, (err, result) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      msg: "success",
      data: data,
      id: this.lastID,
    });
  });
});

app.patch("/users/:id", (req, res, next) => {
  const data = {
    name: req.body.name,
    username: req.body.username,
    password: req.body.password ? md5(req.body.password) : null,
  };
  db.run(
    `UPDATE users set name = COALESCE(?, name), username = COALESCE(?,username), password = COALESCE(?,password) WHERE id = ?`,
    [data.name, data.username, data.password, req.params.id],
    (err, result) => {
      if (err) {
        res.status(400).json({ error: res.message });
        return;
      }
      res.json({
        msg: "success",
        data: data,
        changes: this.changes,
      });
    }
  );
});

app.delete("/users/:id", (req, res, next) => {
  if (!req.body.password) {
    res.status(400).json({ error: "Password not fill in." });
    return;
  }
  db.get(
    "SELECT * FROM users WHERE id = ?",
    [req.params.id],
    function (err, result) {
      if (err) {
        res.status(400).json({ error: res.message });
        return;
      }
      if (!result) {
        res.status(404).json({ error: "User not found." });
        return;
      }

      const hash = md5(req.body.password);
      if (hash !== result.password) {
        res.status(400).json({
          error: "Password not matched.",
        });
        return;
      }
      db.run("DELETE FROM users WHERE id = ?", req.params.id, (err, result) => {
        if (err) {
          res.status(400).json({ error: res.message });
          return;
        }
        res.json({ msg: "user has deleted", changes: this.changes });
      });
    }
  );
});

app.listen(PORT, () =>
  console.log(`Server is running at http://127.0.0.1:${PORT}/`)
);
