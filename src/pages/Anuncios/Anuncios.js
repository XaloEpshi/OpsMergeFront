import React, { useEffect, useState } from 'react';
import { getFirestore, collection, onSnapshot, addDoc, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Table, Button, Form } from 'react-bootstrap';
import './Anuncios.css';

const Anuncios = () => {
  const [anuncios, setAnuncios] = useState([]);
  const [nuevoAnuncio, setNuevoAnuncio] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [editAnuncio, setEditAnuncio] = useState(null);
  const db = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'anuncios'), (snapshot) => {
      const newAnuncios = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAnuncios(newAnuncios);
    });

    return () => unsubscribe();
  }, [db]);

  useEffect(() => {
    if (user) {
      const fetchUserProfile = async () => {
        const userDoc = doc(db, 'users', user.uid);
        const userProfileData = await getDoc(userDoc);
        if (userProfileData.exists()) {
          setUserProfile(userProfileData.data());
        } else {
          console.log('No such document!');
        }
      };

      fetchUserProfile();
    }
  }, [user, db]);

  const agregarAnuncio = async (e) => {
    e.preventDefault();
    if (userProfile && userProfile.profile === 'Líder de Equipo') {
      const newAnuncio = {
        mensaje: nuevoAnuncio,
        timestamp: new Date(),
        usuario: userProfile.username,
      };
      if (editAnuncio) {
        await updateDoc(doc(db, 'anuncios', editAnuncio.id), newAnuncio);
        setEditAnuncio(null);
      } else {
        await addDoc(collection(db, 'anuncios'), newAnuncio);
      }
      setNuevoAnuncio('');
    } else {
      alert("No tienes permiso para agregar anuncios.");
    }
  };

  const handleEdit = (anuncio) => {
    setEditAnuncio(anuncio);
    setNuevoAnuncio(anuncio.mensaje);
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'anuncios', id));
  };

  return (
    <div className="anuncios-container">
      <h1>Anuncios</h1>
      {userProfile && userProfile.profile === 'Líder de Equipo' ? (
        <>
          <Form onSubmit={agregarAnuncio}>
            <Form.Group controlId="nuevoAnuncio">
              <Form.Control
                type="text"
                placeholder="Escribe un nuevo anuncio"
                value={nuevoAnuncio}
                onChange={(e) => setNuevoAnuncio(e.target.value)}
                required
              />
              <br/>
            </Form.Group>
            <Button type="submit" className="btn-anuncio">
              {editAnuncio ? 'Actualizar Anuncio' : 'Agregar Anuncio'}
            </Button>
          </Form>
          <Table striped bordered hover className="anuncios-tabla">
            <thead>
              <tr><th>Anuncio</th><th>Usuario</th><th>Fecha</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {anuncios.map((anuncio) => (
                <tr key={anuncio.id}>
                  <td>{anuncio.mensaje}</td><td>{anuncio.usuario}</td><td>{new Date(anuncio.timestamp.seconds ? anuncio.timestamp.seconds * 1000 : anuncio.timestamp).toLocaleString()}</td>
                  <td>
                    <Button variant="warning" onClick={() => handleEdit(anuncio)}>Editar</Button>{' '}
                    <Button variant="danger" onClick={() => handleDelete(anuncio.id)}>Eliminar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      ) : (
        <p>No tienes permiso para agregar anuncios.</p>
      )}
    </div>
  );
};

export default Anuncios;
