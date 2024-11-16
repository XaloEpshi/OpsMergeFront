import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, onSnapshot, query, orderBy, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Button, Form, ListGroup } from 'react-bootstrap';
import './ForoDiscusion.css';

const ForoDiscusion = () => {
  const [discusiones, setDiscusiones] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [usuarioDestinatario, setUsuarioDestinatario] = useState('');
  const [respuesta, setRespuesta] = useState('');
  const [idDiscusionSeleccionada, setIdDiscusionSeleccionada] = useState(null);
  const [nombreUsuarioAutenticado, setNombreUsuarioAutenticado] = useState('');

  useEffect(() => {
    // Obtener discusiones y eliminar las que tienen más de un día
    const q = query(collection(db, 'discusiones'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const discusionesData = [];
      const ahora = new Date();
      querySnapshot.forEach((doc) => {
        const discusion = { ...doc.data(), id: doc.id };
        const timestamp = discusion.timestamp;
        let dateObj;
        if (timestamp && typeof timestamp.toDate === 'function') {
          dateObj = timestamp.toDate();
        } else {
          dateObj = new Date(timestamp);
        }
        const diferenciaTiempo = ahora - dateObj;
        const unDia = 24 * 60 * 60 * 1000; // Milisegundos en un día
        if (diferenciaTiempo <= unDia) {
          discusionesData.push(discusion);
        } else {
          deleteDoc(doc.ref); // Eliminar discusiones viejas
        }
      });
      setDiscusiones(discusionesData);
    });

    // Obtener usuarios
    const usuariosRef = collection(db, 'users');
    const unsubscribeUsers = onSnapshot(usuariosRef, (snapshot) => {
      const usuariosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsuarios(usuariosData);

      // Obtener nombre del usuario autenticado desde la colección `users`
      const user = auth.currentUser;
      if (user) {
        const currentUserData = usuariosData.find(u => u.id === user.uid);
        if (currentUserData) {
          setNombreUsuarioAutenticado(currentUserData.username);
        }
      }
    });

    return () => {
      unsubscribe();
      unsubscribeUsers();
    };
  }, []);

  const iniciarDiscusion = async (e) => {
    e.preventDefault();
    const nombreUsuario = nombreUsuarioAutenticado;
    if (nuevoMensaje.trim() && nombreUsuario.trim() && usuarioDestinatario.trim()) {
      try {
        await addDoc(collection(db, 'discusiones'), {
          mensaje: nuevoMensaje,
          usuario: nombreUsuario,
          destinatario: usuarioDestinatario,
          timestamp: new Date(),
          respuestas: [],
        });
        setNuevoMensaje('');
        setUsuarioDestinatario('');
      } catch (error) {
        console.error('Error iniciando discusión:', error);
      }
    }
  };

  const responderDiscusion = async (e, discusionId) => {
    e.preventDefault();
    const nombreUsuario = nombreUsuarioAutenticado;
    if (respuesta.trim() && nombreUsuario.trim()) {
      try {
        const discusionRef = doc(db, 'discusiones', discusionId);
        const updatedDiscusiones = discusiones.map(discusion =>
          discusion.id === discusionId ? {
            ...discusion,
            respuestas: [...discusion.respuestas, {
              mensaje: respuesta,
              usuario: nombreUsuario,
              timestamp: new Date()
            }]
          } : discusion
        );
        setDiscusiones(updatedDiscusiones);
        await updateDoc(discusionRef, {
          respuestas: updatedDiscusiones.find(d => d.id === discusionId).respuestas
        });
        setRespuesta('');
        setIdDiscusionSeleccionada(null);
      } catch (error) {
        console.error('Error respondiendo a discusión:', error);
      }
    }
  };

  const mostrarDiscusiones = () => {
    const nombreUsuario = nombreUsuarioAutenticado;
    return discusiones.filter(discusion => 
      discusion.destinatario === nombreUsuario || discusion.usuario === nombreUsuario
    );
  };

  return (
    <div className="foro-discusion">
      <h1>Foro de Discusión</h1>
      <Form onSubmit={iniciarDiscusion}>
        <Form.Group controlId="usuarioDestinatario">
          <Form.Control
            as="select"
            value={usuarioDestinatario}
            onChange={(e) => setUsuarioDestinatario(e.target.value)}
            required
          >
            <option value="">Selecciona un destinatario</option>
            {usuarios
              .filter(user => user.username !== nombreUsuarioAutenticado) // Filtrar el usuario autenticado
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
            onChange={(e) => setNuevoMensaje(e.target.value)}
            required
          />
        </Form.Group>
        <Button type="submit">Enviar</Button>
      </Form>
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
                    onChange={(e) => setRespuesta(e.target.value)}
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
