import "./InfoPage.css";

export default function ComoFuncionaCinefilos() {
  return (
    <div className="info-page-container">
      <h1>Para Cinéfilos</h1>
      <p>
        Descubre un universo de cine independiente. ClipStream está diseñado para que
        encuentres y apoyes el talento emergente.
      </p>        <h2>Tu Rol en la Comunidad</h2>

        <div className="info-section">
          <h3>Busca y Descubre</h3>
          <p>
            Utiliza nuestra barra de búsqueda y filtros para encontrar cortometrajes por
            género, creador o popularidad.
          </p>
        </div>

        <div className="info-section">
          <h3>Califica y Opina</h3>
          <p>
            Tu opinión es clave. Califica los cortometrajes que has visto y proporciona
            feedback constructivo para ayudar a los creadores a mejorar.
          </p>
        </div>

        <div className="info-section">
          <h3>Recomienda</h3>
          <p>
            ¿Te gustó un corto? Recomiéndalo a otros usuarios dentro de la plataforma para
            fomentar la interacción y darle visibilidad.
          </p>
        </div>
    </div>
  );
}
