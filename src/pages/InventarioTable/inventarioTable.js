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
      const response = await axios.get("http://localhost:3001/api/bodegas");
      setInventario(response.data);
    } catch (err) {
      console.error("Error al obtener el inventario:", err);
    }
  };

  // Obtener el inventario desde la API al cargar el componente
  useEffect(() => {
    fetchInventario();
  }, []);

  // Manejar la eliminación de una bodega
  const handleDelete = async (id) => {
    const isConfirmed = window.confirm(`¿Estás seguro de que deseas eliminar la bodega con ID ${id}?`);
    if (isConfirmed) {
      try {
        await axios.delete(`http://localhost:3001/api/bodegas/${id}`);
        setInventario(inventario.filter((item) => item.id !== id));
        console.log(`Bodega con ID ${id} eliminada`);
      } catch (err) {
        console.error(`Error al eliminar la bodega con ID ${id}:`, err);
      }
    }
  };

  // Manejar la edición de una bodega
  const handleEdit = (id) => {
    const bodega = inventario.find((item) => item.id === id);
    setBodegaEditada(bodega);
    setMostrarFormulario(true); // Mostrar el formulario de edición
  };

  const onFormSubmit = () => {
    // Ocultar el formulario después de enviar
    setMostrarFormulario(false);
    fetchInventario(); // Volver a cargar el inventario después de agregar o actualizar
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
          onClose={handleCloseForm} // Pasar la función de cerrar
        />
      )}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Bodega</th>
            <th>Fecha</th>
            <th>Detalle</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {inventario.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.nombre_bodega}</td>
              <td>{new Date(item.fecha_inventario).toLocaleDateString()}</td>
              <td>{item.detalle_inventario}</td>
              <td>
                <button
                  className="btn-inventario-edit"
                  onClick={() => handleEdit(item.id)}
                >
                  <FaEdit />
                </button>
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
