import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Cortometrajes.css";

interface Genero {
  generoId: number;
  nombreGenero: string;
}

interface CortometrajeForm {
  nombre: string;
  sinopsis: string;
  generoId: string;
  fecha: string;
  foto: string;
  video: string;
  director: string;
}

export default function Cortometrajes() {
  const navigate = useNavigate();
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState<CortometrajeForm>({
    nombre: "",
    sinopsis: "",
    generoId: "",
    fecha: new Date().toISOString().split('T')[0],
    foto: "",
    video: "",
    director: ""
  });

  const [errors, setErrors] = useState<Partial<CortometrajeForm>>({});

  // Obtener géneros al cargar el componente
  useEffect(() => {
    const fetchGeneros = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/generos');
        if (!response.ok) {
          throw new Error('Error al cargar los géneros');
        }
        const data = await response.json();
        setGeneros(data);
      } catch (err) {
        setError("Error al cargar los géneros");
      }
    };

    fetchGeneros();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Partial<CortometrajeForm> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    }

    if (!formData.sinopsis.trim()) {
      newErrors.sinopsis = "La sinopsis es requerida";
    } else if (formData.sinopsis.length < 10) {
      newErrors.sinopsis = "La sinopsis debe tener al menos 10 caracteres";
    }

    if (!formData.generoId) {
      newErrors.generoId = "Debes seleccionar un género";
    }

    if (!formData.fecha) {
      newErrors.fecha = "La fecha es requerida";
    }

    if (!formData.director.trim()) {
      newErrors.director = "El director es requerido";
    }

    if (!formData.foto.trim()) {
      newErrors.foto = "La URL de la foto es requerida";
    } else if (!isValidUrl(formData.foto)) {
      newErrors.foto = "La URL de la foto no es válida";
    }

    if (!formData.video.trim()) {
      newErrors.video = "La URL del video es requerida";
    } else if (!isValidUrl(formData.video)) {
      newErrors.video = "La URL del video no es válida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name as keyof CortometrajeForm]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }

    // Limpiar mensajes generales
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Obtener el usuario actual del localStorage
      const userData = localStorage.getItem('user');
      let usuarioId = 1;

      if (userData) {
        const user = JSON.parse(userData);
        usuarioId = user.usuarioId;
      }

      const cortometrajeData = {
        usuarioId: usuarioId,
        generoId: parseInt(formData.generoId),
        nombre: formData.nombre.trim(),
        sinopsis: formData.sinopsis.trim(),
        fecha: formData.fecha,
        foto: formData.foto.trim(),
        video: formData.video.trim(),
        director: formData.director.trim(),
        numVistas: 0,
        calificacion: 0.0
      };

      const response = await fetch('http://localhost:8080/api/cortometrajes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cortometrajeData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess("¡Cortometraje creado exitosamente!");
        
        // Limpiar el formulario
        setFormData({
          nombre: "",
          sinopsis: "",
          generoId: "",
          fecha: new Date().toISOString().split('T')[0],
          foto: "",
          video: "",
          director: ""
        });
        
        // Navegar al detalle del cortometraje recién creado
        if (result.data && result.data.cortometrajeId) {
          setTimeout(() => {
            navigate(`/cortometraje/${result.data.cortometrajeId}`);
          }, 2000);
        } else {
          // Si no hay ID, redirigir al home
          setTimeout(() => {
            navigate("/home");
          }, 2000);
        }
      } else {
        setError(result.message || "Error al crear el cortometraje");
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/home");
  };

  const handleViewCortometrajes = () => {
    navigate("/home");
  };

  return (
    <div className="cortometrajes-container">
      <div className="cortometrajes-overlay">
        <div className="cortometrajes-form-container">
          <div className="header-actions">
            <h2>Crear Nuevo Cortometraje</h2>
            <button 
              type="button" 
              className="view-cortometrajes-button"
              onClick={handleViewCortometrajes}
            >
              Ver Cortometrajes
            </button>
          </div>
          
          {error && <div className="error-message general-error">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit} className="cortometrajes-form">
            <div className="form-group">
              <label htmlFor="nombre">Nombre del Cortometraje *</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className={errors.nombre ? "input-error" : ""}
                placeholder="Ingresa el nombre del cortometraje"
                disabled={loading}
              />
              {errors.nombre && <span className="field-error">{errors.nombre}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="director">Director *</label>
              <input
                type="text"
                id="director"
                name="director"
                value={formData.director}
                onChange={handleInputChange}
                className={errors.director ? "input-error" : ""}
                placeholder="Ingresa el nombre del director"
                disabled={loading}
              />
              {errors.director && <span className="field-error">{errors.director}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="generoId">Género *</label>
              <select
                id="generoId"
                name="generoId"
                value={formData.generoId}
                onChange={handleInputChange}
                className={errors.generoId ? "input-error" : ""}
                disabled={loading || generos.length === 0}
              >
                <option value="">Selecciona un género</option>
                {generos.map((genero) => (
                  <option key={genero.generoId} value={genero.generoId}>
                    {genero.nombreGenero}
                  </option>
                ))}
              </select>
              {errors.generoId && <span className="field-error">{errors.generoId}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="fecha">Fecha de Publicación *</label>
              <input
                type="date"
                id="fecha"
                name="fecha"
                value={formData.fecha}
                onChange={handleInputChange}
                className={errors.fecha ? "input-error" : ""}
                disabled={loading}
              />
              {errors.fecha && <span className="field-error">{errors.fecha}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="foto">URL de la Foto *</label>
              <input
                type="url"
                id="foto"
                name="foto"
                value={formData.foto}
                onChange={handleInputChange}
                className={errors.foto ? "input-error" : ""}
                placeholder="https://ejemplo.com/foto.jpg"
                disabled={loading}
              />
              {errors.foto && <span className="field-error">{errors.foto}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="video">URL del Video *</label>
              <input
                type="url"
                id="video"
                name="video"
                value={formData.video}
                onChange={handleInputChange}
                className={errors.video ? "input-error" : ""}
                placeholder="https://ejemplo.com/video.mp4"
                disabled={loading}
              />
              {errors.video && <span className="field-error">{errors.video}</span>}
            </div>

            <div className="form-group full-width">
              <label htmlFor="sinopsis">Sinopsis *</label>
              <textarea
                id="sinopsis"
                name="sinopsis"
                value={formData.sinopsis}
                onChange={handleInputChange}
                className={errors.sinopsis ? "input-error" : ""}
                placeholder="Describe la trama del cortometraje..."
                rows={4}
                disabled={loading}
              />
              {errors.sinopsis && <span className="field-error">{errors.sinopsis}</span>}
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={handleCancel}
                className="cancel-button"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading ? "Creando..." : "Crear Cortometraje"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}