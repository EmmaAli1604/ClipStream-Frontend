// Cortometrajes.tsx
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
  foto: File | null;
  video: File | null;
  director: string;
}

/**
 * Tipo de errores: mapea cada campo del formulario a un mensaje opcional (string).
 * Esto corrige el problema de tipos donde antes errors tenía la misma forma que CortometrajeForm.
 */
type CortometrajeErrors = Partial<Record<keyof CortometrajeForm, string>>;

export default function Cortometrajes() {
  const navigate = useNavigate();
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState<CortometrajeForm>({
    nombre: "",
    sinopsis: "",
    generoId: "",
    fecha: new Date().toISOString().split("T")[0],
    foto: null,
    video: null,
    director: ""
  });

  const [errors, setErrors] = useState<CortometrajeErrors>({});

  // Obtener géneros al cargar el componente
  useEffect(() => {
    const fetchGeneros = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/generos");
        if (!response.ok) {
          throw new Error("Error al cargar los géneros");
        }
        const data = await response.json();
        setGeneros(data);
      } catch (err) {
        console.error(err);
        setError("Error al cargar los géneros");
      }
    };

    fetchGeneros();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: CortometrajeErrors = {};

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

    if (!formData.foto) {
      newErrors.foto = "La foto es requerida";
    }

    if (!formData.video) {
      newErrors.video = "El video es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Configuración de Cloudinary - CORREGIDO
  const cloudinaryConfig = {
    cloudName: "dtomrqjlf", // Tu cloud name
    uploadPreset: "cortometrajes-preset" // Tu upload preset
  };

  const uploadToCloudinary = async (file: File, type: "image" | "video"): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", cloudinaryConfig.uploadPreset); // CORREGIDO: "upload_preset" no "cortometrajes-preset"
    
    const resourceType = type === "image" ? "image" : "video";
    const url = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/${resourceType}/upload`;

    console.log(`Subiendo ${type} a Cloudinary:`, {
      cloudName: cloudinaryConfig.cloudName,
      uploadPreset: cloudinaryConfig.uploadPreset,
      file: file.name,
      size: file.size,
      type: file.type
    });

    try {
      const response = await fetch(url, {
        method: "POST",
        body: fd
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Cloudinary ${type} upload error:`, {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Error subiendo ${type}: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`${type} subido exitosamente:`, data.secure_url);
      return data.secure_url || data.url;
    } catch (uploadError) {
      console.error(`Error completo uploading ${type}:`, uploadError);
      throw new Error(`No se pudo subir el ${type === "image" ? "archivo de imagen" : "video"}. Verifica tu conexión e intenta nuevamente.`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "foto" | "video") => {
    const file = e.target.files?.[0] || null;

    if (file) {
      // Validaciones mejoradas
      if (type === "foto") {
        const validImageTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
        const validExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
        const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
        
        if (!validImageTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
          setErrors(prev => ({ ...prev, foto: "Formato de imagen no válido. Use JPEG, PNG o GIF" }));
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          setErrors(prev => ({ ...prev, foto: "La imagen no debe exceder 5MB" }));
          return;
        }
      } else if (type === "video") {
        const validVideoTypes = ["video/mp4", "video/avi", "video/quicktime", "video/mov", "video/wmv", "video/webm"];
        const validExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.webm', '.m4v'];
        const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
        
        if (!validVideoTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
          setErrors(prev => ({ ...prev, video: "Formato de video no válido. Use MP4, AVI, MOV, WMV o WEBM" }));
          return;
        }
        if (file.size > 500 * 1024 * 1024) {
          setErrors(prev => ({ ...prev, video: "El video no debe exceder 500MB" }));
          return;
        }
      }
    }

    setFormData(prev => ({
      ...prev,
      [type]: file
    }));

    // Limpiar error del campo si existía
    if (errors[type]) {
      setErrors(prev => ({
        ...prev,
        [type]: undefined
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name as keyof CortometrajeForm]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }

    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      console.log("Validación falló:", errors);
      return;
    }

    setLoading(true);
    setUploadProgress(0);
    setError("");
    setSuccess("");

    try {
      console.log("Iniciando proceso de creación de cortometraje...");
      
      // Subir archivos a Cloudinary
      setUploadProgress(10);
      
      console.log("Subiendo foto:", formData.foto?.name);
      const fotoUrl = await uploadToCloudinary(formData.foto!, "image");
      setUploadProgress(40);

      console.log("Subiendo video:", formData.video?.name);
      const videoUrl = await uploadToCloudinary(formData.video!, "video");
      setUploadProgress(70);

      // Obtener usuario del localStorage (si aplica)
      const userData = localStorage.getItem("user");
      let usuarioId = 1;

      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user && user.usuarioId) usuarioId = user.usuarioId;
        } catch (parseErr) {
          console.warn("No se pudo parsear user en localStorage:", parseErr);
        }
      }

      const cortometrajeData = {
        usuarioId: usuarioId,
        generoId: parseInt(formData.generoId, 10),
        nombre: formData.nombre.trim(),
        sinopsis: formData.sinopsis.trim(),
        fecha: formData.fecha,
        foto: fotoUrl,
        video: videoUrl,
        director: formData.director.trim(),
        numVistas: 0,
        calificacion: 0.0
      };

      console.log("Enviando datos al backend:", cortometrajeData);

      const response = await fetch("http://localhost:8080/api/cortometrajes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(cortometrajeData)
      });

      const result = await response.json();
      setUploadProgress(100);

      console.log("Respuesta del backend:", result);

      if (response.ok && result.success) {
        setSuccess("¡Cortometraje creado exitosamente!");

        // Limpiar formulario
        setFormData({
          nombre: "",
          sinopsis: "",
          generoId: "",
          fecha: new Date().toISOString().split("T")[0],
          foto: null,
          video: null,
          director: ""
        });

        setErrors({});
        
        // Redirigir al nuevo cortometraje si el backend devuelve el id
        if (result.data && result.data.cortometrajeId) {
          setTimeout(() => {
            navigate(`/cortometraje/${result.data.cortometrajeId}`);
          }, 1500);
        } else {
          // Si no hay ID, redirigir al home después de 2 segundos
          setTimeout(() => {
            navigate("/home");
          }, 2000);
        }
      } else {
        setError(result.message || "Error al crear el cortometraje en el backend");
      }
    } catch (err) {
      console.error("Error completo en handleSubmit:", err);
      setError(`Error: ${err instanceof Error ? err.message : "Error desconocido al procesar la solicitud"}`);
    } finally {
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 1000);
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

          {uploadProgress > 0 && (
            <div className="upload-progress" aria-live="polite">
              <div className="progress-bar" role="progressbar" aria-valuenow={uploadProgress} aria-valuemin={0} aria-valuemax={100}>
                <div
                  className="progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <span>Subiendo archivos... {uploadProgress}%</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="cortometrajes-form" noValidate>
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
              <label htmlFor="foto">Foto del Cortometraje *</label>
              <input
                type="file"
                id="foto"
                name="foto"
                accept="image/jpeg,image/png,image/jpg,image/gif"
                onChange={(e) => handleFileChange(e, "foto")}
                className={errors.foto ? "input-error" : ""}
                disabled={loading}
              />
              {formData.foto && <span className="file-info">Archivo seleccionado: {formData.foto.name}</span>}
              {errors.foto && <span className="field-error">{errors.foto}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="video">Video del Cortometraje *</label>
              <input
                type="file"
                id="video"
                name="video"
                accept="video/mp4,video/avi,video/mov,video/wmv,video/webm"
                onChange={(e) => handleFileChange(e, "video")}
                className={errors.video ? "input-error" : ""}
                disabled={loading}
              />
              {formData.video && <span className="file-info">Archivo seleccionado: {formData.video.name}</span>}
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