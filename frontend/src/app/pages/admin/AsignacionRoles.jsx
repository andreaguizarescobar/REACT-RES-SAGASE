import { Minus, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getUsers, updateUser } from "../../services/user.service.js";
import Swal from "sweetalert2";

export function AsignacionRoles() {
  const [criterio, setCriterio] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menu, setMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    user: null,
  });

  const [modalRol, setModalRol] = useState({
    visible: false,
    user: null,
    modo: "asignar",
  });

  const [formRol, setFormRol] = useState({
    rol: "",
  });

  const roles = [
    "ADMIN",
    "REGISTRADOR",
    "EJECUTOR",
    "VALIDADOR",
  ];

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await getUsers(token);

      if (!response.ok) {
        setError("No se pudieron cargar los usuarios.");
        return;
      }

      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      console.error("Error cargando usuarios:", fetchError);
      setError("Error de red al cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getUserRole = (user) => {
    const primaryRole = user.roles?.[0] || {};
    return primaryRole.rol || null;
  };

  const filteredUsers = users.filter((user) => {
    const texto = criterio.toLowerCase();
    const rol = getUserRole(user);

    return (
      (user.nombre?.toLowerCase().includes(texto) ||
        user.username?.toLowerCase().includes(texto) ||
        user.userId?.toLowerCase().includes(texto) ||
        rol?.toLowerCase().includes(texto))
    );
  });

  const handleClick = (e, user) => {
    e.stopPropagation();
    setMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      user,
    });
  };

  const cerrarMenu = () => {
    setMenu({ ...menu, visible: false, user: menu.user });
  };

  const handleAsignar = () => {
    const rol = getUserRole(menu.user);
    setModalRol({
      visible: true,
      user: menu.user,
      modo: rol ? "editar" : "asignar",
    });
    setFormRol({ rol: rol || "" });
    cerrarMenu();
  };

  const handleEliminar = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await updateUser(menu.user.userId, { roles: [] }, token);

      if (!response.ok) {
        console.error("Error eliminando rol:", response.statusText);
        return;
      }

      await fetchUsers();
      cerrarMenu();
    } catch (error) {
      console.error("Error eliminando rol:", error);
    }
  };

  const handleSaveRole = async () => {
    if (!formRol.rol) {
      Swal.fire({
        toast: true,
        icon: "warning",
        position: "top-end",
        title: "Rol no seleccionado",
        text: "Seleccione un rol antes de guardar.",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });
      return;
    }

    // Confirmación antes de guardar
    const result = await Swal.fire({
      title: "¿Guardar cambios?",
      text: `Se asignará el rol "${formRol.rol}" al usuario.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, guardar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#8B1538",
      cancelButtonColor: "#6B7280",
      reverseButtons: true,
    });
    
    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await updateUser(
        modalRol.user.userId,
        { roles: [{ rol: formRol.rol }] },
        token
      );

      if (!response.ok) {
        console.error("Error guardando rol:", response.statusText);

        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo guardar el rol.",
          confirmButtonColor: "#8B1538",
        });

        return;
      }

      await fetchUsers();
      setModalRol({ visible: false, user: null, modo: "asignar" });
      setMenu({ ...menu, visible: false, user: null });

       Swal.fire({
        icon: "success",
        title: "Rol asignado",
        text: "El rol se guardó correctamente.",
        timer: 2500,
        showConfirmButton: false,
        position: "top-end",
        toast: true,
        timerProgressBar: true,
      });
      
    } catch (saveError) {
      console.error("Error guardando rol:", saveError);
      
       Swal.fire({
        icon: "error",
        title: "Ocurrió un error",
        text: "No fue posible guardar el rol.",
        confirmButtonColor: "#8B1538",
      });
    }
  };

  return (
    <div
      className="flex-1 p-6 bg-gray-100 overflow-y-auto"
      onClick={cerrarMenu}
    >
      {/* HEADER */}
      <div className="bg-gray-300 rounded-t-md flex items-center justify-between px-4 py-2">
        <h1 className="text-sm font-semibold text-gray-800">
          Asignación de roles a usuarios
        </h1>

        <button className="w-6 h-6 flex items-center justify-center rounded-full bg-[#8B1538] text-white">
          <Minus size={14} />
        </button>
      </div>

      {/* CONTENIDO */}
      <div className="bg-white p-6 rounded-b-md shadow-sm space-y-6 text-xs">
        {/* BUSCADOR */}
        <input
          type="text"
          value={criterio}
          onChange={(e) => setCriterio(e.target.value)}
          className="w-full border rounded px-2 py-2"
          placeholder="Buscar..."
        />

        {/* TABLA */}
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-xs">
            <thead className="bg-[#8B1538] text-white">
              <tr>
                <th className="px-3 py-2 text-left">Nombre</th>
                <th className="px-3 py-2 text-left">Usuario</th>
                <th className="px-3 py-2 text-left">Rol</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-10 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                      <Loader2 className="animate-spin" size={24} />
                      <span>Cargando usuarios...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => {
                  const rol = getUserRole(user);

                  return (
                    <motion.tr
                        key={index}
                        onClick={(e) => handleClick(e, user)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="cursor-pointer hover:bg-gray-50"
                    >
                      <td className="px-3 py-2">{user.nombre}</td>

                      <td className="px-3 py-2">{user.username}</td>

                      <td className="px-3 py-2">
                        {rol || (
                          <span className="italic">Sin asignar</span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔥 MENÚ CONTEXTUAL */}
      <AnimatePresence>
        {menu.visible && (
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bg-white border shadow-md rounded text-xs z-50"
            style={{
              top: menu.y,
              left: menu.x,
            }}
          >
            <button
              onClick={handleAsignar}
              className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
            >
              Asignar/Cambiar rol
            </button>

            <button
              onClick={handleEliminar}
              className="block px-4 py-2 hover:bg-red-100 text-red-600 w-full text-left"
            >
              Eliminar rol
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalRol.visible && (
          <motion.div
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,.4)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="
                relative
                bg-white
                w-full
                max-w-2xl
                max-h-[90vh]
                rounded-md
                shadow-xl
                overflow-hidden
                flex
                flex-col
              "
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
            >
              {/* HEADER */}
              <div className="bg-gray-300 flex items-center justify-between px-4 py-2 shrink-0">
                <h2 className="text-sm font-semibold text-gray-800">
                  {modalRol.modo === "editar"
                    ? "Cambiar rol de usuario"
                    : "Asignar rol a usuario"}
                </h2>

                <button
                  onClick={() => setModalRol({ ...modalRol, visible: false })}
                  className="w-6 h-6 flex items-center justify-center rounded-full bg-[#8B1538] text-white"
                >
                  <Minus size={14} />
                </button>
              </div>

              {/* CONTENIDO */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-2">
                    <label className="block mb-1">Nombre</label>
                    <input
                      value={modalRol.user?.nombre}
                      readOnly
                      className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-gray-600"
                    />
                  </div>

                  <div className="md:col-span-1">
                    <label className="block mb-1">Usuario</label>
                    <input
                      value={modalRol.user?.username || ""}
                      readOnly
                      className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-gray-600"
                    />
                  </div>
                </div>

                {/* ROL */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-2">
                  <label className="block mb-1">Rol:</label>
                  <select
                    value={formRol.rol}
                    onChange={(e) =>
                      setFormRol({ ...formRol, rol: e.target.value })
                    }
                    className="
                      w-full
                      rounded-lg
                      border
                      border-gray-300
                      px-3
                      py-2.5
                      transition
                      focus:border-[#8B1538]
                      focus:ring-2
                      focus:ring-[#8B1538]/20
                      outline-none
                    "
                  >
                    <option value="">Seleccionar rol</option>
                    {roles.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                  </div>
                </div>

                {/* BOTÓN */}
                <div className="flex justify-center pt-2">
                  <button
                    onClick={handleSaveRole}
                    className="
                        bg-[#8B1538]
                        text-white
                        font-medium
                        px-10
                        py-3
                        rounded-lg
                        hover:bg-[#6f102c]
                        transition
                        shadow-md
                        hover:shadow-lg
                      "
                    >
                    Guardar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
