import { useState } from "react";

const generalTasks = [
  { label: "Tablero de control", color: "text-[#8B1538]", view: "tablero-control" },
  { label: "Registra documento y genera notas de atención", color: "text-gray-600", view: "registra-documento" },
  { label: "Buscador de documentos", color: "text-[#8B1538]", view: "buscador-documento" },
  { label: "Reporte de asuntos", color: "text-gray-600", view: "reporte-asuntos" },
  { label: "Reporte de acuerdos", color: "text-[#8B1538]", view: "reporte-acuerdos" },
  { label: "Generación de Oficios", color: "text-gray-600", view: "generacion-oficios" },
  { label: "Control de Oficios", color: "text-[#8B1538]", view: "control-oficios" },
  { label: "Registro Salida de Correspondencia", color: "text-gray-600", view: "salida-correspondencia" },
  { label: "Modifica Salida de Correspondencia", color: "text-[#8B1538]", view: "modificaS-correspondencia" },
  { label: "Consulta Salida de Correspondencia", color: "text-gray-600", view: "consultaS-correspondencia" },
  { label: "Reporte Salida de Correspondencia", color: "text-[#8B1538]", view: "reporteS-correspondencia" },
  { label: "Tablero de control Salida de Correspondencia", color: "text-gray-600", view: "tableroS-correspondencia" },
  { label: "Registra instrucciones, solicitudes y notificaciones internas", color: "text-[#8B1538]", view: "registra-notinternas" }
];

export function Sidebar({ isOpen, onSelectView }) {
  const [paginaActual, setPaginaActual] = useState(1);
  const [selectedTask, setSelectedTask] = useState(null);

  const filasPorPagina = 6;

  const totalPaginas = Math.ceil(generalTasks.length / filasPorPagina);

  const indiceInicio = (paginaActual - 1) * filasPorPagina;

  const tareasPaginadas = generalTasks.slice(
    indiceInicio,
    indiceInicio + filasPorPagina
  );

  return (
    <aside
      className={`bg-gray-50 border-r border-gray-200 flex flex-col transition-all duration-300 ${
        isOpen ? "w-64" : "w-0 overflow-hidden"
      }`}
    >
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-sm text-gray-700 mb-3">Roles Disponibles</h2>

        <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8B1538] focus:border-transparent">
          <option>Archivos General de la Nación</option>
          <option>Administrador General</option>
          <option>Usuario Estándar</option>
          <option>Supervisor</option>
        </select>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-sm text-gray-700 mb-2">Tareas Generales</h3>

        <div className="bg-white border border-gray-200 rounded flex flex-col h-70">

          {/* Lista paginada */}
          <div className="p-2 flex-1 overflow-y-auto">

            <nav className="space-y-0.5">
              {tareasPaginadas.map((task, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (task.view) {
                      setSelectedTask(task.label);
                      onSelectView(task.view);
                    }
                  }}
                  className={`w-full text-left px-3 py-2 text-xs rounded transition-colors ${
                    selectedTask === task.label
                      ? "bg-[#8B1538] text-white"
                      : `${task.color} hover:bg-gray-50`
                  }`}
                >
                  {task.label}
                </button>
              ))}
            </nav>

          </div>

          {/* Paginación */}
          {generalTasks.length > 0 && totalPaginas > 1 && (
            <div className="border-t border-gray-200 py-1">
              <div className="flex items-center justify-center gap-1 text-[10px]">

                <button
                  onClick={() => setPaginaActual((prev) => prev - 1)}
                  disabled={paginaActual === 1}
                  className={`w-5 h-5 flex items-center justify-center rounded border ${
                    paginaActual === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  &lt;
                </button>

                {(() => {
                  const maxVisible = 3;

                  let inicio = Math.max(1, paginaActual - 1);
                  let fin = inicio + maxVisible - 1;

                  if (fin > totalPaginas) {
                    fin = totalPaginas;
                    inicio = Math.max(1, fin - maxVisible + 1);
                  }

                  return Array.from({ length: fin - inicio + 1 }, (_, i) => {
                    const numeroPagina = inicio + i;

                    return (
                      <button
                        key={numeroPagina}
                        onClick={() => setPaginaActual(numeroPagina)}
                        className={`w-5 h-5 flex items-center justify-center rounded border ${
                          paginaActual === numeroPagina
                            ? "bg-[#8B1538] text-white"
                            : "bg-white hover:bg-gray-100"
                        }`}
                      >
                        {numeroPagina}
                      </button>
                    );
                  });
                })()}

                <button
                  onClick={() => setPaginaActual((prev) => prev + 1)}
                  disabled={paginaActual === totalPaginas}
                  className={`w-5 h-5 flex items-center justify-center rounded border ${
                    paginaActual === totalPaginas
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  &gt;
                </button>

              </div>
            </div>
          )}

        </div>
      </div>
    </aside>
  );
}