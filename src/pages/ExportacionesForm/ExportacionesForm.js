import React, { useState } from "react";
import axios from "axios";
import { Form, Button, Row, Col } from "react-bootstrap";
import "./ExportacionesForm.css";

const FormularioExportaciones = () => {
  const [formData, setFormData] = useState({
    mercado: "",
    material: "",
    descripcion: "",
    fechaCarga: "",
    observacion: "",
    pallet: "",
    cajas: "",
    poExportacion: "",
    conductor: "",
    rut: "",
    telefono: "",
    contenedor: "",
    selloNaviero: "",
    status: "En Espera", //Valor por Default
    transporte: "",
    tipoContenedor: "",
    centroCarga: "",
    nave: "",
    pol: "",
    naviera: "",
    operador: "",
    turno: "",
    patenteRampla: "",
    patenteCamion: "", // manteniendo una sola patente de camión
    destino: "",
    selloEmpresa: "",
    delivery: "",
    poLocal: "",
    facturaCPW: "",
    numeroInterno: "", // manteniendo un solo número interno
  });

  const formatFecha = (fecha) => {
    const date = new Date(fecha);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        fechaCarga: formData.fechaCarga ? formatFecha(formData.fechaCarga) : "",
        poExportacion: String(formData.poExportacion),
      };
      await axios.post(
        "https://opsmergeback-production.up.railway.app/api/exportaciones",
        dataToSend
      );
      alert("Datos de exportación registrados con éxito");
      setFormData({
        mercado: "",
        material: "",
        descripcion: "",
        fechaCarga: "",
        observacion: "",
        pallet: "",
        cajas: "",
        poExportacion: "",
        conductor: "",
        rut: "",
        telefono: "",
        contenedor: "",
        selloNaviero: "",
        status: "",
        transporte: "",
        tipoContenedor: "",
        centroCarga: "",
        nave: "",
        pol: "",
        naviera: "",
        operador: "",
        turno: "",
        patenteRampla: "",
        patenteCamion: "",
        destino: "",
        selloEmpresa: "",
        delivery: "",
        poLocal: "",
        facturaCPW: "",
        numeroInterno: "",
      });
    } catch (error) {
      console.error("Error al enviar los datos:", error);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="exportaciones-form">
        <h1 className="form-title">Agenda Exportaciones</h1>
        <br />
        <h3>Datos Encargada de Exportaciones</h3>
        <br />
        <br />
        <Row>
          <Col>
            <Form.Group controlId="mercado">
              <Form.Label>Mercado</Form.Label>
              <Form.Control
                type="text"
                name="mercado"
                value={formData.mercado}
                onChange={handleChange}
                required
                placeholder="requerido"
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="material">
              <Form.Label>Material</Form.Label>
              <Form.Control
                type="text"
                name="material"
                value={formData.material}
                onChange={handleChange}
                required
                placeholder="requerido"
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Group controlId="descripcion">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                type="text"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                required
                placeholder="requerido"
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="fechaCarga">
              <Form.Label>Fecha de Carga</Form.Label>
              <Form.Control
                type="date"
                name="fechaCarga"
                value={formData.fechaCarga}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Group controlId="observacion">
              <Form.Label>Observación</Form.Label>
              <Form.Control
                type="text"
                name="observacion"
                value={formData.observacion}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="pallet">
              <Form.Label>Número de Pallets</Form.Label>
              <Form.Control
                type="number"
                name="pallet"
                value={formData.pallet}
                onChange={handleChange}
                required
                placeholder="requerido"
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Group controlId="cajas">
              <Form.Label>Número de Cajas</Form.Label>
              <Form.Control
                type="number"
                name="cajas"
                value={formData.cajas}
                onChange={handleChange}
                required
                placeholder="requerido"
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="poExportacion">
              <Form.Label>PO Exportación</Form.Label>
              <Form.Control
                type="number"
                name="poExportacion"
                value={formData.poExportacion}
                onChange={handleChange}
                required
                placeholder="Numero PO requerido"
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Group controlId="conductor">
              <Form.Label>Conductor</Form.Label>
              <Form.Control
                type="text"
                name="conductor"
                value={formData.conductor}
                onChange={handleChange}
                required
                placeholder="requerido"
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="rut">
              <Form.Label>RUT</Form.Label>
              <Form.Control
                type="text"
                name="rut"
                value={formData.rut}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Group controlId="telefono">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="patenteCamion">
              <Form.Label>Patente del Camión</Form.Label>
              <Form.Control
                type="text"
                name="patenteCamion"
                value={formData.patenteCamion}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Group controlId="contenedor">
              <Form.Label>Contenedor</Form.Label>
              <Form.Control
                type="text"
                name="contenedor"
                value={formData.contenedor}
                onChange={handleChange}
                required
                placeholder="Ejemplo GAOU711741-1 requerido"
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="selloNaviero">
              <Form.Label>Sello Naviero</Form.Label>
              <Form.Control
                type="text"
                name="selloNaviero"
                value={formData.selloNaviero}
                onChange={handleChange}
                required
                placeholder="Ejemplo ML-CL03524 requerido"
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Group controlId="status">
              <Form.Label>Status</Form.Label>
              <Form.Control
                as="select"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="En espera">En espera</option>
                <option value="Cancelado">Cancelado</option>
              </Form.Control>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="transporte">
              <Form.Label>Transporte</Form.Label>
              <Form.Control
                type="text"
                name="transporte"
                value={formData.transporte}
                onChange={handleChange}
                required
                placeholder="Ejemplo PERROT requerido"
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Group controlId="tipoContenedor">
              <Form.Label>Tipo de Contenedor</Form.Label>
              <Form.Control
                  type="text"
                  name="tipoContenedor"
                  value={formData.tipoContenedor}
                  onChange={handleChange}
                  required
                  placeholder="Ejemplo HC40 requerido"
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="centroCarga">
                <Form.Label>Centro de Carga</Form.Label>
                <Form.Control
                  type="text"
                  name="centroCarga"
                  value={formData.centroCarga}
                  onChange={handleChange}
                  required
                  placeholder="Ejemplo CPW MAIPU requerido"
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Group controlId="nave">
                <Form.Label>Nave</Form.Label>
                <Form.Control
                  type="Number"
                  name="nave"
                  value={formData.nave}
                  onChange={handleChange}
                  required
                  placeholder="Ejemplo SNG0440734 requerido"
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="pol">
                <Form.Label>POL</Form.Label>
                <Form.Control
                  type="text"
                  name="pol"
                  value={formData.pol}
                  onChange={handleChange}
                  required
                  placeholder="Ejemplo EVER LAWFUL requerido"
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Group controlId="naviera">
                <Form.Label>Naviera</Form.Label>
                <Form.Control
                  type="text"
                  name="naviera"
                  value={formData.naviera}
                  onChange={handleChange}
                  required
                  placeholder="Ejemplo SAN ANTONIO requerido"
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="operador">
                <Form.Label>Operador</Form.Label>
                <Form.Control
                  type="text"
                  name="operador"
                  value={formData.operador}
                  onChange={handleChange}
                  required
                  placeholder="Ejemplo MAERSK requerido"
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Group controlId="turno">
                <Form.Label>Turno</Form.Label>
                <Form.Control
                  type="text"
                  name="turno"
                  value={formData.turno}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="patenteRampla">
                <Form.Label>Patente Rampla</Form.Label>
                <Form.Control
                  type="text"
                  name="patenteRampla"
                  value={formData.patenteRampla}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Group controlId="destino">
                <Form.Label>Destino</Form.Label>
                <Form.Control
                  type="text"
                  name="destino"
                  value={formData.destino}
                  onChange={handleChange}
                  required
                  placeholder="Ejemplo PUERTO SAN ANTONIO requerido"
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="selloEmpresa">
                <Form.Label>Sello Empresa</Form.Label>
                <Form.Control
                  type="text"
                  name="selloEmpresa"
                  value={formData.selloEmpresa}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Group controlId="delivery">
                <Form.Label>Delivery</Form.Label>
                <Form.Control
                  type="text"
                  name="delivery"
                  value={formData.delivery}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="poLocal">
                <Form.Label>PO Local</Form.Label>
                <Form.Control
                  type="text"
                  name="poLocal"
                  value={formData.poLocal}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <br />
          <Button variant="primary" type="submit">
            Enviar
          </Button>
        </form>
      </>
    );
  };

  export default FormularioExportaciones;
