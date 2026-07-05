import { Minus } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function RegistraInstruccionesSolicitudesNotificacionesInt() {
  const [form, setForm] = useState({
    tipoDocumento: "",
    fecha: "",
    area: "",
    numeroOficio: "",
    asunto: "",
    destinatario: "",
    informacion: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleGuardar = () => {
    console.log("Datos registrados:", form);
  };

  return (
    <div className="flex-1 w-full p-4 md:p-6 bg-gray-100 overflow-y-auto">
      <div className="w-full">

        {/* HEADER */}
        <div className="bg-gray-300 rounded-t-md flex items-center justify-between px-4 py-2">
          <h1 className="text-sm font-semibold text-gray-800">
            Registra documento y genera notas de atención
          </h1>

          <button className="w-7 h-7 flex items-center justify-center rounded-full bg-[#8B1538] text-white">
            <Minus size={14} />
          </button>
        </div>

        {/* BODY */}
        <div className="bg-white rounded-b-md shadow-sm p-6 space-y-6">

          {/* TITULO */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-300" />
            <h2 className="text-sm font-semibold text-[#8B1538] uppercase tracking-wide">
              Datos del Documento
            </h2>
            <div className="h-px flex-1 bg-gray-300" />
          </div>

          {/* TIPO DOCUMENTO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Tipo de documento
              </label>

              <select
                name="tipoDocumento"
                value={form.tipoDocumento}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-[#8B1538] focus:ring-2 focus:ring-[#8B1538]/20 outline-none"
              >
                <option value="">Seleccionar</option>
                <option value="oficio">Oficio</option>
                <option value="circular">Circular</option>
                <option value="memorandum">Memorandum</option>
              </select>
            </div>

            {/* 🔥 ANIMACIÓN MEJORADA */}
            <AnimatePresence mode="wait">
              {form.tipoDocumento && (
                <motion.div
                  key="extra-fields"
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="contents"
                >

                  {/* Fecha */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                  >
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Fecha
                    </label>

                    <input
                      type="datetime-local"
                      name="fecha"
                      value={form.fecha}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-[#8B1538] focus:ring-2 focus:ring-[#8B1538]/20 outline-none"
                    />
                  </motion.div>

                  {/* Área */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Área
                    </label>

                    <select
                      name="area"
                      value={form.area}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-[#8B1538] focus:ring-2 focus:ring-[#8B1538]/20 outline-none"
                    >
                      <option value="">Seleccionar</option>
                      <option value="ti">Tecnologías de la Información</option>
                      <option value="rh">Recursos Humanos</option>
                      <option value="finanzas">Finanzas</option>
                    </select>
                  </motion.div>

                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* FORMULARIO PRINCIPAL */}
          <AnimatePresence>
            {form.tipoDocumento && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs"
              >

                {[
                  {
                    label: "Núm. Oficio",
                    name: "numeroOficio",
                  },
                  {
                    label: "Destinatario",
                    name: "destinatario",
                  },
                  {
                    label: "Asunto",
                    name: "asunto",
                    span: true,
                  },
                ].map((field, i) => (
                  <motion.div
                    key={field.name}
                    className={field.span ? "md:col-span-2" : ""}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                  >
                    {field.name === "asunto" ? (
                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          Asunto
                        </label>

                        <textarea
                          name="asunto"
                          value={form.asunto}
                          onChange={handleChange}
                          rows={3}
                          className="w-full rounded-xl border border-gray-300 px-4 py-3 resize-none text-sm focus:border-[#8B1538] focus:ring-2 focus:ring-[#8B1538]/20 outline-none"
                        />
                      </div>
                    ) : (
                      <>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          {field.label}
                        </label>

                        <input
                          type="text"
                          name={field.name}
                          value={form[field.name]}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-[#8B1538] focus:ring-2 focus:ring-[#8B1538]/20 outline-none"
                        />
                      </>
                    )}
                  </motion.div>
                ))}

                {/* Información */}
                <motion.div
                  className="md:col-span-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Información
                  </label>

                  <textarea
                    name="informacion"
                    value={form.informacion}
                    onChange={handleChange}
                    rows={6}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-[#8B1538] focus:ring-2 focus:ring-[#8B1538]/20 outline-none resize-none"
                  />
                </motion.div>

                {/* BOTÓN */}
                <motion.div
                  className="md:col-span-2 flex justify-end pt-2"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.45 }}
                >
                  <button
                    onClick={handleGuardar}
                    className="bg-[#8B1538] text-white px-12 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all text-sm"
                  >
                    Guardar
                  </button>
                </motion.div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}