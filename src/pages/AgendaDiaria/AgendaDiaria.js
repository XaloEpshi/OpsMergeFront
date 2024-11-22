import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash } from 'react-icons/fa';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  const obtenerDespachos = () => {
    setLoading(true);
    axios.get('https://opsmergeback-production.up.railway.app/api/agenda/')
      .then(response => {
        console.log(response.data); // Verifica la estructura aquí
        const data = response.data.data; // Mapea correctamente a response.data.data
        if (!Array.isArray(data)) {
          throw new Error('La respuesta de la API no es un arreglo.');
        }
        const formatearFechasHoras = data.map(despacho => ({
          ...despacho,
          fecha: new Date(despacho.fecha).toISOString().split('T')[0],
          hora: despacho.hora.slice(0, 5),
        }));
        setDespachos(formatearFechasHoras);
        setLoading(false);
      })
      .catch(error => {
        console.error('Hubo un error al obtener las agendas', error);
        setError('Error al obtener las agendas');
        setLoading(false);
      });
  };

  useEffect(() => {
    obtenerDespachos();
  }, []);

  const agregarDespacho = (e) => {
    e.preventDefault();
    if (!nuevoDespacho.fecha || !nuevoDespacho.hora || !nuevoDespacho.detalles) {
      setError('Por favor, completa todos los campos');
      return;
    }

    setLoading(true);
    setError(null);
    setMensaje(null);

    const despacho = { ...nuevoDespacho };

    if (editando) {
      axios.put(`https://opsmergeback-production.up.railway.app/api/agenda/${idEdicion}`, despacho)
        .then(() => {
          obtenerDespachos();
          setNuevoDespacho({ fecha: '', hora: '', detalles: '' });
          setEditando(false);
          setIdEdicion(null);
          setMensaje('Agenda editada correctamente');
          setLoading(false);
        })
        .catch(error => {
          console.error('Hubo un error al actualizar la agenda', error);
          setError('Error al actualizar el evento');
          setLoading(false);
        });
    } else {
      axios.post('https://opsmergeback-production.up.railway.app/api/agenda', despacho)
        .then(() => {
          obtenerDespachos();
          setNuevoDespacho({ fecha: '', hora: '', detalles: '' });
          setMensaje('Evento agregado correctamente');
          setLoading(false);
        })
        .catch(error => {
          console.error('Hubo un error al agregar la agenda', error);
          setError('Error al agregar el evento');
          setLoading(false);
        });
    }
  };

  const eliminarDespacho = (id) => {
    const confirmacion = window.confirm('¿Estás seguro de que deseas eliminar esta agenda?');
    if (!confirmacion) return;

    setLoading(true);
    setError(null);
    setMensaje(null);
    
    axios.delete(`https://opsmergeback-production.up.railway.app/api/agenda/${id}`)
      .then(() => {
        obtenerDespachos();
        setMensaje('Agenda eliminada correctamente');
        setLoading(false);
      })
      .catch(error => {
        console.error('Hubo un error al eliminar la agenda', error);
        setError('No puedes eliminar esta agenda porque está relacionada con despachos');
        setLoading(false);
      });
  };

  const editarDespacho = (id) => {
    const confirmacion = window.confirm('¿Estás seguro de que deseas editar los datos de esta agenda?');
    if (!confirmacion) return;

    const despacho = despachos.find(d => d.id === id);
    setNuevoDespacho({
      ...despacho,
      fecha: new Date(despacho.fecha).toISOString().split('T')[0], // Asegurar que la fecha está en formato yyyy-MM-dd
      hora: despacho.hora.slice(0, 5) // Formato HH:mm
    });
    setEditando(true);
    setIdEdicion(despacho.id);
  };

  return (
    <div className="agenda-diaria">
      <h1>Agenda Diaria de Despachos</h1>
      <form onSubmit={agregarDespacho}>
        {error && <p className="error">{error}</p>}
        {mensaje && <p className="mensaje">{mensaje}</p>}
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
        <button type="submit" disabled={loading}>
          {loading ? 'Cargando...' : (editando ? 'Actualizar Despacho' : 'Agregar Despacho')}
        </button>
      </form>
      {loading && <p>Cargando...</p>}
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
          {despachos.map((despacho) => (
            <tr key={despacho.id}>
              <td>{despacho.fecha}</td>
              <td>{despacho.hora}</td>
              <td>{despacho.detalles}</td>
              <td>
                <button 
                  className="edit-button"
                  onClick={() => editarDespacho(despacho.id)} 
                  title="Editar"
                  aria-label="Editar"
                  disabled={loading}
                >
                  <FaEdit />
                </button>
                <button 
                  className="delete-button"
                  onClick={() => eliminarDespacho(despacho.id)} 
                  title="Eliminar"
                  aria-label="Eliminar"
                  disabled={loading}
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

export default AgendaDiaria;//Codigo funcional
