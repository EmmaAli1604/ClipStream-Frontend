import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

interface UserProfile {
  usuarioId: number;
  nombre: string;
  apellido: string;
  username: string;
  correo: string;
}

interface Cortometraje {
  cortometrajeId: number;
  nombre: string;
  sinopsis: string;
  director: string;
  fecha: string;
  foto: string;
  video: string;
  numVistas: number;
  calificacion: number;
  generoId: number;
  usuarioId: number;
}

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  cortometrajeName: string;
}

// Componente Modal para confirmar eliminación
const DeleteModal: React.FC<DeleteModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  cortometrajeName 
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>¿Estás seguro de eliminar este cortometraje?</h3>
        <p>
          Estás a punto de eliminar "<strong>{cortometrajeName}</strong>". 
          Esta acción no se puede deshacer.
        </p>
        <div className="modal-actions">
          <button 
            onClick={onClose} 
            className="modal-button cancel-button"
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm} 
            className="modal-button confirm-button"
          >
            Sí, Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Profile() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [cortometrajes, setCortometrajes] = useState<Cortometraje[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCortometrajes, setLoadingCortometrajes] = useState(true);
  const [error, setError] = useState("");
  const [errorCortometrajes, setErrorCortometrajes] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    cortometrajeId: number | null;
    cortometrajeName: string;
  }>({
    isOpen: false,
    cortometrajeId: null,
    cortometrajeName: ""
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          setError("No se encontraron datos de usuario. Por favor, inicia sesión.");
          setLoading(false);
          navigate("/login");
          return;
        }

        const userData = JSON.parse(storedUser);
        const userId = userData.usuarioId;

        if (!userId) {
          setError("ID de usuario no disponible");
          setLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Usuario no encontrado");
          }
          throw new Error(`Error: ${response.status}`);
        }

        const profileData: UserProfile = await response.json();
        setUserProfile(profileData);
        
      } catch (err: any) {
        console.error("Error al cargar el perfil:", err);
        setError(err.message || "Error al cargar los datos del perfil");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  useEffect(() => {
    const fetchUserCortometrajes = async () => {
      try {
        setLoadingCortometrajes(true);
        
        const storedUser = localStorage.getItem('user');
        if (!storedUser) return;

        const userData = JSON.parse(storedUser);
        const userId = userData.usuarioId;

        if (!userId) return;

        const response = await fetch(`http://localhost:8080/api/cortometrajes/usuario/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            setCortometrajes([]);
            return;
          }
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        if (data.success && data.data) {
          setCortometrajes(data.data);
        } else {
          setCortometrajes([]);
        }
        
      } catch (err: any) {
        console.error("Error al cargar los cortometrajes:", err);
        setErrorCortometrajes("Error al cargar los cortometrajes");
        setCortometrajes([]);
      } finally {
        setLoadingCortometrajes(false);
      }
    };

    if (userProfile) {
      fetchUserCortometrajes();
    }
  }, [userProfile]);

  const handleEditProfile = () => {
    navigate("/edit-profile");
  };

  const handleCreateCortometraje = () => {
    navigate("/cortometrajes");
  };

  const handleViewCortometraje = (cortometrajeId: number) => {
    navigate(`/cortometrajes/${cortometrajeId}`);
  };

  const handleEditCortometraje = (cortometrajeId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/edit-cortometraje/${cortometrajeId}`);
  };

  const handleDeleteClick = (cortometrajeId: number, cortometrajeName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteModal({
      isOpen: true,
      cortometrajeId,
      cortometrajeName
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.cortometrajeId) return;

    try {
      setDeletingId(deleteModal.cortometrajeId);
      
      const response = await fetch(`http://localhost:8080/api/cortometrajes/${deleteModal.cortometrajeId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setCortometrajes(prev => prev.filter(corto => corto.cortometrajeId !== deleteModal.cortometrajeId));
      } else {
        throw new Error(result.message || "Error al eliminar el cortometraje");
      }
      
    } catch (err: any) {
      console.error("Error al eliminar el cortometraje:", err);
      alert("Error al eliminar el cortometraje: " + err.message);
    } finally {
      setDeletingId(null);
      setDeleteModal({
        isOpen: false,
        cortometrajeId: null,
        cortometrajeName: ""
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({
      isOpen: false,
      cortometrajeId: null,
      cortometrajeName: ""
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="profile-error">
          <h2>Error</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={() => window.location.reload()} className="retry-button">
              Reintentar
            </button>
            <button onClick={() => navigate("/")} className="back-button">
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Modal de confirmación de eliminación */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        cortometrajeName={deleteModal.cortometrajeName}
      />

      <div className="profile-header">
        <h1>Mi Perfil</h1>
        <button onClick={handleEditProfile} className="edit-profile-button">
          Editar Perfil
        </button>
      </div>

      <div className="profile-content">
        <div className="profile-avatar">
          <div className="avatar-circle">
            {userProfile ? 
              `${userProfile.nombre?.charAt(0) || ''}${userProfile.apellido?.charAt(0) || ''}`.toUpperCase() 
              : 'U'
            }
          </div>
          <h2 className="user-fullname">
            {userProfile?.nombre} {userProfile?.apellido}
          </h2>
          <p className="user-username">@{userProfile?.username}</p>
        </div>

        <div className="profile-info">
          <div className="info-section">
            <h3>Información de Contacto</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Correo electrónico:</label>
                <span>{userProfile?.correo}</span>
              </div>
              <div className="info-item">
                <label>ID de usuario:</label>
                <span>{userProfile?.usuarioId}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Cortometrajes */}
        <div className="cortometrajes-section">
          <div className="section-header">
            <h3>Tus Cortometrajes</h3>
            <button onClick={handleCreateCortometraje} className="create-cortometraje-button">
              + Crear Cortometraje
            </button>
          </div>

          {loadingCortometrajes ? (
            <div className="cortometrajes-loading">
              <div className="loading-spinner small"></div>
              <p>Cargando cortometrajes...</p>
            </div>
          ) : errorCortometrajes ? (
            <div className="cortometrajes-error">
              <p>{errorCortometrajes}</p>
            </div>
          ) : cortometrajes.length === 0 ? (
            <div className="no-cortometrajes">
              <div className="no-cortometrajes-icon">🎬</div>
              <h4>No tienes cortometrajes aún</h4>
              <p>Comparte tu talento creando tu primer cortometraje</p>
              <button onClick={handleCreateCortometraje} className="create-cortometraje-button primary">
                Crear mi primer cortometraje
              </button>
            </div>
          ) : (
            <div className="cortometrajes-grid">
              {cortometrajes.map((cortometraje) => (
                <div 
                  key={cortometraje.cortometrajeId} 
                  className="cortometraje-card"
                >
                  <div 
                    className="cortometraje-image"
                    onClick={() => handleViewCortometraje(cortometraje.cortometrajeId)}
                  >
                    {cortometraje.foto ? (
                      <img 
                        src={cortometraje.foto} 
                        alt={cortometraje.nombre}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-film.jpg';
                        }}
                      />
                    ) : (
                      <div className="cortometraje-placeholder">
                        🎬
                      </div>
                    )}
                  </div>
                  <div className="cortometraje-info">
                    <h4 
                      className="cortometraje-title"
                      onClick={() => handleViewCortometraje(cortometraje.cortometrajeId)}
                    >
                      {cortometraje.nombre}
                    </h4>
                    <p className="cortometraje-director">Por: {cortometraje.director}</p>
                    <p className="cortometraje-sinopsis">
                      {cortometraje.sinopsis?.length > 100 
                        ? `${cortometraje.sinopsis.substring(0, 100)}...` 
                        : cortometraje.sinopsis}
                    </p>
                    <div className="cortometraje-stats">
                      <span className="stat">
                        👁️ {cortometraje.numVistas || 0} vistas
                      </span>
                      <span className="stat">
                        ⭐ {cortometraje.calificacion || 0}/5
                      </span>
                    </div>
                    <p className="cortometraje-date">
                      {formatDate(cortometraje.fecha)}
                    </p>
                    
                    {/* Botones de acción */}
                    <div className="cortometraje-actions">
                      <button 
                        onClick={(e) => handleEditCortometraje(cortometraje.cortometrajeId, e)}
                        className="action-button edit-button"
                        disabled={deletingId === cortometraje.cortometrajeId}
                      >
                        ✏️ Editar
                      </button>
                      <button 
                        onClick={(e) => handleDeleteClick(cortometraje.cortometrajeId, cortometraje.nombre, e)}
                        className="action-button delete-button"
                        disabled={deletingId === cortometraje.cortometrajeId}
                      >
                        {deletingId === cortometraje.cortometrajeId ? (
                          <span className="deleting-spinner"></span>
                        ) : (
                          "🗑️ Eliminar"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="profile-actions">
        <button onClick={() => navigate("/")} className="back-button">
          Volver al inicio
        </button>
      </div>
    </div>
  );
}