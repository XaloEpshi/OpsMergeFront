import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard/Dashboard";
import Header from "./components/Header/header";
import Footer from "./components/Footer/Footer";
import AuthPage from "./pages/AuthPage/AuthPage";
import ForoDiscusion from "./pages/ForoDiscusion/ForoDiscusion";
import DespachoNacionalForm from "./pages/DespachoNacionalForm/despachoNacionalForm";
import AgendaDiaria from "./pages/AgendaDiaria/AgendaDiaria";
import InventarioTable from "./pages/InventarioTable/inventarioTable";
import ExportacionesTable from "./pages/ExportacionesTable/ExportacionesTable";
import useAuth from './hooks/useAuth';

const App = () => {
  const { userData, isAuthenticated, isLoading } = useAuth();
  const [activeView, setActiveView] = useState({ content: "dashboard", view: "table" });

  const handleMenuClick = (content) => {
    setActiveView({ content, view: "table" });
  };

  const handleViewChange = (content, view) => {
    setActiveView({ content, view });
  };

  if (isLoading) {
    return <div>Loading...</div>; // Muestra un loader mientras se verifica la autenticación
  }

  return (
    <Router>
      <Header
        userData={userData}
        isAuthenticated={isAuthenticated}
        handleMenuClick={handleMenuClick}
        handleViewChange={handleViewChange}
      />
      <div className="main-content">
        <Routes>
          <Route path="/" element={isAuthenticated ? (<Navigate to="/dashboard" />) : (<AuthPage />)} />
          <Route path="/AuthPage" element={<AuthPage />} />
          <Route path="/dashboard" element={isAuthenticated ? (<Dashboard activeView={activeView} handleViewChange={handleViewChange} />) : (<Navigate to="/" />)} />
          <Route path="/inventario" element={isAuthenticated ? <InventarioTable /> : <Navigate to="/" />} />
          <Route path="/exportaciones" element={isAuthenticated ? <ExportacionesTable /> : <Navigate to="/" />} />
          <Route path="/agenda-diaria" element={isAuthenticated ? <AgendaDiaria /> : <Navigate to="/" />} />
          <Route path="/foro-discusion" element={isAuthenticated ? <ForoDiscusion /> : <Navigate to="/" />} />
          <Route path="/despacho-nacional-form" element={isAuthenticated ? <DespachoNacionalForm username={userData.username} /> : <Navigate to="/" />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
};

export default App;
