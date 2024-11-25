import React, { useState, useEffect } from 'react';  // Importa React y los hooks useState y useEffect
import { Calendar, momentLocalizer } from 'react-big-calendar';  // Importa el calendario de react-big-calendar y el localizador de moment
import moment from 'moment';  // Importa moment.js para manejar fechas y horas
import 'react-big-calendar/lib/css/react-big-calendar.css';  // Estilos de react-big-calendar
import './CustomCalendar.css';  // Estilos personalizados para el calendario
import { Modal, Button, Form } from 'react-bootstrap';  // Componentes de React Bootstrap para crear el modal y los botones
import axios from 'axios';  // Importa axios para realizar peticiones HTTP

const localizer = momentLocalizer(moment);  // Localiza el calendario con moment.js

const CustomCalendar = () => {
  // Estados del componente
  const [events, setEvents] = useState([]);  // Estado para almacenar los eventos
  const [showModal, setShowModal] = useState(false);  // Estado para manejar la visibilidad del modal
  const [selectedEvent, setSelectedEvent] = useState(null);  // Estado para almacenar el evento seleccionado
  const [newEvent, setNewEvent] = useState({ title: '', start: '', end: '', allDay: false, tooltip: '' });  // Estado para los nuevos eventos a crear

  // Función para obtener los eventos desde la API
  const fetchEvents = async () => {
    try {
      const response = await axios.get('https://opsmergeback-production.up.railway.app/api/calendario/events', {
        params: { userId: '1' },  // Filtra los eventos por usuario
      });
      setEvents(response.data);  // Actualiza el estado de los eventos con los datos obtenidos
    } catch (error) {
      console.error('Error fetching events:', error);  // Manejo de errores
    }
  };

  useEffect(() => {
    fetchEvents();  // Llama a fetchEvents cuando el componente se monta
  }, []);

  // Función para guardar un evento (ya sea nuevo o actualizado)
  const handleSaveEvent = async () => {
    if (newEvent.title.trim() === '') {
      alert('El título del evento no puede estar vacío.');  // Validación del título del evento
      return;
    }
    const now = moment();
    if (moment(newEvent.start).isBefore(now, 'day')) {
      alert('No puedes agregar un evento en una fecha pasada.');  // Valida que la fecha de inicio no sea pasada
      return;
    }
    try {
      const eventToSave = {
        ...newEvent,
        userId: '1',  // Ajuste del ID del usuario
        start: moment(newEvent.start).format('YYYY-MM-DD HH:mm:ss'),  // Formatea las fechas para la API
        end: moment(newEvent.end).format('YYYY-MM-DD HH:mm:ss'),
      };
      if (selectedEvent) {
        // Si existe un evento seleccionado, lo actualiza
        const response = await axios.put(`https://opsmergeback-production.up.railway.app/api/calendario/events/${selectedEvent.id}`, eventToSave);
        const updatedEvents = events.map(evt => (evt.id === response.data.id ? response.data : evt));  // Actualiza el evento en la lista
        setEvents(updatedEvents);  // Establece los eventos actualizados
      } else {
        // Si no hay evento seleccionado, crea un nuevo evento
        const response = await axios.post('https://opsmergeback-production.up.railway.app/api/calendario/events', eventToSave);
        setEvents([...events, response.data]);  // Añade el nuevo evento al estado de eventos
      }
      setShowModal(false);  // Cierra el modal después de guardar
      setNewEvent({ title: '', start: '', end: '', allDay: false, tooltip: '' });  // Limpia el formulario
      setSelectedEvent(null);  // Resetea el evento seleccionado
    } catch (error) {
      console.error('Error saving event:', error);  // Manejo de errores
    }
  };

  // Función para eliminar un evento
  const handleDeleteEvent = async () => {
    if (selectedEvent) {
      try {
        await axios.delete(`https://opsmergeback-production.up.railway.app/api/calendario/events/${selectedEvent.id}`);  // Elimina el evento de la API
        const filteredEvents = events.filter(evt => evt.id !== selectedEvent.id);  // Filtra el evento eliminado de la lista
        setEvents(filteredEvents);  // Actualiza la lista de eventos
        setShowModal(false);  // Cierra el modal
        setNewEvent({ title: '', start: '', end: '', allDay: false, tooltip: '' });  // Limpia el formulario
        setSelectedEvent(null);  // Resetea el evento seleccionado
      } catch (error) {
        console.error('Error deleting event:', error);  // Manejo de errores
      }
    }
  };

  // Función para manejar el clic en una fecha del calendario
  const handleDateClick = (slotInfo) => {
    const today = moment().startOf('day');
    const selectedDate = moment(slotInfo.start).startOf('day');

    if (selectedDate.isBefore(today)) {
      alert('No puedes agregar eventos en días pasados.');  // Previene la selección de días pasados
      return;
    }

    // Establece los valores iniciales para un nuevo evento
    setNewEvent({ title: '', start: slotInfo.start, end: slotInfo.end, allDay: slotInfo.start === slotInfo.end, tooltip: '' });
    setShowModal(true);  // Muestra el modal para agregar un evento
    setSelectedEvent(null);  // Limpia el evento seleccionado
  };

  // Función para manejar el clic en un evento del calendario
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);  // Establece el evento seleccionado
    setNewEvent({
      title: event.title,
      start: moment(event.start).toDate(),
      end: moment(event.end).toDate(),
      allDay: event.allDay,
      tooltip: event.tooltip,
    });
    setShowModal(true);  // Muestra el modal para editar el evento
  };

  // Función para generar opciones de hora para los selectores
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = moment({ hour, minute }).format('HH:mm');
        options.push(
          <option key={time} value={time}>
            {time}
          </option>
        );
      }
    }
    return options;
  };

  return (
    <div className="custom-calendar-container">
      <Calendar
        localizer={localizer}  // Asocia el localizador de fechas
        events={events}  // Pasa los eventos al calendario
        startAccessor="start"  // Propiedad para la fecha de inicio de los eventos
        endAccessor="end"  // Propiedad para la fecha de fin de los eventos
        style={{ height: 500, width: '100%' }}  // Estilos del calendario
        views={['month']}  // Muestra el calendario en vista mensual
        defaultView="month"  // Vista por defecto
        popup
        selectable  // Permite seleccionar fechas
        onSelectEvent={handleSelectEvent}  // Maneja el clic en un evento
        onSelectSlot={handleDateClick}  // Maneja el clic en una fecha
        onDoubleClickEvent={event => handleDeleteEvent(event.id)}  // Permite eliminar eventos con doble clic
        tooltipAccessor="tooltip"  // Muestra la descripción del evento como un tooltip
      />

      {/* Modal para crear o editar eventos */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedEvent ? 'Editar Evento' : 'Agregar Evento'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formEventTitle">
              <Form.Label>Título</Form.Label>
              <Form.Control
                type="text"
                placeholder="Título del evento"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formEventStart">
              <Form.Label>Fecha y Hora de Inicio</Form.Label>
              <Form.Control
                type="date"
                value={moment(newEvent.start).format('YYYY-MM-DD')}
                onChange={(e) => setNewEvent({ ...newEvent, start: moment(e.target.value + ' ' + moment(newEvent.start).format('HH:mm')).toDate() })}
              />
              <Form.Control
                as="select"
                value={moment(newEvent.start).format('HH:mm')}
                onChange={(e) => setNewEvent({ ...newEvent, start: moment(moment(newEvent.start).format('YYYY-MM-DD') + ' ' + e.target.value).toDate() })}
              >
                {generateTimeOptions()}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formEventEnd">
              <Form.Label>Fecha y Hora de Fin</Form.Label>
              <Form.Control
                type="date"
                value={moment(newEvent.end).format('YYYY-MM-DD')}
                onChange={(e) => setNewEvent({ ...newEvent, end: moment(e.target.value + ' ' + moment(newEvent.end).format('HH:mm')).toDate() })}
              />
              <Form.Control
                as="select"
                value={moment(newEvent.end).format('HH:mm')}
                onChange={(e) => setNewEvent({ ...newEvent, end: moment(moment(newEvent.end).format('YYYY-MM-DD') + ' ' + e.target.value).toDate() })}
              >
                {generateTimeOptions()}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formEventTooltip">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newEvent.tooltip}
                onChange={(e) => setNewEvent({ ...newEvent, tooltip: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cerrar</Button>
          <Button variant="primary" onClick={handleSaveEvent}>{selectedEvent ? 'Actualizar Evento' : 'Agregar Evento'}</Button>
          {selectedEvent && <Button variant="danger" onClick={handleDeleteEvent}>Eliminar Evento</Button>}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CustomCalendar;
