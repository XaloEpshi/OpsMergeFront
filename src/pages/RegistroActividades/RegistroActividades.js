import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RegistroActividades.css'; // Importación de los estilos específicos para este componente
import { v4 as uuidv4 } from 'uuid'; // Importa la biblioteca uuid para generar identificadores únicos

const RegistroActividades = () => {
  const [actividades, setActividades] = useState([]);
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const fetchActividades = async () => {
      try {
        const response = await axios.get('https://opsmergeback-production.up.railway.app/api/activities');
        if (Array.isArray(response.data)) {
          setActividades(response.data);
        } else {
          setMensaje('Error: la respuesta no es un array.');
        }
      } catch (error) {
        setMensaje('Error al cargar las actividades: ' + error.message);
      }
    };

    fetchActividades();
  }, []);

  const handleFiltroUsuarioChange = (e) => {
    setFiltroUsuario(e.target.value);
  };

  const handleFiltroFechaChange = (e) => {
    setFiltroFecha(e.target.value);
  };

  const actividadesFiltradas = actividades.filter((actividad) => {
    return (
      (!filtroUsuario || (actividad.user_id && actividad.user_id.includes(filtroUsuario))) &&
      (!filtroFecha || actividad.fecha_hora.includes(filtroFecha))
    );
  });

  return (
    <div className="registro-actividades">
      <h2>Historial de Actividades</h2>
      {mensaje && <p className="mensaje">{mensaje}</p>}

      <div className="filtros">
        <input
          type="text"
          placeholder="Buscar por usuario"
          value={filtroUsuario}
          onChange={handleFiltroUsuarioChange}
        />
        <input
          type="date"
          placeholder="Buscar por fecha"
          value={filtroFecha}
          onChange={handleFiltroFechaChange}
        />
      </div>

      <table className="tabla-actividades">
        <thead>
          <tr>
            <th>Origen</th>
            <th>Actividad</th>
            <th>Fecha y Hora</th>
            <th>Descripción</th>
            <th>Usuario o Turno</th>
          </tr>
        </thead>
        <tbody>
  {actividadesFiltradas.map((actividad) => (
    <tr key={actividad.id || uuidv4()}>
      <td>{actividad.origen}</td>
      <td>{actividad.actividad}</td>
      <td>{new Date(actividad.fecha_hora).toLocaleString()}</td>
      <td>{actividad.descripcion}</td>
      <td>{actividad.turno ? actividad.turno : actividad.user_id}</td>
    </tr>
  ))}
</tbody>

      </table>
    </div>
  );
};

export default RegistroActividades;
