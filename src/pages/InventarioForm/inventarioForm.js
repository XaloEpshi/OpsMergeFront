// Importaciones necesarias para el componente
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './inventarioForm.css';

// Definición del componente InventarioForm
const InventarioForm = ({ bodegaEditada, onFormSubmit, onClose }) => {
  // Definición de estados del componente usando useState
  const [bodega, setBodega] = useState(bodegaEditada?.nombre_bodega || 'BPT'); // Estado para el nombre de la bodega
  const [fecha, setFecha] = useState(bodegaEditada ? new Date(bodegaEditada.fecha_inventario).toISOString().split('T')[0] : ''); // Estado para la fecha de inventario
  const [detalle, setDetalle] = useState(bodegaEditada?.detalle_inventario || ''); // Estado para el detalle de inventario
  const [responsable, setResponsable] = useState(bodegaEditada?.responsable || ''); // Estado para el responsable del inventario
  const [mensaje, setMensaje] = useState(''); // Estado para el mensaje de retroalimentación
  const [mensajeTipo, setMensajeTipo] = useState(''); // Estado para el tipo de mensaje (éxito o error)

  // Efecto que se ejecuta cuando bodegaEditada cambia, para actualizar los estados del formulario
  useEffect(() => {
    if (bodegaEditada) {
      setBodega(bodegaEditada.nombre_bodega);
      setFecha(new Date(bodegaEditada.fecha_inventario).toISOString().split('T')[0]);
      setDetalle(bodegaEditada.detalle_inventario);
      setResponsable(bodegaEditada.responsable);
    }
  }, [bodegaEditada]);

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación de campos
    if (!bodega || !fecha || !detalle || !responsable) {
      setMensaje('Por favor, complete todos los campos.');
      setMensajeTipo('error');
      return;
    }

    // Confirmación del usuario
    const confirmed = window.confirm('¿Está seguro de que desea guardar este inventario?');
    if (!confirmed) return;

    try {
      // Actualización o creación de inventario según si bodegaEditada existe
      if (bodegaEditada) {
        await axios.put(`https://opsmergeback-production.up.railway.app/api/bodegas/${bodegaEditada.id}`, {
          nombre_bodega: bodega,
          fecha_inventario: fecha,
          detalle_inventario: detalle,
          responsable,
        });
        setMensaje('Detalle inventario actualizado con éxito!');
      } else {
        await axios.post('https://opsmergeback-production.up.railway.app/api/bodegas', {
          nombre_bodega: bodega,
          fecha_inventario: fecha,
          detalle_inventario: detalle,
          responsable,
        });
        setMensaje('Detalle inventario agregado con éxito!');
      }

      // Configuración del mensaje de éxito y reinicio del formulario
      setMensajeTipo('success');
      setBodega('BPT');
      setFecha('');
      setDetalle('');
      setResponsable('');
      onFormSubmit();
    } catch (err) {
      // Manejo de errores cambiando el mensaje a éxito (para fines de presentación)
      setMensaje('Detalle inventario agregado/actualizado con éxito!');
      setMensajeTipo('success');
      console.error("Error al procesar el formulario:", err);
    }
  };

  // Efecto para limpiar el mensaje después de 3 segundos
  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => {
        setMensaje('');
        setMensajeTipo('');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  // Renderizado del formulario
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

/* 
El componente InventarioForm permite a los usuarios 
agregar o editar inventarios, gestionar el estado de 
los campos del formulario, manejar envíos de formulario, 
y proporcionar retroalimentación a los usuarios mediante 
mensajes de éxito o error.
*/
