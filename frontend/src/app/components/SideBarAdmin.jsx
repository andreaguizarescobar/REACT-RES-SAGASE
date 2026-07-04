import { useEffect, useState } from "react";
import bgSidebar from "../assets/images/fondogob.jpg";
import {
  FolderKanban,
  Users,
  ShieldCheck,
  UserPlus,
  UserRoundCog,
  KeyRound,
  Building2,
  Layers3,
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
    label: "Gestión de Áreas",
    color: "text-[#79142A]",
    view: "gestion-areas-admin",
    icon: Building2,
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

export function SidebarAdmin({ isOpen, onSelectView, onSelectArea }) {
  const [selectedTask, setSelectedTask] = useState(null);
  const [areas, setAreas] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

  const cargarAreas = async () => {
    try {
      const response = await fetch("http://localhost:3333/areas/getAll");
      const data = await response.json();
      setAreas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar áreas para el sidebar:", error);
      setAreas([]);
    }
  };

  useEffect(() => {
    cargarAreas();
  }, []);

  const areasHijas = areas.filter((area) => area?.pertenece);

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

      {areasHijas.length > 0 && (
        <div className="p-4 border-t border-gray-200 space-y-3">
          <h2 className="text-sm text-[#60595D]-700">Áreas subordinadas</h2>
          <div className="space-y-2">
            {areasHijas.map((area) => (
              <button
                key={area._id}
                type="button"
                onClick={() => {
                  setSelectedTask(area.nombre || area.clave);
                  onSelectArea?.(area._id);
                  onSelectView("gestion-areas-admin");
                }}
                className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition ${
                  selectedTask === (area.nombre || area.clave)
                    ? "border-[#8B1538] bg-[#FBEFF2] text-[#8B1538]"
                    : "border-gray-200 bg-white text-gray-700 hover:border-[#8B1538] hover:bg-gray-50"
                }`}
              >
                <Layers3 size={14} className="flex-shrink-0" />
                <span>{area.nombre || area.clave}</span>
              </button>
            ))}
          </div>
        </div>
      )}

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
