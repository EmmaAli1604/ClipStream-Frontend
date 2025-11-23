import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import "./Cortometraje.css";
import Resena from "./Resena";
import Calificacion from "./Calificacion";

interface Cortometraje {
  cortometrajeId: number;
  usuarioId: number;
  generoId: number;
  nombre: string;
  sinopsis: string;
  fecha: string;
  foto: string;
  video: string;
  director: string;
  numVistas: number;
  calificacion: number;
}

export default function CortometrajeDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cortometraje, setCortometraje] = useState<Cortometraje | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [genero, setGenero] = useState<string>("");
  const [videoError, setVideoError] = useState(false);

  // Detectar si es YouTube
  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  // Extraer ID de YouTube
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  useEffect(() => {
    const fetchCortometraje = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/cortometrajes/${id}`);
        if (!response.ok) {
          throw new Error('Cortometraje no encontrado');
        }
        const data = await response.json();
        
        if (data.success) {
          setCortometraje(data.data);
          console.log('Video URL:', data.data.video); // Debug
          
          // Incrementar vistas
          await fetch(`http://localhost:8080/api/cortometrajes/${id}/vistas`, {
            method: 'PATCH'
          });
          
          // Obtener nombre del género
          fetchGenero(data.data.generoId);
        } else {
          throw new Error(data.message);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el cortometraje');
      } finally {
        setLoading(false);
      }
    };

    const fetchGenero = async (generoId: number) => {
      try {
        const response = await fetch(`http://localhost:8080/api/generos/${generoId}`);
        if (response.ok) {
          const generoData = await response.json();
          setGenero(generoData.nombreGenero);
        }
      } catch (error) {
        console.error('Error al cargar el género:', error);
      }
    };

    if (id) {
      fetchCortometraje();
    }
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleVideoError = () => {
    console.error('Error al cargar el video');
    setVideoError(true);
  };

  if (loading) {
    return (
      <div className="cortometraje-container">
        <div className="loading">Cargando cortometraje...</div>
      </div>
    );
  }

  if (error || !cortometraje) {
    return (
      <div className="cortometraje-container">
        <div className="error-section">
          <h2>Error</h2>
          <p>{error || "Cortometraje no encontrado"}</p>
          <button onClick={handleBack} className="back-button">
            Volver atrás
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cortometraje-container">
      <div className="cortometraje-detail">
        {/* Video */}
        {cortometraje.video && !videoError && (
          <div className="video-section">
            <h2>Ver Cortometraje</h2>
            <div className="video-container">
              {isYouTubeUrl(cortometraje.video) ? (
                <iframe
                  width="100%"
                  height="400"
                  src={`https://www.youtube.com/embed/${getYouTubeId(cortometraje.video)}`}
                  title={cortometraje.nombre}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <video 
                  controls 
                  className="video-player"
                  poster={cortometraje.foto}
                  onError={handleVideoError}
                >
                  <source src={cortometraje.video} type="video/mp4" />
                  <source src={cortometraje.video} type="video/webm" />
                  Tu navegador no soporta el elemento de video.
                </video>
              )}
            </div>
          </div>
        )}

        {videoError && (
          <div className="video-error">
            <p>No se puede reproducir el video. El enlace puede ser inválido.</p>
            {cortometraje.video && (
              <a href={cortometraje.video} target="_blank" rel="noopener noreferrer">
                Abrir video en nueva pestaña
              </a>
            )}
          </div>
        )}

        {/* Header con imagen y información básica */}
        <div className="detail-header">
          {cortometraje.foto && (
            <div className="poster-section">
              <img 
                src={cortometraje.foto} 
                alt={cortometraje.nombre}
                className="poster-image"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x450/4A5568/FFFFFF?text=Sin+Imagen';
                }}
              />
            </div>
          )}
          
          <div className="info-section">
            <h1 className="title">{cortometraje.nombre}</h1>
            
            <div className="meta-info">
              <div className="meta-item">
                <span className="meta-label">Director:</span>
                <span className="meta-value">{cortometraje.director}</span>
              </div>
              
              <div className="meta-item">
                <span className="meta-label">Género:</span>
                <span className="meta-value">{genero || "Cargando..."}</span>
              </div>
              
              <div className="meta-item">
                <span className="meta-label">Fecha:</span>
                <span className="meta-value">
                  {new Date(cortometraje.fecha).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              
              <div className="meta-item">
                <span className="meta-label">Vistas:</span>
                <span className="meta-value">{cortometraje.numVistas || 0}</span>
              </div>
            </div>

            <div className="rating-section">
              <div className="rating">
                <span className="rating-star"><FaStar /></span>
                <span className="rating-value">
                  {cortometraje.calificacion ? cortometraje.calificacion.toFixed(1) : '0.0'}
                </span>
                <span className="rating-max">/ 5.0</span>
                <span className="rating-count">(Promedio)</span>
              </div>
            </div>
          </div>
        </div>

        {/* COMPONENTE DE CALIFICACIÓN */}
        {cortometraje.cortometrajeId && (
          <Calificacion cortometrajeId={cortometraje.cortometrajeId} />
        )}

        {/* Sinopsis */}
        <div className="sinopsis-section">
          <h2>Sinopsis</h2>
          <p className="sinopsis-text">
            {cortometraje.sinopsis || "No hay sinopsis disponible."}
          </p>
        </div>

        {/* COMPONENTE RESEÑAS */}
        {cortometraje.cortometrajeId && (
          <Resena cortometrajeId={cortometraje.cortometrajeId} />
        )}
      </div>
    </div>
  );
}