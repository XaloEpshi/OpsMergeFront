import React, { useState, useEffect } from "react";
import { Form, Button, Alert, Table, Spinner } from "react-bootstrap";
import axios from "axios";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

const TareasDiariasForm = () => {
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

  const [usuarios, setUsuarios] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [error, setError] = useState(null);
  const [editingTarea, setEditingTarea] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const fetchUsuarios = async () => {
      const db = getFirestore();
      const usersCollection = collection(db, "users");
      const userSnapshot = await getDocs(usersCollection);
      const userList = userSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsuarios(userList);
    };

    const fetchTareas = async () => {
      try {
        const response = await axios.get("https://opsmergeback-production.up.railway.app/api/tareas");
        setTareas(response.data);
      } catch (error) {
        console.error("Error al obtener las tareas:", error);
        setError("No se pudieron cargar las tareas. Por favor, intenta nuevamente más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
    fetchTareas();
  }, []);

  useEffect(() => {
    if (editingTarea) {
      const formatFecha = (fecha) => {
        if (!fecha) return "";
        const date = new Date(fecha);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
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
      });
    }
  }, [editingTarea]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTarea({ ...tarea, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tarea.nombre_tarea || !tarea.descripcion || !tarea.responsable) {
      alert("Por favor completa todos los campos requeridos.");
      return;
    }

    try {
      let response;
      if (tarea.id) {
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
        );
      } else {
        response = await axios.post("https://opsmergeback-production.up.railway.app/api/tareas", {
          ...tarea,
          estado_tarea: "Pendiente",
        });
        setTareas([...tareas, response.data]);
      }

      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);

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

  const handleEditClick = (tarea) => {
    setEditingTarea(tarea);
  };

  const handleDeleteClick = async (id) => {
    try {
      await axios.delete(`https://opsmergeback-production.up.railway.app/api/tareas/${id}`);
      setTareas((prevTareas) => prevTareas.filter((tarea) => tarea.id !== id));
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error("Error al eliminar la tarea:", error);
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return "";
    const date = new Date(fecha);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Los meses empiezan desde 0
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

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
