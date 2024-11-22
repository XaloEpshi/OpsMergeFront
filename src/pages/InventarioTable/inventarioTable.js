import React, { useState, useEffect } from "react";
import { Table, Button } from "react-bootstrap";
import { FaEdit, FaTrash, FaSync } from "react-icons/fa";
import axios from "axios";
import InventarioForm from "../InventarioForm/inventarioForm";
import "./inventarioTable.css"; // Asegúrate de importar los estilos

const InventarioTable = () => {
  const [inventario, setInventario] = useState([]);
  const [bodegaEditada, setBodegaEditada] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false); // Estado para mostrar u ocultar el formulario

  const fetchInventario = async () => {
    try {
      const response = await axios.get("https://opsmergeback-production.up.railway.app/api/bodegas");
      setInventario(response.data);
    } catch (err) {
      console.error("Error al obtener el inventario:", err);
    }
  };

  useEffect(() => {
    fetchInventario();
  }, []);

  const handleDelete = async (id) => {
    const isConfirmed = window.confirm(`¿Estás seguro de que deseas eliminar la bodega con ID ${id}?`);
    if (isConfirmed) {
      try {
        await axios.delete(`https://opsmergeback-production.up.railway.app/api/bodegas/${id}`);
        setInventario(inventario.filter((item) => item.id !== id));
        console.log(`Bodega con ID ${id} eliminada`);
      } catch (err) {
        console.error(`Error al eliminar la bodega con ID ${id}:`, err);
      }
    }
  };

  const handleEdit = (id) => {
    const item = inventario.find((item) => item.id === id);
    setBodegaEditada(item);
    setMostrarFormulario(true);
  };

  const onFormSubmit = () => {
    setMostrarFormulario(false);
    fetchInventario();
  };

  const handleCloseForm = () => {
    setMostrarFormulario(false);
    setBodegaEditada(null);
  };

  return (
    <div className="inventario-table-container">
      <h3>Inventario</h3>
      <Button className="mb-3" onClick={fetchInventario}>
        <FaSync /> Actualizar
      </Button>
      {mostrarFormulario && (
        <InventarioForm 
          bodegaEditada={bodegaEditada} 
          setBodegaEditada={setBodegaEditada} 
          onFormSubmit={onFormSubmit} 
          onClose={handleCloseForm}
        />
      )}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Bodega</th>
            <th>Fecha</th>
            <th>Detalle</th>
            <th>Responsable</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {inventario.map((item) => (
            <tr key={item.id}>
              <td>{item.nombre_bodega}</td>
              <td>{new Date(item.fecha_inventario).toLocaleDateString()}</td>              
              <td>{item.detalle_inventario}</td>
              <td>{item.responsable}</td>
              <td>
                <button
                  className="btn-inventario-edit"
                  onClick={() => handleEdit(item.id)}
                >
                  <FaEdit />
                </button>
                <br />
                <button
                  className="btn-inventario-delete"
                  onClick={() => handleDelete(item.id)}
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default InventarioTable;
