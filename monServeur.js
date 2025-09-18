const express = require("express");
const fs = require("fs");


const app = express(); 
app.use(express.json());


// Lire la base (db.json)
function readDB() {
  return JSON.parse(fs.readFileSync("db.json"));
}

// Sauver dans db.json
function writeDB(data) {
  fs.writeFileSync("db.json", JSON.stringify(data, null, 2));
}

// CREATE
app.post("/tasks", (req, res) => {
  const db = readDB();
  const newTask = { id: Date.now(), ...req.body };
  db.tasks.push(newTask);
  writeDB(db);
  res.status(201).json(newTask);
});

// READ ALL
app.get("/tasks", (req, res) => {
  const db = readDB();
  res.json(db.tasks);
});

// READ ONE
app.get("/tasks/:id", (req, res) => {
  const db = readDB();
  const task = db.tasks.find(t => t.id == parseInt(req.params.id));
  if (!task) return res.status(404).json({ message: "Task not found" });
  res.json(task);
});

// UPDATE
app.put("/tasks/:id", (req, res) => {
  const db = readDB();
  const index = db.tasks.findIndex(t => t.id == parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: "Task not found" });

  db.tasks[index] = { ...db.tasks[index], ...req.body };
  writeDB(db);
  res.json(db.tasks[index]);
});

// DELETE
app.delete("/tasks/:id", (req, res) => {
  const db = readDB();
  const index = db.tasks.findIndex(t => t.id == parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: "Task not found" });

  const deleted = db.tasks.splice(index, 1);
  writeDB(db);
  res.json(deleted[0]);
});

app.listen(5000, () => console.log("Serveur lancé sur http://localhost:5000"));
