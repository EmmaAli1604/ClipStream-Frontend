import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import UserMenu from "../UserMenu/UserMenu";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isWelcomePage = location.pathname === "/";
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  // Función para verificar si el usuario está autenticado
  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsLoggedIn(true);
        setUserData(user);
      } catch (error) {
        console.error('Error parsing user data:', error);
        clearAuth();
      }
    } else {
      setIsLoggedIn(false);
      setUserData(null);
    }
  };

  // Función para limpiar autenticación
  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserData(null);
  };

  // Verificar estado de autenticación al cargar el componente y cuando cambia la ruta
  useEffect(() => {
    checkAuthStatus();
  }, [location.pathname]); // Se ejecuta cuando cambia la ruta

  // Escuchar cambios en el localStorage (para cuando se cierra sesión desde otro componente)
  useEffect(() => {
    const handleStorageChange = () => {
      checkAuthStatus();
    };

    // Escuchar eventos de storage
    window.addEventListener('storage', handleStorageChange);
    
    // Escuchar eventos personalizados (si los usas)
    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  // Manejar evento personalizado de cambio de autenticación
  const handleAuthChange = (event) => {
    if (event.detail && event.detail.isLoggedIn === false) {
      clearAuth();
    } else {
      checkAuthStatus();
    }
  };

  // Determinar el destino del logo basado en el estado de autenticación
  const getLogoDestination = () => {
    return isLoggedIn ? "/home" : "/";
  };

  return (
    <nav className="navbar" style={{ position: "fixed", top: 0, left: 0, zIndex: 1000 }}>
      <div className="navbar-content">
        <Link 
          to={getLogoDestination()} 
          className="logo" 
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <h1 className="navbar-logo">ClipStream</h1>
        </Link>

        <div className="navbar-links">
          <Link to="/para-cinefilos">Para Cinéfilos</Link>
          <Link to="/para-creadores">Para Creadores</Link>
        </div>

        {!isWelcomePage && (
          <div className="navbar-auth" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {isLoggedIn ? (
              <>
                <Link to="/cortometrajes">Agregar cortometraje</Link>
                <UserMenu />
              </>
            ) : (
              <>
                <button 
                  className="btn-secondary" 
                  onClick={() => navigate('/login')}
                >
                  Iniciar Sesión
                </button>
                <button 
                  className="btn-primary" 
                  onClick={() => navigate('/register')}
                >
                  Unirse
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}