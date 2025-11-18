import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const [cortometrajes, setCortometrajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCortometrajes = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/cortometrajes');
        if (!response.ok) {
          throw new Error('Error al cargar los cortometrajes');
        }
        const data = await response.json();
        if (data.success) {
          setCortometrajes(data.data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCortometrajes();
  }, []);

  const handleLogin = () => {
    navigate("/login");
  };

  const handleRegister = () => {
    navigate("/register");
  };

  const handleCardClick = (cortometrajeId) => {
    // Navegar a la página de detalles del cortometraje
    navigate(`/cortometraje/${cortometrajeId}`);
  };

  if (loading) {
    return (
      <div className="home-container">
        <div className="overlay">
          <div className="loading">Cargando cortometrajes...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-container">
        <div className="overlay">
          <div className="error-message">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="overlay">
        {cortometrajes.length === 0 ? (
          <p>No hay cortometrajes por mostrar.</p>
        ) : (
          <div className="cortometrajes-grid">
            {cortometrajes.map((cortometraje) => (
              <div 
                key={cortometraje.cortometrajeId} 
                className="cortometraje-card"
                onClick={() => handleCardClick(cortometraje.cortometrajeId)}
              >
                <div className="card-image">
                  {cortometraje.foto ? (
                    <img 
                      src={cortometraje.foto} 
                      alt={cortometraje.nombre}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200/4A5568/FFFFFF?text=Sin+Imagen';
                      }}
                    />
                  ) : (
                    <div className="placeholder-image">
                      <span>{cortometraje.nombre}</span>
                    </div>
                  )}
                </div>
                
                <div className="card-content">
                  <h3 className="card-title">{cortometraje.nombre}</h3>
                  <p className="card-director">Director: {cortometraje.director}</p>
                  <p className="card-sinopsis">
                    {cortometraje.sinopsis && cortometraje.sinopsis.length > 100 
                      ? `${cortometraje.sinopsis.substring(0, 100)}...` 
                      : cortometraje.sinopsis}
                  </p>
                  
                  <div className="card-stats">
                    <span className="card-rating">
                      ⭐ {cortometraje.calificacion ? cortometraje.calificacion.toFixed(1) : '0.0'}
                    </span>
                    <span className="card-views">
                      👁️ {cortometraje.numVistas || 0}
                    </span>
                  </div>
                  
                  <div className="card-date">
                    {new Date(cortometraje.fecha).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}