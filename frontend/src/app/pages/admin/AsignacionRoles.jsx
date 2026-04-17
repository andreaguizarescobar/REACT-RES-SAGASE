import { Minus } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getUsers, updateUser } from "../../services/user.service.js";

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
    proceso: "",
    rol: "",
  });

  const procesos = [
    "Correspondencia",
    "Finanzas",
    "Gestión de instrucciones y solicitudes",
  ];

  const roles = [
    "Administrador",
    "Ejecutor",
    "Registrador Enrutador",
    "Validador de respuesta",
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
      console.log("Usuarios cargados:", data);
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
    console.log(`Roles del usuario ${user.username}:`, primaryRole.rol);
    return {
      proceso: primaryRole.proceso || null,
      rol: primaryRole.rol || null,
    };
  };

  const filteredUsers = users.filter((user) => {
    const texto = criterio.toLowerCase();
    const { proceso, rol } = getUserRole(user);

    return (
      (user.nombre?.toLowerCase().includes(texto) ||
        user.username?.toLowerCase().includes(texto) ||
        user.userId?.toLowerCase().includes(texto) ||
        proceso?.toLowerCase().includes(texto) ||
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
    setModalRol({
      visible: true,
      user: menu.user,
      modo: "asignar",
    });
    setFormRol({ proceso: "", rol: "" });
    cerrarMenu();
  };

  const handleEditar = () => {
    const { proceso, rol } = getUserRole(menu.user);
    setModalRol({
      visible: true,
      user: menu.user,
      modo: "editar",
    });
    setFormRol({ proceso: proceso || "", rol: rol || "" });
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
    if (!formRol.proceso || !formRol.rol) {
      alert("Selecciona proceso y rol antes de guardar.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await updateUser(
        modalRol.user.userId,
        { roles: [{ rol: formRol.rol, proceso: formRol.proceso }] },
        token
      );

      if (!response.ok) {
        console.error("Error guardando rol:", response.statusText);
        alert("No se pudo guardar el rol. Revisa la consola.");
        return;
      }

      await fetchUsers();
      setModalRol({ visible: false, user: null, modo: "asignar" });
      setMenu({ ...menu, visible: false, user: null });
    } catch (saveError) {
      console.error("Error guardando rol:", saveError);
      alert("Ocurrió un error al guardar el rol.");
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
                <th className="px-3 py-2 text-left">Proceso</th>
                <th className="px-3 py-2 text-left">Rol</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user, index) => {
                const sinAsignar = !user.proceso && !user.rol;

                return (
                  <tr
                    key={index}
                    onClick={(e) => handleClick(e, user)}
                    className={`border-t cursor-pointer ${
                      sinAsignar
                        ? "bg-gray-100 text-gray-400"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <td className="px-3 py-2">{user.nombre}</td>
                    <td className="px-3 py-2">{user.username}</td>
                    <td className="px-3 py-2">
                      {user.proceso || (
                        <span className="italic">Sin asignar</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {user.rol || (
                        <span className="italic">Sin asignar</span>
                      )}
                    </td>
                  </tr>
                );
              })}
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
            {/* SI NO TIENE ROL */}
            {!menu.user?.rol && (
              <button
                onClick={handleAsignar}
                className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
              >
                Asignar rol
              </button>
            )}

            {/* SI YA TIENE */}
            {menu.user?.rol && (
              <>
                <button
                  onClick={handleEditar}
                  className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                >
                  Editar rol
                </button>

                <button
                  onClick={handleEliminar}
                  className="block px-4 py-2 hover:bg-red-100 text-red-600 w-full text-left"
                >
                  Eliminar rol
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalRol.visible && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-[9999]"
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white w-[700px] rounded shadow-lg relative"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
            >
              {/* HEADER */}
              <div className="bg-gray-300 px-4 py-2 text-xs font-semibold text-gray-700">
                {modalRol.modo === "editar"
                  ? "Editar rol de usuario"
                  : "Asignar rol a usuario"}
              </div>

              {/* CERRAR */}
              <button
                onClick={() => setModalRol({ ...modalRol, visible: false })}
                className="absolute top-1 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-[#8B1538] text-white"
              >
                <Minus size={14} />
              </button>

              {/* CONTENIDO */}
              <div className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">Nombre:</label>
                    <input
                      value={modalRol.user?.nombre}
                      readOnly
                      className="w-full border rounded px-2 py-2 bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">Usuario:</label>
                    <input
                      value={modalRol.user?.usuario}
                      readOnly
                      className="w-full border rounded px-2 py-2 bg-gray-100"
                    />
                  </div>
                </div>

                {/* PROCESO */}
                <div>
                  <label className="block mb-1">Proceso:</label>
                  <select
                    value={formRol.proceso}
                    onChange={(e) =>
                      setFormRol({ ...formRol, proceso: e.target.value })
                    }
                    className="w-full border rounded px-2 py-2"
                  >
                    <option value="">Seleccionar proceso</option>
                    {procesos.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* ROL */}
                <div>
                  <label className="block mb-1">Rol:</label>
                  <select
                    value={formRol.rol}
                    onChange={(e) =>
                      setFormRol({ ...formRol, rol: e.target.value })
                    }
                    className="w-full border rounded px-2 py-2"
                  >
                    <option value="">Seleccionar rol</option>
                    {roles.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* BOTÓN */}
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() =>
                      alert(
                        `${modalRol.modo === "editar" ? "Editado" : "Asignado"} correctamente`
                      )
                    }
                    className="bg-[#79142A] text-white px-12 py-2 rounded hover:opacity-90"
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
