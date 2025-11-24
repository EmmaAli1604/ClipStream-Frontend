import { Routes, Route } from "react-router-dom";
import Welcome from "../views/pages/Welcome/Welcome";
import Login from "../views/pages/Login/Login";
import Register from "../views/pages/Register/Register";
import Navbar from "../views/components/Navbar/Navbar";
import Footer from "../views/components/Footer/Footer";
import Home from "../views/pages/Home/Home";
import Buscar from "../views/pages/Buscar/Buscar.tsx";
import Profile from "../views/pages/Profile/Profile.tsx";
import EditarPerfil from "../views/pages/EditarPerfil/EditarPerfil.tsx";
import Cortometrajes from "../views/pages/Home/Cortometrajes.tsx";
import CortometrajeDetalle from "../views/pages/Cortometraje/Cortometraje.tsx";
import EditarCortometraje from "../views/pages/EditarCortometraje/EditarCortometraje.tsx";
import ComoFuncionaCinefilos from "../views/pages/Info/ComoFuncionaCinefilos.tsx";
import ComoFuncionaCreadores from "../views/pages/Info/ComoFuncionaCreadores.tsx";
import ProtectedRoute from "./ProtectedRoutes.tsx";

export default function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={ <Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home/>} />
        <Route path="/buscar" element={<Buscar/>} />
        <Route path="/profile" element={<Profile/>}/>
        <Route path="edit-profile" element={<EditarPerfil/>}/>
        <Route path="/para-cinefilos" element={<ComoFuncionaCinefilos/>} />
        <Route path="/para-creadores" element={<ComoFuncionaCreadores/>} />
        <Route path="/cortometrajes" element={<Cortometrajes/>} />
        <Route path="/cortometraje/:id" element={<CortometrajeDetalle />} />
        <Route path="/edit-cortometraje/:id" element={<EditarCortometraje />} />
      </Routes>
      <Footer/>
    </>
  );
}