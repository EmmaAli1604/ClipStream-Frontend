import React, { useState, useEffect } from "react";
import "./Resena.css";

interface Resena {
  resenaId: number;
  usuarioId: number;
  cortometrajeId: number;
  contenido: string;
  likes: number;
  usuarioNombre?: string;
  fechaCreacion?: string;
}

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

export default function Resena({ cortometrajeId }: Props) {
  const [reseñas, setReseñas] = useState<Resena[]>([]);
  const [nuevaReseña, setNuevaReseña] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);

  // Obtener usuario actual del localStorage
  useEffect(() => {
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

  // Obtener reseñas del cortometraje
  useEffect(() => {
    fetchResenas();
  }, [cortometrajeId]);

  const fetchResenas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:8080/api/resenas/cortometraje/${cortometrajeId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Datos de reseñas recibidos:", data); // Para debug
        if (data.success) {
          setReseñas(data.data);
        } else {
          setError(data.message || "Error al cargar reseñas");
        }
      } else {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Error fetching reseñas:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar reseñas');
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarReseña = async () => {
    if (!nuevaReseña.trim()) {
      alert("Por favor escribe una reseña");
      return;
    }

    if (!currentUser) {
      alert("Debes iniciar sesión para escribir una reseña");
      return;
    }

    try {
      setEnviando(true);
      setError(null);
      
      const resenaData = {
        usuarioId: currentUser.usuarioId,
        cortometrajeId: cortometrajeId,
        contenido: nuevaReseña.trim(),
        likes: 0
      };

      console.log("Enviando reseña:", resenaData); // Para debug

      const response = await fetch('http://localhost:8080/api/resenas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resenaData)
      });

      const result = await response.json();
      console.log("Respuesta del servidor:", result); // Para debug

      if (response.ok && result.success) {
        setNuevaReseña("");
        await fetchResenas(); // Recargar reseñas
      } else {
        throw new Error(result.message || 'Error al enviar reseña');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al enviar reseña';
      setError(errorMessage);
      alert("Error al enviar la reseña: " + errorMessage);
    } finally {
      setEnviando(false);
    }
  };

  const handleLike = async (resenaId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/resenas/${resenaId}/like`, {
        method: 'POST'
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          fetchResenas(); // Recargar para actualizar likes
        } else {
          console.error('Error al dar like:', result.message);
        }
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (error) {
      console.error('Error al dar like:', error);
    }
  };

  if (loading) {
    return <div className="loading-resenas">Cargando reseñas...</div>;
  }

  return (
    <div className="resenas-container">
      {/* Sección: Escribir reseña - Solo si hay usuario logueado */}
      {currentUser ? (
        <div className="escribir-resena-section">
          <h3>Escribe tu reseña</h3>
          <div className="resena-form">
            <textarea
              value={nuevaReseña}
              onChange={(e) => setNuevaReseña(e.target.value)}
              placeholder="Comparte tu opinión sobre este cortometraje..."
              className="resena-textarea"
              rows={4}
              maxLength={500}
            />
            <div className="resena-actions">
              <span className="caracteres-restantes">
                {nuevaReseña.length}/500 caracteres
              </span>
              <button 
                onClick={handleEnviarReseña}
                disabled={enviando || !nuevaReseña.trim()}
                className="enviar-resena-btn"
              >
                {enviando ? "Enviando..." : "Publicar Reseña"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="login-prompt">
          <p>💡 <a href="/login">Inicia sesión</a> para escribir una reseña</p>
        </div>
      )}

      {/* Sección: Lista de reseñas */}
      <div className="lista-resenas-section">
        <h3>Reseñas ({reseñas.length})</h3>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {reseñas.length === 0 ? (
          <div className="no-resenas">
            <p>No hay reseñas aún. ¡Sé el primero en comentar!</p>
          </div>
        ) : (
          <div className="resenas-list">
            {reseñas.map((resena) => (
              <div key={resena.resenaId} className="resena-card">
                <div className="resena-header">
                  <div className="usuario-info">
                    <span className="usuario-avatar">
                      {resena.usuarioNombre ? 
                        resena.usuarioNombre.split(' ').map(n => n.charAt(0)).join('').toUpperCase() 
                        : 'U'}
                    </span>
                    <div>
                      <span className="usuario-nombre">
                        {resena.usuarioNombre || `Usuario ${resena.usuarioId}`}
                      </span>
                      {resena.fechaCreacion && (
                        <span className="resena-fecha">
                          {new Date(resena.fechaCreacion).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleLike(resena.resenaId)}
                    className="like-btn"
                    title="Dar like a esta reseña"
                  >
                    👍 {resena.likes || 0}
                  </button>
                </div>
                
                <div className="resena-contenido">
                  {resena.contenido}
                </div>

                {/* Mostrar si es la reseña del usuario actual */}
                {currentUser && resena.usuarioId === currentUser.usuarioId && (
                  <div className="resena-propia-badge">
                    Tu reseña
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}