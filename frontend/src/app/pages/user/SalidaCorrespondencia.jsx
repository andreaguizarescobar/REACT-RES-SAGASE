import { Minus } from "lucide-react";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import { 
  searchDocumentos, 
  createCorrespondenciaSalida,
} from "../../services/correspondencia.service";
import { getRemitentes, createRemitente } from "../../services/remitente.service";
import { getAreas } from "../../services/catalogos.service";


export function SalidaCorrespondencia() {
  const [form, setForm] = useState({
    anio: "",
    folioSalida: "",
    fechaRegistro: "",
    nivelImportancia: "",
    fechaLimite: "",
    horaLimite: "",
    justificacion: "",
    soporte: "",
    areaTramitadora: "",
    numeroOficio: "",
    asunto: "",
    folio: "",
    fichaSAA: "",
    folioSAGA: "",
    documentoSAGA: "",
    documentoId: "",
    nombreCargo: "",
    remitenteId: "",
    otroRemitente: false,
    destinatario: "",
    destinatarioId: "",
    otroDestinatario: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 🔥 LIMPIAR ERROR DEL CAMPO EDITADO
    setErrores((prev) => ({
      ...prev,
      [name]: false,
    }));
  };

  const generarFolioSalida = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `SC-${year}-${random}`;
  };

  const obtenerFechaActualLocalDatetime = () => {
    const now = new Date();
    const offsetMs = now.getTimezoneOffset() * 60000;
    return new Date(now - offsetMs).toISOString().slice(0, 16);
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

  function ModalNuevoRemitente({ isOpen, onClose, onRemitentCreated, tipo }) {
    const [formData, setFormData] = useState({
      name: "",
      tipo: tipo || "",
      cargo: "",
      area: "",
      dependencia: "",
    });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      if (!formData.name || !formData.tipo || !formData.cargo) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Nombre, tipo y cargo son obligatorios",
        });
        return;
      }

      setLoading(true);
      try {
        const response = await createRemitente(formData);
        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(errorBody || "Error al crear el remitente");
        }

        const nuevoRemitente = await response.json();
        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: "Remitente creado correctamente",
        });
        setFormData({
          name: "",
          tipo: tipo || "",
          cargo: "",
          area: "",
          dependencia: "",
        });
        onRemitentCreated(nuevoRemitente);
        onClose();
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Error al crear el remitente",
        });
      } finally {
        setLoading(false);
      }
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full mx-4">
          <h2 className="text-xl font-semibold mb-4">Nuevo Remitente</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre*</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:border-[#8B1538]"
                placeholder="Nombre del remitente"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tipo*</label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:border-[#8B1538]"
              >
                <option value="">Selecciona tipo</option>
                <option value="interno">Interno</option>
                <option value="externo">Externo</option>
                <option value="ciudadano">Ciudadano</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Cargo*</label>
              <input
                type="text"
                name="cargo"
                value={formData.cargo}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:border-[#8B1538]"
                placeholder="Cargo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Área</label>
              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:border-[#8B1538]"
                placeholder="Área"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Dependencia</label>
              <input
                type="text"
                name="dependencia"
                value={formData.dependencia}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:border-[#8B1538]"
                placeholder="Dependencia"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-[#8B1538] text-white rounded hover:opacity-90 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const [errores, setErrores] = useState({});

  const [remitentes, setRemitentes] = useState([]);
  const [documentosResultados, setDocumentosResultados] = useState([]);
  const [busquedaDocumento, setBusquedaDocumento] = useState("");
  const [areas, setAreas] = useState([]);
  const [busquedaRemitente, setBusquedaRemitente] = useState("");
  const [remitentesFiltrados, setRemitentesFiltrados] = useState([]);
  const [busquedaDestinatario, setBusquedaDestinatario] = useState("");
  const [destinatariosFiltrados, setDestinatariosFiltrados] = useState([]);
  const [mostrando, setMostrando] = useState({
    resultadosDocumentos: false,
    resultadosRemitente: false,
    resultadosDestinatario: false,
  });
  const [showModalRemitente, setShowModalRemitente] = useState(false);
  const [tipoModalRemitente, setTipoModalRemitente] = useState(""); // "remitente" o "destinatario"

  // Cargar remitentes y áreas al montar el componente
  useEffect(() => {
    cargarRemitentes();
    cargarAreas();
    setForm((prev) => ({
      ...prev,
      folioSalida: generarFolioSalida(),
      fechaRegistro: obtenerFechaActualLocalDatetime(),
    }));
  }, []);

  const cargarRemitentes = async () => {
    try {
      const datos = await getRemitentes();
      const remitentes = await datos.json();
      console.log('Remitentes cargados en componente:', remitentes);
      setRemitentes(remitentes || []);
    } catch (error) {
      console.error('Error en cargarRemitentes:', error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los remitentes",
      });
    }
  };

  const cargarAreas = async () => {
    try {
      const datos = await getAreas();
      const areas = await datos.json();
      console.log('Áreas cargadas en componente:', areas);
      setAreas(areas || []);
    } catch (error) {
      console.error('Error en cargarAreas:', error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar las áreas",
      });
    }
  };

  // Buscar documentos
  const handleBuscarDocumentos = async (query) => {
    setBusquedaDocumento(query);
    setForm((prev) => ({ ...prev, documentoId: "" }));

    if (query.length < 2) {
      setDocumentosResultados([]);
      setMostrando((prev) => ({ ...prev, resultadosDocumentos: false }));
      return;
    }

    try {
      const response = await searchDocumentos(query);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error en búsqueda de documentos");
      }
      const resultados = await response.json();
      console.log("Documentos encontrados:", resultados);
      const documentos = Array.isArray(resultados)
        ? resultados
        : Array.isArray(resultados.data)
        ? resultados.data
        : [];
      setDocumentosResultados(documentos);
      setMostrando((prev) => ({ ...prev, resultadosDocumentos: documentos.length > 0 }));
    } catch (error) {
      console.error("Error en búsqueda:", error);
      setDocumentosResultados([]);
      setMostrando((prev) => ({ ...prev, resultadosDocumentos: false }));
    }
  };

  // Seleccionar un documento
  const handleSeleccionarDocumento = (documento) => {
    setForm((prev) => ({
      ...prev,
      folio: documento.folio || prev.folio,
      documentoSAGA: documento.docId || documento.folio || prev.documentoSAGA,
      documentoId: documento._id || prev.documentoId,
      asunto: documento.asunto || prev.asunto,
    }));
    setBusquedaDocumento("");
    setMostrando((prev) => ({ ...prev, resultadosDocumentos: false }));
  };

  // Buscar remitentes
  const handleBuscarRemitentes = (query) => {
    setBusquedaRemitente(query);
    setForm((prev) => ({ ...prev, remitenteId: "" }));

    if (query.length < 1) {
      setRemitentesFiltrados([]);
      setMostrando((prev) => ({ ...prev, resultadosRemitente: false }));
      return;
    }

    const filtrados = remitentes.filter((rem) =>
      `${rem.name} - ${rem.cargo}`.toLowerCase().includes(query.toLowerCase())
    );
    setRemitentesFiltrados(filtrados);
    setMostrando((prev) => ({ ...prev, resultadosRemitente: true }));
  };

  // Seleccionar remitente
  const handleSeleccionarRemitente = (remitente) => {
    const texto = `${remitente.name} - ${remitente.cargo}`;
    setForm((prev) => ({
      ...prev,
      nombreCargo: texto,
      remitenteId: remitente._id,
    }));
    setBusquedaRemitente("");
    setMostrando((prev) => ({ ...prev, resultadosRemitente: false }));
  };

  // Buscar destinatarios
  const handleBuscarDestinatarios = (query) => {
    setBusquedaDestinatario(query);
    setForm((prev) => ({ ...prev, destinatarioId: "" }));

    if (query.length < 1) {
      setDestinatariosFiltrados([]);
      setMostrando((prev) => ({ ...prev, resultadosDestinatario: false }));
      return;
    }

    const filtrados = remitentes.filter((rem) =>
      `${rem.name} - ${rem.cargo}`.toLowerCase().includes(query.toLowerCase())
    );
    setDestinatariosFiltrados(filtrados);
    setMostrando((prev) => ({ ...prev, resultadosDestinatario: true }));
  };

  // Seleccionar destinatario
  const handleSeleccionarDestinatario = (remitente) => {
    const texto = `${remitente.name} - ${remitente.cargo}`;
    setForm((prev) => ({
      ...prev,
      destinatario: texto,
      destinatarioId: remitente._id,
    }));
    setBusquedaDestinatario("");
    setMostrando((prev) => ({ ...prev, resultadosDestinatario: false }));
  };

  // Abrir modal para crear remitente
  const handleAgregarRemitente = (tipo) => {
    setTipoModalRemitente(tipo);
    setShowModalRemitente(true);
  };

  // Cuando se crea un nuevo remitente
  const handleRemitenteCreado = (nuevoRemitente) => {
    setRemitentes((prev) => [...prev, nuevoRemitente]);
    setShowModalRemitente(false);
    const texto = `${nuevoRemitente.name} - ${nuevoRemitente.cargo}`;

    if (tipoModalRemitente === "remitente") {
      setForm((prev) => ({
        ...prev,
        nombreCargo: texto,
        remitenteId: nuevoRemitente._id,
      }));
      setBusquedaRemitente(texto);
    } else if (tipoModalRemitente === "destinatario") {
      setForm((prev) => ({
        ...prev,
        destinatario: texto,
        destinatarioId: nuevoRemitente._id,
      }));
      setBusquedaDestinatario(texto);
    }
  };

  const validarCampos = () => {
    let nuevosErrores = {};

    if (!form.anio) nuevosErrores.anio = true;
    if (!form.folioSalida) nuevosErrores.folioSalida = true;
    if (!form.fechaRegistro) nuevosErrores.fechaRegistro = true;
    if (!form.nivelImportancia) nuevosErrores.nivelImportancia = true;
    if (!form.soporte) nuevosErrores.soporte = true;
    if (!form.areaTramitadora) nuevosErrores.areaTramitadora = true;
    if (!form.folio) nuevosErrores.folio = true;
    if (!form.documentoSAGA) nuevosErrores.documentoSAGA = true;
    if (!form.remitenteId) nuevosErrores.nombreCargo = true;
    if (!form.destinatarioId) nuevosErrores.destinatario = true;
    if (!form.asunto) nuevosErrores.asunto = true;

    // Validación extra si es urgente
    if (form.nivelImportancia === "urgente") {
      if (!form.fechaLimite) nuevosErrores.fechaLimite = true;
      if (!form.justificacion) nuevosErrores.justificacion = true;
    }

    setErrores(nuevosErrores);
    console.log(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleGuardar = async () => {
    if (!validarCampos()) {
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

    // Modal de confirmación
    Swal.fire({
      title: "Confirmación",
      text: "¿Seguro que desea continuar?, ¿su información está correcta?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "OK",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#8B1538",
      cancelButtonColor: "#6B7280",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Preparar datos para enviar
          const datosGuardar = {
            fecha: new Date(form.fechaRegistro),
            folio: form.folio,
            importancia: form.nivelImportancia,
            entregaMax: form.fechaLimite ? new Date(form.fechaLimite) : null,
            justificacion: form.justificacion,
            soporte: form.soporte,
            area: form.areaTramitadora,
            oficio: form.numeroOficio,
            asunto: form.asunto,
            doc: form.documentoId || null,
            remitente: form.remitenteId,
            destinatario: form.destinatarioId,
          };

          const respuesta = await createCorrespondenciaSalida(datosGuardar);

          if (!respuesta.ok) {
            console.log(await respuesta.json());
            throw new Error("Error al guardar la correspondencia");
          }

          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "Documento guardado correctamente",
            showConfirmButton: false,
            timer: 2000,
          });

          // Limpiar formulario y búsquedas
          setForm({
            anio: "",
            folioSalida: generarFolioSalida(),
            fechaRegistro: obtenerFechaActualLocalDatetime(),
            nivelImportancia: "",
            fechaLimite: "",
            horaLimite: "",
            justificacion: "",
            soporte: "",
            areaTramitadora: "",
            numeroOficio: "",
            asunto: "",
            folio: "",
            fichaSAA: "",
            folioSAGA: "",
            documentoSAGA: "",
            documentoId: "",
            nombreCargo: "",
            remitenteId: "",
            otroRemitente: false,
            destinatario: "",
            destinatarioId: "",
            otroDestinatario: false,
          });
          setBusquedaDocumento("");
          setBusquedaRemitente("");
          setBusquedaDestinatario("");
          setDocumentosResultados([]);
          setRemitentesFiltrados([]);
          setDestinatariosFiltrados([]);
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message || "Error al guardar la correspondencia",
          });
        }
      }
    });
  };


  return (
    <div className="flex-1 p-6 bg-gray-100 overflow-y-auto">
      {/* Header */}
      <div className="bg-gray-300 rounded-t-md flex items-center justify-between px-4 py-2">
        <h1 className="text-sm font-semibold text-gray-800">
          Registrar correspondencia de salida
        </h1>
        <button className="w-6 h-6 flex items-center justify-center rounded-full bg-[#8B1538] text-white">
          <Minus size={14} />
        </button>
      </div>

      {/* Contenedor principal */}
      <div className="bg-white p-6 rounded-b-md shadow-sm space-y-8 text-xs">
        
        {/* FILA 1 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label>Año*</label>
            <select
              name="anio"
              value={form.anio}
              onChange={handleChange}
              className={`w-full border rounded px-2 py-2 ${
                errores.anio ? "border-red-500 bg-red-50" : ""
              }`}
            >
              <option value="">Selecciona año</option>
              <option>2025</option>
              <option>2026</option>
            </select>
          </div>
        </div>

        {/* FILA 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label>Folio de salida*</label>
            <input
              name="folioSalida"
              value={form.folioSalida}
              onChange={handleChange}
              className={`w-full border rounded px-2 py-1 ${
                errores.folioSalida ? "border-red-500 bg-red-50" : ""
              }`}
            />
          </div>

          <div>
            <label>Fecha y hora de registro*</label>
            <input
              type="datetime-local"
              name="fechaRegistro"
              value={form.fechaRegistro}
              readOnly
              className={`w-full border rounded px-2 py-1 bg-gray-100 text-gray-700 ${
                errores.fechaRegistro ? "border-red-500 bg-red-50" : ""
}`}
            />
          </div>
        </div>

        {/* NIVEL IMPORTANCIA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label>Nivel de importancia*</label>
            <select
              name="nivelImportancia"
              value={form.nivelImportancia}
              onChange={handleChange}
              className={`w-full border rounded px-2 py-2 ${
                errores.nivelImportancia ? "border-red-500 bg-red-50" : ""
              }`}
            >
              <option value="">Selecciona opción</option>
              <option value="normal">Normal</option>
              <option value="urgente">Urgente</option>
              <option value="termino">Con término</option>
            </select>
          </div>

          <div>
            <label>Soporte*</label>
            <select
              name="soporte"
              value={form.soporte}
              onChange={handleChange}
              className={`w-full border rounded px-2 py-2 ${
                errores.soporte ? "border-red-500 bg-red-50" : ""
              }`}
            >
              <option value="">Selecciona opción</option>
              <option>Físico</option>
              <option>Digital</option>
            </select>
          </div>
        </div>

        {/* CAMPOS URGENTE */}
        <AnimatePresence>
          {(form.nivelImportancia === "urgente" || form.nivelImportancia === "termino") && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className={`grid grid-cols-1 md:grid-cols-1 gap-6 p-4 rounded ${
                form.nivelImportancia === "urgente"
                  ? "bg-yellow-50"
                  : "bg-red-50"
              }`}
            >

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-red-50 p-4 rounded">
            <div>
              <label>
                {form.nivelImportancia === "urgente"
                  ? "Fecha máxima de entrega*"
                  : "Fecha de término*"}
              </label>
              <input
                type="date"
                name="fechaLimite"
                value={form.fechaLimite}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1"
              />
            </div>

            <div className="col-span-1 md:col-span-3">
              <label>Justificación*</label>
              <textarea
                name="justificacion"
                value={form.justificacion}
                onChange={handleChange}
                className="w-full border rounded px-2 py-2 h-16 resize-none"
              />
            </div>
          </div>

          </motion.div>
        )}
      </AnimatePresence>

        {/* DATOS IDENTIFICADORES */}
        <div>
          <h2 className="font-semibold text-gray-700 mb-4">
            Datos identificadores
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label>Área tramitadora*</label>
              <select
                name="areaTramitadora"
                value={form.areaTramitadora}
                onChange={handleChange}
                className={`w-full border rounded px-2 py-2 ${
                  errores.areaTramitadora ? "border-red-500 bg-red-50" : ""
                }`}
              >
                <option value="">Selecciona opción</option>
                {areas.map((area) => (
                  <option key={area._id} value={area._id}>
                    {area.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Asunto*</label>
              <input
                name="asunto"
                value={form.asunto}
                readOnly
                className={`w-full border rounded px-2 py-1 bg-gray-100 text-gray-700 ${
                  errores.asunto ? "border-red-500 bg-red-50" : ""
                }`}
              />
            </div>

            <div>
              <label>Folio SAGASE</label>
              <input
                name="folio"
                value={form.folio}
                readOnly
                className="w-full border rounded px-2 py-1 bg-gray-100 text-gray-700"
              />
            </div>

            <div>
              <label>No. Documento</label>
              <div className="relative">
                <input
                  type="text"
                  value={busquedaDocumento}
                  onChange={(e) => handleBuscarDocumentos(e.target.value)}
                  placeholder={form.documentoSAGA ? `${form.documentoSAGA}` : "Buscar por folio, docId o asunto"}
                  className="w-full border rounded px-2 py-1"
                />
                {mostrando.resultadosDocumentos && documentosResultados.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-t-0 rounded-b shadow-lg z-10 max-h-48 overflow-y-auto">
                    {documentosResultados.map((doc, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSeleccionarDocumento(doc)}
                        className="p-2 hover:bg-gray-100 cursor-pointer text-xs border-b"
                      >
                        <div className="font-semibold">{doc.folio}</div>
                        <div className="text-gray-600">{doc.asunto}</div>
                        <div className="text-gray-500">{doc.docId}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* DATOS REMITENTE */}
        <div>
          <h2 className="font-semibold text-gray-700 mb-4">
            Datos del remitente
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative">
              <label>Nombre y cargo*</label>
              {!form.otroRemitente ? (
                <>
                  <input
                    type="text"
                    value={busquedaRemitente}
                    onChange={(e) => handleBuscarRemitentes(e.target.value)}
                    placeholder={form.nombreCargo ? form.nombreCargo : "Buscar remitente"}
                    className={`w-full border rounded px-2 py-1 ${
                      errores.nombreCargo ? "border-red-500 bg-red-50" : ""
                    }`}
                  />
                  {mostrando.resultadosRemitente && remitentesFiltrados.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-t-0 rounded-b shadow-lg z-10 max-h-48 overflow-y-auto mt-0">
                      {remitentesFiltrados.map((rem) => (
                        <div
                          key={rem._id}
                          onClick={() => handleSeleccionarRemitente(rem)}
                          className="p-2 hover:bg-gray-100 cursor-pointer text-xs border-b"
                        >
                          <div className="font-semibold">{rem.name}</div>
                          <div className="text-gray-600">{rem.cargo}</div>
                          {rem.area && <div className="text-gray-500 text-xs">{rem.area}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <input
                  name="nombreCargo"
                  value={form.nombreCargo}
                  onChange={handleChange}
                  placeholder="Nombre y cargo del remitente"
                  className={`w-full border rounded px-2 py-1 ${
                    errores.nombreCargo ? "border-red-500 bg-red-50" : ""
                  }`}
                />
              )}
            </div>

            <div className="flex items-center gap-3 mt-5">
              <Toggle
                checked={form.otroRemitente}
                onChange={(val) => {
                  setForm({ ...form, otroRemitente: val });
                  if (val) {
                    handleAgregarRemitente("remitente");
                  }
                }}
              />
              <label>Otro remitente</label>
            </div>
          </div>
        </div>

        {/* DATOS DESTINATARIO */}
        <div>
          <h2 className="font-semibold text-gray-700 mb-4">
            Datos del destinatario
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative">
              <label>Nombre y cargo*</label>
              {!form.otroDestinatario ? (
                <>
                  <input
                    type="text"
                    value={busquedaDestinatario}
                    onChange={(e) => handleBuscarDestinatarios(e.target.value)}
                    placeholder={form.destinatario ? form.destinatario : "Buscar destinatario"}
                    className={`w-full border rounded px-2 py-1 ${
                      errores.destinatario ? "border-red-500 bg-red-50" : ""
                    }`}
                  />
                  {mostrando.resultadosDestinatario && destinatariosFiltrados.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-t-0 rounded-b shadow-lg z-10 max-h-48 overflow-y-auto mt-0">
                      {destinatariosFiltrados.map((rem) => (
                        <div
                          key={rem._id}
                          onClick={() => handleSeleccionarDestinatario(rem)}
                          className="p-2 hover:bg-gray-100 cursor-pointer text-xs border-b"
                        >
                          <div className="font-semibold">{rem.name}</div>
                          <div className="text-gray-600">{rem.cargo}</div>
                          {rem.area && <div className="text-gray-500 text-xs">{rem.area}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <input
                  name="destinatario"
                  value={form.destinatario}
                  onChange={handleChange}
                  placeholder="Nombre y cargo del destinatario"
                  className={`w-full border rounded px-2 py-1 ${
                    errores.destinatario ? "border-red-500 bg-red-50" : ""
                  }`}
                />
              )}
            </div>

            <div className="flex items-center gap-3 mt-5">
              <Toggle
                checked={form.otroDestinatario}
                onChange={(val) => {
                  setForm({ ...form, otroDestinatario: val });
                  if (val) {
                    handleAgregarRemitente("destinatario");
                  }
                }}
              />
              <label>Otro destinatario</label>
            </div>
          </div>
        </div>

        {/* BOTÓN */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleGuardar}
            className="bg-[#8B1538] text-white px-10 py-2 rounded text-xs hover:opacity-90"
          >
            Guardar
          </button>
        </div>
      </div>

      {/* Modal para crear nuevo remitente */}
      <ModalNuevoRemitente
        isOpen={showModalRemitente}
        tipo={tipoModalRemitente}
        onClose={() => setShowModalRemitente(false)}
        onRemitentCreated={handleRemitenteCreado}
      />
    </div>
  );
}
