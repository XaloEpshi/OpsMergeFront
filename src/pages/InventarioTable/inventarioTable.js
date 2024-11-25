// Importaciones necesarias para el componente
import React, { useState, useEffect } from "react"; 
import { Table, Button } from "react-bootstrap"; 
import { FaEdit, FaTrash, FaSync } from "react-icons/fa"; 
import axios from "axios"; 
import InventarioForm from "../InventarioForm/inventarioForm"; 
import "./inventarioTable.css"; 

// Definición del componente InventarioTable
const InventarioTable = () => {
  // Definición de estados del componente usando useState
  const [inventario, setInventario] = useState([]); // Estado para almacenar la lista de inventarios
  const [bodegaEditada, setBodegaEditada] = useState(null); // Estado para almacenar el inventario que se está editando
  const [mostrarFormulario, setMostrarFormulario] = useState(false); // Estado para controlar la visibilidad del formulario

  // Función para obtener la lista de inventarios desde la API
  const fetchInventario = async () => {
    try {
      const response = await axios.get("https://opsmergeback-production.up.railway.app/api/bodegas");
      setInventario(response.data); // Actualiza el estado con los datos obtenidos
    } catch (err) {
      console.error("Error al obtener el inventario:", err); // Manejo de errores
    }
  };

  // Efecto que se ejecuta al montar el componente para obtener la lista de inventarios
  useEffect(() => {
    fetchInventario(); // Llama a la función para obtener los inventarios
  }, []); // Se ejecuta solo una vez al montar el componente

  // Función para manejar la eliminación de un inventario
  const handleDelete = async (id) => {
    const isConfirmed = window.confirm(`¿Estás seguro de que deseas eliminar la bodega con ID ${id}?`);
    if (isConfirmed) {
      try {
        await axios.delete(`https://opsmergeback-production.up.railway.app/api/bodegas/${id}`);
        setInventario(inventario.filter((item) => item.id !== id)); // Filtra el inventario eliminado del estado
        console.log(`Bodega con ID ${id} eliminada`); 
      } catch (err) {
        console.error(`Error al eliminar la bodega con ID ${id}:`, err); // Manejo de errores
      }
    }
  };

  // Función para manejar la edición de un inventario
  const handleEdit = (id) => {
    const item = inventario.find((item) => item.id === id); // Encuentra el inventario a editar
    setBodegaEditada(item); // Actualiza el estado con el inventario seleccionado
    setMostrarFormulario(true); // Muestra el formulario de edición
  };

  // Función que se ejecuta al enviar el formulario
  const onFormSubmit = () => {
    setMostrarFormulario(false); // Oculta el formulario
    fetchInventario(); // Vuelve a obtener la lista de inventarios
  };

  // Función para cerrar el formulario
  const handleCloseForm = () => {
    setMostrarFormulario(false); // Oculta el formulario
    setBodegaEditada(null); // Resetea el inventario editado
  };

  // Renderizado del componente
  return (
    <div className="inventario-table-container">
      <h3>Inventario</h3>
      <Button className="mb-3" onClick={fetchInventario}>
        <FaSync /> Actualizar
      </Button>
      {mostrarFormulario && (
        <InventarioForm
          bodegaEditada={bodegaEditada} // Pasa el inventario a editar como prop
          onFormSubmit={onFormSubmit} // Pasa la función para manejar el envío del formulario como prop
          onClose={handleCloseForm} // Pasa la función para cerrar el formulario como prop
        />
      )}
      <Table striped bordered hover responsive>
        <thead>
          <tr><th>Bodega</th><th>Fecha</th><th>Detalle</th><th>Responsable</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {inventario.map((item) => (
            <tr key={item.id}>
              <td>{item.nombre_bodega}</td>
              <td>{new Date(item.fecha_inventario).toLocaleDateString()}</td>
              <td>{item.detalle_inventario}</td>
              <td>{item.responsable}</td>
              <td>
                <Button onClick={() => handleEdit(item.id)}><FaEdit /> Editar</Button>
                <Button variant="danger" onClick={() => handleDelete(item.id)}><FaTrash /> Eliminar</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

// Exporta el componente para que pueda ser usado en otras partes de la aplicación
export default InventarioTable;

/* 
El componente InventarioTable permite visualizar, agregar, editar y eliminar inventarios.
Utiliza React Hooks para gestionar el estado y los efectos, y axios para realizar las peticiones HTTP
a una API. La tabla se actualiza dinámicamente al agregar, editar o eliminar inventarios.
*/
