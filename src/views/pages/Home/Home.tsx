import React from "react";
import { useNavigate } from "react-router-dom";
import cineImage from "../../../assets/cine.png"
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  const handleRegsiter = () => {
    navigate("/register");
  }

  return (
    <div className="home-container">
      <div className="overlay">
        <p>No hay cortometrajes por mostrar.</p>
      </div>
    </div>
  );
}
