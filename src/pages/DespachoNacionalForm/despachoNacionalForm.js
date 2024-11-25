import React, { useState, useEffect } from 'react';  // Importa React y hooks useState y useEffect
import axios from 'axios';  // Importa axios para realizar peticiones HTTP
import './despachoNacionalForm.css'; // Importa los estilos para el formulario

// El componente recibe 'dispatch' y 'onClose' como propiedades
const DespachoNacionalForm = ({ dispatch, onClose }) => {
  // Estado inicial del formulario, contiene los campos del despacho
  const [despacho, setDespacho] = useState({
    cantidad: '',  // Campo para la cantidad de despacho
    nombreChofer: '',  // Campo para el nombre del chofer
    rutChofer: '',  // Campo para el RUT del chofer
    patenteCamion: '',  // Campo para la patente del camión
    patenteRampla: '',  // Campo para la patente de la rampla
    numeroSellos: '',  // Campo para el número de sellos
    agenda_diaria_id: '',  // Campo para el ID de la agenda diaria
    responsable: ""  // Campo para el responsable del despacho
  });

  // useEffect para establecer el estado inicial del formulario si hay datos en 'dispatch'
  useEffect(() => {
    if (dispatch) {
      setDespacho({
        cantidad: dispatch.cantidad || '',
        nombreChofer: dispatch.nombreChofer || '',
        rutChofer: dispatch.rutChofer || '',
        patenteCamion: dispatch.patenteCamion || '',
        patenteRampla: dispatch.patenteRampla || '',
        numeroSellos: dispatch.numeroSellos || '',
        agenda_diaria_id: dispatch.agenda_id || '',
        responsable: dispatch.responsable || ''
      });
    }
  }, [dispatch]); // Este efecto se ejecuta cada vez que 'dispatch' cambie

  // Función que maneja los cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;  // Extrae el 'name' y 'value' del evento
    setDespacho({
      ...despacho,  // Conserva los valores previos
      [name]: value  // Actualiza el campo específico en el estado
    });
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();  // Previene el comportamiento por defecto del formulario (recarga de página)
    try {
      // Realiza una petición POST a la API con los datos del despacho
      await axios.post('https://opsmergeback-production.up.railway.app/api/despacho', despacho, {
        headers: { 'Content-Type': 'application/json' }  // Define el tipo de contenido como JSON
      });
      console.log('Datos guardados correctamente');  // Mensaje de éxito en la consola
      alert('Datos guardados correctamente');  // Muestra una alerta al usuario
      if (onClose) onClose();  // Si existe la función onClose, la ejecuta para cerrar el formulario
    } catch (error) {
      console.error('Error al guardar los datos:', error);  // Si hay un error, lo muestra en la consola
    }
  };

  return (
    <form onSubmit={handleSubmit} className="despacho-form">  {/* Envoltorio del formulario */}
      <h3>Formulario de Despacho Nacional</h3>  {/* Título del formulario */}

      {/* Grupo de campos del formulario */}
      <div className="form-group">
        <label htmlFor="cantidad">Cantidad:</label>
        <input
          type="number"
          name="cantidad"  // Define el nombre del campo para que se vincule con el estado
          value={despacho.cantidad}  // Vincula el valor del campo con el estado
          onChange={handleChange}  // Ejecuta handleChange al cambiar el valor
          placeholder="Cantidad"  // Texto de ayuda cuando el campo está vacío
          required  // El campo es obligatorio
        />
      </div>

      <div className="form-group">
        <label htmlFor="nombreChofer">Nombre del Chofer:</label>
        <input
          type="text"
          name="nombreChofer"
          value={despacho.nombreChofer}
          onChange={handleChange}
          placeholder="Nombre del Chofer"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="rutChofer">RUT del Chofer:</label>
        <input
          type="text"
          name="rutChofer"
          value={despacho.rutChofer}
          onChange={handleChange}
          placeholder="RUT del Chofer"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="patenteCamion">Patente del Camión:</label>
        <input
          type="text"
          name="patenteCamion"
          value={despacho.patenteCamion}
          onChange={handleChange}
          placeholder="Patente del Camión"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="patenteRampla">Patente de la Rampla:</label>
        <input
          type="text"
          name="patenteRampla"
          value={despacho.patenteRampla}
          onChange={handleChange}
          placeholder="Patente de la Rampla"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="numeroSellos">Número de Sellos:</label>
        <input
          type="text"
          name="numeroSellos"
          value={despacho.numeroSellos}
          onChange={handleChange}
          placeholder="Número de Sellos"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="agenda_diaria_id">ID de la Agenda Diaria:</label>
        <input
          type="number"
          name="agenda_diaria_id"
          value={despacho.agenda_diaria_id}
          onChange={handleChange}
          placeholder="ID de la Agenda Diaria"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="responsable">Responsable:</label>
        <input
          type="text"
          name="responsable"
          value={despacho.responsable}
          onChange={handleChange}
          placeholder="Responsable"
          required
        />
      </div>

      {/* Botón para enviar el formulario */}
      <button type="submit" className="btn-submit">Guardar</button>
    </form>
  );
};

export default DespachoNacionalForm;  // Exporta el componente para que pueda ser utilizado en otras partes de la aplicación
