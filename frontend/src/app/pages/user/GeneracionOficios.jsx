import { motion, AnimatePresence } from "framer-motion";
import { Minus, Search } from "lucide-react";
import { useState, useEffect } from "react";

export function GeneracionOficios() {
  const [tipo, setTipo] = useState("");
  const [fechaHora, setFechaHora] = useState("");
  const [area, setArea] = useState("");
  const [numeroOficio, setNumeroOficio] = useState("");
  const [destinatario, setDestinatario] = useState("");
  const [asunto, setAsunto] = useState("");
  const [contenido, setContenido] = useState("");

  const tipos = [
    { value: "oficio", label: "Oficio" },
    { value: "circular", label: "Circular" },
  ];

  const areas = [
    {
      value: "direccion_tic",
      label: "Dirección de Tecnologías de la Información y Comunicaciones",
    },
    { value: "recursos_humanos", label: "Recursos Humanos" },
    { value: "finanzas", label: "Finanzas" },
  ];

  // Generar fecha y hora automática
  useEffect(() => {
    if (tipo) {
      const now = new Date();
      setFechaHora(now.toLocaleString());

      const consecutivo = Math.floor(Math.random() * 1000);
      setNumeroOficio(`DG/DTIC/${consecutivo}/2026`);
    }
  }, [tipo]);

  const handleGuardar = () => {
    const data = {
      tipo,
      fechaHora,
      area,
      numeroOficio,
      destinatario,
      asunto,
      contenido,
    };

    console.log("Datos del documento:", data);

    // 👇 ABRE EL OFICIO
    setMostrarOficio(true);
  };

  const [mostrarOficio, setMostrarOficio] = useState(false);

  return (
    <div className="flex-1 w-full p-6 bg-gray-100 overflow-y-auto">
      {/* Header */}
      <div className="bg-gray-300 rounded-t-md flex items-center justify-between px-4 py-2">
        <h1 className="text-sm font-semibold text-gray-800">
          Generación de Oficios
        </h1>

        <button className="w-6 h-6 flex items-center justify-center rounded-full bg-[#8B1538] text-white">
          <Minus size={14} />
        </button>
      </div>

      <div className="w-full bg-white p-4 sm:p-6 md:p-10 rounded-b-md shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-6 text-xs">
          
          {/* Tipo de oficio */}
          <div className="col-span-2">
            <label className="block mb-1">Tipo de oficio:</label>

            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1 h-8 focus:outline-none focus:ring-2 focus:ring-[#8B1538]"
            >
              <option value="">Selecciona opción</option>

              {tipos.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Mostrar resto solo si hay tipo */}
          {tipo && (
            <>
              {/* Fecha */}
              <div className="col-span-2">
                <label className="block mb-1">Fecha y hora:</label>

                <input
                  type="text"
                  value={fechaHora}
                  disabled
                  className="w-full border border-gray-300 bg-gray-100 rounded px-2 py-1 h-8"
                />
              </div>

              {/* Área */}
              <div className="col-span-2">
                <label className="block mb-1">Área:</label>

                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1 h-8 focus:outline-none focus:ring-2 focus:ring-[#8B1538]"
                >
                  <option value="">Selecciona área</option>

                  {areas.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Número de oficio */}
              <div className="col-span-2">
                <label className="block mb-1">Núm. Oficio:</label>

                <input
                  type="text"
                  value={numeroOficio}
                  disabled
                  className="w-full border border-gray-300 bg-gray-100 rounded px-2 py-1 h-8"
                />
              </div>

              {/* Asunto */}
              <div className="col-span-4">
                <label className="block mb-1">Asunto:</label>

                <textarea
                  value={asunto}
                  onChange={(e) => setAsunto(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8B1538]"
                />
              </div>

              {/* Para */}
              <div className="col-span-4">
                <label className="block mb-1">Para:</label>

                <div className="relative">
                  <input
                    type="text"
                    value={destinatario}
                    onChange={(e) => setDestinatario(e.target.value)}
                    placeholder="Buscar y seleccionar opción"
                    className="w-full border border-gray-300 rounded px-8 py-1 h-8 focus:outline-none focus:ring-2 focus:ring-[#8B1538]"
                  />

                  <Search
                    size={14}
                    className="absolute left-2 top-2 text-gray-400"
                  />
                </div>
              </div>

              {/* Información */}
              <div className="col-span-4">
                <label className="block mb-1">Información:</label>

                <textarea
                  value={contenido}
                  onChange={(e) => setContenido(e.target.value)}
                  rows={6}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8B1538]"
                />
              </div>

              {/* Botón */}
              <div className="col-span-full flex justify-center sm:justify-end">
                <button
                  onClick={handleGuardar}
                  className="bg-[#8B1538] text-white px-10 py-2 rounded hover:opacity-90 transition"
                >
                  Guardar
                </button>
              </div>
            </>
          )}
          <AnimatePresence>
            {mostrarOficio && (
              <motion.div
                className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                
                {/* CONTENEDOR */}
                <motion.div
                  initial={{ scale: 0.9, y: 40, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ scale: 0.9, y: 40, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="w-full max-w-4xl bg-white rounded shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
                >

                  {/* BARRA SUPERIOR */}
                  <div className="bg-gray-700 text-white flex items-center justify-between px-4 py-2 text-xs">
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => window.print()}
                        className="bg-red-600 px-2 py-1 rounded"
                      >
                        PDF
                      </button>

                      <button className="bg-gray-400 px-2 py-1 rounded">
                        Imprimir
                      </button>
                    </div>

                    <div className="font-semibold">
                      Página 1 de 1
                    </div>

                    <button
                      onClick={() => setMostrarOficio(false)}
                      className="bg-[#8B1538] w-6 h-6 rounded-full flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>

                  {/* CONTENIDO */}
                  <div className="bg-gray-800 flex justify-center p-4 overflow-y-auto">

                    {/* HOJA */}
                    <div className="bg-white w-full max-w-[650px] min-h-[750px] p-10 text-xs shadow">

                      {/* ENCABEZADO */}
                      <div className="mb-6">
                        <p className="font-semibold">Gobierno de México</p>
                        <p className="text-right">{area || "Área no especificada"}</p>
                        <p className="text-right">{fechaHora}</p>
                        <p className="text-right font-semibold">{numeroOficio}</p>
                      </div>

                      {/* DESTINATARIO */}
                      <div className="mb-6">
                        <p className="font-semibold uppercase">
                          {destinatario || "DESTINATARIO"}
                        </p>
                        <p>PRESENTE</p>
                      </div>

                      {/* ASUNTO */}
                      <div className="mb-4">
                        <p>
                          <strong>Asunto:</strong> {asunto || "SIN ASUNTO"}
                        </p>
                      </div>

                      {/* CONTENIDO */}
                      <div className="mb-10 text-justify whitespace-pre-line">
                        {contenido || "Contenido del oficio..."}
                      </div>

                      {/* DESPEDIDA */}
                      <div className="mt-16">
                        <p>ATENTAMENTE</p>
                        <br />
                        <br />
                        <p className="font-semibold">
                          {area || "Nombre del área"}
                        </p>
                      </div>

                    </div>
                  </div>

                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
    
  );
}
