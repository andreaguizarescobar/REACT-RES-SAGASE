import { useState } from "react";
import { Pencil, Trash2, ArrowUpDown, Search, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function SistemRoles() {
  const [roles, setRoles] = useState([
    { id: 1, nombre: "Administracion_SAGA", estatus: "Activo" },
    { id: 5, nombre: "Supervisor", estatus: "Activo" },
    { id: 3, nombre: "Usuario", estatus: "Inactivo" },
    { id: 8, nombre: "Auditor", estatus: "Activo" },
    { id: 2, nombre: "Invitado", estatus: "Inactivo" },
  ]);

    const [rolesSistema, setRolesSistema] = useState([
        { id: 2, desc: "Administrador de proyecto", asignado: true },
        { id: 4, desc: "Arquitecto", asignado: false },
        { id: 6, desc: "Operador", asignado: true },
        { id: 7, desc: "Administrador de Base de Datos", asignado: false },
    ]);

    const [busqueda, setBusqueda] = useState("");
    const [columnaOrden, setColumnaOrden] = useState("id");
    const [ordenAsc, setOrdenAsc] = useState(true);

    const [modalOpen, setModalOpen] = useState(false);
    
    const [rolSeleccionado, setRolSeleccionado] = useState(null);

  const handleEliminar = (id) => {
    setRoles(roles.filter((r) => r.id !== id));
  };

  const handleEditar = (rol) => {
    setRolSeleccionado(rol);
    setModalOpen(true);
  };


  const handleCrear = () => {
    const nuevo = {
      id: Math.floor(Math.random() * 100),
      nombre: "Nuevo Rol",
      estatus: "Activo",
    };
    setRoles([...roles, nuevo]);
  };

  // 🔍 FILTRO GLOBAL
  const rolesFiltrados = roles.filter((rol) =>
    `${rol.id} ${rol.nombre} ${rol.estatus}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  // 🔥 ORDENAMIENTO
  const rolesOrdenados = [...rolesFiltrados].sort((a, b) => {
    if (columnaOrden === "id") {
      return ordenAsc ? a.id - b.id : b.id - a.id;
    }

    if (columnaOrden === "nombre") {
      return ordenAsc
        ? a.nombre.localeCompare(b.nombre)
        : b.nombre.localeCompare(a.nombre);
    }

    if (columnaOrden === "estatus") {
      return ordenAsc
        ? a.estatus.localeCompare(b.estatus)
        : b.estatus.localeCompare(a.estatus);
    }

    return 0;
  });

  const handleOrden = (columna) => {
    if (columnaOrden === columna) {
      setOrdenAsc(!ordenAsc);
    } else {
      setColumnaOrden(columna);
      setOrdenAsc(true);
    }
  };

  return (
    <div className="flex-1 p-6 bg-gray-100">
        <h2>Roles del Sistema</h2>
      {/* HEADER acciones */}
        <div className="flex items-center gap-3 mb-4 ">
        
        {/* Botón redondo con tooltip */}
        <div className="relative group">
            <button
                onClick={handleCrear}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-[#8B1538] text-white hover:scale-105 transition"
            >
                <Plus size={16} />
            </button>

            {/* Tooltip */}
            <div className="absolute left-1/2 -translate-x-1/2 
                            bg-gray-800 text-white text-[10px] px-2 py-1 rounded 
                            opacity-0 group-hover:opacity-100 
                            transition-all duration-200 
                            group-hover:-translate-y-1 
                            pointer-events-none whitespace-nowrap">
                Crear Usuario
            </div>
        </div>

        {/* Buscador */}
        <div className="relative w-72">
            <Search
            size={14}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
            type="text"
            placeholder="Buscar..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-7 pr-3 py-2 text-xs border rounded focus:outline-none focus:ring-2 focus:ring-[#8B1538]"
            />
        </div>

        </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded shadow-sm overflow-hidden"
      >
        <table className="w-full text-xs">
          {/* HEADER */}
          <thead className="bg-[#8B1538] text-white">
            <tr>
              <th className="px-4 py-2 text-left">
                <div
                  onClick={() => handleOrden("id")}
                  className="flex items-center gap-1 cursor-pointer"
                >
                  Id <ArrowUpDown size={12} />
                </div>
              </th>

              <th className="px-4 py-2 text-left">
                <div
                  onClick={() => handleOrden("nombre")}
                  className="flex items-center gap-1 cursor-pointer"
                >
                  Nombre <ArrowUpDown size={12} />
                </div>
              </th>

              <th className="px-4 py-2 text-left">
                <div
                  onClick={() => handleOrden("estatus")}
                  className="flex items-center gap-1 cursor-pointer"
                >
                  Estatus <ArrowUpDown size={12} />
                </div>
              </th>

              <th className="px-4 py-2 text-center">Eliminar</th>
              <th className="px-4 py-2 text-center">Editar</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {rolesOrdenados.map((rol) => (
              <tr key={rol.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 text-[#8B1538]">{rol.id}</td>

                <td className="px-4 py-2 text-[#8B1538]">
                  {rol.nombre}
                </td>

                <td className="px-4 py-2">
                  <span
                    className={
                      rol.estatus === "Activo"
                        ? "text-green-600"
                        : "text-gray-500"
                    }
                  >
                    {rol.estatus}
                  </span>
                </td>

                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => handleEliminar(rol.id)}
                    className="text-red-600 hover:scale-110"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>

                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => handleEditar(rol)}
                    className="text-[#8B1538] hover:scale-110"
                  >
                    <Pencil size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
    <AnimatePresence>
        {modalOpen && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white w-[700px] rounded shadow-lg overflow-hidden"
                >
                {/* HEADER */}
                <div className="bg-[#8B1538] text-white px-4 py-2 text-sm font-semibold flex justify-between">
                    <span>Roles de {rolSeleccionado?.nombre}</span>
                    <button onClick={() => setModalOpen(false)}>✕</button>
                </div>

                {/* CONTENIDO */}
                <div className="p-4 text-xs space-y-4">

                    {/* Tabla superior */}
                    <div className="border rounded overflow-hidden">
                    <table className="w-full text-xs">
                        <thead className="bg-gray-100">
                        <tr>
                            <th className="px-3 py-2 text-left">Id Usuario</th>
                            <th className="px-3 py-2 text-left">Nombre</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr className="border-t">
                            <td className="px-3 py-2 text-[#8B1538]">
                            {rolSeleccionado?.id}
                            </td>
                            <td className="px-3 py-2 text-[#8B1538]">
                            {rolSeleccionado?.nombre}
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    </div>

                    {/* Tabla inferior (roles asignados simulados) */}
                    <div className="border rounded overflow-hidden">
                    <table className="w-full text-xs">
                        <thead className="bg-[#8B1538] text-white">
                        <tr>
                            <th className="px-3 py-2 text-left">Id rol asignado</th>
                            <th className="px-3 py-2 text-left">Descripción</th>
                            <th className="px-3 py-2 text-left">Acción</th>

                        </tr>
                        </thead>

                        <tbody>
                        {rolesSistema.map((r) => (
                            <tr key={r.id} className="border-t">
                                <td className="px-3 py-2">{r.id}</td>

                                <td className="px-3 py-2">{r.desc}</td>

                                <td className="px-3 py-2">
                                    <div className="relative group w-fit">
                                        
                                        <span
                                        onClick={() =>
                                            setRolesSistema((prev) =>
                                            prev.map((item) =>
                                                item.id === r.id
                                                ? { ...item, asignado: !item.asignado }
                                                : item
                                            )
                                            )
                                        }
                                        className={`px-2 py-1 rounded-full text-[10px] font-medium cursor-pointer transition ${
                                            r.asignado
                                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                                            : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                                        }`}
                                        >
                                        {r.asignado ? "Asignado" : "No asignado"}
                                        </span>

                                        {/* Tooltip dinámico */}
                                        <div
                                        className="absolute left-1/2 -translate-x-1/2 -top-5
                                                    bg-gray-800 text-white text-[10px] px-2 py-1 rounded 
                                                    opacity-0 group-hover:opacity-100 
                                                    transition-all duration-200 
                                                    group-hover:-translate-y-1 
                                                    pointer-events-none whitespace-nowrap shadow-md"
                                        >
                                        {r.asignado
                                            ? "Quitar rol a usuario"
                                            : "Asignar rol a usuario"}
                                        </div>

                                    </div>
                                    </td>


                            </tr>
                        ))}
                        </tbody>

                    </table>
                    </div>

                </div>
                </motion.div>
            </div>
            )}
        </AnimatePresence>
      </motion.div>
    </div>

    
  );
}
