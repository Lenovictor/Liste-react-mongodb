import React, { useState } from "react";
import axios from "../axiosConfig";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleLogin = async () => {
    try {
      await axios.post("auth/login", { username, password });
      localStorage.setItem("loggedIn", "true");
      window.location.href = "/";
    } catch (err) {
      setMsg("Connexion échouée !");
    }
  };

  return (
    <div className="login-container">
      <h2>Connexion</h2>
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
      <button onClick={handleLogin}>Se connecter</button>
      {msg && <p>{msg}</p>}
    </div>
  );
}
