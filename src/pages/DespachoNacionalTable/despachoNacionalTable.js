import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Form, Modal, Button, Alert } from "react-bootstrap";
import { FaEdit, FaSave } from "react-icons/fa";
import DespachoNacionalForm from "../../pages/DespachoNacionalForm/despachoNacionalForm";
import "./despachoNacionalTable.css";

const DespachoNacionalTable = () => {
  const [dispatches, setDispatches] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("En Progreso"); 
  const [showDespachoForm, setShowDespachoForm] = useState(false);
  const [selectedDispatch, setSelectedDispatch] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [dispatchToComplete, setDispatchToComplete] = useState(null);
  const [noResults, setNoResults] = useState(false);
  const [showAlert, setShowAlert] = useState({ type: '', message: '' });

  const fetchDispatches = async () => {
    try {
      const response = await axios.get("/api/despacho");
      if (Array.isArray(response.data)) {
        const dispatchesWithState = response.data.map(dispatch => ({
          ...dispatch,
          estado: isComplete(dispatch) ? "Completado" : "En Progreso"
        }));
        setDispatches(dispatchesWithState);
      } else {
        setDispatches([]);
        console.error("Los datos recibidos no son un array:", response.data);
      }
    } catch (error) {
      console.error("Error al obtener los datos de despachos:", error);
    }
  };

  useEffect(() => {
    fetchDispatches();
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const handleRefreshClick = () => {
    fetchDispatches();
  };

  const formatDateString = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).substring(2);
    return `${day}-${month}-${year}`;
  };

  const isComplete = (dispatch) => {
    return (
      dispatch.detalles &&
      dispatch.cantidad &&
      dispatch.fecha &&
      dispatch.nombreChofer &&
      dispatch.rutChofer &&
      dispatch.patenteCamion &&
      dispatch.patenteRampla &&
      dispatch.numeroSellos &&
      dispatch.hora
    );
  };

  const isInProgress = (dispatch) => {
    return (
      dispatch.detalles &&
      dispatch.fecha &&
      dispatch.hora &&
      (!dispatch.cantidad ||
        !dispatch.nombreChofer ||
        !dispatch.rutChofer ||
        !dispatch.patenteCamion ||
        !dispatch.patenteRampla ||
        !dispatch.numeroSellos)
    );
  };

  const filteredDispatches = dispatches.filter((dispatch) => {
    const matchesSearchTerm =
      dispatch.nombreChofer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispatch.rutChofer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispatch.patenteCamion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispatch.patenteRampla?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispatch.numeroSellos?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispatch.detalles?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispatch.fecha?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispatch.hora?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filter === "Todos" ||
      (filter === "En Progreso" && dispatch.estado === "En Progreso") ||
      (filter === "Completados" && dispatch.estado === "Completado");

    return matchesSearchTerm && matchesFilter;
  });

  useEffect(() => {
    setNoResults(filteredDispatches.length === 0);
  }, [filteredDispatches]);

  const handleEditClick = (dispatch) => {
    setSelectedDispatch(dispatch);
    setShowDespachoForm(true);
  };

  const handleSaveClick = (dispatch) => {
    if (isComplete(dispatch)) {
      setDispatchToComplete(dispatch);
      setShowConfirmModal(true);
    } else {
      setShowAlert({ type: 'danger', message: 'Por favor complete todos los campos antes de guardar.' });
      setTimeout(() => setShowAlert({ type: '', message: '' }), 3000);
    }
  };

  const confirmSave = async () => {
    if (!dispatchToComplete) return;

    try {
      setDispatches((prevDispatches) =>
        prevDispatches.map((d) => (d.id === dispatchToComplete.id ? { ...d, estado: "Completado" } : d))
      );
      setShowConfirmModal(false);
      setShowAlert({ type: 'success', message: 'Despacho guardado exitosamente. Los datos no pueden ser deshechos.' });
      setTimeout(() => setShowAlert({ type: '', message: '' }), 3000);
    } catch (error) {
      console.error("Error al guardar los datos:", error);
      setShowAlert({ type: 'danger', message: 'Hubo un error al guardar los datos.' });
      setTimeout(() => setShowAlert({ type: '', message: '' }), 3000);
    }
  };

  const handleFormSubmit = async (newDispatch) => {
    try {
      await axios.post("/api/despacho", newDispatch, {
        headers: { "Content-Type": "application/json" },
      });
      console.log("Nuevo despacho guardado correctamente");
      alert("Datos guardados");
      setDispatches((prevDispatches) => [...prevDispatches, newDispatch]);
      setShowDespachoForm(false);
    } catch (error) {
      console.error("Error al guardar los datos:", error);
    }
  };

  const handleCloseForm = () => {
    setShowDespachoForm(false);
  };

  return (
    <div className="despacho-table-container">
      <h1>Despacho Nacional</h1>
      <div className="search-filter-row">
        <Form.Control
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={handleSearch}
        />
        <Form.Control as="select" value={filter} onChange={handleFilterChange}>
          <option value="En Progreso">En Progreso</option>
          <option value="Completados">Completados</option>
          <option value="Todos">Todos</option>
        </Form.Control>
        <Button variant="primary" onClick={handleRefreshClick}>
          Actualizar
        </Button>
      </div>
      {showAlert.message && (
        <Alert variant={showAlert.type}>{showAlert.message}</Alert>
      )}
      {noResults ? (
        <div>No hay términos relacionados con su búsqueda. Intente con otro estado.</div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Destino</th>
              <th>Cantidad</th>
              <th>Fecha de Despacho</th>
              <th>Nombre Chofer</th>
              <th>RUT Chofer</th>
              <th>Patente Camión</th>
              <th>Patente Rampla</th>
              <th>Número Sellos</th>
              <th>Horario Disponible</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredDispatches.map((dispatch) => (
              <tr key={`${dispatch.id}-${dispatch.agenda_diaria_id}`}>
                <td>{dispatch.detalles}</td>
                <td>{dispatch.cantidad || '-'}</td>
                <td>{formatDateString(dispatch.fecha)}</td>
                <td>{dispatch.nombreChofer || '-'}</td>
                <td>{dispatch.rutChofer || '-'}</td>
                <td>{dispatch.patenteCamion || '-'}</td>
                <td>{dispatch.patenteRampla || '-'}</td>
                <td>{dispatch.numeroSellos || '-'}</td>
                <td>{dispatch.hora}</td>
                <td>
                  <button
                    onClick={() => handleEditClick(dispatch)}
                    title="Editar"
                    aria-label="Editar"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleSaveClick(dispatch)}
                    title="Guardar"
                    aria-label="Guardar"
                    style={{ backgroundColor: "green", color: "white" }}
                    disabled={!isComplete(dispatch)} // Deshabilitado si no está completo
                  >
                    <FaSave />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Modal show={showDespachoForm} onHide={handleCloseForm} size="lg" centered>
      <Modal.Header closeButton>
          <Modal.Title>Editar Despacho</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <DespachoNacionalForm
            dispatch={selectedDispatch}
            onSubmit={handleFormSubmit}
            onClose={handleCloseForm}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseForm}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro de que deseas guardar? Esta acción no se puede deshacer.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            No
          </Button>
          <Button variant="success" onClick={confirmSave}>
            Sí
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DespachoNacionalTable;

