import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase'; // Importa la base de datos Firestore y la autenticación de Firebase
import { collection, onSnapshot, query, orderBy, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore'; // Importa funciones de Firestore para manejar colecciones y documentos
import { Button, Form, ListGroup } from 'react-bootstrap'; // Importa componentes de React Bootstrap para formularios y listas
import './ForoDiscusion.css'; // Importa los estilos específicos del componente

const ForoDiscusion = () => {
  // Estado para almacenar las discusiones, usuarios y otros valores
  const [discusiones, setDiscusiones] = useState([]); // Almacena las discusiones activas
  const [usuarios, setUsuarios] = useState([]); // Almacena la lista de usuarios
  const [nuevoMensaje, setNuevoMensaje] = useState(''); // Almacena el mensaje de la nueva discusión
  const [usuarioDestinatario, setUsuarioDestinatario] = useState(''); // Almacena el destinatario de la discusión
  const [respuesta, setRespuesta] = useState(''); // Almacena la respuesta a una discusión
  const [idDiscusionSeleccionada, setIdDiscusionSeleccionada] = useState(null); // Almacena el ID de la discusión seleccionada para responder
  const [nombreUsuarioAutenticado, setNombreUsuarioAutenticado] = useState(''); // Almacena el nombre del usuario autenticado

  useEffect(() => {
    // Obtener discusiones y eliminar las que tienen más de un día
    const q = query(collection(db, 'discusiones'), orderBy('timestamp', 'desc')); // Consulta para obtener las discusiones, ordenadas por fecha
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const discusionesData = [];
      const ahora = new Date(); // Obtiene la fecha actual
      querySnapshot.forEach((doc) => { // Recorre todas las discusiones
        const discusion = { ...doc.data(), id: doc.id }; // Obtiene los datos de la discusión
        const timestamp = discusion.timestamp;
        let dateObj;
        if (timestamp && typeof timestamp.toDate === 'function') {
          dateObj = timestamp.toDate(); // Convierte el timestamp de Firestore a un objeto Date
        } else {
          dateObj = new Date(timestamp); // Si no es un objeto Date, lo convierte
        }
        const diferenciaTiempo = ahora - dateObj; // Calcula la diferencia de tiempo entre la fecha actual y la fecha de la discusión
        const unDia = 24 * 60 * 60 * 1000; // Milisegundos en un día
        if (diferenciaTiempo <= unDia) { // Si la discusión es reciente (menos de un día)
          discusionesData.push(discusion); // Agrega la discusión a la lista
        } else {
          deleteDoc(doc.ref); // Elimina la discusión vieja
        }
      });
      setDiscusiones(discusionesData); // Actualiza el estado con las discusiones recientes
    });

    // Obtener usuarios registrados
    const usuariosRef = collection(db, 'users');
    const unsubscribeUsers = onSnapshot(usuariosRef, (snapshot) => {
      const usuariosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); // Convierte los datos de los usuarios en un array
      setUsuarios(usuariosData); // Actualiza el estado con los usuarios

      // Obtener el nombre del usuario autenticado desde la colección `users`
      const user = auth.currentUser; // Obtiene el usuario autenticado
      if (user) {
        const currentUserData = usuariosData.find(u => u.id === user.uid); // Busca el usuario en los datos de usuarios
        if (currentUserData) {
          setNombreUsuarioAutenticado(currentUserData.username); // Establece el nombre de usuario del usuario autenticado
        }
      }
    });

    // Limpia los listeners al desmontar el componente
    return () => {
      unsubscribe(); 
      unsubscribeUsers();
    };
  }, []); // Este useEffect solo se ejecuta una vez al montar el componente

  // Función para iniciar una nueva discusión
  const iniciarDiscusion = async (e) => {
    e.preventDefault(); // Evita que se recargue la página
    const nombreUsuario = nombreUsuarioAutenticado; // Obtiene el nombre del usuario autenticado
    if (nuevoMensaje.trim() && nombreUsuario.trim() && usuarioDestinatario.trim()) { // Verifica que todos los campos estén completos
      try {
        // Agrega una nueva discusión a Firestore
        await addDoc(collection(db, 'discusiones'), {
          mensaje: nuevoMensaje,
          usuario: nombreUsuario,
          destinatario: usuarioDestinatario,
          timestamp: new Date(),
          respuestas: [],
        });
        setNuevoMensaje(''); // Limpia el campo de mensaje
        setUsuarioDestinatario(''); // Limpia el campo de destinatario
      } catch (error) {
        console.error('Error iniciando discusión:', error); // Si ocurre un error, lo muestra en la consola
      }
    }
  };

  // Función para responder a una discusión
  const responderDiscusion = async (e, discusionId) => {
    e.preventDefault(); // Evita que se recargue la página
    const nombreUsuario = nombreUsuarioAutenticado; // Obtiene el nombre del usuario autenticado
    if (respuesta.trim() && nombreUsuario.trim()) { // Verifica que el campo de respuesta no esté vacío
      try {
        const discusionRef = doc(db, 'discusiones', discusionId); // Obtiene la referencia de la discusión
        const updatedDiscusiones = discusiones.map(discusion =>
          discusion.id === discusionId ? {
            ...discusion,
            respuestas: [...discusion.respuestas, { // Agrega la nueva respuesta al array de respuestas
              mensaje: respuesta,
              usuario: nombreUsuario,
              timestamp: new Date(),
            }]
          } : discusion
        );
        setDiscusiones(updatedDiscusiones); // Actualiza el estado con las respuestas nuevas
        await updateDoc(discusionRef, {
          respuestas: updatedDiscusiones.find(d => d.id === discusionId).respuestas // Actualiza las respuestas en Firestore
        });
        setRespuesta(''); // Limpia el campo de respuesta
        setIdDiscusionSeleccionada(null); // Cierra el formulario de respuesta
      } catch (error) {
        console.error('Error respondiendo a discusión:', error); // Si ocurre un error, lo muestra en la consola
      }
    }
  };

  // Función para mostrar solo las discusiones del usuario autenticado o las que están dirigidas a él
  const mostrarDiscusiones = () => {
    const nombreUsuario = nombreUsuarioAutenticado; // Obtiene el nombre del usuario autenticado
    return discusiones.filter(discusion => 
      discusion.destinatario === nombreUsuario || discusion.usuario === nombreUsuario
    );
  };

  return (
    <div className="foro-discusion">
      <h1>Foro de Discusión</h1>
      {/* Formulario para iniciar una nueva discusión */}
      <Form onSubmit={iniciarDiscusion}>
        <Form.Group controlId="usuarioDestinatario">
          <Form.Control
            as="select"
            value={usuarioDestinatario}
            onChange={(e) => setUsuarioDestinatario(e.target.value)} // Actualiza el destinatario seleccionado
            required
          >
            <option value="">Selecciona un destinatario</option>
            {/* Filtra y muestra los usuarios disponibles, excluyendo al usuario autenticado */}
            {usuarios
              .filter(user => user.username !== nombreUsuarioAutenticado) 
              .map((user, index) => (
                <option key={index} value={user.username}>{user.username}</option>
              ))}
          </Form.Control>
        </Form.Group>
        <Form.Group controlId="nuevoMensaje">
          <Form.Control
            type="text"
            placeholder="Inicia una nueva discusión"
            value={nuevoMensaje}
            onChange={(e) => setNuevoMensaje(e.target.value)} // Actualiza el mensaje
            required
          />
        </Form.Group>
        <Button type="submit">Enviar</Button>
      </Form>
      {/* Lista de discusiones activas */}
      <ListGroup variant="flush">
        {mostrarDiscusiones().map((discusion) => (
          <ListGroup.Item key={discusion.id}>
            <div><strong>{discusion.usuario}:</strong> {discusion.mensaje}</div>
            <div><em>Para: {discusion.destinatario}</em></div>
            {discusion.respuestas && (
              <ListGroup variant="flush" className="respuestas">
                {discusion.respuestas.map((resp, index) => (
                  <ListGroup.Item key={index} className="respuesta">
                    <strong>{resp.usuario}:</strong> {resp.mensaje}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
            {/* Botón para responder a la discusión */}
            <Button
              variant="link"
              className="responder-btn"
              onClick={() => setIdDiscusionSeleccionada(discusion.id)}
            >
              Responder
            </Button>
            {idDiscusionSeleccionada === discusion.id && (
              <Form onSubmit={(e) => responderDiscusion(e, discusion.id)}>
                <Form.Group controlId="respuesta">
                  <Form.Control
                    type="text"
                    placeholder="Escribe tu respuesta"
                    value={respuesta}
                    onChange={(e) => setRespuesta(e.target.value)} // Actualiza el campo de respuesta
                    required
                  />
                </Form.Group>
                <Button type="submit">Enviar Respuesta</Button>
              </Form>
            )}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default ForoDiscusion;
