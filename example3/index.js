const express = require("express");
const app = express();
const PORT = 3000;
const connection = require("./databases");
const md5 = require("md5");
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
connection.init();

app.get("/", (req, res) => {
  res.json({ msg: "Example 2: Hello world from express" });
});

app.get("/users", async (req, res, next) => {
  try {
    const resp = await connection.getAllUsers();
    res.json({
      msg: "success",
      data: resp,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/users/:id", async (req, res, next) => {
  try {
    const resp = await connection.getUser(req.params.id);
    if (Object.prototype.toString.call(resp) === "[object Array]") {
      if (resp.length < 1) {
        res.status(400).json({ error: "User not found." });
        return;
      }
    }
    res.json({
      msg: "success",
      data: resp,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/users", async (req, res, next) => {
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

  try {
    const data = {
      name: req.body.name,
      username: req.body.username,
      password: md5(req.body.password),
    };
    await connection.createUser(data);

    res.json({
      data,
      msg: "success",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.patch("/users/:id", async (req, res, next) => {
  const data = {
    name: req.body.name,
    username: req.body.username,
    password: req.body.password ? md5(req.body.password) : null,
  };

  try {
    await connection.updateUser(req.params.id, data);
    res.json({
      msg: "success",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/users/:id", async (req, res, next) => {
  if (!req.body.password) {
    res.status(400).json({ error: "Password not fill in." });
    return;
  }

  try {
    const user = await connection.getUser(req.params.id);
    if (Object.prototype.toString.call(user) === "[object Array]") {
      if (user.length < 1) {
        res.status(400).json({ error: "User not found." });
        return;
      }

      const hashed = md5(req.body.password);
      if (hashed !== user[0].password) {
        res.status(400).json({
          error: "Password not matched.",
        });
        return;
      }

      await connection.deleteUser(req.params.id);
      res.json({ msg: "User has deleted." });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () =>
  console.log(`Server is running at http://127.0.0.1:${PORT}/`)
);
