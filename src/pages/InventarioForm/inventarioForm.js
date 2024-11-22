import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './inventarioForm.css';

const InventarioForm = ({ bodegaEditada, setBodegaEditada, onFormSubmit, onClose }) => {
  const [bodega, setBodega] = useState(bodegaEditada?.nombre_bodega || 'BPT');
  const [fecha, setFecha] = useState(bodegaEditada ? new Date(bodegaEditada.fecha_inventario).toISOString().split('T')[0] : '');
  const [detalle, setDetalle] = useState(bodegaEditada?.detalle_inventario || '');
  const [responsable, setResponsable] = useState(bodegaEditada?.responsable || ''); // Estado para el responsable
  const [mensaje, setMensaje] = useState('');
  const [mensajeTipo, setMensajeTipo] = useState('');

  useEffect(() => {
    if (bodegaEditada) {
      setBodega(bodegaEditada.nombre_bodega);
      setFecha(new Date(bodegaEditada.fecha_inventario).toISOString().split('T')[0]);
      setDetalle(bodegaEditada.detalle_inventario);
      setResponsable(bodegaEditada.responsable); // Cargar responsable si existe
    }
  }, [bodegaEditada]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (bodegaEditada) {
        await axios.put(`https://opsmergeback-production.up.railway.app/api/bodegas/${bodegaEditada.id}`, {
          nombre_bodega: bodega,
          fecha_inventario: fecha,
          detalle_inventario: detalle,
          responsable, // Enviar responsable
        });
        setMensaje('Detalle inventario actualizado con éxito!');
        setMensajeTipo('success');
      } else {
        await axios.post('https://opsmergeback-production.up.railway.app/api/bodegas', {
          nombre_bodega: bodega,
          fecha_inventario: fecha,
          detalle_inventario: detalle,
          responsable, // Enviar responsable
        });
        setMensaje('Detalle inventario agregado con éxito!');
        setMensajeTipo('success');
      }

      // Resetear los valores del formulario
      setBodega('BPT');
      setFecha('');
      setDetalle('');
      setResponsable(''); // Resetear responsable
      setBodegaEditada(null);
      onFormSubmit();
    } catch (err) {
      setMensaje('Error al procesar el formulario.');
      setMensajeTipo('error');
      console.error("Error al procesar el formulario:", err);
    }
  };

  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => {
        setMensaje('');
        setMensajeTipo('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  return (
    <div className="inventario-form-container">
      <button className="close-button" onClick={onClose}>Cerrar</button>
      <form onSubmit={handleSubmit} className="inventario-form">
        <h3>{bodegaEditada ? 'Editar Inventario' : 'Agregar Inventario'}</h3>
        {mensaje && <p className={`mensaje ${mensajeTipo}`}>{mensaje}</p>}
        <div className="form-group">
          <label>Bodega:</label>
          <select
            value={bodega}
            onChange={(e) => setBodega(e.target.value)}
            required
          >
            <option value="BPT">BPT</option>
            <option value="BMP">BMP</option>
          </select>
        </div>
        <div className="form-group">
          <label>Fecha:</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Detalle:</label>
          <textarea
            rows={3}
            placeholder="Ingrese los detalles para dejar en el inventario"
            value={detalle}
            onChange={(e) => setDetalle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Responsable:</label>
          <input
            type="text"
            placeholder="Ingrese el nombre del responsable"
            value={responsable}
            onChange={(e) => setResponsable(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-submit">{bodegaEditada ? 'Actualizar Inventario' : 'Agregar al Inventario'}</button>
      </form>
    </div>
  );
};

export default InventarioForm;
