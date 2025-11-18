import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [correo, setCorreo] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const [errors, setErrors] = useState<{
    nombre?: string;
    apellidos?: string;
    correo?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const emailIsValid = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!nombre.trim()) newErrors.nombre = "Ingresa tu nombre.";
    if (!apellidos.trim()) newErrors.apellidos = "Ingresa tus apellidos.";
    if (!correo.trim()) newErrors.correo = "Ingresa tu correo.";
    else if (!emailIsValid(correo.trim())) newErrors.correo = "Ingresa un correo válido.";

    if (!username.trim()) newErrors.username = "Ingresa un nombre de usuario.";
    else if (username.trim().length < 3)
      newErrors.username = "El nombre de usuario debe tener al menos 3 caracteres.";

    if (!password) newErrors.password = "Ingresa una contraseña.";
    else if (password.length < 6) newErrors.password = "La contraseña debe tener al menos 6 caracteres.";

    if (!confirmPassword) newErrors.confirmPassword = "Confirma tu contraseña.";
    else if (confirmPassword !== password) newErrors.confirmPassword = "Las contraseñas no coinciden.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    
    if (validate()) {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:8080/api/users/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nombre: nombre.trim(),
            apellido: apellidos.trim(), // Nota: el backend espera "apellido" (singular)
            username: username.trim(),
            correo: correo.trim(),
            password: password
          })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // Registro exitoso
          navigate("/login", { 
            state: { 
              message: "¡Registro exitoso! Por favor inicia sesión." 
            } 
          });
        } else {
          // Error del servidor
          setGeneralError(data.mensaje || "Error en el registro. Intenta nuevamente.");
        }
      } catch (error) {
        console.error('Error al conectar con el servidor:', error);
        setGeneralError("Error de conexión con el servidor");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handlers que limpian el error correspondiente al empezar a escribir
  const handleChange = (
    field: keyof typeof errors,
    value: string,
    setter: (v: string) => void
  ) => {
    setter(value);
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (generalError) setGeneralError("");
  };

  return (
    <div className="register-container">
      <div className="register-overlay">
        <form className="register-form" onSubmit={handleSubmit} noValidate>
          <h2>Crear cuenta</h2>

          {/* Error general */}
          {generalError && <p className="error-text general-error">{generalError}</p>}

          <div className="input-group">
            <input
              type="text"
              placeholder="Nombre"
              value={nombre}
              onChange={(e) => handleChange("nombre", e.target.value, setNombre)}
              className={errors.nombre ? "input-error" : ""}
              disabled={isLoading}
            />
            {errors.nombre && <p className="error-text">{errors.nombre}</p>}
          </div>

          <div className="input-group">
            <input
              type="text"
              placeholder="Apellidos"
              value={apellidos}
              onChange={(e) => handleChange("apellidos", e.target.value, setApellidos)}
              className={errors.apellidos ? "input-error" : ""}
              disabled={isLoading}
            />
            {errors.apellidos && <p className="error-text">{errors.apellidos}</p>}
          </div>

          <div className="input-group">
            <input
              type="email"
              placeholder="Correo"
              value={correo}
              onChange={(e) => handleChange("correo", e.target.value, setCorreo)}
              className={errors.correo ? "input-error" : ""}
              disabled={isLoading}
            />
            {errors.correo && <p className="error-text">{errors.correo}</p>}
          </div>

          <div className="input-group">
            <input
              type="text"
              placeholder="Nombre de usuario"
              value={username}
              onChange={(e) => handleChange("username", e.target.value, setUsername)}
              className={errors.username ? "input-error" : ""}
              disabled={isLoading}
            />
            {errors.username && <p className="error-text">{errors.username}</p>}
          </div>

          <div className="input-group password-group">
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => handleChange("password", e.target.value, setPassword)}
                className={errors.password ? "input-error" : ""}
                disabled={isLoading}
              />
              <button
                type="button"
                className="show-hide-button"
                onClick={() => setShowPassword((s) => !s)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={20} className="icon-eye" /> : <Eye size={20} className="icon-eye" />}
              </button>
            </div>
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>

          <div className="input-group password-group">
            <div className="password-wrapper">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value, setConfirmPassword)}
                className={errors.confirmPassword ? "input-error" : ""}
                disabled={isLoading}
              />
              <button
                type="button"
                className="show-hide-button"
                onClick={() => setShowConfirm((s) => !s)}
                disabled={isLoading}
              >
                {showConfirm ? <EyeOff size={20} className="icon-eye" /> : <Eye size={20} className="icon-eye" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
          </div>

          <button 
            type="submit" 
            className="submit-button" 
            disabled={isLoading}
          >
            {isLoading ? "Registrando..." : "Registrarse"}
          </button>
          
          <p className="auth-link"> 
            ¿Ya tienes una cuenta?{" "} 
            <Link to="/login" className="register-link">Iniciar sesión</Link>
          </p>
        </form>
      </div>
    </div>
  );
}