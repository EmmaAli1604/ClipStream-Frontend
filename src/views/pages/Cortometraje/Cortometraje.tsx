import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaStar, FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand } from "react-icons/fa";
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

  // Estados para el reproductor personalizado (solo para Cloudinary)
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // === COMPATIBILIDAD CON YOUTUBE (PARA TUS VIDEOS EXISTENTES) ===
  // Detectar si es YouTube - MANTENER ESTAS FUNCIONES POR AHORA
  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  // Extraer ID de YouTube - MANTENER ESTA FUNCIÓN POR AHORA
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };
  // ==============================================================

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

  // === CONTROLES DEL REPRODUCTOR PERSONALIZADO (SOLO PARA CLOUDINARY) ===
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.parentElement?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleVideoError = () => {
    console.error('Error al cargar el video');
    setVideoError(true);
  };

  const handleBack = () => {
    navigate(-1);
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
        {/* REPRODUCTOR DE VIDEO */}
        {cortometraje.video && !videoError && (
          <div className="video-section">        
            {/* === YOUTUBE (MANTENER POR AHORA) === */}
            {isYouTubeUrl(cortometraje.video) ? (
              <div className="video-container">
                <iframe
                  width="100%"
                  height="400"
                  src={`https://www.youtube.com/embed/${getYouTubeId(cortometraje.video)}`}
                  title={cortometraje.nombre}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              /* === REPRODUCTOR PERSONALIZADO PARA CLOUDINARY === */
              <div 
                className="video-container-custom"
                onMouseEnter={() => setShowControls(true)}
                onMouseLeave={() => setShowControls(false)}
              >
                <video 
                  ref={videoRef}
                  className="custom-video-player"
                  poster={cortometraje.foto}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onError={handleVideoError}
                  onClick={togglePlay}
                >
                  <source src={cortometraje.video} type="video/mp4" />
                  <source src={cortometraje.video} type="video/webm" />
                  Tu navegador no soporta el elemento de video.
                </video>

                {/* CONTROLES PERSONALIZADOS */}
                <div className={`video-controls ${showControls ? 'show' : 'hide'}`}>
                  {/* Barra de Progreso */}
                  <div className="progress-bar-container">
                    <input type="range"  min="0" max={duration || 0} value={currentTime} onChange={handleSeek} className="progress-bar" />
                      <div className="progress-filled" style={{ width: `${(currentTime / duration) * 100}%` }} ></div>
                  </div>

                  {/* Botones de Control */}
                  <div className="control-buttons">
                    <div className="left-controls">
                      <button onClick={togglePlay} className="control-btn play-pause">
                        {isPlaying ? <FaPause /> : <FaPlay />}
                      </button>
                      
                      <div className="volume-controls">
                        <button onClick={toggleMute} className="control-btn volume-btn">
                          {isMuted || volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={volume}
                          onChange={handleVolumeChange}
                          className="volume-bar"
                        />
                      </div>
                    </div>

                    <div className="right-controls">
                      <div className="time-display">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </div>
                      <button onClick={toggleFullscreen} className="control-btn fullscreen-btn">
                        <FaExpand />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Overlay de Play/Pausa */}
                {!isPlaying && (
                  <div className="play-overlay" onClick={togglePlay}>
                    <div className="play-icon">
                      <FaPlay size={50} />
                    </div>
                  </div>
                )}
              </div>
            )}
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

        {/* INFORMACIÓN DEL CORTOMETRAJE */}
        <div className="detail-header">
          {cortometraje.foto && (
            <div className="poster-section">
              <img src={cortometraje.foto} alt={cortometraje.nombre} className="poster-image"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x450/4A5568/FFFFFF?text=Sin+Imagen';
                }} />
            </div>
          )}
          
          <div className="info-section">
            <h1 className="title">{cortometraje.nombre}</h1>
            
            <div className="meta-info">
              <div className="meta-item">
                <span className="meta-label">Director: </span>
                <span className="meta-value">{cortometraje.director}</span>
              </div>
              
              
              <div className="meta-item">
                <span className="meta-label">Fecha: </span>
                <span className="meta-value">
                  {new Date(cortometraje.fecha).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              
              <div className="meta-item">
                <span className="meta-label">Vistas: </span>
                <span className="meta-value">{cortometraje.numVistas || 0}</span>
              </div>
            </div>
             <div className="meta-item-genero">
                <span className="meta-value">{genero || "Cargando..."}</span>
              </div>
          </div>
          {/* SINOPSIS */}
        <div className="sinopsis-section">
          <h2>Sinopsis</h2>
          <p className="sinopsis-text">
            {cortometraje.sinopsis || "No hay sinopsis disponible."}
          </p>
        </div>
        </div>

        {/* COMPONENTE DE CALIFICACIÓN */}
        {cortometraje.cortometrajeId && (
          <Calificacion cortometrajeId={cortometraje.cortometrajeId} />
        )}
      </div>
      {/* COMPONENTE RESEÑAS */}
      <div className="resenaSeccion">
        {cortometraje.cortometrajeId && (
          <Resena cortometrajeId={cortometraje.cortometrajeId} />
        )}
      </div>
    </div>
  );
}