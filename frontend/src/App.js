import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import Tasks from "./components/Tasks";
import "./App.css";

function App() {
  const isLoggedIn = localStorage.getItem("loggedIn") === "true";

  return (
    <Router>
      <nav>
        <Link className="gest" to="/">Gestionnaire de tâches</Link>
        <div className="box" style={{display:"flex", justifyContent:"center", alignItems:"center", gap:"10px"}}>
          {!isLoggedIn && <Link className="edit-btn" to="/login" style={{textDecoration:"none", fontWeight:"bold",padding:"8px"}}> Connexion </Link>}
        {!isLoggedIn && <Link className="edit-btn" to="/register" style={{textDecoration:"none", fontWeight:"bold",padding:"8px"}}>Inscription</Link>}
        {isLoggedIn && (
          <button className="lougout-btn"
            onClick={() => {
              localStorage.removeItem("loggedIn");
              window.location.href = "/login";
            }}
          >
            Déconnexion
          </button>
        )}
        </div>
        
      </nav>

      <Routes>
        <Route path="/" element={isLoggedIn ? <Tasks /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export { App };