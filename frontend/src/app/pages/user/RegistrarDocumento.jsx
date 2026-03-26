import { Minus, Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";

export function RegistrarDocumento() {

  const [errores, setErrores] = useState({});

  const [form, setForm] = useState({
    ejercicio: "",
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
    
    if (!form.ejercicio) nuevosErrores.ejercicio = true;
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
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });

    // 🔥 quitar error al escribir
    if (errores[name]) {
      setErrores({
        ...errores,
        [name]: false,
      });
    }
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
    if (!validarFormulario()) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Faltan campos obligatorios",
        showConfirmButton: false,
        timer: 2500,
      });
      return;
    }

    // 🔥 MODAL DE CONFIRMACIÓN
    Swal.fire({
      title: "Confirmación",
      text: "¿Seguro que desea continuar?, su información está correcta?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "OK",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#8B1538",
      cancelButtonColor: "#6B7280",
    }).then((result) => {
      if (result.isConfirmed) {
        // ✅ AQUÍ YA GUARDA
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Documento guardado correctamente",
          showConfirmButton: false,
          timer: 2000,
        });

        // aquí puedes agregar lógica real de guardado (API, etc.)
      }
    });
  };

  const [busquedaRemitenteExt, setBusquedaRemitenteExt] = useState("");
  const [mostrarOpcionesRemitenteExt, setMostrarOpcionesRemitenteExt] = useState(false);

  const remitentesExternos = [
    { id: 1, nombre: "Gobierno del Estado de Nayarit" },
    { id: 2, nombre: "Empresa XYZ S.A. de C.V." },
    { id: 3, nombre: "Universidad Autónoma de Nayarit" },
    { id: 4, nombre: "Secretaría de Educación" },
    { id: 5, nombre: "Juan López Martínez" },
  ];

  const remitentesFiltrados = remitentesExternos.filter((r) =>
    r.nombre.toLowerCase().includes(busquedaRemitenteExt.toLowerCase())
  );

const [mostrarOpcionesAsunto, setMostrarOpcionesAsunto] = useState(false);

const refTipoDoc = useRef(null);
const refRemitenteExt = useRef(null);
const refMaterial = useRef(null);
const refAsunto = useRef(null);
const refTemaPrincipal = useRef(null);
const refTemaSecundario = useRef(null);

useEffect(() => {
  const handleClickOutside = (event) => {
    if (refTipoDoc.current && !refTipoDoc.current.contains(event.target)) {
      setMostrarOpcionesTipoDoc(false);
    }

    if (refRemitenteExt.current && !refRemitenteExt.current.contains(event.target)) {
      setMostrarOpcionesRemitenteExt(false);
    }

    if (refMaterial.current && !refMaterial.current.contains(event.target)) {
      setMostrarOpcionesMaterial(false);
    }

    if (refAsunto.current && !refAsunto.current.contains(event.target)) {
      setMostrarOpcionesAsunto(false);
    }

    if (refTemaPrincipal.current && !refTemaPrincipal.current.contains(event.target)) {
      setMostrarOpcionesTemaPrincipal(false);
    }

    if (refTemaSecundario.current && !refTemaSecundario.current.contains(event.target)) {
      setMostrarOpcionesTemaSecundario(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

const [busquedaTemaPrincipal, setBusquedaTemaPrincipal] = useState("");
const [mostrarOpcionesTemaPrincipal, setMostrarOpcionesTemaPrincipal] = useState(false);

const [busquedaTemaSecundario, setBusquedaTemaSecundario] = useState("");
const [mostrarOpcionesTemaSecundario, setMostrarOpcionesTemaSecundario] = useState(false);

const temas = [
  { value: "administrativo", label: "Administrativo" },
  { value: "juridico", label: "Jurídico" },
  { value: "finanzas", label: "Finanzas" },
  { value: "recursos_humanos", label: "Recursos Humanos" },
  { value: "agradecimiento", label: "Agradecimiento" },
  { value: "solicitud", label: "Solicitud" },
];
const temasFiltradosPrincipal = temas.filter((t) =>
  t.label.toLowerCase().includes(busquedaTemaPrincipal.toLowerCase())
);

const temasFiltradosSecundario = temas.filter((t) =>
  t.label.toLowerCase().includes(busquedaTemaSecundario.toLowerCase())
);

  return (
    <div className="flex-1 p-6 bg-gray-100 overflow-y-auto">
      <div className="max-w-6xl mx-auto bg-white rounded shadow">

        {/* HEADER */}
        <div className="flex justify-between items-center bg-gray-200 px-4 py-2 rounded-t">
          <h1 className="font-semibold text-gray-700">Registro de documento</h1>
          <button className="bg-[#8B1538] text-white p-2 rounded-full">
            <Minus size={16} />
          </button>
        </div>

        {/* MENSAJE FALTA INFORMACIÓN */}
        <AnimatePresence>
          {form.faltaInformacion && (
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.3 }}
              className="px-6 pt-4"
            >
              <div className="border border-blue-400 bg-gray-100 rounded overflow-hidden">

                {/* FOLIO */}
                <div className="flex items-center justify-between bg-gray-400 px-3 py-2 text-white text-sm">
                  {folioGenerado}

                  <button
                    onClick={() => {
                      setForm({ ...form, faltaInformacion: false });
                      setFolioGenerado("");
                    }}
                    className="bg-[#8B1538] w-6 h-6 flex items-center justify-center rounded-full"
                  >
                    <Minus size={14} />
                  </button>
                </div>

                {/* MENSAJE */}
                <div className="bg-gray-200 text-center text-sm py-2">
                  No se registran instrucciones, folio con información incompleta
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-6 space-y-6">

          {/* EJERCICIO */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-80">
              <label className="text-xs text-gray-500">Ejercicio</label>
              <select
                name="ejercicio"
                value={form.ejercicio}
                onChange={handleChange}
                className={`w-full border rounded px-2 py-1 ${
                  errores.ejercicio ? "border-red-500 bg-red-50" : ""
                }`}
              >
                <option value="">Seleccionar</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>
          </div>

          {/* DATOS GENERALES */}
          <div>
            <h2 className="text-sm font-semibold text-gray-600 mb-2">
              Datos generales
            </h2>

            <div className="grid grid-cols-4 gap-4 items-end">

              <div>
                <label className="text-xs text-gray-500">No. de documento *</label>
                <input
                  name="noDocumento"
                  value={form.noDocumento}
                  onChange={handleChange}
                  className={`w-full border rounded px-2 py-1 ${
                    errores.noDocumento ? "border-red-500 bg-red-50" : ""
                  }`}
                />
              </div>

              <div>
                <label className="text-xs text-gray-500">Fecha de documento *</label>
                <input
                  type="date"
                  name="fechaDocumento"
                  value={form.fechaDocumento}
                  onChange={handleChange}
                   className={`w-full border rounded px-2 py-1 ${
                    errores.fechaDocumento ? "border-red-500 bg-red-50" : ""
                  }`}
                />
              </div>

              <div>
                <label className="text-xs text-gray-500">Fecha de acuse *</label>
                <input
                  type="date"
                  name="fechaAcuse"
                  value={form.fechaAcuse}
                  onChange={handleChange}
                  className={`w-full border rounded px-2 py-1 ${
                    errores.fechaAcuse ? "border-red-500 bg-red-50" : ""
                  }`}
                />
              </div>

              <div>
                <label className="text-xs text-gray-500">Fecha de registro *</label>
                <input
                  type="datetime-local"
                  name="fechaRegistro"
                  value={form.fechaRegistro}
                  onChange={handleChange}
                  className={`w-full border rounded px-2 py-1 ${
                    errores.fechaRegistro ? "border-red-500 bg-red-50" : ""
                  }`}
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Falta información:</span>
                <Toggle
                  checked={form.faltaInformacion}
                  onChange={handleToggleFaltaInformacion}
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Documento interno:</span>
                <Toggle
                  checked={form.documentoInterno}
                  onChange={(v) =>
                    setForm({ ...form, documentoInterno: v })
                  }
                />
              </div>

            </div>
          </div>

          {/* REMITENTE */}
          <div>
            <h2 className="text-sm font-semibold text-gray-600 mb-2">
              Remitente
            </h2>

            <div className="grid grid-cols-6 gap-4 items-end">

             {/* Tipo de remitente */}
              <div className="col-span-2">
                <label className="text-xs text-gray-500">Tipo de remitente *</label>
                <select
                  name="tipoRemitente"
                  value={form.tipoRemitente}
                  onChange={handleChange}
                    className={`w-full border rounded px-2 py-1 ${
                      errores.tipoRemitente ? "border-red-500 bg-red-50" : ""
                    }`}
                >
                  <option value="">Seleccionar</option>
                  <option value="interno">Interno</option>
                  <option value="externo">Externo</option>
                </select>
              </div>

              {/* ===== CAMPOS DINÁMICOS ===== */}
              <AnimatePresence mode="wait">
                {form.tipoRemitente === "interno" && (
                  <motion.div
                    key="interno"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="col-span-2"
                  >
                    <label className="text-xs text-gray-500">
                      Funcionario / Área *
                    </label>
                    <select
                      name="remitenteInterno"
                      value={form.remitenteInterno}
                      onChange={handleChange}
                      className={`w-full border rounded px-2 py-1 ${
                        errores.remitenteInterno ? "border-red-500 bg-red-50" : ""
                      }`}
                    >
                      <option value="">Seleccionar</option>
                      {usuariosInstitucion.map((u) => (
                        <option key={u.id} value={u.nombre}>
                          {u.nombre}
                        </option>
                      ))}
                    </select>
                  </motion.div>
                )}

                {form.tipoRemitente === "externo" && (
                  <motion.div
                    key="externo"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="col-span-2"
                  >
                    <label className="text-xs text-gray-500">
                      Selecciona remitente externo *
                    </label>

                    {/* CONTENEDOR BUSCADOR + TOGGLE */}
                    <div className="flex items-center gap-3">

                      {/* BUSCADOR */}
                      <div ref={refRemitenteExt} className="flex-1 relative">
                        <div className={`flex items-center border rounded px-2 ${
                            errores.remitenteExterno ? "border-red-500 bg-red-50" : ""
                          }`}>
                          <Search size={16} className="text-gray-400" />
                          <input
                            value={busquedaRemitenteExt}
                            onChange={(e) => {
                              setBusquedaRemitenteExt(e.target.value);
                              setMostrarOpcionesRemitenteExt(true);
                            }}
                            onFocus={() => setMostrarOpcionesRemitenteExt(true)}
                            className="w-full px-2 py-1 outline-none"
                            placeholder="Buscar y seleccionar opción"
                          />
                        </div>

                        {/* DROPDOWN */}
                        {mostrarOpcionesRemitenteExt && (
                          <div className="absolute bg-white border w-full mt-1 max-h-40 overflow-y-auto z-10">
                            {remitentesFiltrados.length > 0 ? (
                              remitentesFiltrados.map((r) => (
                                <div
                                  key={r.id}
                                  onClick={() => {
                                    setForm({ ...form, remitenteExterno: r.nombre });
                                    setBusquedaRemitenteExt(r.nombre);
                                    setMostrarOpcionesRemitenteExt(false);
                                  }}
                                  className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                                >
                                  {r.nombre}
                                </div>
                              ))
                            ) : (
                              <div className="px-2 py-1 text-gray-400">
                                Sin resultados
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* TOGGLE */}
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <span className="text-xs text-gray-500">
                          Otro funcionario o ciudadano
                        </span>
                        <Toggle
                          checked={form.otroFuncionario}
                          onChange={(v) => {
                            setForm({ ...form, otroFuncionario: v });
                            if (v) setMostrarModalRemitente(true);
                          }}
                        />
                      </div>

                    </div>
                  </motion.div>
                )}


              </AnimatePresence>


            </div>
          </div>


          {/* DATOS ESPECÍFICOS */}
          <div>
            <h2 className="text-sm font-semibold text-gray-600 mb-2">
              Datos específicos
            </h2>

            <div className="grid grid-cols-6 gap-4 items-end">

              {/* Tipo documento con buscador */}
                <div ref={refTipoDoc} className="col-span-2 relative">
                  <label className="text-xs text-gray-500">
                    Selecciona tipo de documento *
                  </label>
                  <div
                    className={`flex items-center border rounded px-2 ${
                      errores.tipoDocumento ? "border-red-500 bg-red-50" : ""
                    }`}
                  >
                    <Search size={16} className="text-gray-400" />
                    <input
                      value={busquedaTipoDoc}
                      onChange={(e) => {
                        setBusquedaTipoDoc(e.target.value);

                        if (errores.tipoDocumento) {
                          setErrores({ ...errores, tipoDocumento: false });
                        }
                      }}
                      onFocus={() => setMostrarOpcionesTipoDoc(true)}
                      className="w-full px-2 py-1 outline-none"
                      placeholder="Buscar y seleccionar opción"

                    />
                  </div>

                  {mostrarOpcionesTipoDoc && (
                    <div className="absolute bg-white border w-full mt-1 max-h-40 overflow-y-auto z-10">
                      {tiposFiltrados.map((t) => (
                        <div
                          key={t.value}
                          onClick={() => {
                            setForm({ ...form, tipoDocumento: t.value });
                            setBusquedaTipoDoc(t.label);
                            setMostrarOpcionesTipoDoc(false);

                          }}
                          className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                        >
                          {t.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Toggle alta tipo */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    Alta tipo de documento:
                  </span>
                  <Toggle
                    checked={form.altaTipoDocumento}
                    onChange={(v) => {
                      setForm({ ...form, altaTipoDocumento: v });
                      if (v) setMostrarModalTipoDocumento(true);
                    }}
                  />
                </div>

                {/* Relacionado */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-500">Relacionado con:</span>
                  <Toggle
                    checked={form.relacionadoCon}
                    onChange={(v) => {
                      setForm({ ...form, relacionadoCon: v });

                      if (v) {
                        setMostrarModalRelacionado(true);
                      } else {
                        setMostrarModalRelacionado(false);

                        // 👇 LIMPIAR ASUNTO
                        setAsuntoSeleccionado(null);
                        setBusquedaAsunto("");
                      }
                    }}
                  />
                </div>

                {/* Asunto */}
                <div className="col-span-2">
                  <label className="text-xs text-gray-500">Asunto</label>
                  <textarea
                    value={asuntoSeleccionado?.descripcion || ""}
                    disabled
                    className="w-full border rounded px-2 py-1 h-[34px] resize-none bg-gray-100 cursor-not-allowed"
                  />
                </div>

              </div>

              <div className="grid grid-cols-4 gap-4 mt-4">

              {/* Tema */}
              <div>
          
                <div ref={refTemaPrincipal} className="relative">
                  <label className="text-xs text-gray-500">
                    Selecciona tema principal *
                  </label>

                  <div className={`flex items-center border rounded px-2 ${
                    errores.temaPrincipal ? "border-red-500 bg-red-50" : ""
                  }`}>
                    <Search size={16} className="text-gray-400" />
                    <input
                      value={busquedaTemaPrincipal}
                      onChange={(e) => {
                        setBusquedaTemaPrincipal(e.target.value);
                        setMostrarOpcionesTemaPrincipal(true);
                      }}
                      onFocus={() => setMostrarOpcionesTemaPrincipal(true)}
                      className="w-full px-2 py-1 outline-none"
                      placeholder="Buscar y seleccionar opción"
                    />
                  </div>

                  {mostrarOpcionesTemaPrincipal && (
                    <div className="absolute bg-white border w-full mt-1 max-h-40 overflow-y-auto z-10">
                      {temasFiltradosPrincipal.length > 0 ? (
                        temasFiltradosPrincipal.map((t) => (
                          <div
                            key={t.value}
                            onClick={() => {
                              setForm({ ...form, temaPrincipal: t.value });
                              setBusquedaTemaPrincipal(t.label);
                              setMostrarOpcionesTemaPrincipal(false);
                            }}
                            className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                          >
                            {t.label}
                          </div>
                        ))
                      ) : (
                        <div className="px-2 py-1 text-gray-400">Sin resultados</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div ref={refTemaSecundario} className="relative">
                <label className="text-xs text-gray-500">
                  Tema secundario
                </label>

                <div className="flex items-center border rounded px-2">
                  <Search size={16} className="text-gray-400" />
                  <input
                    value={busquedaTemaSecundario}
                    onChange={(e) => {
                      setBusquedaTemaSecundario(e.target.value);
                      setMostrarOpcionesTemaSecundario(true);
                    }}
                    onFocus={() => setMostrarOpcionesTemaSecundario(true)}
                    className="w-full px-2 py-1 outline-none"
                    placeholder="Buscar y seleccionar opción"
                  />
                </div>

                {mostrarOpcionesTemaSecundario && (
                  <div className="absolute bg-white border w-full mt-1 max-h-40 overflow-y-auto z-10">
                    {temasFiltradosSecundario.length > 0 ? (
                      temasFiltradosSecundario.map((t) => (
                        <div
                          key={t.value}
                          onClick={() => {
                            setForm({ ...form, temaSecundario: t.value });
                            setBusquedaTemaSecundario(t.label);
                            setMostrarOpcionesTemaSecundario(false);
                          }}
                          className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                        >
                          {t.label}
                        </div>
                      ))
                    ) : (
                      <div className="px-2 py-1 text-gray-400">Sin resultados</div>
                    )}
                  </div>
                )}
              </div>

              <div ref={refMaterial}className="relative">
                <label className="text-xs text-gray-500">
                  Selecciona material adicional
                </label>

                <div className="flex items-center border rounded px-2">
                  <Search size={16} className="text-gray-400" />
                  <input
                    value={busquedaMaterial}
                    onChange={(e) => {
                      setBusquedaMaterial(e.target.value);
                      setMostrarOpcionesMaterial(true);
                    }}
                    onFocus={() => setMostrarOpcionesMaterial(true)}
                    className="w-full px-2 py-1 outline-none"
                    placeholder="Buscar y seleccionar opción"
                  />
                </div>

                {mostrarOpcionesMaterial && (
                  <div className="absolute bg-white border w-full mt-1 max-h-40 overflow-y-auto z-10">
                    {materialesFiltrados.length > 0 ? (
                      materialesFiltrados.map((m) => (
                        <div
                          key={m.value}
                          onClick={() => {
                            setForm({ ...form, materialAdicional: m.value });
                            setBusquedaMaterial(m.label);
                            setMostrarOpcionesMaterial(false);
                          }}
                          className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                        >
                          {m.label}
                        </div>
                      ))
                    ) : (
                      <div className="px-2 py-1 text-gray-400">
                        Sin resultados
                      </div>
                    )}
                  </div>
                )}
              </div>


              <div className="col-span-4">
                <label className="text-xs text-gray-500">
                  Síntesis del asunto *
                </label>
                <textarea
                  name="sintesis"
                  value={form.sintesis}
                  onChange={handleChange}
                  className={`w-full border rounded px-2 py-1 ${
                    errores.sintesis ? "border-red-500 bg-red-50" : ""
                  }`}
                />
              </div>

              <div className="col-span-4">
                <label className="text-xs text-gray-500">Observaciones</label>
                <textarea className="w-full border rounded px-2 py-1" />
              </div>

            </div>
          </div>

          {/* BOTÓN */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="bg-[#8B1538] text-white px-6 py-2 rounded"
            >
              Guardar
            </button>
          </div>

        </div>
      </div>

      {/* MODAL REMITENTE EXTERNO */}
      <AnimatePresence>
        {mostrarModalRemitente && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white w-[700px] rounded shadow-lg overflow-hidden"
            >
              
              {/* HEADER */}
              <div className="flex justify-between items-center bg-gray-400 px-4 py-2">
                <span className="text-white text-sm">
                  Alta remitente externo
                </span>

                <button
                  onClick={() => {
                    setMostrarModalRemitente(false);
                    setForm({ ...form, otroFuncionario: false });
                  }}
                  className="bg-[#8B1538] text-white p-2 rounded-full"
                >
                  <Minus size={16} />
                </button>
              </div>

              {/* BODY */}
              <div className="p-6 grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">
                    Nombre completo:
                  </label>
                  <input
                    className="w-full border rounded px-2 py-1"
                    value={nuevoRemitente.nombreCompleto}
                    onChange={(e) =>
                      setNuevoRemitente({
                        ...nuevoRemitente,
                        nombreCompleto: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500">Cargo:</label>
                  <input
                    className="w-full border rounded px-2 py-1"
                    value={nuevoRemitente.cargo}
                    onChange={(e) =>
                      setNuevoRemitente({
                        ...nuevoRemitente,
                        cargo: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs text-gray-500">
                    Dependencia:
                  </label>
                  <input
                    className="w-full border rounded px-2 py-1"
                    value={nuevoRemitente.dependencia}
                    onChange={(e) =>
                      setNuevoRemitente({
                        ...nuevoRemitente,
                        dependencia: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* FOOTER */}
              <div className="flex justify-end p-4">
                <button
                  onClick={() => {
                    setForm({
                      ...form,
                      remitenteExterno: nuevoRemitente.nombreCompleto,
                    });
                    setBusquedaRemitenteExt(nuevoRemitente.nombreCompleto);
                    setMostrarModalRemitente(false);

                    Swal.fire({
                      toast: true,
                      position: "top-end",
                      icon: "success",
                      title: "Remitente agregado",
                      showConfirmButton: false,
                      timer: 2000,
                    });
                  }}
                  className="bg-red-600 text-white px-6 py-2 rounded"
                >
                  Guardar
                </button>

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL TIPO DOCUMENTO */}
      <AnimatePresence>
        {mostrarModalTipoDocumento && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white w-[500px] rounded shadow-lg overflow-hidden"
            >
              
              {/* HEADER */}
              <div className="flex justify-between items-center bg-gray-400 px-4 py-2">
                <span className="text-white text-sm">
                  Alta tipo de documento
                </span>

                <button
                  onClick={() => {
                    setMostrarModalTipoDocumento(false);
                    setForm({ ...form, altaTipoDocumento: false });
                  }}
                  className="bg-[#8B1538] text-white p-2 rounded-full"
                >
                  <Minus size={16} />
                </button>
              </div>

              {/* BODY */}
              <div className="p-6">
                <label className="text-xs text-gray-500">
                  Descripción:
                </label>
                <input
                  className="w-full border rounded px-2 py-1 mt-1"
                  value={nuevoTipoDocumento}
                  onChange={(e) => setNuevoTipoDocumento(e.target.value)}
                />
              </div>

              {/* FOOTER */}
              <div className="flex justify-end p-4">
                <button
                  onClick={() => {
                    if (!nuevoTipoDocumento.trim()) return;

                    const nuevo = {
                      value: nuevoTipoDocumento.toLowerCase().replace(/\s+/g, "_"),
                      label: nuevoTipoDocumento,
                    };

                    setTiposDocumento([...tiposDocumento, nuevo]);

                    // Seleccionarlo automáticamente
                    setForm({ ...form, tipoDocumento: nuevo.value });
                    setBusquedaTipoDoc(nuevo.label);

                    setNuevoTipoDocumento("");
                    setMostrarModalTipoDocumento(false);

                    Swal.fire({
                      toast: true,
                      position: "top-end",
                      icon: "success",
                      title: "Tipo de documento agregado",
                      showConfirmButton: false,
                      timer: 2000,
                    });
                  }}
                  className="bg-[#8B1538] text-white px-6 py-2 rounded"
                >
                  Guardar
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mostrarModalRelacionado && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white w-[900px] rounded shadow-lg overflow-hidden"
            >
              
              {/* HEADER */}
              <div className="flex justify-between items-center bg-gray-400 px-4 py-2">
                <span className="text-white text-sm">Asuntos</span>

                <button
                  onClick={() => {
                    setMostrarModalRelacionado(false);
                    setForm({ ...form, relacionadoCon: false });
                  }}
                  className="bg-[#8B1538] text-white p-2 rounded-full"
                >
                  <Minus size={16} />
                </button>
              </div>

              {/* BODY */}
              <div className="p-6 space-y-4">

                {/* Buscador */}
                <div ref={refAsunto} className="relative">
                  <label className="text-xs text-gray-500">
                    Buscar asunto:
                  </label>

                  <div className="flex items-center border rounded px-2">
                    <Search size={16} className="text-gray-400" />
                    <input
                      value={busquedaAsunto}
                      onChange={(e) => {
                        setBusquedaAsunto(e.target.value);
                        setMostrarOpcionesAsunto(true);
                      }}
                      onFocus={() => setMostrarOpcionesAsunto(true)}
                      className="w-full px-2 py-1 outline-none"
                      placeholder="Buscar por número, descripción o fecha"
                    />
                  </div>

                  {/* DROPDOWN */}
                  {mostrarOpcionesAsunto && (
                    <div className="absolute bg-white border w-full mt-1 max-h-40 overflow-y-auto z-10">
                      {asuntosFiltrados.length > 0 ? (
                        asuntosFiltrados.map((a, i) => (
                          <div
                            key={i}
                            onClick={() => {
                              setAsuntoSeleccionado(a);
                              setBusquedaAsunto(a.descripcion || a.numero);
                              setMostrarOpcionesAsunto(false);
                            }}
                            className="px-2 py-1 hover:bg-gray-100 cursor-pointer text-sm"
                          >
                            <div className="font-medium">{a.numero}</div>
                            <div className="text-gray-500 text-xs">{a.descripcion}</div>
                          </div>
                        ))
                      ) : (
                        <div className="px-2 py-1 text-gray-400">
                          Sin resultados
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Tabla */}
                <div className="border rounded overflow-hidden">
                  <div className="bg-[#8B1538] text-white text-xs grid grid-cols-3 px-2 py-2">
                    <span>Número</span>
                    <span>Fecha de registro</span>
                    <span>Descripción del asunto</span>
                  </div>

                  <div className="max-h-60 overflow-y-auto">
                    {asuntos.length > 0 ? (
                      asuntos.map((a, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            setAsuntoSeleccionado(a);
                            setMostrarModalRelacionado(false);
                          }}
                          className="grid grid-cols-3 px-2 py-2 text-sm border-b hover:bg-gray-100 cursor-pointer"
                        >
                          <span>{a.numero}</span>
                          <span>{a.fecha}</span>
                          <span>{a.descripcion}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-400 text-sm py-6">
                        Sin datos en la tabla.
                      </div>
                    )}
                  </div>
                </div>

                {/* Botón alta */}
                <div>
                  <button
                    onClick={() => setMostrarModalAltaAsunto(true)}
                    className="bg-[#8B1538] text-white px-4 py-2 rounded"
                  >
                    Alta de Asunto general
                  </button>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

        {/* MODAL ALTA ASUNTO */}
      <AnimatePresence>
        {mostrarModalAltaAsunto && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white w-[800px] rounded shadow-lg overflow-hidden"
            >

              {/* HEADER */}
              <div className="flex justify-between items-center bg-gray-400 px-4 py-2">
                <span className="text-white text-sm">
                  Registro de Asunto
                </span>

                <button
                  onClick={() => setMostrarModalAltaAsunto(false)}
                  className="bg-[#8B1538] text-white p-2 rounded-full"
                >
                  <Minus size={16} />
                </button>
              </div>

              {/* BODY */}
              <div className="p-6 grid grid-cols-2 gap-4">

                {/* No. asunto */}
                <div>
                  <label className="text-xs text-gray-500">
                    No. de asunto:
                  </label>
                  <input
                    disabled
                    placeholder="Autogenerado"
                    className="w-full border rounded px-2 py-1 bg-gray-100"
                  />
                </div>

                {/* CLASE ASUNTO (CON BUSCADOR 🔥) */}
                <div className="relative">
                  <label className="text-xs text-gray-500">
                    Clase asunto *
                  </label>

                  <div className="flex items-center border rounded px-2">
                    <Search size={16} className="text-gray-400" />
                    <input
                      value={busquedaClaveAsunto}
                      onChange={(e) => {
                        setBusquedaClaveAsunto(e.target.value);
                        setMostrarOpcionesClave(true);
                      }}
                      onFocus={() => setMostrarOpcionesClave(true)}
                      className="w-full px-2 py-1 outline-none"
                    />
                  </div>

                  {mostrarOpcionesClave && (
                    <div className="absolute bg-white border w-full mt-1 max-h-40 overflow-y-auto z-10">
                      {clavesFiltradas.map((c) => (
                        <div
                          key={c.value}
                          onClick={() => {
                            setNuevoAsunto({
                              ...nuevoAsunto,
                              clave: c.value,
                            });
                            setBusquedaClaveAsunto(c.label);
                            setMostrarOpcionesClave(false);
                          }}
                          className="px-2 py-1 hover:bg-gray-100 cursor-pointer text-sm"
                        >
                          {c.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* DESCRIPCIÓN */}
                <div className="col-span-2">
                  <label className="text-xs text-gray-500">
                    Descripción del asunto *
                  </label>
                  <input
                    value={nuevoAsunto.descripcion}
                    onChange={(e) =>
                      setNuevoAsunto({
                        ...nuevoAsunto,
                        descripcion: e.target.value,
                      })
                    }
                    className="w-full border rounded px-2 py-1"
                  />
                </div>

              </div>

              {/* FOOTER */}
              <div className="flex justify-end p-4 gap-2">
                <button
                  onClick={() => setMostrarModalAltaAsunto(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancelar
                </button>

                <button
                  onClick={() => {
                    if (!nuevoAsunto.descripcion || !nuevoAsunto.clave) {
                      Swal.fire({
                        icon: "error",
                        title: "Campos obligatorios",
                        text: "Completa la información",
                      });
                      return;
                    }

                    const nuevo = {
                      numero: `AS-${Date.now().toString().slice(-5)}`,
                      ...nuevoAsunto,
                      fecha: new Date().toLocaleDateString(),
                    };

                    setAsuntos([...asuntos, nuevo]);

                    // seleccionar automáticamente
                    setAsuntoSeleccionado(nuevo);
                    setBusquedaAsunto(nuevo.descripcion);

                    setNuevoAsunto({
                      numero: "",
                      clave: "",
                      descripcion: "",
                    });

                    setBusquedaClaveAsunto("");
                    setMostrarModalAltaAsunto(false);

                    Swal.fire({
                      toast: true,
                      position: "top-end",
                      icon: "success",
                      title: "Asunto agregado",
                      showConfirmButton: false,
                      timer: 2000,
                    });
                  }}
                  className="bg-[#8B1538] text-white px-6 py-2 rounded"
                >
                  Guardar
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );

}
