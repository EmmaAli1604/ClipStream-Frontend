import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Welcome from "../views/pages/Welcome/Welcome";
import Login from "../views/pages/Login/Login";
import Register from "../views/pages/Register/Register";
import Navbar from "../views/components/Navbar/Navbar";
import Footer from "../views/components/Footer/Footer";
import Home from "../views/pages/Home/Home";

export default function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home/>} />
      </Routes>
      <Footer/>
    </>
  );
}