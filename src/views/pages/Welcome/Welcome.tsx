import React from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, MessageSquareText, CircleDollarSign } from "lucide-react";
import SobreNosotros from "../../components/SobreNosotros/SobreNosotros";
import cineImage from "../../../assets/cine.png"
import "./Welcome.css";

export default function Welcome() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  const handleRegsiter = () => {
    navigate("/register");
  }

  return (
    <> 
    <div className="welcome-container" style={{ backgroundImage: `url(${cineImage})` }} >
      <div className="overlay">
        <h1>ClipStream</h1>
        <h2>La plataforma para cortometrajes hispanohablantes.</h2>
        <p>Exhibición, financiación y crítica. Todo en una sola plataforma.</p>
        <div className="temp">
            <button onClick={handleLogin}>Iniciar sesión</button>
            <button onClick={handleRegsiter}>Unirse a la comunidad</button>
        </div>
      </div>
    </div>
    <div className="rest">
        <p>Una plataforma, tres pilares ...</p>
        <div className="pilares">
            <div className="pilar pilar1">
              <UploadCloud size={36} className="pilar-icon" />
              <p>Sube y comparte tus cortometrajes en un entorno seguro diseñado específicamente para creadores independientes.</p>
            </div>
            <div className="pilar pilar2">
              <MessageSquareText size={36} className="pilar-icon" />
              <p>Sistema de reseñas y calificaciones. Recibe feedback constructivo de una comunidad cinéfila que ayuda a perfeccionar tu trabajo.</p>
            </div>
            <div className="pilar pilar3">
              <CircleDollarSign size={36} className="pilar-icon" />
              <p>Un ecosistema listo para monetizar tu trabajo y financiar futuros proyectos. (Próximamente: Crowdfunding y PPV).</p>
            </div>
        </div>
    </div>
        <SobreNosotros />
    </>
  );
}
