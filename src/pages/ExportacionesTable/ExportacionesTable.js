import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Form, Button, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import "./ExportacionesTable.css";

const ExportacionesTable = ({ user }) => {
  const [exportaciones, setExportaciones] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter] = useState("All");
  const [editingExportacion, setEditingExportacion] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchExportaciones = async () => {
    try {
      const response = await axios.get("/api/exportaciones");
      if (Array.isArray(response.data)) {
        setExportaciones(response.data);
      } else {
        console.error("Los datos recibidos no son un array:", response.data);
        setExportaciones([]);
      }
    } catch (error) {
      console.error("Error al obtener los datos de exportaciones:", error);
      setExportaciones([]);
    }
  };

  useEffect(() => {
    fetchExportaciones();
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleEdit = (exportacion) => {
    setEditingExportacion(exportacion);
    setShowModal(true);
  };

  const handleSave = async () => {
    const formattedExportacion = {
      ...editingExportacion,
      fechaCarga: editingExportacion.fechaCarga
        ? new Date(editingExportacion.fechaCarga).toISOString().split("T")[0]
        : null,
    };

    try {
      const response = await axios.put(`/api/exportaciones/${editingExportacion.id}`, formattedExportacion);
      setExportaciones(
        exportaciones.map((exp) => (exp.id === editingExportacion.id ? response.data : exp))
      );
      setShowModal(false);
    } catch (error) {
      console.error("Error al actualizar la exportación:", error);
    }
  };

  const handleComplete = async (id) => {
    try {
      await axios.put(`/api/exportaciones/status/${id}`, { status: "Completado" });
      setExportaciones(
        exportaciones.map((exp) => (exp.id === id ? { ...exp, status: "Completado" } : exp))
      );
      alert("Estado de la exportación actualizado a 'Completado' con éxito.");
    } catch (error) {
      console.error("Error al completar la exportación:", error);
      alert("Error al completar la exportación. Inténtelo de nuevo.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingExportacion({ ...editingExportacion, [name]: value });
  };

  const filteredExportaciones = Array.isArray(exportaciones)
    ? exportaciones.filter((exp) => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        const lowerFilter = filter.toLowerCase();

        if (lowerFilter !== "all" && exp.destino.toLowerCase() !== lowerFilter) {
          return false;
        }

        return (
          exp.destino?.toLowerCase().includes(lowerSearchTerm) ||
          exp.conductor?.toLowerCase().includes(lowerSearchTerm) ||
          exp.patenteCamion?.toLowerCase().includes(lowerSearchTerm)
        );
      })
    : [];

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
                <Button variant="warning" onClick={() => handleEdit(exp)}>
                  Editar
                </Button>
                <Button variant="success" onClick={() => handleComplete(exp.id)}>
                  Completar
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
                  value={editingExportacion.mercado || ''}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="formMaterial">
                <Form.Label>Material</Form.Label>
                <Form.Control
                  type="text"
                  name="material"
                  value={editingExportacion.material || ''}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="formDescripcion">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  type="text"
                  name="descripcion"
                  value={editingExportacion.descripcion || ''}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="formFechaCarga">
                <Form.Label>Fecha de Carga</Form.Label>
                <Form.Control
                  type="date"
                  name="fechaCarga"
                  value={editingExportacion.fechaCarga || ''}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="formObservacion">
                <Form.Label>Observación</Form.Label>
                <Form.Control
                  type="text"
                  name="observacion"
                  value={editingExportacion.observacion || ''}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="formPallet">
                <Form.Label>Pallet</Form.Label>
                <Form.Control
                  type="number"
                  name="pallet"
                  value={editingExportacion.pallet || ''}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="formCajas">
                <Form.Label>Cajas</Form.Label>
                <Form.Control
                  type="number"
                  name="cajas"
                  value={editingExportacion.cajas || ''}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="formPoExportacion">
                <Form.Label>PO Exportación</Form.Label>
                <Form.Control
                  type="text"
                  name="poExportacion"
                  value={editingExportacion.poExportacion || ''}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="formConductor">
                <Form.Label>Conductor</Form.Label>
                <Form.Control
                  type="text"
                  name="conductor"
                  value={editingExportacion.conductor || ''}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="formRut">
                <Form.Label>RUT</Form.Label>
                <Form.Control
                  type="text"
                  name="rut"
                  value={editingExportacion.rut || ''}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="formTelefono">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  type="text"
                  name="telefono"
                  value={editingExportacion.telefono || ''}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="formContenedor">
                <Form.Label>Contenedor</Form.Label>
                <Form.Control
                  type="text"
                  name="contenedor"
                  value={editingExportacion.contenedor || ''}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="formSelloNaviero">
                <Form.Label>Sello Naviero</Form.Label>
                <Form.Control
                  type="text"
                  name="selloNaviero"
                  value={editingExportacion.selloNaviero || ''}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="formStatus">
                <Form.Label>Status</Form.Label>
                <Form.Control
                  type="text"
                  name="status"
                  value={editingExportacion.status || ''}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="formTransporte">
                <Form.Label>Transporte</Form.Label>
                <Form.Control
                  type="text"
                  name="transporte"
                  value={editingExportacion.transporte || ''}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="formTipoContenedor">
                <Form.Label>Tipo Contenedor</Form.Label>
                <Form.Control
                  type="text"
                  name="tipoContenedor"
                  value={editingExportacion.tipoContenedor || ''}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="formCentroCarga">
                <Form.Label>Centro Carga</Form.Label>
                <Form.Control
                  type="text"
                  name="centroCarga"
                  value={editingExportacion.centroCarga || ''}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="formNave">
                <Form.Label>Nave</Form.Label>
                <Form.Control
                  type="text"
                  name="nave"
                  value={editingExportacion.nave || ''}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="formPol">
                <Form.Label>POL</Form.Label>
                <Form.Control
                  type="text"
                  name="pol"
                  value={editingExportacion.pol || ''}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="formNaviera">
                <Form.Label>Naviera</Form.Label>
                <Form.Control
                  type="text"
                  name="naviera"
                  value={editingExportacion.naviera || ''}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="formOperador">
                <Form.Label>Operador</Form.Label>
                <Form.Control
                  type="text"
                  name="operador"
                  value={editingExportacion.operador || ''}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="formTurno">
                <Form.Label>Turno</Form.Label>
                <Form.Control
                  type="text"
                  name="turno"
                  value={editingExportacion.turno || ''}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="formPatenteRampla">
                <Form.Label>Patente Rampla</Form.Label>
                <Form.Control
                  type="text"
                  name="patenteRampla"
                  value={editingExportacion.patenteRampla || ''}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="formPatenteCamion">
                <Form.Label>Patente Camión</Form.Label>
                <Form.Control
                  type="text"
                  name="patenteCamion"
                  value={editingExportacion.patenteCamion || ''}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="formDestino">
                <Form.Label>Destino</Form.Label>
                <Form.Control
                  type="text"
                  name="destino"
                  value={editingExportacion.destino || ''}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="formSelloEmpresa">
                <Form.Label>Sello Empresa</Form.Label>
                <Form.Control
                  type="text"
                  name="selloEmpresa"
                  value={editingExportacion.selloEmpresa || ''}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="formDelivery">
                <Form.Label>Delivery</Form.Label>
                <Form.Control
                  type="text"
                  name="delivery"
                  value={editingExportacion.delivery || ''}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="formPoLocal">
                <Form.Label>PO Local</Form.Label>
                <Form.Control
                  type="text"
                  name="poLocal"
                  value={editingExportacion.poLocal || ''}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="formNumeroInterno">
                <Form.Label>N° Interno</Form.Label>
                <Form.Control
                  type="text"
                  name="numeroInterno"
                  value={editingExportacion.numeroInterno || ''}
                  onChange={handleChange}
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

  