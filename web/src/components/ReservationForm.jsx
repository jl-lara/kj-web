import { CalendarDays, MailCheck, Store, Users } from 'lucide-react';
import { useState } from 'react';
import { locations } from '../data/siteData.js';

export default function ReservationForm() {
  const [sent, setSent] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <section className="section reservation-section" id="reservaciones">
      <div className="container reservation-layout">
        <div className="reservation-copy">
          <span className="eyebrow">Reservaciones</span>
          <h2>Reserva tu mesa en la sucursal que prefieras</h2>
          <p>
            El usuario completa la solicitud; la sucursal recibe la información,
            confirma disponibilidad y responde por correo. Esta etapa cubre la
            interfaz del usuario y deja listo el flujo para conectar el envío real.
          </p>
          <div className="reservation-flow" aria-label="Flujo de reservación">
            <article><Users size={18} /><span>El cliente solicita mesa</span></article>
            <article><Store size={18} /><span>La sucursal revisa disponibilidad</span></article>
            <article><MailCheck size={18} /><span>La confirmación llega por correo</span></article>
          </div>
        </div>

        <form className="reservation-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Nombre completo<input name="name" type="text" autoComplete="name" required /></label>
            <label>Correo<input name="email" type="email" autoComplete="email" required /></label>
          </div>
          <div className="form-row">
            <label>Teléfono<input name="phone" type="tel" autoComplete="tel" required /></label>
            <label>Sucursal
              <select name="location" required defaultValue="">
                <option value="" disabled>Selecciona una sucursal</option>
                {locations.map((location) => <option key={location.name}>{location.name}</option>)}
              </select>
            </label>
          </div>
          <div className="form-row three">
            <label>Fecha<input name="date" type="date" required /></label>
            <label>Hora<input name="time" type="time" required /></label>
            <label>Personas<input name="guests" type="number" min="1" max="20" required /></label>
          </div>
          <label>Comentarios<textarea name="notes" rows="4" placeholder="Indica si visitas con niños, necesitas accesibilidad o tienes alguna preferencia." /></label>
          <button className="button" type="submit"><CalendarDays size={17} /> Solicitar reservación</button>
          {sent && (
            <p className="form-success" role="status">
              Solicitud registrada en el prototipo. La conexión de correo se implementará cuando se definan los correos reales de cada sucursal.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
