import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import cineImage from "../../../assets/cine.png";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ user?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { user?: string; password?: string; general?: string } = {};

    if (!user.trim()) newErrors.user = "Por favor, ingresa tu nombre o correo.";
    if (!password.trim()) newErrors.password = "Por favor, ingresa tu contraseña.";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:8080/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: user,
            password: password
          })
        });

        const data = await response.json();

        if (response.ok) {
          // Guardar datos en localStorage
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data));
          navigate("/home");
        } else {
          setErrors({ general: data.mensaje || "Credenciales incorrectas" });
        }
      } catch (error) {
        console.error('Error al conectar con el servidor:', error);
        setErrors({ general: "Error de conexión con el servidor" });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser(e.target.value);
    if (errors.user || errors.general) setErrors((prev) => ({ ...prev, user: undefined, general: undefined }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password || errors.general) setErrors((prev) => ({ ...prev, password: undefined, general: undefined }));
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
              disabled={isLoading}
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
              disabled={isLoading}
            />
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>

          {/* Error general */}
          {errors.general && <p className="error-text general-error">{errors.general}</p>}

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Cargando..." : "Entrar"}
          </button>
          
          <p className="auth-link"> 
            ¿No tienes una cuenta?{" "} 
            <Link to="/register" className="register-link">Regístrate</Link>
          </p>
        </form>
      </div>
    </div>
  );
}