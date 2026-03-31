import { useState } from "react";
import bgSidebar from "../assets/images/fondogob.jpg";

const generalTasks = [
  { label: "Tablero de control", color: "text-[#79142A]", view: "tablero-control" },
  { label: "Buscador de documentos", color: "text-[#60595D]", view: "buscador-documento" },
  { label: "Registra documento y genera notas de atención", color: "text-[#79142A]", view: "registra-documento" },
  { label: "Reporte de asuntos", color: "text-[#60595D]", view: "reporte-asuntos" },
  { label: "Reporte de acuerdos", color: "text-[#79142A]", view: "reporte-acuerdos" },
  { label: "Generación de Oficios", color: "text-[#60595D]", view: "generacion-oficios" },
  { label: "Control de Oficios", color: "text-[#79142A]", view: "control-oficios" },
  { label: "Registro Salida de Correspondencia", color: "text-[#60595D]", view: "salida-correspondencia" },
  { label: "Modifica Salida de Correspondencia", color: "text-[#79142A]", view: "modificaS-correspondencia" },
  { label: "Consulta Salida de Correspondencia", color: "text-[#60595D]", view: "consultaS-correspondencia" },
  { label: "Reporte Salida de Correspondencia", color: "text-[#79142A]", view: "reporteS-correspondencia" },
  { label: "Tablero de control Salida de Correspondencia", color: "text-[#60595D]", view: "tableroS-correspondencia" },
  { label: "Registra instrucciones, solicitudes y notificaciones internas", color: "text-[#79142A]", view: "registra-notinternas" }
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
      style={{
        backgroundImage: `url(${bgSidebar})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      className={`border-r flex flex-col transition-all duration-300 ${
        isOpen ? "w-64" : "w-0 overflow-hidden"
      }`}
    >
    <div className="p-4 border-b border-[60595D]-200">
        <h2 className="text-sm text-[60595D]-700 mb-3">Roles Disponibles</h2>

        <select className="w-full px-3 py-2 text-sm border border-[60595D]-300 rounded bg-white text-[60595D]-700 focus:outline-none focus:ring-2 focus:ring-[#79142A] focus:border-transparent">
          <option>Archivos General de la Nación</option>
          <option>Administrador General</option>
          <option>Usuario Estándar</option>
          <option>Supervisor</option>
        </select>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-sm text-[60595D]-700 mb-2">Tareas Generales</h3>

        <div className="bg-white border border-[#60595D]-200 rounded flex flex-col h-70">

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
                      ? "bg-[#79142A] text-white"
                      : `${task.color} hover:bg-[#60595D]-50`
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
                      ? "bg-[#60595D]-200 text-[#60595D]-400 cursor-not-allowed"
                      : "bg-white hover:bg-[#60595D]-100"
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
                            ? "bg-[#79142A] text-white"
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