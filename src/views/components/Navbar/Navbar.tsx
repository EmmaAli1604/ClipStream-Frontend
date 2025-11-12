import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar" style={{ position: "fixed", top: 0, left: 0,  zIndex: 1000 }}>
      <div className="navbar-content">
        <Link to="/" className="logo" style={{ textDecoration: "none", color: "inherit" }}>
          <h1 className="navbar-logo">ClipStream</h1>
        </Link>
        <ul className="navbar-links">
          <li><Link to="/home">Inicio</Link></li> 
        </ul>
      </div>
    </nav>
  );
}
