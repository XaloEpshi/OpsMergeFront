// Importación de librerías necesarias
import React, { useState } from "react";  // useState es un hook de React para manejar el estado del componente.
import axios from "axios";  // axios es una librería para realizar solicitudes HTTP.
import { Form, Button, Row, Col } from "react-bootstrap";  // Componentes de React Bootstrap para crear formularios responsivos.
import "./ExportacionesForm.css";  // Importa el archivo de estilo CSS para el formulario.

const FormularioExportaciones = () => {
  // Definir el estado inicial del formulario
  const [formData, setFormData] = useState({
    mercado: "",  // Mercado de exportación
    material: "",  // Material de exportación
    descripcion: "",  // Descripción del material
    fechaCarga: "",  // Fecha de carga
    observacion: "",  // Observaciones generales
    pallet: "",  // Número de pallets
    cajas: "",  // Número de cajas
    poExportacion: "",  // Número de orden de compra de exportación
    conductor: "",  // Nombre del conductor
    rut: "",  // RUT del conductor
    telefono: "",  // Teléfono del conductor
    contenedor: "",  // Contenedor utilizado para el envío
    selloNaviero: "",  // Sello naviero
    status: "En Espera",  // Estado por defecto de la exportación
    transporte: "",  // Nombre del transporte
    tipoContenedor: "",  // Tipo de contenedor utilizado
    centroCarga: "",  // Centro de carga
    nave: "",  // Nombre de la nave de exportación
    pol: "",  // Puerto de origen
    naviera: "",  // Nombre de la naviera
    operador: "",  // Operador del transporte
    turno: "",  // Turno en el que se realiza el envío
    patenteRampla: "",  // Patente de la rampla (remolque)
    patenteCamion: "",  // Patente del camión
    destino: "",  // Destino del envío
    selloEmpresa: "",  // Sello de la empresa
    delivery: "",  // Información de entrega
    poLocal: "",  // Orden de compra local
    facturaCPW: "",  // Factura CPW
    numeroInterno: "",  // Número interno del envío
  });

  // Función para formatear la fecha en el formato 'YYYY-MM-DD'
  const formatFecha = (fecha) => {
    const date = new Date(fecha);  // Convierte la fecha a objeto Date
    const year = date.getFullYear();  // Obtiene el año
    const month = String(date.getMonth() + 1).padStart(2, "0");  // Obtiene el mes, asegurando que sea de dos dígitos
    const day = String(date.getDate()).padStart(2, "0");  // Obtiene el día, asegurando que sea de dos dígitos
    return `${year}-${month}-${day}`;  // Devuelve la fecha en el formato 'YYYY-MM-DD'
  };

  // Función para manejar cambios en los campos del formulario
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });  // Actualiza el estado con el nuevo valor del campo
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();  // Previene la acción por defecto del formulario (recargar la página)
    try {
      // Prepara los datos a enviar, asegurando que 'fechaCarga' esté en el formato correcto y 'poExportacion' sea una cadena
      const dataToSend = {
        ...formData,
        fechaCarga: formData.fechaCarga ? formatFecha(formData.fechaCarga) : "",  // Si hay una fecha de carga, se formatea
        poExportacion: String(formData.poExportacion),  // Convierte 'poExportacion' a string
      };
      
      // Realiza una solicitud POST para enviar los datos al backend
      await axios.post(
        "https://opsmergeback-production.up.railway.app/api/exportaciones",  // URL del servidor donde se enviarán los datos
        dataToSend  // Los datos del formulario
      );
      
      // Muestra un mensaje de éxito si la solicitud es exitosa
      alert("Datos de exportación registrados con éxito");

      // Restablece los datos del formulario a sus valores iniciales
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
      // Maneja cualquier error que ocurra durante la solicitud
      console.error("Error al enviar los datos:", error);
    }
  };

  return (
    <>
      {/* Formulario para ingresar los datos de exportación */}
      <form onSubmit={handleSubmit} className="exportaciones-form">
        <h1 className="form-title">Agenda Exportaciones</h1>  {/* Título principal del formulario */}
        <br />
        <h3>Datos Encargada de Exportaciones</h3>  {/* Subtítulo indicando que se ingresan los datos de la exportación */}
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
