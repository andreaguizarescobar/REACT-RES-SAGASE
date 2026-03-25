import { useState } from "react";

const generalTasks = [
  { label: "Proyectos", color: "text-[#8B1538]", view: "proyectos-admin" },
  { label: "Usuarios", color: "text-gray-600", view: "usuarios-admin" },
  { label: "Roles", color: "text-[#8B1538]", view: "roles-admin" },
  { label: "Roles de Sistema", color: "text-gray-600", view: "roles-sistema-admin" },
  { label: "Alta de Usuarios", color: "text-[#8B1538]", view: "alta-usuarios-admin" },
  { label: "Asignación de Roles", color: "text-gray-600", view: "asignacion-roles-admin" }
];

export function SidebarAdmin({ isOpen, onSelectView }) {
  const [selectedTask, setSelectedTask] = useState(null);

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
        <h3 className="text-sm text-gray-700 mb-2">
          Tareas del Administrador
        </h3>

        <div className="bg-white border border-gray-200 rounded flex flex-col h-70">
          <div className="p-2 flex-1 overflow-y-auto">
            <nav className="space-y-0.5">
              {generalTasks.map((task, index) => (
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
        </div>
      </div>
    </aside>
  );
}
