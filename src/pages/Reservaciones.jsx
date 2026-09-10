import ReservationForm from '../components/ReservationForm.jsx';
import PageHero from '../components/PageHero.jsx';

export default function Reservaciones() {
  return (
    <>
      <PageHero
        eyebrow="Reservaciones"
        title="Tu mesa lista, sin esperas"
        text="Completa la solicitud en la sucursal que prefieras; confirmamos la disponibilidad y respondemos por correo."
      />
      <ReservationForm />
    </>
  );
}
