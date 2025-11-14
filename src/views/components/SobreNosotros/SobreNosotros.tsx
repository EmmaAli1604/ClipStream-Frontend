import React from "react";
import "./SobreNosotros.css";

export default function SobreNosotros() {
  return (
    <div id="sobre-nosotros" className="about-us-container">
      <div className="about-us-content">
        <h2>Sobre APEX-ClipStream</h2>

        <div className="mission-vision">
          <div className="mission-card">
            <h3>Nuestra Misión</h3>
            <p>
              "En APEX, estamos comprometidos a crear productos de software de calidad que
              impulsan el crecimiento y el éxito de nuestros clientes."
            </p>
          </div>
          <div className="mission-card">
            <h3>Nuestra Visión</h3>
            <p>
              "Convertirse en uno de los líderes nacionales en el desarrollo de software,
              transformando negocios a través de tecnología de vanguardia."
            </p>
          </div>
        </div>

        <h3>Conoce al Equipo</h3>
        <div className="team-grid">
          <div className="team-card">
            <h4>Miguel Ángel Brito Lievano</h4>
            <p>Director ejecutivo</p>
          </div>
          <div className="team-card">
            <h4>Emma Alicia Jiménez Sánchez</h4>
            <p>Director Financiero</p>
          </div>
          <div className="team-card">
            <h4>Mariana Morayma Bernal Esquivel</h4>
            <p>Directora de Tecnología & Producto</p>
          </div>
          <div className="team-card">
            <h4>Palomo Valle Samantha Charlize</h4>
            <p>Director de Marketing y Ventas</p>
          </div>
        </div>
      </div>
    </div>
  );
}
