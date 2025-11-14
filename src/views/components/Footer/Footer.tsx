import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-columns">
        <div className="footer-column">
          <h4>Para Cinéfilos</h4>
          <Link to="/para-cinefilos">Cómo funciona</Link>
          <Link to="/explorar">Explorar Cortometrajes</Link>
        </div>
        <div className="footer-column">
          <h4>Para Creadores</h4>
          <Link to="/para-creadores">Cómo funciona</Link>
          <Link to="/publicar">Publicar un Cortometraje</Link>
        </div>
        <div className="footer-column">
          <h4>Plataforma</h4>
          <a href="#sobre-nosotros">Sobre Nosotros</a>
          <Link to="/centro-de-ayuda">Centro de Ayuda</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2025 APEX-ClipStream. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
