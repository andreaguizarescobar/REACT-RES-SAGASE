import { Minus } from "lucide-react";
import { useState } from "react";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";

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
    fichaSAA: "",
    folioSAGA: "",
    documentoSAGA: "",
    nombreCargo: "",
    otroRemitente: false,
  });

  const areas = [
    { value: "direccion_general", label: "Dirección General" },
    { value: "recursos_humanos", label: "Recursos Humanos" },
    { value: "finanzas", label: "Finanzas" },
    { value: "juridico", label: "Jurídico" },
    { value: "tecnologias", label: "Tecnologías de la Información" },
    { value: "archivo", label: "Archivo" },
    { value: "atencion_ciudadana", label: "Atención Ciudadana" },
  ];

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

  const [errores, setErrores] = useState({});

  const validarCampos = () => {
    let nuevosErrores = {};

    if (!form.anio) nuevosErrores.anio = true;
    if (!form.folioSalida) nuevosErrores.folioSalida = true;
    if (!form.fechaRegistro) nuevosErrores.fechaRegistro = true;
    if (!form.nivelImportancia) nuevosErrores.nivelImportancia = true;
    if (!form.soporte) nuevosErrores.soporte = true;
    if (!form.areaTramitadora) nuevosErrores.areaTramitadora = true;
    if (!form.numeroOficio) nuevosErrores.numeroOficio = true;
    if (!form.asunto) nuevosErrores.asunto = true;
    if (!form.nombreCargo) nuevosErrores.nombreCargo = true;

    // Validación extra si es urgente
    if (form.nivelImportancia === "urgente") {
      if (!form.fechaLimite) nuevosErrores.fechaLimite = true;
      if (!form.horaLimite) nuevosErrores.horaLimite = true;
      if (!form.justificacion) nuevosErrores.justificacion = true;
    }

    setErrores(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  };

  const handleGuardar = () => {
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

    // 🔥 MODAL DE CONFIRMACIÓN
    Swal.fire({
      title: "Confirmación",
      text: "¿Seguro que desea continuar?, ¿su información está correcta?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "OK",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#8B1538",
      cancelButtonColor: "#6B7280",
    }).then((result) => {
      if (result.isConfirmed) {
        // ✅ AQUÍ YA GUARDA
        console.log("Datos guardados:", form);

        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Documento guardado correctamente",
          showConfirmButton: false,
          timer: 2000,
        });

        // 👉 Aquí después puedes meter tu API
        // await guardarDatos(form);
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
              onChange={handleChange}
              className={`w-full border rounded px-2 py-1 ${
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

            <div>
              <label>Hora máxima*</label>
              <input
                type="time"
                name="horaLimite"
                value={form.horaLimite}
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
                  <option key={area.value} value={area.value}>
                    {area.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Número de oficio*</label>
              <input
                name="numeroOficio"
                value={form.numeroOficio}
                onChange={handleChange}
                className={`w-full border rounded px-2 py-1 ${
                  errores.numeroOficio ? "border-red-500 bg-red-50" : ""
                }`}
              />
            </div>

            <div>
              <label>Asunto*</label>
              <input
                name="asunto"
                value={form.asunto}
                onChange={handleChange}
                className={`w-full border rounded px-2 py-1 ${
                  errores.asunto ? "border-red-500 bg-red-50" : ""
                }`}
              />
            </div>

            <div>
              <label>Ficha SAA</label>
              <input
                name="fichaSAA"
                value={form.fichaSAA}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1"
              />
            </div>

            <div>
              <label>Folio SAGA</label>
              <input
                name="folioSAGA"
                value={form.folioSAGA}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1"
              />
            </div>

            <div>
              <label>No. Documento en SAGA</label>
              <input
                name="documentoSAGA"
                value={form.documentoSAGA}
                onChange={handleChange}
                placeholder="Buscar y seleccionar opción"
                className="w-full border rounded px-2 py-1"
              />
            </div>
          </div>
        </div>

        {/* DATOS REMITENTE */}
        <div>
          <h2 className="font-semibold text-gray-700 mb-4">
            Datos del remitente
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label>Nombre y cargo*</label>
              <input
                name="nombreCargo"
                value={form.nombreCargo}
                onChange={handleChange}
                placeholder="Buscar y seleccionar opción"
                className={`w-full border rounded px-2 py-1 ${
                  errores.nombreCargo ? "border-red-500 bg-red-50" : ""
                }`}
              />
            </div>

            <div className="flex items-center gap-3 mt-5">
              <Toggle
                checked={form.otroRemitente}
                onChange={(val) =>
                  setForm({ ...form, otroRemitente: val })
                }
              />
              <label>Otro remitente</label>
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
    </div>
  );
}
