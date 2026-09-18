import { useEffect, useState } from "react";
import { getObrasSociales, getOdontologos, getTratamientos } from "./lib/api";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Services from "./components/Services";
import BookingSection from "./components/booking/BookingSection";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import AsistenteChat from "./components/AsistenteChat";
import DoctoresPage from "./components/doctores/DoctoresPage";

const getRouteFromHash = () => (window.location.hash === "#doctores" ? "doctores" : "site");

function App() {
  const [route, setRoute] = useState(getRouteFromHash());
  const [tratamientos, setTratamientos] = useState([]);
  const [odontologos, setOdontologos] = useState([]);
  const [obrasSociales, setObrasSociales] = useState([]);
  const [selectedTratamientoId, setSelectedTratamientoId] = useState(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const onHashChange = () => setRoute(getRouteFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    Promise.all([getTratamientos(), getOdontologos(), getObrasSociales()])
      .then(([t, o, os]) => {
        setTratamientos(t);
        setOdontologos(o);
        setObrasSociales(os);
        setSelectedTratamientoId((current) => current ?? t[0]?.id ?? null);
      })
      .catch((err) => setLoadError(err.message));
  }, []);

  const scrollToTurnos = () => {
    const el = document.getElementById("turnos");
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
  };

  if (route === "doctores") {
    return <DoctoresPage />;
  }

  return (
    <div className="font-nunito text-body bg-surface min-h-screen">
      <Header />
      <Hero />
      {loadError && (
        <div className="max-w-[1180px] mx-auto px-6 mt-6 bg-surface-alt border-l-[6px] border-accent text-ink rounded-lg px-4 py-3 text-sm font-semibold">
          No pudimos cargar los datos del sitio: {loadError}
        </div>
      )}
      <Services
        tratamientos={tratamientos}
        selectedTratamientoId={selectedTratamientoId}
        onSelect={(id) => {
          setSelectedTratamientoId(id);
          scrollToTurnos();
        }}
      />
      <BookingSection
        tratamientos={tratamientos}
        odontologos={odontologos}
        selectedTratamientoId={selectedTratamientoId}
        onTratamientoChange={setSelectedTratamientoId}
      />
      <Contact />
      <Footer />
      <WhatsAppButton />
      <AsistenteChat tratamientos={tratamientos} obrasSociales={obrasSociales} odontologos={odontologos} />
    </div>
  );
}

export default App;
