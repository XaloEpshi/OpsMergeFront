import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const TareasDiariasForm = ({ onTareaAgregada, onTareaActualizada, tareaEditable, onClose }) => {
  const [tarea, setTarea] = useState({
    id: '',
    nombre_tarea: '',
    descripcion: '',
    responsable: '',
    estado_tarea: 'Pendiente',
    fecha_inicio: '',
    fecha_termino: '',
    comentarios: ''
  });

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    const fetchUsuarios = async () => {
      const db = getFirestore();
      const usersCollection = collection(db, 'users');
      const userSnapshot = await getDocs(usersCollection);
      const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsuarios(userList);
      setLoading(false);
    };

    fetchUsuarios();
  }, []);

  useEffect(() => {
    if (tareaEditable) {
      const formatFecha = (fecha) => {
        if (!fecha) return '';
        const date = new Date(fecha);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      setTarea({
        id: tareaEditable.id || '',
        nombre_tarea: tareaEditable.nombre_tarea || '',
        descripcion: tareaEditable.descripcion || '',
        responsable: tareaEditable.responsable || '',
        estado_tarea: 'Pendiente',
        fecha_inicio: formatFecha(tareaEditable.fecha_inicio),
        fecha_termino: formatFecha(tareaEditable.fecha_termino),
        comentarios: tareaEditable.comentarios || ''
      });
    }
  }, [tareaEditable]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTarea({ ...tarea, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Datos enviados:', tarea);

    try {
      if (tarea.id) {
        // Actualizar tarea existente
        const response = await axios.put(`/api/tareas/${tarea.id}`, {
          nombre_tarea: tarea.nombre_tarea,
          descripcion: tarea.descripcion,
          responsable: tarea.responsable,
          fecha_inicio: tarea.fecha_inicio,
          fecha_termino: tarea.fecha_termino,
          comentarios: tarea.comentarios,
          estado_tarea: 'Completado'
        });
        console.log('Tarea actualizada:', response.data);
        if (onTareaActualizada) {
          onTareaActualizada(response.data);
        }
      } else {
        // Crear nueva tarea
        const response = await axios.post('/api/tareas', tarea);
        console.log('Tarea creada:', response.data);
        if (onTareaAgregada) {
          onTareaAgregada(response.data);
        }
      }

      setShowSuccessMessage(true);

      // Limpiar el formulario
      setTarea({
        id: '',
        nombre_tarea: '',
        descripcion: '',
        responsable: '',
        estado_tarea: 'Pendiente',
        fecha_inicio: '',
        fecha_termino: '',
        comentarios: ''
      });

      // Cerrar el formulario
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error al guardar la tarea:', error);
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <Form onSubmit={handleSubmit}>
      {showSuccessMessage && (
        <Alert variant="success" onClose={() => setShowSuccessMessage(false)} dismissible>
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
          disabled={!!tareaEditable}
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
          disabled={!!tareaEditable}
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
          disabled={!!tareaEditable}
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
          value={tarea.fecha_inicio}
          onChange={handleChange}
          required
          disabled={!!tareaEditable}
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
          disabled={!!tareaEditable}
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
  );
};

export default TareasDiariasForm;
