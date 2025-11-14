import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isWelcomePage = location.pathname === "/";

  return (
    <nav className="navbar" style={{ position: "fixed", top: 0, left: 0,  zIndex: 1000 }}>
      <div className="navbar-content">
        <Link to="/" className="logo" style={{ textDecoration: "none", color: "inherit" }}>
          <h1 className="navbar-logo">ClipStream</h1>
        </Link>
        <div className="navbar-links">
          <Link to="/para-cinefilos">Para Cinéfilos</Link>
          <Link to="/para-creadores">Para Creadores</Link>
        </div>
        {!isWelcomePage && (
          <div className="navbar-auth">
            <button className="btn-secondary" onClick={() => navigate('/login')}>Iniciar Sesión</button>
            <button className="btn-primary" onClick={() => navigate('/register')}>Unirse</button>
          </div>
        )}
      </div>
    </nav>
  );
}
