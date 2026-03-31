import { Minus, Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";

export function ModificaSalidaCorrespondencia() {
  const [criterio, setCriterio] = useState("");
  const [resultados, setResultados] = useState([]);
  const [menuContextual, setMenuContextual] = useState({
    visible: false,
    x: 0,
    y: 0,
    registro: null,
  });

  // Datos simulados
  const dataMock = [
    {
      folioSalida: "1-2023",
      fechaRegistro: "2023-03-06T10:00",
      nivelImportancia: "urgente",
      folioSAGA: "4-2023",
      destinatario:
        "Leticia Solís Ramírez Administración Portuaria Integral de Tampico, S.A. de C.V. (API)",
    },
    {
      folioSalida: "2-2023",
      fechaRegistro: "2023-03-28T19:36",
      nivelImportancia: "urgente",
      folioSAGA: "1212",
      destinatario:
        "Luis Pérez Sánchez Administración Portuaria Integral de Dos Bocas, S.A. de C.V. (API)",
    },
    {
      folioSalida: "3-2023",
      fechaRegistro: "2023-04-18T12:30",
      nivelImportancia: "normal",
      folioSAGA: "220",
      destinatario:
        "ANTONIO AGUILAR OLARTE INSTITUTO PARA DEVOLVER AL PUEBLO LO ROBADO",
    },
  ];

  const resultadosFiltrados = dataMock.filter((item) => {
  const texto = criterio.toLowerCase();

  return (
    item.folioSalida.toLowerCase().includes(texto) ||
    item.folioSAGA.toLowerCase().includes(texto) ||
    item.destinatario.toLowerCase().includes(texto) ||
    item.nivelImportancia.toLowerCase().includes(texto)
  );
});

  const handleRightClick = (e, registro) => {
    e.preventDefault();

    setMenuContextual({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      registro,
    });
  };

  const [mostrarModalModificar, setMostrarModalModificar] = useState(false);
  const [formEditar, setformEditar] = useState({
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
    documentoInterno: false,
  });

  const handleModificar = () => {
    const r = menuContextual.registro;

    setformEditar({
      ejercicio: "2026", // puedes ajustarlo
      noDocumento: r.folioSalida,
      fechaDocumento: r.fechaRegistro?.split("T")[0] || "",
      fechaAcuse: r.fechaRegistro?.split("T")[0] || "",
      fechaRegistro: r.fechaRegistro || "",
      tipoRemitente: "externo",
      remitenteExterno: r.destinatario,
      tipoDocumento: "oficio",
      temaPrincipal: "",
      sintesis: "",
      documentoInterno: false,
    });

    setMostrarModalModificar(true);

    setMenuContextual({
      ...menuContextual,
      visible: false,
    });
  };

  const handleChangeEditar = (e) => {
    const { name, value } = e.target;

    setformEditar({
      ...formEditar,
      [name]: value,
    });
  };

  const handleGuardarCambios = () => {
    Swal.fire({
      title: "Confirmar cambios",
      text: "¿Deseas guardar la modificación?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#8B1538",
    }).then((result) => {
      if (result.isConfirmed) {
        console.log("Guardado:", formEditar);

        Swal.fire({
          icon: "success",
          title: "Actualizado correctamente",
          timer: 1500,
          showConfirmButton: false,
        });

        setMostrarModalModificar(false);
      }
    });
  };

   const handleChange = (e) => {
    const { name, value } = e.target;

    const nuevoValor = value.trim(); // 👈 importante

    setformEditar({
      ...formEditar,
      [name]: value,
    });

    // Validación en tiempo real
    setErrores((prev) => ({
      ...prev,
      [name]: !nuevoValor, // true si está vacío
    }));
  };

  const [errores, setErrores] = useState({});
  
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

  const handleToggleFaltaInformacion = (value) => {
    setformEditar({ ...formEditar, faltaInformacion: value });

    if (value) {
      const anioActual = new Date().getFullYear();
      const numeroAleatorio = Math.floor(Math.random() * 900) + 100;
      setFolioGenerado(`Folio ${numeroAleatorio}-${anioActual}`);
    } else {
      setFolioGenerado("");
    }
  };

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

  const [asuntos, setAsuntos] = useState([]);
  const [asuntoSeleccionado, setAsuntoSeleccionado] = useState(null);

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

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formEditar.tipoDocumento) nuevosErrores.tipoDocumento = true;
    if (!formEditar.temaPrincipal) nuevosErrores.temaPrincipal = true;
    if (!formEditar.sintesis) nuevosErrores.sintesis = true;

    setErrores(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  };

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
  
      // MODAL DE CONFIRMACIÓN
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
          // CERRAR MODAL
          setMostrarModalModificar(false);

          // AQUÍ YA GUARDA
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
    
  return (
    <div
      className="flex-1 p-6 bg-gray-100 overflow-y-auto"
      onClick={() =>
        menuContextual.visible &&
        setMenuContextual({ ...menuContextual, visible: false })
      }
    >
      {/* Header */}
      <div className="bg-gray-300 rounded-t-md flex items-center justify-between px-4 py-2">
        <h1 className="text-sm font-semibold text-gray-800">
          Modifica Salida de correspondencia
        </h1>

        <button className="w-6 h-6 flex items-center justify-center rounded-full bg-[#8B1538] text-white">
          <Minus size={14} />
        </button>
      </div>

      {/* Contenedor */}
      <div className="bg-white p-6 rounded-b-md shadow-sm space-y-6 text-xs">
        {/* Buscador */}
        <div>
          <label className="block mb-2 font-medium">
            Criterio de búsqueda:
          </label>

          <textarea
            value={criterio}
            onChange={(e) => setCriterio(e.target.value)}
            className="w-full border rounded px-2 py-2 resize-none"
            rows={2}
          />
        </div>

        {/* Tabla */}
        <AnimatePresence>
          {resultadosFiltrados.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="overflow-x-auto border rounded"
            >
              <table className="min-w-full text-xs">
                <thead className="bg-[#79142A] text-white">
                  <tr>
                    <th className="px-3 py-2 text-left">Folio de salida</th>
                    <th className="px-3 py-2 text-left">
                      Fecha y hora de registro
                    </th>
                    <th className="px-3 py-2 text-left">
                      Nivel de importancia
                    </th>
                    <th className="px-3 py-2 text-left">Folio SAGA</th>
                    <th className="px-3 py-2 text-left">
                      Nombre del destinatario o Institución
                    </th>
                    <th className="px-3 py-2 text-left">Número de Guía</th>
                  </tr>
                </thead>

                <tbody>
                  {resultadosFiltrados.map((registro, index) => (
                    <tr
                      key={index}
                      onContextMenu={(e) =>
                        handleRightClick(e, registro)
                      }
                      className="border-t hover:bg-gray-100 cursor-context-menu"
                    >
                      <td className="px-3 py-2">{registro.folioSalida}</td>
                      <td className="px-3 py-2">{registro.fechaRegistro}</td>
                      <td className="px-3 py-2 capitalize">
                        {registro.nivelImportancia}
                      </td>
                      <td className="px-3 py-2">{registro.folioSAGA}</td>
                      <td className="px-3 py-2">{registro.destinatario}</td>
                      <td className="px-3 py-2">
                        {registro.numeroGuia || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Menú contextual */}
      <AnimatePresence>
        {menuContextual.visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed bg-white border shadow-md rounded text-xs z-50"
            style={{
              top: menuContextual.y,
              left: menuContextual.x,
            }}
          >
            <button
              onClick={handleModificar}
              className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
            >
              Modificar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mostrarModalModificar && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white w-[1000px] max-w-[95vw] max-h-[90vh] rounded shadow-lg flex flex-col"
            >

              {/* HEADER */}
              <div className="flex justify-between items-center bg-gray-400 px-4 py-2">
                <span className="text-white text-sm">
                  Modificar registro
                </span>

                <button
                  onClick={() => setMostrarModalModificar(false)}
                  className="bg-[#8B1538] text-white p-2 rounded-full"
                >
                  <Minus size={16} />
                </button>
              </div>

              {/* BODY */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1">

          {/* EJERCICIO */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-80">
              <label className="text-xs text-gray-500">Ejercicio</label>
              <select
                name="ejercicio"
                value={formEditar.ejercicio}
                disabled
                onChange={handleChange}
                  className="w-full border rounded px-2 py-1 bg-gray-100 cursor-not-allowed"
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
                  value={formEditar.noDocumento}
                  disabled
                  className="w-full border rounded px-2 py-1 bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500">Fecha de documento *</label>
                <input
                  type="date"
                  name="fechaDocumento"
                  value={formEditar.fechaDocumento}
                  disabled
                  className="w-full border rounded px-2 py-1 bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500">Fecha de acuse *</label>
                <input
                  type="date"
                  name="fechaAcuse"
                  value={formEditar.fechaAcuse}
                  disabled
                  className="w-full border rounded px-2 py-1 bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500">Fecha de registro *</label>
                <input
                  type="datetime-local"
                  name="fechaRegistro"
                  value={formEditar.fechaRegistro}
                  disabled
                  className="w-full border rounded px-2 py-1 bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Falta información:</span>
                <Toggle
                  checked={formEditar.faltaInformacion}
                  onChange={handleToggleFaltaInformacion}
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Documento interno:</span>
                <Toggle
                  checked={formEditar.documentoInterno}
                  onChange={(v) =>
                    setformEditar({ ...formEditar, documentoInterno: v })
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
                  value={formEditar.tipoRemitente}
                   disabled
                  className="w-full border rounded px-2 py-1 bg-gray-100 cursor-not-allowed"
                >
                  <option value="">Seleccionar</option>
                  <option value="interno">Interno</option>
                  <option value="externo">Externo</option>
                </select>
              </div>

              {/* ===== CAMPOS DINÁMICOS ===== */}
              <AnimatePresence mode="wait">
                {formEditar.tipoRemitente === "interno" && (
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
                      value={formEditar.remitenteInterno}
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

                {formEditar.tipoRemitente === "externo" && (
                  <motion.div
                    key="externo"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="col-span-4"
                  >
                    <label className="text-xs text-gray-500">
                      Selecciona remitente externo *
                    </label>

                    {/* CONTENEDOR BUSCADOR + TOGGLE */}
                    <div className="flex items-center gap-3">

                      {/* BUSCADOR */}
                      <div ref={refRemitenteExt} className="flex-1 relative">
                        <div className={`flex items-center border rounded px-2  ${
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
                                    setformEditar({ ...formEditar, remitenteExterno: r.nombre });
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
                          checked={formEditar.otroFuncionario}
                          onChange={(v) => {
                            setformEditar({ ...formEditar, otroFuncionario: v });
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
                        const value = e.target.value;
                        setBusquedaTipoDoc(value);
                        setMostrarOpcionesTipoDoc(true);

                        // 🔥 SI BORRA O MODIFICA → INVALIDA SELECCIÓN
                        setformEditar((prev) => ({
                          ...prev,
                          tipoDocumento: "",
                        }));

                        setErrores((prev) => ({
                          ...prev,
                          tipoDocumento: !value.trim(),
                        }));
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
                            setformEditar({ ...formEditar, tipoDocumento: t.value });
                            setBusquedaTipoDoc(t.label);
                            setMostrarOpcionesTipoDoc(false);

                            setErrores((prev) => ({
                              ...prev,
                              tipoDocumento: !t.value,
                            }));
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
                    checked={formEditar.altaTipoDocumento}
                    onChange={(v) => {
                      setformEditar({ ...formEditar, altaTipoDocumento: v });
                      if (v) setMostrarModalTipoDocumento(true);
                    }}
                  />
                </div>

                {/* Relacionado */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-500">Relacionado con:</span>
                  <Toggle
                    checked={formEditar.relacionadoCon}
                    onChange={(v) => {
                      setformEditar({ ...formEditar, relacionadoCon: v });

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
                        const value = e.target.value;
                        setBusquedaTemaPrincipal(value);
                        setMostrarOpcionesTemaPrincipal(true);

                        setformEditar((prev) => ({
                          ...prev,
                          temaPrincipal: "",
                        }));

                        setErrores((prev) => ({
                          ...prev,
                          temaPrincipal: !value.trim(),
                        }));
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
                              setformEditar({ ...formEditar, temaPrincipal: t.value });
                              setBusquedaTemaPrincipal(t.label);
                              setMostrarOpcionesTemaPrincipal(false);

                              setErrores((prev) => ({
                                ...prev,
                                temaPrincipal: !t.value,
                              }));
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
                            setformEditar({ ...formEditar, temaSecundario: t.value });
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
                            setformEditar({ ...formEditar, materialAdicional: m.value });
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
                  value={formEditar.sintesis}
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

            
            {/* BOTÓN */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                className="bg-[#79142A] text-white px-6 py-2 rounded"
              >
                Guardar
              </button>
            </div>

          </div>


        </div>


            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
