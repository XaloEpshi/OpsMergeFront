import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Spinner, Alert, Button, Modal, Form } from 'react-bootstrap';
import { FaEdit, FaSyncAlt } from 'react-icons/fa';

const TareasDiariasTable = () => {
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentTarea, setCurrentTarea] = useState(null);

  const fetchTareas = async () => {
    try {
      const response = await axios.get('https://opsmergeback-production.up.railway.app/api/tareas');
      setTareas(response.data);
    } catch (error) {
      console.error('Error al obtener las tareas:', error);
      setError('No se pudieron cargar las tareas. Por favor, intenta nuevamente más tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTareas();
  }, []);

  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleEditClick = (tarea) => {
    setCurrentTarea({
      ...tarea,
      fecha_inicio: formatDate(tarea.fecha_inicio),
      fecha_termino: formatDate(tarea.fecha_termino),
    });
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setCurrentTarea(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentTarea((prevTarea) => ({ ...prevTarea, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedTarea = { ...currentTarea, estado_tarea: "Completado" }; // Cambiar estado a Completado
      await axios.put(`https://opsmergeback-production.up.railway.app/api/tareas/${currentTarea.id}`, updatedTarea);
      setTareas((prevTareas) =>
        prevTareas.map((tarea) =>
          tarea.id === currentTarea.id ? updatedTarea : tarea
        )
      );
      setShowModal(false);
    } catch (error) {
      console.error('Error al actualizar la tarea:', error);
    }
  };

  return (
    <div className="tareas-table-container">
      <h3>Tareas Diarias</h3>
      <Button variant="primary" onClick={fetchTareas}>
        <FaSyncAlt /> Actualizar
      </Button>
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <Spinner animation="border" />
      ) : (
        <Table striped bordered hover responsive className="tareas-table">
          <thead>
            <tr>
              <th>Nombre de la Tarea</th>
              <th>Descripción</th>
              <th>Responsable</th>
              <th>Estado de la Tarea</th>
              <th>Fecha Inicio</th>
              <th>Fecha Término</th>
              <th>Comentarios</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tareas.map((tarea) => (
              <tr key={tarea.id}>
                <td>{tarea.nombre_tarea}</td>
                <td>{tarea.descripcion}</td>
                <td>{tarea.responsable}</td>
                <td>{tarea.estado_tarea}</td>
                <td>{formatDate(tarea.fecha_inicio)}</td>
                <td>{formatDate(tarea.fecha_termino)}</td>
                <td>{tarea.comentarios}</td>
                <td>
                  <Button variant="light" onClick={() => handleEditClick(tarea)}>
                    <FaEdit />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Tarea</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentTarea && (
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="nombreTarea">
                <Form.Label>Nombre de la Tarea</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre_tarea"
                  value={currentTarea.nombre_tarea}
                  onChange={handleChange}
                  required
                  disabled
                />
              </Form.Group>
              <Form.Group controlId="descripcion">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  name="descripcion"
                  value={currentTarea.descripcion}
                  onChange={handleChange}
                  required
                  disabled
                />
              </Form.Group>
              <Form.Group controlId="responsable">
                <Form.Label>Responsable</Form.Label>
                <Form.Control
                  type="text"
                  name="responsable"
                  value={currentTarea.responsable}
                  onChange={handleChange}
                  required
                  disabled
                />
              </Form.Group>
              <Form.Group controlId="estadoTarea">
                <Form.Label>Estado de la Tarea</Form.Label>
                <Form.Control
                  as="select"
                  name="estado_tarea"
                  value={currentTarea.estado_tarea}
                  onChange={handleChange}
                  required
                  disabled
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Completado">Completado</option>
                </Form.Control>
              </Form.Group>
              <Form.Group controlId="fechaInicio">
                <Form.Label>Fecha Inicio</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_inicio"
                  value={currentTarea.fecha_inicio}
                  onChange={handleChange}
                  required
                  disabled
                />
              </Form.Group>
              <Form.Group controlId="fechaTermino">
                <Form.Label>Fecha Término</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_termino"
                  value={currentTarea.fecha_termino}
                  onChange={handleChange}
                  required
                  disabled
                />
              </Form.Group>
              <Form.Group controlId="comentarios">
                <Form.Label>Comentarios</Form.Label>
                <Form.Control
                  as="textarea"
                  name="comentarios"
                  value={currentTarea.comentarios}
                  onChange={handleChange}
                />
              </Form.Group>
              <Button variant="primary" type="submit">
                Guardar
              </Button>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TareasDiariasTable;
