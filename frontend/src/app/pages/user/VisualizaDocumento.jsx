//USUARIO EJECUTOR - TAREA ESPECÍFICA: VISUALIZA DOCUMENTO
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Pencil, X, Minus } from "lucide-react";

export function VisualizaDocumento() {

  const [tabActiva, setTabActiva] = useState("datosAsunto");
  const [documentoEditar, setDocumentoEditar] = useState(null);

  useEffect(() => {
    async function cargar() {
        const data = await getDocumentById(id);
        setDocumentoEditar(data);
    }
    cargar();
  }, []);

  return (
   <div className="flex-1 w-full p-6 bg-gray-100 overflow-y-auto">

        {/* Header */}
        <div className="bg-gray-300 rounded-t-md flex items-center justify-between px-4 py-3">
        <h1 className="text-sm font-semibold text-gray-800">
            Visualizar Documento
        </h1>

        <button className="w-6 h-6 flex items-center justify-center rounded-full bg-[#8B1538] text-white">
            <Minus size={14} />
        </button>
        </div>

        {/* Contenedor */}
        <div className="w-full bg-white p-5 rounded-b-md shadow-sm">

            <span className="text-gray text-sm">
            Folio: {documentoEditar?.folio || ""}
            </span>

            {/* Tabs */}
            <div className="flex border-b text-sm overflow-x-auto mt-4">
                {[
                { id: "datosAsunto", label: "Datos del registro" },
                { id: "anexo", label: "Anexos" },
                { id: "materialAdicional", label: "Material adicional" },
                { id: "verTurnos", label: "Ver todos los turnos" },
                { id: "copias", label: "Copias de conocimiento" },
                { id: "bitacora", label: "Bitácora" },
                ].map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setTabActiva(tab.id)}
                    className={`px-4 py-2 whitespace-nowrap ${
                    tabActiva === tab.id
                        ? "border-b-2 border-[#8B1538] text-[#8B1538] font-semibold"
                        : "text-gray-600"
                    }`}
                >
                    {tab.label}
                </button>
                ))}
            </div>

            {/* Contenido */}
            <div className="mt-6">
                {tabActiva === "datosAsunto" && (
                <div className="space-y-6">

                    {/* Ejercicio */}
                    <div className="flex items-center gap-4">
                    <div className="w-80">
                        <h2 className="text-sm font-semibold text-gray-600 mb-2">Ejercicio</h2>
                        <select
                        name="ejercicio"
                        value={documentoEditar?.ejercicio || ""}
                        disabled
                        className="w-full border rounded px-2 py-1 bg-gray-100 cursor-not-allowed"
                        >
                        <option value="">Seleccionar</option>
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                        </select>
                    </div>
                    </div>

                    {/* Datos generales */}
                    <div>
                    <h2 className="text-sm font-semibold text-gray-600 mb-2">Datos generales</h2>

                    <div className="grid grid-cols-4 gap-4 items-end">
                        <div>
                        <label className="text-xs text-gray-500">No. de documento</label>
                        <input
                            value={documentoEditar?.noDocumento || ""}
                            disabled
                            className="w-full border rounded px-2 py-1 bg-gray-100"
                        />
                        </div>

                        <div>
                        <label className="text-xs text-gray-500">Fecha documento</label>
                        <input
                            type="date"
                            value={documentoEditar?.fechaDocumento || ""}
                            disabled
                            className="w-full border rounded px-2 py-1 bg-gray-100"
                        />
                        </div>

                        <div>
                        <label className="text-xs text-gray-500">Fecha acuse</label>
                        <input
                            type="date"
                            value={documentoEditar?.fechaAcuse || ""}
                            disabled
                            className="w-full border rounded px-2 py-1 bg-gray-100"
                        />
                        </div>

                        <div>
                        <label className="text-xs text-gray-500">Fecha registro</label>
                        <input
                            type="datetime-local"
                            value={documentoEditar?.fechaRegistro || ""}
                            disabled
                            className="w-full border rounded px-2 py-1 bg-gray-100"
                        />
                        </div>
                    </div>
                    </div>

                    {/* Remitente */}
                    <div>
                    <h2 className="text-sm font-semibold text-gray-600">Remitente</h2>

                    <div className="grid grid-cols-3 gap-4 mt-2">
                        <div>
                        <label className="text-xs text-gray-500">Tipo</label>
                        <input
                            value={documentoEditar?.tipoRemitente || ""}
                            disabled
                            className="w-full border rounded px-2 py-1 bg-gray-100"
                        />
                        </div>

                        <div>
                        <label className="text-xs text-gray-500">Nombre</label>
                        <input
                            value={documentoEditar?.remitenteNombre || ""}
                            disabled
                            className="w-full border rounded px-2 py-1 bg-gray-100"
                        />
                        </div>

                        <div>
                        <label className="text-xs text-gray-500">Cargo</label>
                        <input
                            value={documentoEditar?.remitenteCargo || ""}
                            disabled
                            className="w-full border rounded px-2 py-1 bg-gray-100"
                        />
                        </div>
                    </div>
                    </div>

                </div>
                )}
            </div>

        </div>

    </div>
  );
}
