import React, { useState, useEffect } from "react";
import axios from "axios";
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null); // id de la tâche en édition
  const [editingTitle, setEditingTitle] = useState(""); // nouveau titre temporaire

  const fetchTasks = () => {
    axios.get("http://localhost:5000/tasks")
      .then(res => setTasks(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Ajouter une tâche
  const addTask = () => {
    if (!newTitle.trim()) {
      setMessage("Le titre ne peut pas être vide !");
      return;
    }

    axios.post("http://localhost:5000/tasks", { title: newTitle })
      .then(res => {
        setTasks([...tasks, res.data]);
        setNewTitle("");
        setMessage(`Tâche ajoutée : ${res.data.title}`);
      })
      .catch(err => {
        console.error(err);
        setMessage("Erreur lors de l'ajout !");
      });
  };

  // Supprimer une tâche
  const deleteTask = (id) => {
    axios.delete(`http://localhost:5000/tasks/${id}`)
      .then(() => setTasks(tasks.filter(task => task.id !== id)))
      .catch(err => console.error(err));
  };

  // Commencer l'édition
  const startEditing = (task) => {
    setEditingId(task.id);
    setEditingTitle(task.title);
  };

  // Sauvegarder la modification
  const saveEditing = (id) => {
    if (!editingTitle.trim()) {
      setMessage("Le titre ne peut pas être vide !");
      return;
    }

    axios.put(`http://localhost:5000/tasks/${id}`, { title: editingTitle })
      .then(res => {
        setTasks(tasks.map(t => t.id === id ? res.data : t));
        setEditingId(null);
        setEditingTitle("");
        setMessage(`Tâche modifiée : ${res.data.title}`);
      })
      .catch(err => {
        console.error(err);
        setMessage("Erreur lors de la modification !");
      });
  };

  return (
    <div>
      <h1>Liste des tâches</h1>

      <div>
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

      <table className='task-table'>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Complétée</th>
            <th colSpan={2}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task.id}>
              <td>{task.id}</td>
              <td>
                {editingId === task.id ? (
                  <input 
                    value={editingTitle} 
                    onChange={(e) => setEditingTitle(e.target.value)} 
                  />
                ) : (
                  task.title
                )}
              </td>
              <td>{task.completed ? "oui" : "non"}</td>
              <td>
                {editingId === task.id ? (
                  <button onClick={() => saveEditing(task.id)}>Sauvegarder</button>
                ) : (
                  <button className="edit-btn" onClick={() => startEditing(task)}>Modifier</button>
                )}
              </td>
              <td>
                <button className="delete-btn" onClick={() => deleteTask(task.id)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
