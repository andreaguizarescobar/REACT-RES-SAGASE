import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Roles() {

    const [openIndex, setOpenIndex] = useState(null);

  const permisos = [
  {
    nombre: "Sistema Automatizado de Gestión de Archivos", checked: true,
        children: [
        { nombre: "Administración y Configuración del Sistema", checked: true },
        { nombre: "Ampliación extraordinaria del plazo de AC por expediente" },
        { nombre: "Ampliación extraordinaria del plazo en AT por expediente" },
        { nombre: "Archivo de Trámite" },
        { nombre: "Atención de solicitudes mediante correos electrónicos institucionales" },
        { nombre: "Baja Documental" },
        { nombre: "Baja Documental Contable" },
        { nombre: "Consulta electrónica de expediente en AC" },
        { nombre: "Consulta electrónica de expedientes en AT" },
        { nombre: "Incorporación de documentos de archivo como bienes muebles" },
        { nombre: "Digitalización de Expedientes Físicos" },
        { nombre: "Elaboración de fichas técnicas de valoración documental" },
        { nombre: "Eliminación de DCAI" },
        { nombre: "Generación de Inventario General por Expedientes Trimestral" },
        { nombre: "Gestión de instrucciones y solicitudes" },
        { nombre: "Glosa de documentos" },
        { nombre: "Identificación de valores secundarios de las series" },
        { nombre: "Modificación del Catálogo de Disposición Documental" },
        { nombre: "Modificación del Cuadro General de Clasificación Archivística" },
        { nombre: "Préstamo y consulta de expedientes AT" },
        { nombre: "Préstamo y consulta de expedientes AC" },
        ],
    },
  ];

  return (
  <div className="min-h-screen flex justify-center bg-gray-100 p-4">
    
    <div className="bg-white p-4 rounded shadow-sm text-xs w-full max-w-3xl h-[85vh] flex flex-col">
      
      <h2 className="text-center text-gray-700 font-semibold mb-3">
        Roles Asignados
      </h2>

      {/* CONTENIDO SCROLL */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-1">
        {permisos.map((grupo, i) => (
          <div key={i}>
            {/* Grupo principal */}
            <div
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex items-center gap-2 font-medium text-gray-700 cursor-pointer"
                >
                <ChevronRight
                    size={14}
                    className={`transition-transform ${
                        openIndex === i ? "rotate-90" : ""
                    }`}
                    />


                <input type="checkbox" onClick={(e) => e.stopPropagation()} />

                <span>{grupo.nombre}</span>
                </div>


            {/* Hijos */}
            <AnimatePresence>
            {openIndex === i && (
                <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="ml-6 mt-1 space-y-1 overflow-hidden"
                >


              {grupo.children.map((item, j) => (
                <label
                  key={j}
                  className="flex items-center gap-2 text-gray-600 cursor-pointer hover:text-gray-800"
                >
                  <input
                    type="checkbox"
                    defaultChecked={item.checked}
                    className="accent-[#8B1538]"
                  />
                  <span>{item.nombre}</span>
                </label>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
          </div>
        ))}
      </div>

    </div>
  </div>
);

}
