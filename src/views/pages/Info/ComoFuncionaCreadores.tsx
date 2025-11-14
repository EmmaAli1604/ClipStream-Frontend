import React from "react";
import "./InfoPage.css";

export default function ComoFuncionaCreadores() {
  return (
    <div className="info-page-container">
      <h1>Para Creadores</h1>
      <p>
        ClipStream es tu plataforma para exhibir tu trabajo, recibir feedback y crecer como
        cineasta.
      </p>        <h2>Tu Proceso en ClipStream</h2>

        <div className="info-section">
          <h3>1. Publica tu Cortometraje</h3>
          <p>
            Sube tu archivo de video junto con sus metadatos (título, sinopsis, género) en un
            entorno seguro. Tendrás control total para editar o borrar tu contenido cuando quieras.
          </p>
        </div>

        <div className="info-section">
          <h3>2. Recibe Feedback</h3>
          <p>
            Nuestra comunidad de cinéfilos está lista para ver tu trabajo, calificarlo y dejar
            reseñas. Este feedback es tu herramienta más valiosa para crecer.
          </p>
        </div>

        <div className="info-section">
          <h3>3. Crece y Monetiza (Próximamente)</h3>
          <p>
            Construye tu perfil y tu audiencia. Próximamente, podrás lanzar campañas de
            crowdfunding y organizar eventos de Pago Por Evento (PPV) para financiar tus futuros
            proyectos.
          </p>
        </div>
    </div>
  );
}
