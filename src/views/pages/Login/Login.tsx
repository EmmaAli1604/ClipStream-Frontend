import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import cineImage from "../../../assets/cine.png";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ user?: string; password?: string }>({});

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { user?: string; password?: string } = {};

    if (!user.trim()) newErrors.user = "Por favor, ingresa tu nombre o correo.";
    if (!password.trim()) newErrors.password = "Por favor, ingresa tu contraseña.";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      navigate("/home");
    }
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser(e.target.value);
    if (errors.user) setErrors((prev) => ({ ...prev, user: undefined }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
  };

  return (
    <div className="login-container">
      <div className="login-overlay">
        <form className="login-form" onSubmit={handleLogin}>
          <h2>Iniciar sesión</h2>

          {/* Campo usuario */}
          <div className="input-group">
            <input
              type="text"
              placeholder="Nombre o correo"
              value={user}
              onChange={handleUserChange}
              className={errors.user ? "input-error" : ""}
            />
            {errors.user && <p className="error-text">{errors.user}</p>}
          </div>

          {/* Campo contraseña */}
          <div className="input-group">
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={handlePasswordChange}
              className={errors.password ? "input-error" : ""}
            />
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>

          <button type="submit">Entrar</button>
          <p className="auth-link"> ¿No tienes una cuenta?{" "} <Link to="/register" className="register-link">Regístrate</Link></p>
        </form>
      </div>
    </div>
  );
}
