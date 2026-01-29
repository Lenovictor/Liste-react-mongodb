import React, { useState } from "react";
import axios from "../axiosConfig";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleRegister = async () => {
    try {
      await axios.post("/auth/register", { username, password });
      setMsg("Inscription réussie !");
    } catch (err) {
      setMsg("Erreur : " + (err.response?.data?.message || "Échec de l'inscription"));
    }
  };

  return (
    <div className="register-container">
      <h2>Inscription</h2>
      <input
        placeholder="Nom d'utilisateur"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        placeholder="Mot de passe"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleRegister}>S'inscrire</button>
      {msg && <p>{msg}</p>}
    </div>
  );
}
