import { useState } from "react";
import bgSidebar from "../assets/images/fondogob.jpg";
import {
  FolderKanban,
  Users,
  ShieldCheck,
  UserPlus,
  UserRoundCog,
  KeyRound,
} from "lucide-react";

const generalTasks = [
  {
    label: "Proyectos",
    color: "text-[#79142A]",
    view: "proyectos-admin",
    icon: FolderKanban,
  },
  {
    label: "Usuarios",
    color: "text-[#60595D]",
    view: "usuarios-admin",
    icon: Users,
  },
  {
    label: "Roles de Sistema",
    color: "text-[#79142A]",
    view: "roles-sistema-admin",
    icon: ShieldCheck,
  },
  {
    label: "Alta de Usuarios",
    color: "text-[#60595D]",
    view: "alta-usuarios-admin",
    icon: UserPlus,
  },
  {
    label: "Solicitudes de Usuarios",
    color: "text-[#79142A]",
    view: "solicitudes-usuarios-admin",
    icon: UserRoundCog,
  },
  {
    label: "Asignación de Roles",
    color: "text-[#60595D]",
    view: "asignacion-roles-admin",
    icon: KeyRound,
  },
];

export function SidebarAdmin({ isOpen, onSelectView }) {
  const [selectedTask, setSelectedTask] = useState(null);

    const user = JSON.parse(localStorage.getItem("user"));

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

      <div className="p-4 flex flex-col">
        <h3 className="text-sm text-[#60595D]-700 mb-2">
          Tareas del Administrador
        </h3>

        <div className="bg-white border border-gray-200 rounded flex flex-col h-70">
          <div className="p-2 flex-1 overflow-y-auto">
            <nav className="space-y-0.5">
              {generalTasks.map((task, index) => {
                const Icon = task.icon;

                return (
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
                    <div className="flex items-center gap-2">
                      <Icon size={16} className="flex-shrink-0" />
                      <span>{task.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200">
        <h2 className="text-sm text-[#60595D]-700 mb-2">Rol de su usuario</h2>

        <div className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-100 text-gray-700">
          {user?.roles && user.roles.length > 0
            ? user.roles
                .map((r) => {
                  const rol = r.rol?.toUpperCase().trim();

                  if (rol === "ADMIN") {
                    return "Archivo de correspondencia";
                  }

                  return rol;
                })
                .join(", ")
            : "Sin rol asignado"}
        </div>
      </div>

    </aside>
  );
}
