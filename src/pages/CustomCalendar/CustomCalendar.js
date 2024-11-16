import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CustomCalendar.css';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';

const localizer = momentLocalizer(moment);

const CustomCalendar = () => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({ title: '', start: '', end: '', allDay: false });

  // Función para obtener eventos
  const fetchEvents = async () => {
    try {
      const response = await axios.get('/api/calendario/events', {
        params: {
          userId: '1', // Ajustar o eliminar según sea necesario
        },
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Función para guardar un nuevo evento
  const handleSaveEvent = async () => {
    if (newEvent.title.trim() === '') {
      alert('El título del evento no puede estar vacío.');
      return;
    }
    try {
      const eventToSave = {
        ...newEvent,
        userId: '1', // Ajustar userId según sea necesario
        start: moment(newEvent.start).format('YYYY-MM-DD HH:mm:ss'),
        end: moment(newEvent.end).format('YYYY-MM-DD HH:mm:ss')
      };
      if (selectedEvent) {
        // Actualizar evento
        const response = await axios.put(`/api/calendario/events/${selectedEvent.id}`, eventToSave);
        const updatedEvents = events.map(evt => (evt.id === response.data.id ? response.data : evt));
        setEvents(updatedEvents);
      } else {
        // Crear evento
        const response = await axios.post('/api/calendario/events', eventToSave);
        setEvents([...events, response.data]);
      }
      setShowModal(false);
      setNewEvent({ title: '', start: '', end: '', allDay: false }); // Limpiar formulario
      setSelectedEvent(null); // Limpiar el evento seleccionado
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  // Función para eliminar un evento
  const handleDeleteEvent = async () => {
    if (selectedEvent) {
      try {
        await axios.delete(`/api/calendario/events/${selectedEvent.id}`);
        const filteredEvents = events.filter(evt => evt.id !== selectedEvent.id);
        setEvents(filteredEvents);
        setShowModal(false);
        setNewEvent({ title: '', start: '', end: '', allDay: false }); // Limpiar formulario
        setSelectedEvent(null); // Limpiar el evento seleccionado
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  // Función para manejar el clic en una fecha del calendario
  const handleDateClick = (slotInfo) => {
    setNewEvent({ title: '', start: slotInfo.start, end: slotInfo.end, allDay: slotInfo.start === slotInfo.end });
    setShowModal(true);
    setSelectedEvent(null); // Limpiar el evento seleccionado
  };

  // Función para manejar el clic en un evento del calendario
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setNewEvent({
      title: event.title,
      start: moment(event.start).toDate(),
      end: moment(event.end).toDate(),
      allDay: event.allDay,
    });
    setShowModal(true);
  };

  // Función para generar opciones de tiempo
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
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500, width: '100%' }}
        views={['month']}
        defaultView="month"
        popup
        selectable
        onSelectEvent={handleSelectEvent} // Aquí usamos la función handleSelectEvent
        onSelectSlot={handleDateClick}
        onDoubleClickEvent={event => handleDeleteEvent(event.id)}
      />

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
            <Form.Group controlId="formEventAllDay">
              <Form.Check
                type="checkbox"
                label="Todo el día"
                checked={newEvent.allDay}
                onChange={(e) => setNewEvent({ ...newEvent, allDay: e.target.checked })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          {selectedEvent && (
            <Button variant="danger" onClick={handleDeleteEvent}>
              Eliminar
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cerrar</Button>
          <Button variant="primary" onClick={handleSaveEvent}>
            {selectedEvent ? 'Guardar Cambios' : 'Guardar'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CustomCalendar;
