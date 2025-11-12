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

  const [errors, setErrors] = useState<{
    nombre?: string;
    apellidos?: string;
    correo?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const emailIsValid = (email: string) => {
    // comprobación básica de email
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // aquí podrías enviar al backend
      navigate("/home");
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
  };

  return (
    <div className="register-container">
      <div className="register-overlay">
        <form className="register-form" onSubmit={handleSubmit} noValidate>
          <h2>Crear cuenta</h2>

          <div className="input-group">
            <input
              type="text"
              placeholder="Nombre"
              value={nombre}
              onChange={(e) => handleChange("nombre", e.target.value, setNombre)}
              className={errors.nombre ? "input-error" : ""}
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
              />
              <button
                type="button"
                className="show-hide-button"
                onClick={() => setShowPassword((s) => !s)}
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
              />
              <button
                type="button"
                className="show-hide-button"
                onClick={() => setShowConfirm((s) => !s)}
              >
                {showPassword ? <EyeOff size={20} className="icon-eye" /> : <Eye size={20} className="icon-eye" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
          </div>

          <button type="submit" className="submit-button"> Registrarse </button>
          <p className="auth-link"> ¿Ya tienes una cuenta?{" "} <Link to="/login" className="register-link">Iniciar sesión </Link></p>
        </form>
      </div>
    </div>
  );
}

