import React, { useState, useEffect } from 'react';  // Importa React y hooks (useState, useEffect)
import axios from 'axios';  // Importa axios para hacer peticiones HTTP
import { Table, Spinner, Alert, Button, Modal, Form } from 'react-bootstrap';  // Importa componentes de React-Bootstrap
import { FaEdit, FaSyncAlt } from 'react-icons/fa';  // Importa íconos de react-icons

const TareasDiariasTable = () => {
  // Estados para almacenar datos y manejar la interfaz de usuario
  const [tareas, setTareas] = useState([]);  // Estado para almacenar las tareas
  const [loading, setLoading] = useState(true);  // Estado para indicar si los datos se están cargando
  const [error, setError] = useState(null);  // Estado para manejar errores
  const [showModal, setShowModal] = useState(false);  // Estado para controlar la visibilidad del modal
  const [currentTarea, setCurrentTarea] = useState(null);  // Estado para almacenar la tarea seleccionada para editar

  // Función para obtener las tareas desde la API
  const fetchTareas = async () => {
    try {
      const response = await axios.get('https://opsmergeback-production.up.railway.app/api/tareas');  // Petición GET a la API
      setTareas(response.data);  // Si la petición es exitosa, guarda los datos de las tareas
    } catch (error) {
      console.error('Error al obtener las tareas:', error);  // En caso de error, imprime en consola
      setError('No se pudieron cargar las tareas. Por favor, intenta nuevamente más tarde.');  // Muestra un mensaje de error
    } finally {
      setLoading(false);  // Independientemente del resultado, desactiva el indicador de carga
    }
  };

  // useEffect que ejecuta fetchTareas cuando el componente se monta
  useEffect(() => {
    fetchTareas();  // Llama a la función para cargar las tareas
  }, []);  // El array vacío asegura que solo se ejecute al montar el componente

  // Función para formatear las fechas en un formato legible
  const formatDate = (isoDate) => {
    if (!isoDate) return "";  // Si la fecha no existe, devuelve una cadena vacía
    const date = new Date(isoDate);  // Convierte la fecha ISO a un objeto Date
    const year = date.getFullYear();  // Obtiene el año
    const month = String(date.getMonth() + 1).padStart(2, '0');  // Obtiene el mes (con 0 delante si es necesario)
    const day = String(date.getDate()).padStart(2, '0');  // Obtiene el día (con 0 delante si es necesario)
    return `${year}-${month}-${day}`;  // Devuelve la fecha en formato "YYYY-MM-DD"
  };

  // Función que se llama cuando se hace clic en el botón de editar
  const handleEditClick = (tarea) => {
    setCurrentTarea({
      ...tarea,  // Crea una copia de la tarea seleccionada
      fecha_inicio: formatDate(tarea.fecha_inicio),  // Formatea la fecha de inicio
      fecha_termino: formatDate(tarea.fecha_termino),  // Formatea la fecha de término
    });
    setShowModal(true);  // Muestra el modal de edición
  };

  // Función para cerrar el modal
  const handleClose = () => {
    setShowModal(false);  // Oculta el modal
    setCurrentTarea(null);  // Resetea la tarea seleccionada
  };

  // Función que maneja los cambios en los campos del formulario del modal
  const handleChange = (e) => {
    const { name, value } = e.target;  // Obtiene el nombre y valor del campo
    setCurrentTarea((prevTarea) => ({ ...prevTarea, [name]: value }));  // Actualiza la tarea con el nuevo valor
  };

  // Función para manejar el envío del formulario (cuando se hace clic en "Guardar")
  const handleSubmit = async (e) => {
    e.preventDefault();  // Previene el comportamiento predeterminado del formulario
    try {
      const updatedTarea = { ...currentTarea, estado_tarea: "Completado" };  // Marca la tarea como "Completada"
      await axios.put(`https://opsmergeback-production.up.railway.app/api/tareas/${currentTarea.id}`, updatedTarea);  // Envia la solicitud PUT para actualizar la tarea
      setTareas((prevTareas) =>  // Actualiza la lista de tareas con la tarea modificada
        prevTareas.map((tarea) => 
          tarea.id === currentTarea.id ? updatedTarea : tarea  // Si la tarea tiene el mismo id, reemplázala con la tarea actualizada
        )
      );
      setShowModal(false);  // Cierra el modal después de actualizar la tarea
    } catch (error) {
      console.error('Error al actualizar la tarea:', error);  // Maneja el error si la actualización falla
    }
  };

  return (
    <div className="tareas-table-container">
      <h3>Tareas Diarias</h3>
      {/* Botón para actualizar la lista de tareas */}
      <Button variant="primary" onClick={fetchTareas}>
        <FaSyncAlt /> Actualizar
      </Button>

      {/* Si hay un error, muestra un mensaje de alerta */}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Si está cargando, muestra un spinner */}
      {loading ? (
        <Spinner animation="border" />
      ) : (
        // Si no está cargando, muestra la tabla con las tareas
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
            {tareas.map((tarea) => (  // Mapea sobre las tareas y las muestra en la tabla
              <tr key={tarea.id}>
                <td>{tarea.nombre_tarea}</td>
                <td>{tarea.descripcion}</td>
                <td>{tarea.responsable}</td>
                <td>{tarea.estado_tarea}</td>
                <td>{formatDate(tarea.fecha_inicio)}</td>
                <td>{formatDate(tarea.fecha_termino)}</td>
                <td>{tarea.comentarios}</td>
                {/* Botón de editar tarea */}
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

      {/* Modal para editar la tarea */}
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Tarea</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentTarea && (  // Si hay una tarea seleccionada para editar, muestra el formulario
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="nombreTarea">
                <Form.Label>Nombre de la Tarea</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre_tarea"
                  value={currentTarea.nombre_tarea}
                  onChange={handleChange}
                  required
                  disabled  // Deshabilita el campo ya que no se puede cambiar el nombre
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
                  disabled  // Deshabilita el campo de descripción
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
                  disabled  // Deshabilita el campo de responsable
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
                  disabled  // Deshabilita el campo de estado
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
                Guardar Cambios
              </Button>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TareasDiariasTable;  // Exporta el componente
