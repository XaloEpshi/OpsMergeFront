import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './despachoNacionalForm.css'; // Importar los estilos

const DespachoNacionalForm = ({ dispatch, onClose }) => { // Agrega la prop onClose
  const [despacho, setDespacho] = useState({
    cantidad: '',
    nombreChofer: '',
    rutChofer: '',
    patenteCamion: '',
    patenteRampla: '',
    numeroSellos: '',
    agenda_diaria_id: '',
    responsable:""
  });

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
        responsable:dispatch.responsable || ''
      });
    }
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDespacho({
      ...despacho,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://opsmergeback-production.up.railway.app/api/despacho', despacho, {
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('Datos guardados correctamente');
      alert('Datos guardados correctamente');
      if (onClose) onClose(); // Cierra el formulario
    } catch (error) {
      console.error('Error al guardar los datos:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="despacho-form">
      <h3>Formulario de Despacho Nacional</h3>

      <div className="form-group">
        <label htmlFor="cantidad">Cantidad:</label>
        <input
          type="number"
          name="cantidad"
          value={despacho.cantidad}
          onChange={handleChange}
          placeholder="Cantidad"
          required
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
  
        <button type="submit" className="btn-submit">Guardar</button>
      </form>
    );
  };
  
  export default DespachoNacionalForm;
  
