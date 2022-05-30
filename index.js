const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");

//middleware
app.use(cors());
app.use(express.json());

app.listen(5000, () => {
  console.log("server has started on port 5000");
});

//create a todo
app.post("/todos", async (req, res) => {
  try {
    const { description } = req.body;
    const newTodo = await pool.query(
      "INSERT INTO todo (description) VALUES($1) RETURNING *",
      [description]
    );

    res.json(newTodo);
  } catch (err) {
    console.error(err.message);
  }
});

//get all todos
app.get("/todos", async (req, res) => {
  try {
    const allTodos = await pool.query("SELECT * FROM todo");
    res.json(allTodos.rows);
  } catch (err) {
    console.error(err.message);
  }
});

//get a todo
app.get("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await pool.query("SELECT * FROM todo WHERE todo_id = $1", [
      id,
    ]);
    res.json(todo.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

app.patch("/todos/:id/add-view", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("UPDATE todo SET views=views+1 WHERE todo_id=$1", [id]);
    res.send("Update successful");
    //    res.statusCode(200).send("Update successful");
  } catch (err) {
    console.error(err.message);
    res.statusCode(500).send("Update failed");
  }
});

app.patch("/todos/:id/toggle-completed", async (req, res) => {
  console.log("res:", res);
  //console.log("req:", req);
  try {
    const result = await pool.query(
      "UPDATE todo SET completed=NOT completed WHERE todo_id=$1",
      [req.params.id]
    );
    console.log("result from update:", result.rows);
    const todo = await pool.query("SELECT * FROM todo WHERE todo_id = $1", [
      req.params.id,
    ]);
    res.json(todo.rows[0]);
  } catch (error) {
    console.log(error.stack);
    console.error(error.message);
    res.statusCode(500).send("Update failed");
  }
});
