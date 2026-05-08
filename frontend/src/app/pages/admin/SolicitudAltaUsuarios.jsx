import { Minus, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getUsers, updateUser } from "../../services/user.service.js";
import Swal from "sweetalert2";

export function SolicitudAltaUsuarios() {
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
        user.sexo?.toLowerCase().includes(texto) ||
        user.area?.toLowerCase().includes(texto) ||
        user.telefono?.toLowerCase().includes(texto) ||
        user.correo?.toLowerCase().includes(texto) ||
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

  const handleConfirmAprobar = async () => {
    const result = await Swal.fire({
        title: "¿Aprobar alta de usuario?",
        text: "El usuario quedará activo en el sistema para asignarle su rol.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#79142A",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Sí, aprobar",
        cancelButtonText: "Cancelar",
        backdrop: true,
        heightAuto: false,
        didOpen: () => {
           const container = document.querySelector(".swal2-container");
               if (container) {
            container.style.zIndex = "20000";
            }
        }
    });

    if (result.isConfirmed) {
        // 🔥 CERRAR MODAL AQUÍ
        setModalRol({ visible: false, user: null, modo: "asignar" });
        // await handleSaveRole();

        Swal.fire({
        toast: true,
        position: "top-end",
        title: "Aprobado",
        text: "El usuario ha sido dado de alta correctamente.",
        icon: "success",
        showConfirmButton: false,
        timer: 3000,
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
          Solicitudes de alta de usuarios
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
                <th className="px-3 py-2 text-left">Nombre completo</th>
                <th className="px-3 py-2 text-left">Sexo</th>
                <th className="px-3 py-2 text-left">Área</th>
                <th className="px-3 py-2 text-left">Teléfono institucional</th>
                <th className="px-3 py-2 text-left">Correo institucional</th>
              </tr>
            </thead>

            <tbody>
                {loading ? (
                    <tr>
                    <td colSpan="5" className="py-10 text-center">
                        <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                        <Loader2 className="animate-spin" size={24} />
                        <span>Cargando usuarios...</span>
                        </div>
                    </td>
                    </tr>
                ) : filteredUsers.length === 0 ? (
                    <tr>
                    <td colSpan="5" className="py-10 text-center text-gray-400 italic">
                        No hay resultados
                    </td>
                    </tr>
                ) : (
                    filteredUsers.map((user, index) => {
                    const sinAsignar = !user.proceso && !user.rol;

                    return (
                        <motion.tr
                        key={index}
                        onClick={(e) => handleClick(e, user)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={`border-t cursor-pointer ${
                            sinAsignar
                            ? "bg-gray-100 text-gray-400"
                            : "hover:bg-gray-100"
                        }`}
                        >
                        <td className="px-3 py-2">{user.nombre}</td>

                        <td className="px-3 py-2">
                            {user.sexo || <span className="italic">No disponible</span>}
                        </td>

                        <td className="px-3 py-2">
                            {user.area || <span className="italic">No disponible</span>}
                        </td>

                        <td className="px-3 py-2">
                            {user.telefono || (
                            <span className="italic">No disponible</span>
                            )}
                        </td>

                        <td className="px-3 py-2">
                            {user.correo || (
                            <span className="italic">No disponible</span>
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
            {/* SI NO TIENE ROL */}
            {!menu.user?.rol && (
              <button
                onClick={handleAsignar}
                className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
              >
                Ver solicitud de alta
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
              className="bg-white w-[850px] rounded shadow-lg relative"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
            >
              {/* HEADER */}
              <div className="bg-gray-300 px-4 py-2 text-sm font-semibold text-gray-700">
                Aprobar de alta de usuario.
              </div>
              {/* SUBTÍTULO */}
              <div className="px-4 pt-3 pb-1">
                <p className="text-xs text-gray-600 font-medium tracking-wide">
                    Se presentan los detalles de la solicitud de alta de usuario. Revise la información y, si todo es correcto, haga clic en "Aprobar alta" para completar su registro en el sistema.
                </p>
              <div className="h-[1px] bg-gray-200 mt-1"></div>
              </div>
     
              {/* CERRAR */}
              <button
                onClick={() => setModalRol({ ...modalRol, visible: false })}
                className="absolute top-1 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-[#8B1538] text-white"
              >
                <Minus size={14} />
              </button>

              {/* CONTENIDO */}
              <div className="p-6 space-y-4 text-xs ">

                {/* FILA 1 */}
                <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-2">
                    <label className="block mb-1">Nombre Completo:</label>
                    <input
                        value={modalRol.user?.nombre || ""}
                        readOnly
                        className="w-full border rounded px-2 py-1 bg-gray-100"
                    />
                    </div>

                    <div className="col-span-1">
                    <label className="block mb-1">Iniciales:</label>
                    <input
                        value={modalRol.user?.iniciales || ""}
                        readOnly
                        className="w-full border rounded px-2 py-1 bg-gray-100"
                    />
                    </div>
                </div>

                {/* FILA 2 */}
                <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-1">
                    <label className="block mb-1">Sexo:</label>
                    <input
                        value={modalRol.user?.sexo || ""}
                        readOnly
                        className="w-full border rounded px-2 py-2 bg-gray-100"
                    />
                    </div>
                </div>

                {/* FILA 3 */}
                <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-2">
                    <label className="block mb-1">Área de destino:</label>
                    <input
                        value={modalRol.user?.area || ""}
                        readOnly
                        className="w-full border rounded px-2 py-2 bg-gray-100"
                    />
                    </div>
                </div>

                {/* FILA 4 */}
                <div className="grid grid-cols-6 gap-4">
                    <div className="col-span-2">
                    <label className="block mb-0">Teléfono institucional:</label>
                    <input
                        value={modalRol.user?.telefono || ""}
                        readOnly
                        className="w-full border rounded px-2 py-1 bg-gray-100"
                    />
                    </div>

                    <div className="col-span-1">
                    <label className="block mb-0">Ext:</label>
                    <input
                        value={modalRol.user?.ext || ""}
                        readOnly
                        className="w-full border rounded px-2 py-1 bg-gray-100"
                    />
                    </div>
                </div>

                {/* FILA 5 */}
                <div className="grid grid-cols-2 gap-4 items-center">
                    <div>
                    <label className="block mb-1">Correo institucional:</label>
                    <input
                        value={modalRol.user?.correo || ""}
                        readOnly
                        className="w-full border rounded px-2 py-1 bg-gray-100"
                    />
                    </div>

                    <div className="flex items-center gap-2 mt-5">
                    <label>¿Recibe copia?</label>
                    <input
                        type="checkbox"
                        checked={modalRol.user?.copia || false}
                        readOnly
                        className="accent-[#8B1538]"
                    />
                    </div>
                </div>

                    <div className="flex justify-center pt-2">
                        <button
                        onClick={handleConfirmAprobar }
                        className="bg-[#79142A] text-white px-12 py-2 rounded hover:opacity-90"
                        >
                        Aprobar alta
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
