// components/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoutes({ children }: ProtectedRouteProps) {
  // Verificar si el usuario está autenticado
  // Puedes usar tu propio método de autenticación (context, redux, localStorage, etc.)
  const isAuthenticated = () => {
    const token = localStorage.getItem("authToken");
    // O puedes verificar en tu contexto de autenticación
    return !!token; // Retorna true si existe el token
  };

  if (!isAuthenticated()) {
    // Redirigir al login si no está autenticado
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}