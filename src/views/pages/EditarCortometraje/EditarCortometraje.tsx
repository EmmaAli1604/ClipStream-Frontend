import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./EditarCortometraje.css";

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

interface Genero {
  generoId: number;
  nombre: string;
}

export default function EditarCortometraje() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [cortometraje, setCortometraje] = useState<Cortometraje | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    nombre: "",
    sinopsis: "",
    director: "",
    fecha: "",
    foto: "",
    video: "",
    generoId: 1,
    calificacion: 0
  });

  const [generos, setGeneros] = useState<Genero[]>([
    { generoId: 1, nombre: "Drama" },
    { generoId: 2, nombre: "Comedia" },
    { generoId: 3, nombre: "Terror" },
    { generoId: 4, nombre: "Acción" },
    { generoId: 5, nombre: "Ciencia Ficción" },
    { generoId: 6, nombre: "Romance" },
    { generoId: 7, nombre: "Documental" },
    { generoId: 8, nombre: "Animación" }
  ]);

  useEffect(() => {
    const fetchCortometraje = async () => {
      try {
        setLoading(true);
        
        if (!id) {
          setError("ID de cortometraje no proporcionado");
          setLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:8080/api/cortometrajes/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Cortometraje no encontrado");
          }
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        if (data.success && data.data) {
          const cortoData = data.data;
          setCortometraje(cortoData);
          setFormData({
            nombre: cortoData.nombre || "",
            sinopsis: cortoData.sinopsis || "",
            director: cortoData.director || "",
            fecha: cortoData.fecha ? cortoData.fecha.split('T')[0] : "",
            foto: cortoData.foto || "",
            video: cortoData.video || "",
            generoId: cortoData.generoId || 1,
            calificacion: cortoData.calificacion || 0
          });
        } else {
          throw new Error("Datos del cortometraje no disponibles");
        }
        
      } catch (err: any) {
        console.error("Error al cargar el cortometraje:", err);
        setError(err.message || "Error al cargar los datos del cortometraje");
      } finally {
        setLoading(false);
      }
    };

    fetchCortometraje();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'calificacion' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError("");

      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        setError("No se encontraron datos de usuario");
        return;
      }

      const userData = JSON.parse(storedUser);
      
      const requestData = {
        nombre: formData.nombre,
        sinopsis: formData.sinopsis,
        director: formData.director,
        fecha: formData.fecha,
        foto: formData.foto,
        video: formData.video,
        generoId: formData.generoId,
        calificacion: formData.calificacion,
        numVistas: cortometraje?.numVistas || 0,
        usuarioId: userData.usuarioId
      };

      const response = await fetch(`http://localhost:8080/api/cortometrajes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        alert("Cortometraje actualizado exitosamente");
        navigate("/profile");
      } else {
        throw new Error(result.message || "Error al actualizar el cortometraje");
      }
      
    } catch (err: any) {
      console.error("Error al actualizar el cortometraje:", err);
      setError("Error al actualizar el cortometraje: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/profile");
  };

  if (loading) {
    return (
      <div className="edit-cortometraje-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Cargando cortometraje...</p>
        </div>
      </div>
    );
  }

  if (error && !cortometraje) {
    return (
      <div className="edit-cortometraje-container">
        <div className="error">
          <h2>Error</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={() => navigate("/profile")} className="back-button">
              Volver al Perfil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-cortometraje-container">
      <div className="edit-cortometraje-header">
        <h1>Editar Cortometraje</h1>
        <button onClick={handleCancel} className="cancel-button">
          Cancelar
        </button>
      </div>

      <div className="edit-cortometraje-content">
        <form onSubmit={handleSubmit} className="cortometraje-form">
          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="nombre">Título del Cortometraje *</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
                placeholder="Ingresa el título del cortometraje"
              />
            </div>

            <div className="form-group">
              <label htmlFor="director">Director *</label>
              <input
                type="text"
                id="director"
                name="director"
                value={formData.director}
                onChange={handleInputChange}
                required
                placeholder="Nombre del director"
              />
            </div>

            <div className="form-group">
              <label htmlFor="generoId">Género *</label>
              <select
                id="generoId"
                name="generoId"
                value={formData.generoId}
                onChange={handleInputChange}
                required
              >
                {generos.map(genero => (
                  <option key={genero.generoId} value={genero.generoId}>
                    {genero.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="fecha">Fecha de Publicación *</label>
              <input
                type="date"
                id="fecha"
                name="fecha"
                value={formData.fecha}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="sinopsis">Sinopsis *</label>
              <textarea
                id="sinopsis"
                name="sinopsis"
                value={formData.sinopsis}
                onChange={handleInputChange}
                required
                rows={4}
                placeholder="Describe la trama del cortometraje..."
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="foto">URL de la Imagen (Poster)</label>
              <input
                type="url"
                id="foto"
                name="foto"
                value={formData.foto}
                onChange={handleInputChange}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="video">URL del Video *</label>
              <input
                type="url"
                id="video"
                name="video"
                value={formData.video}
                onChange={handleInputChange}
                required
                placeholder="https://ejemplo.com/video.mp4"
              />
            </div>

            <div className="form-group">
              <label htmlFor="calificacion">Calificación (0-5)</label>
              <input
                type="number"
                id="calificacion"
                name="calificacion"
                value={formData.calificacion}
                onChange={handleInputChange}
                min="0"
                max="5"
                step="0.1"
                placeholder="4.5"
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={handleCancel}
              className="cancel-form-button"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={saving}
              className="save-button"
            >
              {saving ? (
                <>
                  <span className="saving-spinner"></span>
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}