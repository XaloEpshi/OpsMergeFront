// Importación de librerías y componentes necesarios
import React, { useState, useEffect } from "react"; // Importa los hooks de React
import axios from "axios"; // Importa axios para hacer solicitudes HTTP
import { Table, Form, Button, Modal } from "react-bootstrap"; // Importa componentes de Bootstrap para la UI
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Importa los iconos de FontAwesome
import { faEdit, faCheck } from "@fortawesome/free-solid-svg-icons"; // Iconos de edición y confirmación
import { faSave } from "@fortawesome/free-solid-svg-icons"; // Icono de guardar
import "./ExportacionesTable.css"; // Importa el archivo de estilos CSS

// Componente principal de la tabla de exportaciones
const ExportacionesTable = ({ user }) => {
  // Definición de los estados del componente
  const [exportaciones, setExportaciones] = useState([]); // Almacena las exportaciones recibidas
  const [searchTerm, setSearchTerm] = useState(""); // Almacena el término de búsqueda del usuario
  const [filter] = useState("All"); // Filtro fijo por destino (se podría modificar para permitir otros filtros)
  const [editingExportacion, setEditingExportacion] = useState(null); // Almacena la exportación que se está editando
  const [showModal, setShowModal] = useState(false); // Controla la visibilidad del modal de edición

  // Función que obtiene las exportaciones desde la API
  const fetchExportaciones = async () => {
    try {
      // Realiza la solicitud GET para obtener las exportaciones
      const response = await axios.get(
        "https://opsmergeback-production.up.railway.app/api/exportaciones"
      );
      // Verifica si los datos recibidos son un arreglo
      if (Array.isArray(response.data)) {
        setExportaciones(response.data); // Si es un arreglo, actualiza el estado
      } else {
        console.error("Los datos recibidos no son un array:", response.data);
        setExportaciones([]); // Si no es un arreglo, muestra un error y resetea el estado
      }
    } catch (error) {
      console.error("Error al obtener los datos de exportaciones:", error);
      setExportaciones([]); // En caso de error en la solicitud, muestra un error y resetea el estado
    }
  };

  // useEffect para cargar las exportaciones cuando el componente se monta
  useEffect(() => {
    fetchExportaciones(); // Llama a la función para obtener las exportaciones
  }, []); // El array vacío significa que solo se ejecutará una vez, al montar el componente

  // Función que maneja el cambio en el campo de búsqueda
  const handleSearch = (event) => {
    setSearchTerm(event.target.value); // Actualiza el término de búsqueda en el estado
  };

  // Función que maneja la edición de una exportación
  const handleEdit = (exportacion) => {
    setEditingExportacion(exportacion); // Establece la exportación seleccionada para editar
    setShowModal(true); // Muestra el modal de edición
  };

  // Función para formatear la fecha en un formato legible
  const formatFecha = (fecha) => {
    const date = new Date(fecha); // Convierte la fecha a un objeto Date
    const year = date.getFullYear(); // Obtiene el año
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Obtiene el mes, con cero a la izquierda
    const day = String(date.getDate()).padStart(2, "0"); // Obtiene el día, con cero a la izquierda
    return `${year}-${month}-${day}`; // Devuelve la fecha en formato YYYY-MM-DD
  };

  // Función que guarda los cambios realizados en una exportación
  const handleSave = async () => {
    // Formatea la exportación para enviarla al servidor
    const formattedExportacion = {
      ...editingExportacion,
      fechaCarga: editingExportacion.fechaCarga
        ? new Date(editingExportacion.fechaCarga).toLocaleDateString("en-CA")
        : null, // Si tiene fecha de carga, la formatea a formato "en-CA"
    };

    try {
      // Realiza una solicitud PUT para actualizar la exportación en el servidor
      const response = await axios.put(
        `https://opsmergeback-production.up.railway.app/api/exportaciones/${editingExportacion.id}`,
        formattedExportacion
      );
      // Actualiza el estado de las exportaciones con la exportación editada
      setExportaciones(
        exportaciones.map((exp) =>
          exp.id === editingExportacion.id ? response.data : exp
        )
      );
      setShowModal(false); // Cierra el modal
    } catch (error) {
      console.error("Error al actualizar la exportación:", error);
    }
  };

  // Función que cambia el estado de una exportación a "Despachado"
  const handleComplete = async (id) => {
    const confirmChange = window.confirm("Una vez cambiado el status a DESPACHADO los datos no podrán editarse. ¿Desea continuar?");
    
    if (confirmChange) {
      try {
        // Realiza una solicitud PUT para cambiar el estado de la exportación
        await axios.put(`https://opsmergeback-production.up.railway.app/api/exportaciones/status/${id}`, { status: "Despachado" });
        // Actualiza el estado local de la exportación con el nuevo estado
        setExportaciones(
          exportaciones.map((exp) => (exp.id === id ? { ...exp, status: "Despachado" } : exp))
        );
        alert("Estado de la exportación actualizado a 'Despachado' con éxito.");
      } catch (error) {
        console.error("Error al completar la exportación:", error);
        alert("Error al completar la exportación. Inténtelo de nuevo.");
      }
    }
  };

  // Función que maneja el cambio de los campos en el formulario de edición
  const handleChange = (e) => {
    const { name, value } = e.target; // Obtiene el nombre y valor del campo
    setEditingExportacion({ ...editingExportacion, [name]: value }); // Actualiza el estado de la exportación en edición
  };

  // Filtra las exportaciones basándose en el término de búsqueda
  const filteredExportaciones = Array.isArray(exportaciones)
    ? exportaciones
        .filter((exp) => {
          const lowerSearchTerm = searchTerm.toLowerCase(); // Convierte el término de búsqueda a minúsculas
          const lowerFilter = filter.toLowerCase(); // Convierte el filtro a minúsculas

          if (lowerFilter !== "all" && exp.destino.toLowerCase() !== lowerFilter) {
            return false; // Filtra las exportaciones según el destino
          }

          // Filtra por destino, conductor o patente de camión
          return (
            exp.destino?.toLowerCase().includes(lowerSearchTerm) ||
            exp.conductor?.toLowerCase().includes(lowerSearchTerm) ||
            exp.patenteCamion?.toLowerCase().includes(lowerSearchTerm)
          );
        })
        .map((exp) => ({
          ...exp,
          fechaCarga: exp.fechaCarga ? formatFecha(exp.fechaCarga) : "", // Formatea la fecha de carga
        }))
    : []; // Si no hay exportaciones, retorna un array vacío

  return (
    <div className="exportaciones-table-container">
      <h1 className="table-title">Exportaciones</h1>
      {user && (
        <p>
          Usuario: {user.username} ({user.email})
        </p>
      )}
      <div className="search-filter-row">
        <Form.Control
          type="text"
          placeholder="Puedes buscar por Destino, Patente Camión y Conductor"
          value={searchTerm}
          onChange={handleSearch}
        />
        <Button variant="primary" onClick={fetchExportaciones}>
          Actualizar
        </Button>
      </div>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Mercado</th>
            <th>Material</th>
            <th>Descripción</th>
            <th>Fecha Carga</th>
            <th>Observación</th>
            <th>Pallet</th>
            <th>Cajas</th>
            <th>PO Exportación</th>
            <th>Conductor</th>
            <th>RUT</th>
            <th>Teléfono</th>
            <th>Contenedor</th>
            <th>Sello Naviero</th>
            <th>Status</th>
            <th>Transporte</th>
            <th>Tipo Contenedor</th>
            <th>Centro Carga</th>
            <th>Nave</th>
            <th>POL</th>
            <th>Naviera</th>
            <th>Operador</th>
            <th>Turno</th>
            <th>Patente Rampla</th>
            <th>Patente Camión</th>
            <th>Destino</th>
            <th>Sello Empresa</th>
            <th>Delivery</th>
            <th>PO Local</th>
            <th>N° Interno</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredExportaciones.map((exp) => (
            <tr key={exp.id}>
              <td>{exp.mercado}</td>
              <td>{exp.material}</td>
              <td>{exp.descripcion}</td>
              <td>{exp.fechaCarga}</td>
              <td>{exp.observacion}</td>
              <td>{exp.pallet}</td>
              <td>{exp.cajas}</td>
              <td>{exp.poExportacion}</td>
              <td>{exp.conductor}</td>
              <td>{exp.rut}</td>
              <td>{exp.telefono}</td>
              <td>{exp.contenedor}</td>
              <td>{exp.selloNaviero}</td>
              <td>{exp.status}</td>
              <td>{exp.transporte}</td>
              <td>{exp.tipoContenedor}</td>
              <td>{exp.centroCarga}</td>
              <td>{exp.nave}</td>
              <td>{exp.pol}</td>
              <td>{exp.naviera}</td>
              <td>{exp.operador}</td>
              <td>{exp.turno}</td>
              <td>{exp.patenteRampla}</td>
              <td>{exp.patenteCamion}</td>
              <td>{exp.destino}</td>
              <td>{exp.selloEmpresa}</td>
              <td>{exp.delivery}</td>
              <td>{exp.poLocal}</td>
              <td>{exp.numeroInterno}</td>
              <td>
                <Button variant="warning" onClick={() => handleEdit(exp)}
                  title="Presione para editar"
                  >
                  <FontAwesomeIcon icon={faEdit} /> Editar
                </Button>
                <br />
                <Button
                  variant="success"
                  onClick={() => handleComplete(exp.id)}
                  title="Presione para cambiar el estado a COMPLETADO"
                >
                  <FontAwesomeIcon icon={faCheck} /> Status
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {editingExportacion && (
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Editar Exportación</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="formMercado">
                <Form.Label>Mercado</Form.Label>
                <Form.Control
                  type="text"
                  name="mercado"
                  value={editingExportacion.mercado || ""}
                  onChange={handleChange}
                  disabled={editingExportacion.status === "Despachado"}
                />
              </Form.Group>
              <Form.Group controlId="formMaterial">
                <Form.Label>Material</Form.Label>
                <Form.Control
                  type="text"
                  name="material"
                  value={editingExportacion.material || ""}
                  onChange={handleChange}
                  disabled={editingExportacion.status === "Despachado"}
                />
              </Form.Group>
              <Form.Group controlId="formDescripcion">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  type="text"
                  name="descripcion"
                  value={editingExportacion.descripcion || ""}
                  onChange={handleChange}
                  disabled={editingExportacion.status === "Despachado"}
                />
              </Form.Group>
              <Form.Group controlId="formFechaCarga">
                <Form.Label>Fecha de Carga</Form.Label>
                <Form.Control
                  type="date"
                  name="fechaCarga"
                  value={editingExportacion.fechaCarga || ""}
                  onChange={handleChange}
                  disabled={editingExportacion.status === "Despachado"}
                />
              </Form.Group>
              <Form.Group controlId="formObservacion">
                <Form.Label>Observación</Form.Label>
                <Form.Control
                  type="text"
                  name="observacion"
                  value={editingExportacion.observacion || ""}
                  onChange={handleChange}
                  disabled={editingExportacion.status === "Despachado"}
                />
              </Form.Group>
              <Form.Group controlId="formPallet">
                <Form.Label>Pallet</Form.Label>
                <Form.Control
                  type="number"
                  name="pallet"
                  value={editingExportacion.pallet || ""}
                  onChange={handleChange}
                  disabled={editingExportacion.status === "Despachado"}
                />
              </Form.Group>
              <Form.Group controlId="formCajas">
                <Form.Label>Cajas</Form.Label>
                <Form.Control
                  type="number"
                  name="cajas"
                  value={editingExportacion.cajas || ""}
                  onChange={handleChange}
                  disabled={editingExportacion.status === "Despachado"}
                />
              </Form.Group>
              <Form.Group controlId="formPoExportacion">
                <Form.Label>PO Exportación</Form.Label>
                <Form.Control
                  type="text"
                  name="poExportacion"
                  value={editingExportacion.poExportacion || ""}
                  onChange={handleChange}
                  disabled={editingExportacion.status === "Despachado"}
                />
              </Form.Group>
              <Form.Group controlId="formConductor">
                <Form.Label>Conductor</Form.Label>
                <Form.Control
                  type="text"
                  name="conductor"
                  value={editingExportacion.conductor || ""}
                  onChange={handleChange}
                  disabled={editingExportacion.status === "Despachado"}
                />
              </Form.Group>
              <Form.Group controlId="formRut">
                <Form.Label>RUT</Form.Label>
                <Form.Control
                  type="text"
                  name="rut"
                  value={editingExportacion.rut || ""}
                  onChange={handleChange}
                  disabled={editingExportacion.status === "Despachado"}
                />
              </Form.Group>
              <Form.Group controlId="formTelefono">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  type="text"
                  name="telefono"
                  value={editingExportacion.telefono || ""}
                  onChange={handleChange}
                  disabled={editingExportacion.status === "Despachado"}
                />
              </Form.Group>
              <Form.Group controlId="formContenedor">
                <Form.Label>Contenedor</Form.Label>
                <Form.Control
                  type="text"
                  name="contenedor"
                  value={editingExportacion.contenedor || ""}
                  onChange={handleChange}
                  disabled={editingExportacion.status === "Despachado"}
                />
              </Form.Group>
              <Form.Group controlId="formSelloNaviero">
                <Form.Label>Sello Naviero</Form.Label>
                <Form.Control
                  type="text"
                  name="selloNaviero"
                  value={editingExportacion.selloNaviero || ""}
                  onChange={handleChange}
                  disabled={editingExportacion.status === "Despachado"}
                />
              </Form.Group>
              <Form.Group controlId="formStatus">
                <Form.Label>Status</Form.Label>
                <Form.Control
                  type="text"
                  name="status"
                  value={editingExportacion.status || ""}
                  onChange={handleChange}
                  disabled={editingExportacion.status === "Despachado"}
                />
              </Form.Group>
              <Form.Group controlId="formTransporte">
                <Form.Label>Transporte</Form.Label>
                <Form.Control
                  type="text"
                  name="transporte"
                  value={editingExportacion.transporte || ""}
                  onChange={handleChange}
                  disabled={editingExportacion.status === "Despachado"}
                />
              </Form.Group>
              <Form.Group controlId="formTipoContenedor">
                <Form.Label>Tipo Contenedor</Form.Label>
                <Form.Control
                  type="text"
                  name="tipoContenedor"
                  value={editingExportacion.tipoContenedor || ""}
                  onChange={handleChange}
                  disabled={editingExportacion.status === "Despachado"}
                />
              </Form.Group>
              <Form.Group controlId="formCentroCarga">
                <Form.Label>Centro Carga</Form.Label>
                <Form.Control
                  type="text"
                  name="centroCarga"
                  value={editingExportacion.centroCarga || ""}
                  onChange={handleChange}
                  disabled={editingExportacion.status === "Despachado"}
                />
              </Form.Group>
              <Form.Group controlId="formNave">
                <Form.Label>Nave</Form.Label>
                <Form.Control
                  type="text"
                  name="nave"
                  value={editingExportacion.nave || ""}
                  onChange={handleChange}
                  disabled={editingExportacion.status === "Despachado"}
                />
              </Form.Group>
              <Form.Group controlId="formPol">
                <Form.Label>POL</Form.Label>
                <Form.Control
                  type="text"
                  name="pol"
                  value={editingExportacion.pol || ""}
                  onChange={handleChange}
                  disabled={editingExportacion.status === "Despachado"}
                />
              </Form.Group>
              <Form.Group controlId="formNaviera">
                <Form.Label>Naviera</Form.Label>
                <Form.Control
                  type="text"
                  name="naviera"
                  value={editingExportacion.naviera || ""}
                  onChange={handleChange}
                  disabled={editingExportacion.status === "Despachado"}
                />
              </Form.Group>
              <Form.Group controlId="formOperador">
                <Form.Label>Operador</Form.Label>
                <Form.Control
                  type="text"
                  name="operador"
                  value={editingExportacion.operador || ""}
                  onChange={handleChange}
                  disabled={editingExportacion.status === "Despachado"}
                />
              </Form.Group>
              <Form.Group controlId="formTurno">
                <Form.Label>Turno</Form.Label>
                <Form.Control
                  type="text"
                  name="turno"
                  value={editingExportacion.turno || ""}
                  onChange={handleChange}
                  disabled={editingExportacion.status === "Despachado"}
                />
              </Form.Group>
              <Form.Group controlId="formPatenteRampla">
                <Form.Label>Patente Rampla</Form.Label>
                <Form.Control
                  type="text"
                  name="patenteRampla"
                  value={editingExportacion.patenteRampla || ""}
                  onChange={handleChange}
                  disabled={editingExportacion.status === "Despachado"}
                />
              </Form.Group>
              <Form.Group controlId="formPatenteCamion">
                <Form.Label>Patente Camión</Form.Label>
                <Form.Control
                  type="text"
                  name="patenteCamion"
                  value={editingExportacion.patenteCamion || ""}
                  onChange={handleChange}
                  disabled={editingExportacion.status === "Despachado"}
                />
              </Form.Group>
              <Form.Group controlId="formDestino">
                <Form.Label>Destino</Form.Label>
                <Form.Control
                  type="text"
                  name="destino"
                  value={editingExportacion.destino || ""}
                  onChange={handleChange}
                  disabled={editingExportacion.status === "Despachado"}
                />
              </Form.Group>
              <Form.Group controlId="formSelloEmpresa">
                <Form.Label>Sello Empresa</Form.Label>
                <Form.Control
                  type="text"
                  name="selloEmpresa"
                  value={editingExportacion.selloEmpresa || ""}
                  onChange={handleChange}
                  disabled={editingExportacion.status === "Despachado"}
                />
              </Form.Group>
              <Form.Group controlId="formDelivery">
                <Form.Label>Delivery</Form.Label>
                <Form.Control
                  type="text"
                  name="delivery"
                  value={editingExportacion.delivery || ""}
                  onChange={handleChange}
                  disabled={editingExportacion.status === "Despachado"}
                />
              </Form.Group>
              <Form.Group controlId="formPoLocal">
                <Form.Label>PO Local</Form.Label>
                <Form.Control
                  type="text"
                  name="poLocal"
                  value={editingExportacion.poLocal || ""}
                  onChange={handleChange}
                  disabled={editingExportacion.status === "Despachado"}
                />
              </Form.Group>
              <Form.Group controlId="formNumeroInterno">
                <Form.Label>N° Interno</Form.Label>
                <Form.Control
                  type="text"
                  name="numeroInterno"
                  value={editingExportacion.numeroInterno || ""}
                  onChange={handleChange}
                  disabled={editingExportacion.status === "Despachado"}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Guardar <FontAwesomeIcon icon={faSave} />
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default ExportacionesTable;
