import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Container, Row, Col, Card, Table } from "react-bootstrap";
import { FaTruck, FaShippingFast, FaBoxOpen, FaTasks, FaBell, FaBullhorn, FaLightbulb } from "react-icons/fa";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import "./Dashboard.css";

const InventarioForm = lazy(() => import("../InventarioForm/inventarioForm"));
const InventarioTable = lazy(() => import("../InventarioTable/inventarioTable"));
const ExportacionesForm = lazy(() => import("../ExportacionesForm/ExportacionesForm"));
const ExportacionesTable = lazy(() => import("../ExportacionesTable/ExportacionesTable"));
const DespachoNacionalForm = lazy(() => import("../DespachoNacionalForm/despachoNacionalForm"));
const DespachoNacionalTable = lazy(() => import("../DespachoNacionalTable/despachoNacionalTable"));
const TareasDiariasForm = lazy(() => import("../TareasDiariasForm/TareasDiariasForm"));
const TareasDiariasTable = lazy(() => import("../TareasDiariasTable/TareasDiariasTable"));
const Anuncios = lazy(() => import("../Anuncios/Anuncios"));

const Dashboard = ({ activeView, handleViewChange, userRole }) => {
  const [notifications, setNotifications] = useState([]);
  const [anuncios, setAnuncios] = useState([]);
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'notifications'), (snapshot) => {
      const newNotifications = snapshot.docs.map((doc) => doc.data());
      setNotifications(newNotifications);
    });

    const unsubscribeAnuncios = onSnapshot(collection(db, 'anuncios'), (snapshot) => {
      const now = new Date();
      const oneDayInMillis = 24 * 60 * 60 * 1000;
      const newAnuncios = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((anuncio) => now - (anuncio.timestamp.seconds ? anuncio.timestamp.seconds * 1000 : anuncio.timestamp) < oneDayInMillis);
      setAnuncios(newAnuncios);
    });

    return () => {
      unsubscribe();
      unsubscribeAnuncios();
    };
  }, [db]);

  return (
    <div className="dashboard-container-unique">
      <Container fluid>
        {activeView.content === "dashboard" && (
          <>
            <h1 className="mt-3 table-title-unique">Pulso Diario</h1>
            <br />
            <Row className="card-row-unique">
              {[
                { title: "Despacho Quilicura", icon: FaTruck, bgColor: "card-clientes-unique" },
                { title: "Exportaciones", icon: FaShippingFast, bgColor: "card-proveedores-unique" },
                { title: "Inventario", icon: FaBoxOpen, bgColor: "card-inventario-unique" },
                { title: "Tareas Diarias", icon: FaTasks, bgColor: "card-tareasDiarias-unique" },
              ].map((card, index) => (
                <Col key={index} md={6} lg={4}>
                  <Card className={`mb-4 shadow-sm ${card.bgColor}`} onClick={() => handleViewChange(card.title.toLowerCase().replace(" ", ""), "table")}>
                    <Card.Body className="card-body">
                      <Card.Title className="text-white">
                        {React.createElement(card.icon)} {card.title}
                        {notifications.some(notification => notification.type === card.title.toLowerCase().replace(" ", "")) && (
                          <FaBell className="notification-icon-blinking" />
                        )}
                      </Card.Title>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
              {userRole === 'Líder de Equipo' && (
                <Col md={6} lg={4}>
                  <Card className="mb-4 shadow-sm card-anuncios-unique" onClick={() => handleViewChange("anuncios", "table")}>
                    <Card.Body className="card-body">
                      <Card.Title className="text-white">
                        <FaBullhorn /> Anuncios
                        {notifications.some(notification => notification.type === "anuncios") && (
                          <FaBell className="notification-icon-blinking" />
                        )}
                      </Card.Title>
                    </Card.Body>
                  </Card>
                </Col>
              )}
            </Row>
            <h2 className="mt-4 mb-4 anuncios-title-unique">Anuncios Recientes</h2>
            <Table striped bordered hover responsive className="anuncios-table-unique">
              <thead>
                <tr>
                  <th>Mensaje</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {anuncios.map(anuncio => (
                  <tr key={anuncio.id} className="anuncio-nuevo">
                    <td>
                      <FaLightbulb className="notification-icon-blinking" /> {anuncio.mensaje}
                    </td>
                    <td>{new Date(anuncio.timestamp.seconds * 1000).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}
        <Suspense fallback={<div>Loading...</div>}>
          {activeView.content === "inventario" && activeView.view === "form" && <InventarioForm />}
          {activeView.content === "inventario" && activeView.view === "table" && <InventarioTable />}
          {activeView.content === "exportaciones" && activeView.view === "form" && <ExportacionesForm />}
          {activeView.content === "exportaciones" && activeView.view === "table" && <ExportacionesTable />}
          {activeView.content === "despachoquilicura" && activeView.view === "form" && <DespachoNacionalForm />}
          {activeView.content === "despachoquilicura" && activeView.view === "table" && <DespachoNacionalTable />}
          {activeView.content === "tareasdiarias" && activeView.view === "form" && <TareasDiariasForm />}
          {activeView.content === "tareasdiarias" && activeView.view === "table" && <TareasDiariasTable />}
          {activeView.content === "anuncios" && activeView.view === "table" && <Anuncios />}
        </Suspense>
        <br/><br/><br/><br/>        
      </Container>
    </div>
  );
};

export default Dashboard;
