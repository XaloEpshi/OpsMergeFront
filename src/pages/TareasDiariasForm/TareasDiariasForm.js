import React, { useState, useEffect } from "react"; // Importa React y hooks necesarios.
import { Form, Button, Alert, Table, Spinner } from "react-bootstrap"; // Componentes de Bootstrap para formularios, botones, alertas, tablas y spinner.
import axios from "axios"; // Importa Axios para hacer peticiones HTTP.
import { getFirestore, collection, getDocs } from "firebase/firestore"; // Importa Firebase para obtener usuarios desde Firestore.
import { FaEdit, FaTrashAlt } from "react-icons/fa"; // Iconos de editar y eliminar.

const TareasDiariasForm = () => {
  // Estado inicial para las variables de tarea, usuarios, tareas, y otros estados de UI.
  const [tarea, setTarea] = useState({
    id: "",
    nombre_tarea: "",
    descripcion: "",
    responsable: "",
    estado_tarea: "Pendiente",
    fecha_inicio: "",
    fecha_termino: "",
    comentarios: "",
  });
  const [usuarios, setUsuarios] = useState([]); // Estado para almacenar la lista de usuarios.
  const [tareas, setTareas] = useState([]); // Estado para almacenar las tareas.
  const [loading, setLoading] = useState(true); // Estado para controlar el loading.
  const [showSuccessMessage, setShowSuccessMessage] = useState(false); // Estado para mostrar mensaje de éxito.
  const [error, setError] = useState(null); // Estado para manejar errores.
  const [editingTarea, setEditingTarea] = useState(null); // Estado para almacenar la tarea que está siendo editada.
  const [showAlert, setShowAlert] = useState(false); // Estado para mostrar alertas.

  // useEffect para cargar los usuarios desde Firebase y las tareas desde la API cuando el componente se monta.
  useEffect(() => {
    const fetchUsuarios = async () => {
      const db = getFirestore(); // Obtiene la instancia de Firestore.
      const usersCollection = collection(db, "users"); // Accede a la colección "users" en Firestore.
      const userSnapshot = await getDocs(usersCollection); // Obtiene los documentos de la colección.
      const userList = userSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })); // Mapea los documentos de usuarios a un array.
      setUsuarios(userList); // Actualiza el estado de usuarios.
    };

    const fetchTareas = async () => {
      try {
        // Realiza una solicitud GET para obtener las tareas desde una API.
        const response = await axios.get("https://opsmergeback-production.up.railway.app/api/tareas");
        setTareas(response.data); // Actualiza el estado de tareas.
      } catch (error) {
        // Maneja errores en la obtención de tareas.
        console.error("Error al obtener las tareas:", error);
        setError("No se pudieron cargar las tareas. Por favor, intenta nuevamente más tarde.");
      } finally {
        setLoading(false); // Desactiva el loading.
      }
    };

    fetchUsuarios(); // Llama a la función para obtener los usuarios.
    fetchTareas(); // Llama a la función para obtener las tareas.
  }, []); // Este useEffect se ejecuta solo una vez cuando el componente se monta.

  // useEffect para formatear la fecha cuando se edita una tarea.
  useEffect(() => {
    if (editingTarea) {
      const formatFecha = (fecha) => {
        if (!fecha) return "";
        const date = new Date(fecha);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`; // Formatea la fecha en formato YYYY-MM-DD.
      };

      setTarea({
        id: editingTarea.id || "",
        nombre_tarea: editingTarea.nombre_tarea || "",
        descripcion: editingTarea.descripcion || "",
        responsable: editingTarea.responsable || "",
        estado_tarea: editingTarea.estado_tarea || "Pendiente",
        fecha_inicio: formatFecha(editingTarea.fecha_inicio),
        fecha_termino: formatFecha(editingTarea.fecha_termino),
        comentarios: editingTarea.comentarios || "",
      }); // Establece los valores de la tarea en el formulario cuando se edita.
    }
  }, [editingTarea]);

  // Manejador de cambios en el formulario.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTarea({ ...tarea, [name]: value }); // Actualiza el estado de tarea con el nuevo valor.
  };

  // Manejador de envío del formulario para crear o actualizar tareas.
  const handleSubmit = async (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario.

    // Verifica que los campos obligatorios estén completos.
    if (!tarea.nombre_tarea || !tarea.descripcion || !tarea.responsable) {
      alert("Por favor completa todos los campos requeridos.");
      return;
    }

    try {
      let response;
      if (tarea.id) {
        // Si hay una tarea con ID, actualiza la tarea existente.
        response = await axios.put(
          `https://opsmergeback-production.up.railway.app/api/tareas/${tarea.id}`,
          {
            nombre_tarea: tarea.nombre_tarea,
            descripcion: tarea.descripcion,
            responsable: tarea.responsable,
            fecha_inicio: tarea.fecha_inicio,
            fecha_termino: tarea.fecha_termino,
            comentarios: tarea.comentarios,
            estado_tarea: tarea.estado_tarea,
          }
        );
        setTareas((prevTareas) =>
          prevTareas.map((t) => (t.id === tarea.id ? response.data.tarea : t))
        ); // Actualiza la lista de tareas con la tarea modificada.
      } else {
        // Si no hay tarea ID, crea una nueva tarea.
        response = await axios.post("https://opsmergeback-production.up.railway.app/api/tareas", {
          ...tarea,
          estado_tarea: "Pendiente",
        });
        setTareas([...tareas, response.data]); // Agrega la nueva tarea a la lista de tareas.
      }

      setShowSuccessMessage(true); // Muestra el mensaje de éxito.
      setTimeout(() => setShowSuccessMessage(false), 3000); // Oculta el mensaje de éxito después de 3 segundos.

      // Limpia el formulario después de guardar la tarea.
      setTarea({
        id: "",
        nombre_tarea: "",
        descripcion: "",
        responsable: "",
        estado_tarea: "Pendiente",
        fecha_inicio: "",
        fecha_termino: "",
        comentarios: "",
      });
    } catch (error) {
      console.error("Error al guardar la tarea:", error);
      alert("Ocurrió un error al guardar la tarea. Por favor intenta nuevamente.");
    }
  };

  // Manejador de clic en editar para cargar la tarea en el formulario de edición.
  const handleEditClick = (tarea) => {
    setEditingTarea(tarea);
  };

  // Manejador de clic en eliminar para eliminar una tarea de la API y la lista.
  const handleDeleteClick = async (id) => {
    try {
      await axios.delete(`https://opsmergeback-production.up.railway.app/api/tareas/${id}`);
      setTareas((prevTareas) => prevTareas.filter((tarea) => tarea.id !== id)); // Filtra la tarea eliminada.
      setShowAlert(true); // Muestra alerta de éxito.
      setTimeout(() => setShowAlert(false), 3000); // Oculta la alerta después de 3 segundos.
    } catch (error) {
      console.error("Error al eliminar la tarea:", error);
    }
  };

  // Función para formatear las fechas de inicio y término.
  const formatFecha = (fecha) => {
    if (!fecha) return "";
    const date = new Date(fecha);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Los meses empiezan desde 0.
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`; // Formatea la fecha en formato YYYY-MM-DD.
  };

  // Si los datos están cargando, muestra un spinner.
  if (loading) {
    return <Spinner animation="border" />;
  }

  return (
    <div>
      <Form onSubmit={handleSubmit}>
        {showSuccessMessage && (
          <Alert
            variant="success"
            onClose={() => setShowSuccessMessage(false)}
            dismissible
          >
            Tarea guardada con éxito.
          </Alert>
        )}
        <Form.Group controlId="nombreTarea">
          <Form.Label>Nombre de la Tarea</Form.Label>
          <Form.Control
            type="text"
            name="nombre_tarea"
            value={tarea.nombre_tarea}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group controlId="descripcion">
          <Form.Label>Descripción</Form.Label>
          <Form.Control
            as="textarea"
            name="descripcion"
            value={tarea.descripcion}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group controlId="responsable">
          <Form.Label>Responsable</Form.Label>
          <Form.Control
            as="select"
            name="responsable"
            value={tarea.responsable}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione un responsable</option>
            {usuarios.map((usuario) => (
              <option key={usuario.id} value={usuario.username}>
                {usuario.username}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        <Form.Group controlId="estadoTarea">
          <Form.Label>Estado de la Tarea</Form.Label>
          <Form.Control
            as="select"
            name="estado_tarea"
            value={tarea.estado_tarea}
            onChange={handleChange}
            disabled={true} // Deshabilitar este campo al crear una nueva tarea
            required
          >
            <option value="Pendiente">Pendiente</option>
          </Form.Control>
        </Form.Group>
        <Form.Group controlId="fechaInicio">
          <Form.Label>Fecha Inicio</Form.Label>
          <Form.Control
            type="date"
            name="fecha_inicio"
            value={tarea.fecha_inicio}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group controlId="fechaTermino">
          <Form.Label>Fecha Término</Form.Label>
          <Form.Control
            type="date"
            name="fecha_termino"
            value={tarea.fecha_termino}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group controlId="comentarios">
          <Form.Label>Comentarios</Form.Label>
          <Form.Control
            as="textarea"
            name="comentarios"
            value={tarea.comentarios}
            onChange={handleChange}
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Guardar
        </Button>
      </Form>
      <h3 className="mt-4">Lista de Tareas</h3>
      {showAlert && (
        <Alert variant="success">Operación realizada con éxito</Alert>
      )}
      {error && <Alert variant="danger">{error}</Alert>}
      <Table striped bordered hover responsive className="mt-4">
        <thead>
          <tr>
            <th>Nombre de la Tarea</th>
            <th>Descripción</th>
            <th>Responsable</th>
            <th>Estado</th>
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
              <td>{formatFecha(tarea.fecha_inicio)}</td>
              <td>{formatFecha(tarea.fecha_termino)}</td>
              <td>{tarea.comentarios}</td>
              <td>
                <Button
                  variant="info"
                  onClick={() => handleEditClick(tarea)}
                >
                  <FaEdit />
                </Button>
                <Button
                  variant="danger"
                  className="ml-2"
                  onClick={() => handleDeleteClick(tarea.id)}
                >
                  <FaTrashAlt />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default TareasDiariasForm;
