import { Minus, Search } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function RegistrarDocumento() {

  const [errores, setErrores] = useState({});

  const [form, setForm] = useState({
    noDocumento: "",
    fechaDocumento: "",
    fechaAcuse: "",
    fechaRegistro: "",
    tipoRemitente: "",
    remitenteInterno: "",
    remitenteExterno: "",
    tipoDocumento: "",
    temaPrincipal: "",
    sintesis: "",
    faltaInformacion: false,
    documentoInterno: false,
    altaTipoDocumento: false,
    relacionadoCon: false,
    otroFuncionario: false,
    materialAdicional: "",
  });

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!form.noDocumento) nuevosErrores.noDocumento = true;
    if (!form.fechaDocumento) nuevosErrores.fechaDocumento = true;
    if (!form.fechaAcuse) nuevosErrores.fechaAcuse = true;
    if (!form.fechaRegistro) nuevosErrores.fechaRegistro = true;
    if (!form.tipoRemitente) nuevosErrores.tipoRemitente = true;
    if (!form.tipoDocumento) nuevosErrores.tipoDocumento = true;
    if (!form.temaPrincipal) nuevosErrores.temaPrincipal = true;
    if (!form.sintesis) nuevosErrores.sintesis = true;

    if (form.tipoRemitente === "interno" && !form.remitenteInterno)
      nuevosErrores.remitenteInterno = true;

    if (form.tipoRemitente === "externo" && !form.remitenteExterno)
      nuevosErrores.remitenteExterno = true;

    setErrores(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  };

  const [folioGenerado, setFolioGenerado] = useState("");

  const handleToggleFaltaInformacion = (value) => {
    setForm({ ...form, faltaInformacion: value });

    if (value) {
      const anioActual = new Date().getFullYear();
      const numeroAleatorio = Math.floor(Math.random() * 900) + 100;
      setFolioGenerado(`Folio ${numeroAleatorio}-${anioActual}`);
    } else {
      setFolioGenerado("");
    }
  };

  const usuariosInstitucion = [
    { id: 1, nombre: "Juan Pérez - Dirección General" },
    { id: 2, nombre: "María López - Jurídico" },
    { id: 3, nombre: "Carlos Ramírez - Administración" },
  ];

  const [busquedaTipoDoc, setBusquedaTipoDoc] = useState("");
  const [mostrarOpcionesTipoDoc, setMostrarOpcionesTipoDoc] = useState(false);

  const [tiposDocumento, setTiposDocumento] = useState([
    { value: "correo_electronico", label: "Correo electrónico" },
    { value: "escrito", label: "Escrito" },
    { value: "informe", label: "Informe" },
    { value: "invitacion", label: "Invitación" },
    { value: "libro", label: "Libro" },
    { value: "nota_informativa", label: "Nota informativa" },
    { value: "oficio", label: "Oficio" },
    { value: "otro", label: "Otro" },
  ]);

  const tiposFiltrados = tiposDocumento.filter((tipo) =>
    tipo.label.toLowerCase().includes(busquedaTipoDoc.toLowerCase())
  );

  const [mostrarModalRemitente, setMostrarModalRemitente] = useState(false);
  const [mostrarModalTipoDocumento, setMostrarModalTipoDocumento] =
    useState(false);

  const [nuevoTipoDocumento, setNuevoTipoDocumento] = useState("");

  const [nuevoRemitente, setNuevoRemitente] = useState({
    nombreCompleto: "",
    cargo: "",
    dependencia: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const Toggle = ({ checked, onChange }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
        checked ? "bg-[#8B1538]" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );

  const [mostrarModalRelacionado, setMostrarModalRelacionado] = useState(false);
  const [mostrarModalAltaAsunto, setMostrarModalAltaAsunto] = useState(false);

  const [asuntos, setAsuntos] = useState([]);
  const [asuntoSeleccionado, setAsuntoSeleccionado] = useState(null);

  const [nuevoAsunto, setNuevoAsunto] = useState({
    numero: "",
    clave: "",
    descripcion: "",
  });

  const [erroresAsunto, setErroresAsunto] = useState({});

  const [busquedaAsunto, setBusquedaAsunto] = useState("");

  const asuntosFiltrados = asuntos.filter((a) =>
    a.numero?.toLowerCase().includes(busquedaAsunto.toLowerCase()) ||
    a.descripcion?.toLowerCase().includes(busquedaAsunto.toLowerCase()) ||
    a.fecha?.toLowerCase().includes(busquedaAsunto.toLowerCase())
  );

  const [busquedaClaveAsunto, setBusquedaClaveAsunto] = useState("");
  const [mostrarOpcionesClave, setMostrarOpcionesClave] = useState(false);

  const clavesAsunto = [
    { value: "compromiso_gobierno", label: "Compromiso de Gobierno" },
    { value: "proyecto", label: "Proyecto" },
    { value: "programa_gobierno", label: "Programa de Gobierno" },
    { value: "accion_gobierno", label: "Acción de Gobierno" },
    { value: "asunto_general", label: "Asunto General" },
  ];

  const clavesFiltradas = clavesAsunto.filter((c) =>
    c.label.toLowerCase().includes(busquedaClaveAsunto.toLowerCase())
  );

  const [busquedaMaterial, setBusquedaMaterial] = useState("");
  const [mostrarOpcionesMaterial, setMostrarOpcionesMaterial] =
    useState(false);

  const materialesAdicionales = [
    { value: "carpeta", label: "Carpeta" },
    { value: "catalogo", label: "Catálogo" },
    { value: "cd_dvd", label: "CD-DVD" },
    { value: "copia", label: "Copia" },
    { value: "curriculum_vitae", label: "Curriculum Vitae" },
    { value: "engargolado", label: "Engargolado" },
    { value: "folleto", label: "Folleto" },
  ];

  const materialesFiltrados = materialesAdicionales.filter((m) =>
    m.label.toLowerCase().includes(busquedaMaterial.toLowerCase())
  );

  const [mostrarModalConfirmacion, setMostrarModalConfirmacion] =
    useState(false);

  const [mostrarMensajeGuardado, setMostrarMensajeGuardado] =
    useState(false);
  const handleSave = () => {
    if (!validarFormulario()) return;

    // Simula guardado
    setMostrarMensajeGuardado(true);
    setTimeout(() => setMostrarMensajeGuardado(false), 2000);
  };

  return (
    <div className="flex-1 p-6 bg-gray-100 overflow-y-auto">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-xl font-semibold text-gray-800 mb-4">Registrar documento y genera notas de atención</h1>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600">No. documento</label>
            <input name="noDocumento" value={form.noDocumento} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded" />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Fecha documento</label>
            <input name="fechaDocumento" value={form.fechaDocumento} onChange={handleChange} type="date" className="w-full mt-1 px-3 py-2 border rounded" />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Remitente interno</label>
            <input name="remitenteInterno" value={form.remitenteInterno} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded" />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Remitente externo</label>
            <input name="remitenteExterno" value={form.remitenteExterno} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded" />
          </div>

          <div className="col-span-2">
            <label className="block text-sm text-gray-600">Síntesis</label>
            <textarea name="sintesis" value={form.sintesis} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded h-24" />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button onClick={handleSave} className="px-4 py-2 bg-[#8B1538] text-white rounded">Guardar</button>
          <button onClick={() => setForm({ ...form, noDocumento: "" })} className="px-4 py-2 border rounded">Limpiar</button>

          {mostrarMensajeGuardado && (
            <span className="text-green-600 text-sm">Guardado correctamente</span>
          )}
        </div>
      </div>
    </div>
  );
}
