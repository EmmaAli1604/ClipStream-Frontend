import React, { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import "./Calificacion.css";

interface Props {
  cortometrajeId: number;
}

interface UserData {
  usuarioId: number;
  nombre: string;
  apellido: string;
  username: string;
  correo: string;
}

export default function Calificacion({ cortometrajeId }: Props) {
  const [calificacionUsuario, setCalificacionUsuario] = useState<number>(0);
  const [calificacionTemporal, setCalificacionTemporal] = useState<number>(0);
  const [promedio, setPromedio] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Obtener usuario actual
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
      } catch (err) {
        console.error('Error al parsear datos del usuario:', err);
      }
    }
  }, []);

  // Cargar calificaciones cuando el usuario esté disponible
  useEffect(() => {
    if (currentUser || !currentUser) { // También carga si no hay usuario (para el promedio)
      fetchCalificaciones();
    }
  }, [currentUser, cortometrajeId]);

  const fetchCalificaciones = async () => {
    try {
      setLoading(true);
      
      // Obtener promedio del cortometraje
      const promedioResponse = await fetch(
        `http://localhost:8080/api/calificaciones/cortometraje/${cortometrajeId}/promedio`
      );
      
      if (promedioResponse.ok) {
        const promedioData = await promedioResponse.json();
        if (promedioData.success) {
          setPromedio(promedioData.promedio || 0);
        }
      }

      // Obtener calificación del usuario si está logueado
      if (currentUser) {
        const usuarioResponse = await fetch(
          `http://localhost:8080/api/calificaciones/usuario/${currentUser.usuarioId}/cortometraje/${cortometrajeId}`
        );
        
        if (usuarioResponse.ok) {
          const usuarioData = await usuarioResponse.json();
          console.log("Calificación del usuario:", usuarioData); // Debug
          if (usuarioData.success && usuarioData.calificacion !== null) {
            const calificacion = Number(usuarioData.calificacion);
            setCalificacionUsuario(calificacion);
            setCalificacionTemporal(calificacion);
          } else {
            // Si no hay calificación, resetear a 0
            setCalificacionUsuario(0);
            setCalificacionTemporal(0);
          }
        }
      } else {
        // Si no hay usuario, resetear calificaciones
        setCalificacionUsuario(0);
        setCalificacionTemporal(0);
      }
    } catch (err) {
      console.error('Error al cargar calificaciones:', err);
      // En caso de error, resetear calificaciones
      setCalificacionUsuario(0);
      setCalificacionTemporal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleCalificar = async (puntuacion: number) => {
    if (!currentUser) {
      alert("Debes iniciar sesión para calificar");
      return;
    }

    try {
      setEnviando(true);
      setError(null);

      const response = await fetch(
        `http://localhost:8080/api/calificaciones?usuarioId=${currentUser.usuarioId}&cortometrajeId=${cortometrajeId}&puntuacion=${puntuacion}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        // Actualizar inmediatamente la calificación del usuario
        setCalificacionUsuario(puntuacion);
        setCalificacionTemporal(puntuacion);
        
        // Recargar el promedio para que se actualice
        await fetchCalificaciones();
        
        console.log("Calificación guardada:", puntuacion); // Debug
      } else {
        throw new Error(result.message || 'Error al calificar');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al calificar';
      setError(errorMessage);
      console.error('Error al calificar:', errorMessage);
    } finally {
      setEnviando(false);
    }
  };

  const handleStarHover = (index: number) => {
    if (!enviando && currentUser) {
      setCalificacionTemporal(index);
    }
  };

  const handleStarLeave = () => {
    if (!enviando) {
      setCalificacionTemporal(calificacionUsuario);
    }
  };

  // Función para renderizar estrellas con coloreado correcto
  const renderEstrellas = (calificacion: number, esInteractivo: boolean = false) => {
    return [1, 2, 3, 4, 5].map((star) => {
      const estaActiva = star <= calificacion;
      const esMitad = calificacion > star - 1 && calificacion < star;
      
      return (
        <button
          key={star}
          className={`estrella-btn ${estaActiva ? 'activa' : 'inactiva'} ${esInteractivo ? 'interactiva' : ''}`}
          onClick={() => esInteractivo && handleCalificar(star)}
          onMouseEnter={() => esInteractivo && handleStarHover(star)}
          onMouseLeave={() => esInteractivo && handleStarLeave()}
          disabled={!esInteractivo || enviando || !currentUser}
          title={esInteractivo ? `Calificar con ${star} ${star === 1 ? 'estrella' : 'estrellas'}` : ''}
        >
          <FaStar 
            size={esInteractivo ? 28 : 20} 
            className={`estrella ${estaActiva ? 'activa' : 'inactiva'}`}
          />
        </button>
      );
    });
  };

  if (loading) {
    return <div className="calificacion-loading">Cargando calificaciones...</div>;
  }

  return (
    <div className="calificacion-container">
      <div className="calificacion-header">
        <h3>Calificación</h3>
        
        {/* Promedio general */}
        <div className="promedio-section">
          <div className="promedio-estrellas">
            {renderEstrellas(Math.round(promedio))}
          </div>
          <div className="promedio-info">
            <span className="promedio-valor">{promedio.toFixed(1)}</span>
            <span className="promedio-max">/ 5.0</span>
            <span className="promedio-texto">Promedio</span>
          </div>
        </div>

        {/* Calificación del usuario */}
        <div className="usuario-calificacion-section">
          <h4>Tu Calificación</h4>
          
          {!currentUser ? (
            <div className="login-prompt">
              <p>💡 <a href="/login">Inicia sesión</a> para calificar este cortometraje</p>
            </div>
          ) : (
            <div className="estrellas-interactivas">
              <div className="estrellas-container">
                {renderEstrellas(calificacionTemporal, true)}
              </div>
              
              <div className="calificacion-info">
                {calificacionUsuario > 0 ? (
                  <div className="calificacion-usuario-info">
                    <span className="calificacion-usuario-texto">
                      Calificaste con {calificacionUsuario} {calificacionUsuario === 1 ? 'estrella' : 'estrellas'}
                    </span>
                    <span className="cambiar-calificacion-texto">
                      (Haz clic en otra estrella para cambiar)
                    </span>
                  </div>
                ) : (
                  <span className="sin-calificacion-texto">
                    Haz clic en una estrella para calificar
                  </span>
                )}
                
                {enviando && (
                  <span className="enviando-texto">Guardando...</span>
                )}
              </div>

              {error && (
                <div className="calificacion-error">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}