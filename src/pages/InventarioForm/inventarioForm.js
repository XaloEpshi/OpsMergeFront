import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './inventarioForm.css';

const InventarioForm = ({ bodegaEditada, setBodegaEditada, onFormSubmit, onClose }) => {
  const [bodega, setBodega] = useState(bodegaEditada?.nombre_bodega || 'BPT');
  const [fecha, setFecha] = useState(bodegaEditada ? new Date(bodegaEditada.fecha_inventario).toISOString().split('T')[0] : '');
  const [detalle, setDetalle] = useState(bodegaEditada?.detalle_inventario || '');
  const [mensaje, setMensaje] = useState('');
  const [mensajeTipo, setMensajeTipo] = useState('');

  useEffect(() => {
    if (bodegaEditada) {
      setBodega(bodegaEditada.nombre_bodega);
      setFecha(new Date(bodegaEditada.fecha_inventario).toISOString().split('T')[0]);
      setDetalle(bodegaEditada.detalle_inventario);
    }
  }, [bodegaEditada]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (bodegaEditada) {
        await axios.put(`http://localhost:3001/api/bodegas/${bodegaEditada.id}`, {
          nombre_bodega: bodega,
          fecha_inventario: fecha,
          detalle_inventario: detalle
        });
        setMensaje('Detalle inventario actualizado con éxito!');
        setMensajeTipo('success');
      } else {
        await axios.post('http://localhost:3001/api/bodegas', {
          nombre_bodega: bodega,
          fecha_inventario: fecha,
          detalle_inventario: detalle
        });
        setMensaje('Detalle inventario agregado con éxito!');
        setMensajeTipo('success');
      }

      // Limpiar el formulario después de enviar
      setBodega('BPT');
      setFecha('');
      setDetalle('');
      setBodegaEditada(null);
      onFormSubmit();
    } catch (err) {
    }
  };

  return (
    <div className="inventario-form-container">
      <button className="close-button" onClick={onClose}></button>
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
        <button type="submit" className="btn-submit">{bodegaEditada ? 'Actualizar Inventario' : 'Agregar al Inventario'}</button>
      </form>
    </div>
  );
};

export default InventarioForm;//5
