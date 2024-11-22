import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash } from 'react-icons/fa'; // Importar iconos de react-icons
import './AgendaDiaria.css';

const AgendaDiaria = () => {
  // Estados para manejar datos y estados de la aplicación
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

  // Función para obtener los despachos de la API
  const obtenerDespachos = () => {
    setLoading(true);
    axios.get('https://opsmergeback-production.up.railway.app/api/agenda')
      .then(response => {
        // Imprime la respuesta para verificar el formato de los datos
        console.log(response.data);
        
        if (Array.isArray(response.data.data)) {
          // Formatear fechas y horas si response.data.data es un array
          const formatearFechasHoras = response.data.data.map(despacho => ({
            ...despacho,
            fecha: new Date(despacho.fecha).toISOString().split('T')[0], // Formato yyyy-MM-dd
            hora: despacho.hora.slice(0, 5) // Formato HH:mm
          }));
          setDespachos(formatearFechasHoras);
        } else {
          setError('Formato de datos no válido');
        }

        setLoading(false);
        setTimeout(() => setMensaje(null), 3000); // Ocultar mensaje después de 3 segundos
      })
      .catch(error => {
        console.error('Hubo un error al obtener las agendas', error);
        setError('Error al obtener las agendas');
        setLoading(false);
        setTimeout(() => setError(null), 3000); // Ocultar mensaje de error después de 3 segundos
      });
  };

  // useEffect para obtener despachos al cargar el componente
  useEffect(() => {
    obtenerDespachos();
  }, []);

  // Función para agregar o editar un despacho
  const agregarDespacho = (e) => {
    e.preventDefault();

    // Validación de campos completos
    if (!nuevoDespacho.fecha || !nuevoDespacho.hora || !nuevoDespacho.detalles) {
      setError('Por favor, completa todos los campos');
      return;
    }

    setLoading(true); // Establecer estado de cargando
    setError(null);
    setMensaje(null);

    const despacho = { ...nuevoDespacho };

    // Si estamos editando, enviar una solicitud PUT
    if (editando) {
      axios.put(`https://opsmergeback-production.up.railway.app/api/agenda/${idEdicion}`, despacho)
        .then(() => {
          obtenerDespachos();
          setNuevoDespacho({ fecha: '', hora: '', detalles: '' });
          setEditando(false);
          setIdEdicion(null);
          setMensaje('Agenda editada correctamente');
          setLoading(false); // Detener estado de cargando
        })
        .catch(error => {
          console.error('Hubo un error al actualizar la agenda', error);
          setError('Error al actualizar el evento');
          setLoading(false); // Detener estado de cargando
        });
    } else {
      // Si estamos agregando un nuevo despacho, enviar una solicitud POST
      axios.post('https://opsmergeback-production.up.railway.app/api/agenda', despacho)
        .then(() => {
          obtenerDespachos();
          setNuevoDespacho({ fecha: '', hora: '', detalles: '' });
          setMensaje('Evento agregado correctamente');
          setLoading(false); // Detener estado de cargando
        })
        .catch(error => {
          console.error('Hubo un error al agregar la agenda', error);
          setError('Error al agregar el evento');
          setLoading(false); // Detener estado de cargando
        });
    }
  };

  // Función para eliminar un despacho
  const eliminarDespacho = (id) => {
    setLoading(true);
    setError(null);
    setMensaje(null);

    axios.delete(`https://opsmergeback-production.up.railway.app/api/agenda/${id}`)
      .then(() => {
        obtenerDespachos();
        setMensaje('Agenda Eliminada correctamente');
        setLoading(false);
      })
      .catch(error => {
        console.error('Hubo un error al eliminar la agenda', error);
        setError('No puedes Eliminar esta Agenda porque tiene relacionado despachos');
        setLoading(false);
      });
  };

  // Función para preparar la edición de un despacho
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

export default AgendaDiaria;
