import { useState } from "react";
import bgSidebar from "../assets/images/fondogob.jpg";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Search,
  FilePlus,
  FileText,
  ClipboardList,
  Mail,
  FolderOpen,
  Send,
  Edit,
  Eye,
  BarChart3,
  Bell,
  FolderKanban,
  Users,
  Shield,
  UserPlus,
  UserCheck,
} from "lucide-react";

// const generalTasks = [
//   { label: "Tablero de control", color: "text-[#79142A]", view: "tablero-control" },
//   { label: "Buscador de documentos", color: "text-[#60595D]", view: "buscador-documento" },
//   { label: "Registra documento y genera notas de atención", color: "text-[#79142A]", view: "registra-documento" },
//   { label: "Reporte de asuntos", color: "text-[#60595D]", view: "reporte-asuntos" },
//   { label: "Reporte de acuerdos", color: "text-[#79142A]", view: "reporte-acuerdos" },
//   { label: "Generación de Oficios", color: "text-[#60595D]", view: "generacion-oficios" },
//   { label: "Control de Oficios", color: "text-[#79142A]", view: "control-oficios" },
//   { label: "Registro Salida de Correspondencia", color: "text-[#60595D]", view: "salida-correspondencia" },
//   { label: "Modifica Salida de Correspondencia", color: "text-[#79142A]", view: "modificaS-correspondencia" },
//   { label: "Consulta Salida de Correspondencia", color: "text-[#60595D]", view: "consultaS-correspondencia" },
//   { label: "Reporte Salida de Correspondencia", color: "text-[#79142A]", view: "reporteS-correspondencia" },
//   { label: "Tablero de control Salida de Correspondencia", color: "text-[#60595D]", view: "tableroS-correspondencia" },
//   { label: "Registra instrucciones, solicitudes y notificaciones internas", color: "text-[#79142A]", view: "registra-notinternas" }
// ];

const tareasPorRol = {
  VALIDADOR: [
    {
      label: "Generación de oficios",
      color: "text-[#60595D]",
      view: "generacion-oficios",
      icon: Mail,
    },
    {
      label: "Control de oficios",
      color: "text-[#79142A]",
      view: "control-oficios",
      icon: FolderOpen,
    },
    {
      label: "Tablero de control",
      color: "text-[#60595D]",
      view: "tablero-control",
      icon: LayoutDashboard,
    }
  ],

  EJECUTOR: [
    {
      label: "Buscador de documentos",
      color: "text-[#60595D]",
      view: "buscador-documento",
      icon: Search,
    },
    {
      label: "Reporte de asuntos",
      color: "text-[#79142A]",
      view: "reporte-asuntos",
      icon: FileText,
    },
    {
      label: "Reporte de acuerdos",
      color: "text-[#60595D]",
      view: "reporte-acuerdos",
      icon: ClipboardList,
    },
    {
      label: "Generación de oficios",
      color: "text-[#79142A]",
      view: "generacion-oficios",
      icon: Mail,
    },
    {
      label: "Control de oficios",
      color: "text-[#60595D]",
      view: "control-oficios",
      icon: FolderOpen,
    },
    // {
    //   label: "Registra instrucciones, solicitudes y notificaciones internas",
    //   color: "text-[#79142A]",
    //   view: "registra-notinternas",
    //   icon: Bell,
    // },
    {
      label: "Tablero de control",
      color: "text-[#60595D]",
      view: "tablero-control",
      icon: LayoutDashboard,
    }
  ],

  REGISTRADOR: [
    {
      label: "Buscador de documentos",
      color: "text-[#60595D]",
      view: "buscador-documento",
      icon: Search,
    },
    {
      label: "Registra documento y genera notas de atención",
      color: "text-[#79142A]",
      view: "registra-documento",
      icon: FilePlus,
    },
    {
      label: "Reporte de asuntos",
      color: "text-[#60595D]",
      view: "reporte-asuntos",
      icon: FileText,
    },
    {
      label: "Reporte de acuerdos",
      color: "text-[#79142A]",
      view: "reporte-acuerdos",
      icon: ClipboardList,
    },
    {
      label: "Generación de Oficios",
      color: "text-[#60595D]",
      view: "generacion-oficios",
      icon: Mail,
    },
    {
      label: "Control de Oficios",
      color: "text-[#79142A]",
      view: "control-oficios",
      icon: FolderOpen,
    },
    {
      label: "Registro Salida de Correspondencia",
      color: "text-[#60595D]",
      view: "salida-correspondencia",
      icon: Send,
    },
    {
      label: "Consulta Salida de Correspondencia",
      color: "text-[#79142A]",
      view: "consultaS-correspondencia",
      icon: Eye,
    },
    {
      label: "Reporte Salida de Correspondencia",
      color: "text-[#60595D]",
      view: "reporteS-correspondencia",
      icon: BarChart3,
    },
    {
      label: "Tablero de control",
      color: "text-[#79142A]",
      view: "tablero-control",
      icon: LayoutDashboard,
    }
  ],

  ADMIN: [
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
      label: "Roles",
      color: "text-[#79142A]",
      view: "roles-admin",
      icon: Shield,
    },
    {
      label: "Roles de Sistema",
      color: "text-[#60595D]",
      view: "roles-sistema-admin",
      icon: Shield,
    },
    {
      label: "Alta de Usuarios",
      color: "text-[#79142A]",
      view: "alta-usuarios-admin",
      icon: UserPlus,
    },
    {
      label: "Solicitudes de Usuarios",
      color: "text-[#79142A]",
      view: "solicitudes-usuarios-admin",
      icon: UserCheck,
    },
    {
      label: "Asignación de Roles",
      color: "text-[#60595D]",
      view: "asignacion-roles-admin",
      icon: Shield,
    },
  ],
};

const nombreRoles = {
  VALIDADOR: "Secretaria particular",
  REGISTRADOR: "Registrador Enrutador",
  EJECUTOR: "Ejecutor",
  ADMIN: "Archivo de correspondencia"
};

export function Sidebar({ isOpen, onSelectView }) {
  const user = JSON.parse(localStorage.getItem("user"));

  const rol = user?.roles?.length > 0
  ? user.roles[0].rol?.toUpperCase().trim()
  : "REGISTRADOR";

  const tareas = tareasPorRol[rol] || [];
  
  const [paginaActual, setPaginaActual] = useState(1);
  const [selectedTask, setSelectedTask] = useState(null);

  const filasPorPagina = 5;

  const totalPaginas = Math.ceil(tareas.length / filasPorPagina);

  const indiceInicio = (paginaActual - 1) * filasPorPagina;

  const tareasPaginadas = tareas.slice(
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
      className={`border-r flex flex-col transition-all duration-300 h-screen overflow-hidden ${
        isOpen ? "w-64" : "w-0"
      }`}
    >
      
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="p-4 flex flex-col min-h-full">
        <h3 className="text-sm text-[#60595D]-700 mb-2">Tareas Generales</h3>

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
                
                  <div className="flex items-start gap-2">
                    {task.icon && (
                      <task.icon
                        size={18}
                        className="flex-shrink-0 mt-0.5"
                      />
                    )}
                    <span>{task.label}</span>
                  </div>
                </button>
              ))}
            </nav>

          </div>

          {/* PAGINACIÓN */}
          {tareas.length > 0 && totalPaginas > 1 && (
            <div className="border-t border-gray-100 px-3 py-3 bg-white">
              <div className="flex items-center justify-center gap-2">

                {/* ANTERIOR */}
                <button
                  onClick={() =>
                    setPaginaActual((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={paginaActual === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm hover:bg-[#79142A] hover:text-white hover:border-[#79142A] transition-all duration-200 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-400"
                >
                  <ChevronLeft size={16} />
                </button>

                {/* NÚMEROS */}
                <div className="flex items-center gap-2">
                  {(() => {
                    const maxVisible = 3;

                    let inicio = Math.max(1, paginaActual - 1);
                    let fin = inicio + maxVisible - 1;

                    if (fin > totalPaginas) {
                      fin = totalPaginas;
                      inicio = Math.max(1, fin - maxVisible + 1);
                    }

                    return Array.from(
                      { length: fin - inicio + 1 },
                      (_, i) => {
                        const numeroPagina = inicio + i;

                        return (
                          <button
                            key={numeroPagina}
                            onClick={() => setPaginaActual(numeroPagina)}
                            className={`w-8 h-8 rounded-xl text-xs font-medium transition-all duration-200 ${
                              paginaActual === numeroPagina
                                ? "bg-[#79142A] text-white shadow-md scale-105"
                                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {numeroPagina}
                          </button>
                        );
                      }
                    );
                  })()}
                </div>

                {/* SIGUIENTE */}
                <button
                  onClick={() =>
                    setPaginaActual((prev) =>
                      Math.min(prev + 1, totalPaginas)
                    )
                  }
                  disabled={paginaActual === totalPaginas}
                  className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm hover:bg-[#79142A] hover:text-white hover:border-[#79142A] transition-all duration-200 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-400"
                >
                  <ChevronRight size={16} />
                </button>

              </div>
            </div>
          )}
        </div>
       <div className="p-4 border-t border-gray-200 space-y-3">

        {/* ROL */}
        <div>
          <h2 className="text-sm text-[#60595D]-700 mb-2">
            Rol de su usuario
          </h2>

          <div className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-100 text-gray-700">
            {user?.roles && user.roles.length > 0
              ? user.roles
                  .map((r) => {
                    const rolNormalizado = r.rol?.toUpperCase().trim();
                    return nombreRoles[rolNormalizado] || rolNormalizado;
                  })
                  .join(", ")
              : "Sin rol asignado"}
          </div>
        </div>

        {/* ÁREA SOLO PARA EJECUTOR */}
        {rol === "EJECUTOR" && (
          <div>
            <h2 className="text-sm text-[#60595D]-700 mb-2">
              Área del usuario
            </h2>

            <div className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-100 text-gray-700">
              {user?.area || "Sin área asignada"}
            </div>
          </div>
        )}

      </div>
              
              
        </div>
      </div>
     
    </aside>
  );
}