import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Alert, Spinner } from 'react-bootstrap';
import { FaEdit, FaTrashAlt, FaSyncAlt, FaTimes } from 'react-icons/fa';
import TareasDiariasForm from '../TareasDiariasForm/TareasDiariasForm';
import './TareasDiariasTable.css';
import { getAuth } from 'firebase/auth';

const TareasDiariasTable = ({ nuevasTareas = [], user }) => {
  const [tareas, setTareas] = useState([]);
  const [editingTarea, setEditingTarea] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);

  const fetchTareas = async () => {
    try {
      const response = await axios.get('/api/tareas');
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

  useEffect(() => {
    if (nuevasTareas.length > 0) {
      setTareas((prevTareas) => [...prevTareas, ...nuevasTareas]);
    }
  }, [nuevasTareas]);

  useEffect(() => {
    const auth = getAuth();
    const userLoggedIn = auth.currentUser;
    if (userLoggedIn) {
      setCurrentUser(userLoggedIn);
    }
  }, []);

  const handleEditClick = (tarea) => {
    setEditingTarea(tarea);
  };

  const handleDeleteClick = async (id) => {
    try {
      await axios.delete(`/api/tareas/${id}`);
      setTareas((prevTareas) => prevTareas.filter(tarea => tarea.id !== id));
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error('Error al eliminar la tarea:', error);
    }
  };

  const handleUpdateTarea = async (tareaActualizada) => {
    try {
      const formattedFechaInicio = tareaActualizada.fecha_inicio ? tareaActualizada.fecha_inicio.split('-').reverse().join('-') : '';
      const formattedFechaTermino = tareaActualizada.fecha_termino ? tareaActualizada.fecha_termino.split('-').reverse().join('-') : '';

      await axios.put(`/api/tareas/${tareaActualizada.id}`, {
        ...tareaActualizada,
        fecha_inicio: formattedFechaInicio,
        fecha_termino: formattedFechaTermino
      });

      setTareas((prevTareas) =>
        prevTareas.map((tarea) =>
          tarea.id === tareaActualizada.id ? tareaActualizada : tarea
        )
      );
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      setEditingTarea(null);
    } catch (error) {
      console.error('Error al actualizar la tarea:', error);
      if (error.response) {
        console.error('Datos de respuesta del servidor:', error.response.data);
        console.error('Código de estado del servidor:', error.response.status);
      } else if (error.request) {
        console.error('No se recibió respuesta del servidor:', error.request);
      } else {
        console.error('Error al configurar la solicitud:', error.message);
      }
    }
  };

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    const year = String(date.getFullYear()).slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
  };

  return (
    <div className="tareas-table-container">
      <h3>Tareas Diarias</h3>
      {showAlert && <Alert variant="success">Tarea actualizada</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <Spinner animation="border" />
      ) : (
        <>
          <Button variant="primary" onClick={fetchTareas}>
            <FaSyncAlt /> Actualizar
          </Button>
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
                    <Button
                      onClick={() => handleEditClick(tarea)}
                      variant="light"
                      disabled={!currentUser || (currentUser.displayName && currentUser.displayName.trim() !== tarea.responsable.trim())}
                      title={
                        !currentUser || (currentUser.displayName && currentUser.displayName.trim() !== tarea.responsable.trim())
                          ? "No tienes permiso para editar esta tarea"
                          : ""
                      }
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      onClick={() => handleDeleteClick(tarea.id)}
                      variant="danger"
                      disabled={!currentUser || (currentUser.displayName && currentUser.displayName.trim() !== tarea.responsable.trim())}
                      title={
                        !currentUser || (currentUser.displayName && currentUser.displayName.trim() !== tarea.responsable.trim())
                          ? "No tienes permiso para eliminar esta tarea"
                          : ""
                      }
                    >
                      <FaTrashAlt />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
      {editingTarea && (
        <div>
          <Button variant="danger" onClick={() => setEditingTarea(null)}>
            <FaTimes /> Cerrar
          </Button>
          <TareasDiariasForm
            onTareaActualizada={(updatedTarea) => {
              handleUpdateTarea(updatedTarea);
              setEditingTarea(null); // Cerrar el formulario al guardar
            }}
            onClose={() => setEditingTarea(null)}
            user={currentUser}
            tareaEditable={editingTarea}
          />
        </div>
      )}
    </div>
  );
};

export default TareasDiariasTable;
