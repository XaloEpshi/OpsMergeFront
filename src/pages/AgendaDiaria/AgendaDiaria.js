import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash } from 'react-icons/fa'; // Importar iconos de react-icons
import './AgendaDiaria.css';

const AgendaDiaria = () => {
  const [despachos, setDespachos] = useState([]);
  const [nuevoDespacho, setNuevoDespacho] = useState({
    fecha: '',
    hora: '',
    detalles: '',
  });
  const [editando, setEditando] = useState(false);
  const [idEdicion, setIdEdicion] = useState(null);

  const obtenerDespachos = () => {
    axios.get('/api/agenda/')
      .then(response => {
        // Formatear las fechas antes de actualizar el estado
        const formatearFechas = response.data.map(despacho => ({
          ...despacho,
          fecha: new Date(despacho.fecha).toLocaleDateString(), // Formatear la fecha
        }));
        setDespachos(formatearFechas);
      })
      .catch(error => {
        console.error('Hubo un error al obtener los eventos', error);
      });
  };

  useEffect(() => {
    obtenerDespachos(); // Obtener todos los eventos al montar el componente
  }, []);

  const agregarDespacho = (e) => {
    e.preventDefault();

    const despacho = { ...nuevoDespacho };

    if (editando) {
      axios.put(`/api/agenda/${idEdicion}`, despacho)
        .then(() => {
          obtenerDespachos(); // Actualizar la lista de despachos después de editar
          setNuevoDespacho({ fecha: '', hora: '', detalles: '' });
          setEditando(false);
          setIdEdicion(null);
        })
        .catch(error => {
          console.error('Hubo un error al actualizar el evento', error);
        });
    } else {
      axios.post('/api/agenda', despacho)
        .then(() => {
          obtenerDespachos(); // Actualizar la lista de despachos después de agregar
          setNuevoDespacho({ fecha: '', hora: '', detalles: '' });
        })
        .catch(error => {
          console.error('Hubo un error al agregar el evento', error);
        });
    }
  };

  const eliminarDespacho = (id) => {
    axios.delete(`/api/agenda/${id}`)
      .then(() => {
        obtenerDespachos(); // Actualizar la lista de despachos después de eliminar
      })
      .catch(error => {
        console.error('Hubo un error al eliminar el evento', error);
      });
  };

  const editarDespacho = (index) => {
    const despacho = despachos[index];
    setNuevoDespacho(despacho);
    setEditando(true);
    setIdEdicion(despacho.id);
  };

  return (
    <div className="agenda-diaria">
      <h1>Agenda Diaria de Despachos</h1>
      <form onSubmit={agregarDespacho}>
        <input 
          type="date" 
          value={nuevoDespacho.fecha}
          onChange={(e) => setNuevoDespacho({ ...nuevoDespacho, fecha: e.target.value })}
          required 
        />
        <input 
          type="time" 
          value={nuevoDespacho.hora}
          onChange={(e) => setNuevoDespacho({ ...nuevoDespacho, hora: e.target.value })}
          required 
        />
        <input 
          type="text" 
          placeholder="Detalles"
          value={nuevoDespacho.detalles}
          onChange={(e) => setNuevoDespacho({ ...nuevoDespacho, detalles: e.target.value })}
          required 
        />
        <br/>
        <button type="submit">{editando ? 'Actualizar Despacho' : 'Agregar Despacho'}</button>
      </form>
      <table className="table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Detalles</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {despachos.map((despacho, index) => (
            <tr key={index}>
              <td>{despacho.fecha}</td>
              <td>{despacho.hora}</td>
              <td>{despacho.detalles}</td>
              <td>
                <button 
                  onClick={() => editarDespacho(index)} 
                  title="Editar"
                  aria-label="Editar"
                >
                  <FaEdit />
                </button>
                <button 
                  onClick={() => eliminarDespacho(despacho.id)} 
                  title="Eliminar"
                  aria-label="Eliminar"
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AgendaDiaria;
