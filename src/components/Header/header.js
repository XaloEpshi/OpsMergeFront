import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Offcanvas } from 'react-bootstrap';
import { FaSignOutAlt } from 'react-icons/fa';
import FormularioExportaciones from '../../pages/ExportacionesForm/ExportacionesForm';
import InventarioForm from '../../pages/InventarioForm/inventarioForm';
import TareasDiariasForm from '../../pages/TareasDiariasForm/TareasDiariasForm';
import CustomCalendar from '../../pages/CustomCalendar/CustomCalendar';
import AgendaDiaria from '../../pages/AgendaDiaria/AgendaDiaria';
import Anuncios from '../../pages/Anuncios/Anuncios';
import ForoDiscusion from '../../pages/ForoDiscusion/ForoDiscusion';
import './Header.css';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';

const Header = ({ userData, isAuthenticated, isLoading }) => {
  const [showExportacionesForm, setShowExportacionesForm] = useState(false);
  const [showInventarioForm, setShowInventarioForm] = useState(false);
  const [showTareasForm, setShowTareasForm] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [showAgendaDiaria, setShowAgendaDiaria] = useState(false);
  const [showAnuncios, setShowAnuncios] = useState(false);
  const [showForoDiscusion, setShowForoDiscusion] = useState(false);
  const navigate = useNavigate();

  const handleNavLinkClick = (setShowForm) => {
    setShowForm(true);
    setShowOffcanvas(false); // Cierra el menú desplegable
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate("/"); // Redirige al usuario a la página principal
      })
      .catch((error) => {
        console.error("Error al cerrar sesión:", error);
      });
  };

  const renderNavLinks = () => (
    <ul className="navbar-nav">
      <li className="nav-item">
        <button className="nav-link btn-link" onClick={() => handleNavLinkClick(setShowExportacionesForm)}>
          Agenda Exportacion
        </button>
      </li>
      <li className="nav-item">
        <button className="nav-link btn-link" onClick={() => handleNavLinkClick(setShowInventarioForm)}>
          Inventario Semanal
        </button>
      </li>
      <li className="nav-item">
        <button className="nav-link btn-link" onClick={() => handleNavLinkClick(setShowTareasForm)}>
          Nueva Tarea
        </button>
      </li>   
      <li className="nav-item">
        <button className="nav-link btn-link" onClick={() => handleNavLinkClick(setShowAgendaDiaria)}>
          Asignación Horas QLS
        </button>
      </li>
      <li className="nav-item">
        <button className="nav-link btn-link" onClick={() => handleNavLinkClick(setShowAnuncios)}>
          Anuncios
        </button>
      </li>
      <li className="nav-item">
        <button className="nav-link btn-link" onClick={() => handleNavLinkClick(setShowForoDiscusion)}>
          Foro de Discusión
        </button>
      </li>
      <li className="nav-item">
        <button className="nav-link btn-link" onClick={() => handleNavLinkClick(setShowCalendar)}>
          Calendario
        </button>
      </li>
    </ul>
  );

  if (isLoading) {
    return (
      <nav className="navbar navbar-expand-lg">
        <a className="navbar-brand" href="./Dashboard">
          <i className="fas fa-box-open"></i> OpsMerge
        </a>
        <span className="navbar-text navbar-text-loading">Cargando...</span>
      </nav>
    );
  }

  return (
    <>
      {isAuthenticated && (
        <>
          <nav className="navbar navbar-expand-lg">
            <a className="navbar-brand" href="./Dashboard">
              <i className="fas fa-box-open"></i> OpsMerge
            </a>
            <button
              className="navbar-toggler"
              type="button"
              onClick={() => setShowOffcanvas(true)}
              aria-controls="offcanvasNavbar"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              {renderNavLinks()}
              <ul className="navbar-nav ml-auto">
                <li className="nav-item">
                  <button className="nav-link btn-link" onClick={handleLogout}>
                    <FaSignOutAlt /> Cerrar Sesión
                  </button>
                </li>
              </ul>
            </div>
          </nav>

          <Offcanvas show={showOffcanvas} onHide={() => setShowOffcanvas(false)}>
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>
                Bienvenido {userData.name} ({userData.profile})
                <hr/>
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              {renderNavLinks()}
              <div className="logout-section">
                <button className="nav-link btn-link" onClick={handleLogout}>
                  <FaSignOutAlt /> Cerrar Sesión
                </button>
              </div>
            </Offcanvas.Body>
          </Offcanvas>
          
          <Modal show={showExportacionesForm} onHide={() => setShowExportacionesForm(false)} size="lg" centered>
            <Modal.Header closeButton>
              <Modal.Title>Nueva Exportación</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <FormularioExportaciones />

            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowExportacionesForm(false)}>Cerrar</Button>
            </Modal.Footer>
          </Modal>
          <Modal show={showInventarioForm} onHide={() => setShowInventarioForm(false)} size="lg" centered>
            <Modal.Header closeButton>
              <Modal.Title>Nuevo Inventario</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <InventarioForm />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowInventarioForm(false)}>Cerrar</Button>
            </Modal.Footer>
          </Modal>
          <Modal show={showTareasForm} onHide={() => setShowTareasForm(false)} size="lg" centered>
            <Modal.Header closeButton>
              <Modal.Title>Nueva Tarea</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <TareasDiariasForm />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowTareasForm(false)}>Cerrar</Button>
            </Modal.Footer>
          </Modal>   
          <Modal show={showCalendar} onHide={() => setShowCalendar(false)} size="lg" centered>
            <Modal.Header closeButton>
            <Modal.Title>Calendario</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <CustomCalendar />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowCalendar(false)}>Cerrar</Button>
            </Modal.Footer>
          </Modal>
          <Modal show={showAgendaDiaria} onHide={() => setShowAgendaDiaria(false)} size="lg" centered>
            <Modal.Header closeButton>
              <Modal.Title>Agenda Diaria</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <AgendaDiaria />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowAgendaDiaria(false)}>Cerrar</Button>
            </Modal.Footer>
          </Modal>
          <Modal show={showAnuncios} onHide={() => setShowAnuncios(false)} size="lg" centered>
            <Modal.Header closeButton>
              <Modal.Title>Anuncios</Modal.Title>
              </Modal.Header>
            <Modal.Body>
              <Anuncios />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowAnuncios(false)}>Cerrar</Button>
            </Modal.Footer>
          </Modal>
          <Modal show={showForoDiscusion} onHide={() => setShowForoDiscusion(false)} size="lg" centered>
            <Modal.Header closeButton>
              <Modal.Title>Foro de Discusión</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <ForoDiscusion />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowForoDiscusion(false)}>Cerrar</Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </>
  );
};

export default Header;
