import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./UserMenu.css"; 

export default function UserMenu({ userData }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      if (userData && userData.usuarioId) {
        await fetch(`http://localhost:8080/api/auth/logout/${userData.usuarioId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      window.dispatchEvent(new CustomEvent('authChange', { 
        detail: { isLoggedIn: false } 
      }));
      
      setOpen(false);
      navigate("/login");
      
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new CustomEvent('authChange', { 
        detail: { isLoggedIn: false } 
      }));
      setOpen(false);
      navigate("/login");
    }
  };

  // Obtener iniciales del usuario
  const getUserInitials = () => {
    if (userData) {
      const firstInitial = userData.nombre ? userData.nombre.charAt(0).toUpperCase() : 'U';
      const lastInitial = userData.apellido ? userData.apellido.charAt(0).toUpperCase() : '';
      return `${firstInitial}${lastInitial}`;
    }
    return 'U';
  };

  return (
    <div className="user-menu-container">
      {/* Botón circular */}
      <button onClick={() => setOpen(!open)} className="user-menu-button">
        <span className="user-initial">
          {getUserInitials()}
        </span>
      </button>
      {/* Dropdown */}
      {open && (
        <div className="user-dropdown">
          <Link to="/profile" className="dropdown-item" onClick={() => setOpen(false)}>
            Perfil
          </Link>
          <button className="dropdown-item logout" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}