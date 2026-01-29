import React, { useState, useEffect } from "react";
import axios from "../axiosConfig";
import "../App.css";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingCompleted, setEditingCompleted] = useState(false);

  const fetchTasks = () => {
    axios
      .get("/tasks")
      .then((res) => setTasks(res.data))
      .catch((err) => {
        console.error(err);
        if (err.response?.status === 401) {
          localStorage.removeItem("loggedIn");
          window.location.href = "/login";
        }
      });
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = () => {
    if (!newTitle.trim()) {
      setMessage("Le titre ne peut pas être vide !");
      return;
    }

    axios
      .post("/tasks", { title: newTitle })
      .then((res) => {
        setTasks([...tasks, res.data]);
        setNewTitle("");
        setMessage(`Tâche ajoutée : ${res.data.title}`);
      })
      .catch(() => setMessage("Erreur lors de l'ajout !"));
  };

  const deleteTask = (id) => {
    axios
      .delete(`/tasks/${id}`)
      .then(() => setTasks(tasks.filter((t) => t._id !== id)))
      .catch((err) => console.error(err));
  };

  const startEditing = (task) => {
    setEditingId(task._id);
    setEditingTitle(task.title);
  };

  const saveEditing = (id) => {
    if (!editingTitle.trim()) {
      setMessage("Le titre ne peut pas être vide !");
      return;
    }

    axios
      .put(`/tasks/${id}`, { title: editingTitle, completed: editingCompleted })
      .then(res => {
        setTasks(tasks.map(t => t.id === id ? res.data : t));
        setEditingId(null);
        setEditingTitle("");
        setEditingCompleted(false);
        setMessage(`Tâche mise à jour : ${res.data.title}`);
      })
      .catch(err => {
        console.error(err);
        setMessage("Erreur lors de la modification !");
      });
  };
  return (
    <div>
      <table className="task-table" align="center">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Complétée</th>
            <th colSpan={2}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task._id}>
              <td>{task._id.slice(-5)}</td>
              <td>
                {editingId === task._id ? (
                  <input
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                  />
                ) : (
                  task.title
                )}
              </td>
              <td>
               {editingId === task._id ? (
                    <select
                      value={editingCompleted}
                      onChange={(e) => setEditingCompleted(e.target.value === "true")}
                      className="select-status"
                    >
                      <option value="false">Non</option>
                      <option value="true">Oui</option>
                    </select>
                  ) : (
                    task.completed ? "Oui" : "Non"
                    
                  )}

              </td>
             
              <td>
                <button className="delete-btn" onClick={() => deleteTask(task._id)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="task-input" align="center">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Nouvelle tâche"
        />
        <button className="add-btn" onClick={addTask}>Ajouter</button>
        <button className="refresh-btn" onClick={fetchTasks}>Actualiser</button>
      </div>

      {message && <p>{message}</p>}
    </div>
  );
}

export default Tasks;
