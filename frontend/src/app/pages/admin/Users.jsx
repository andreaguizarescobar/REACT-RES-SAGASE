import { Minus, Loader2, Search, ChevronLeft,
  ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getUsers, updateUser, deleteUser } from "../../services/user.service.js";
import { getAreas } from "../../services/catalogos.service.js";
import Swal from "sweetalert2";

export function Users() {
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
    setMenu((prev) => ({
      ...prev,
      visible: false,
    }));
  };

  const handleModificar = () => {
    setFormEditar({
      nombre: menu.user.nombre || "",
      iniciales: menu.user.iniciales || "",
      sexo: menu.user.sexo || "",
      area: menu.user.area || "",
      telefono: menu.user.telefono || "",
      ext: menu.user.ext || "",
      email: menu.user.email || menu.user.correo || "",
      rol: menu.user.roles?.[0]?.rol || "",
      copia: menu.user.copia || false,
    });
    setBusquedaArea(menu.user.area || "");
    setMostrarOpcionesArea(false);

    setModalEditar({
      visible: true,
      user: menu.user,
    });

    cerrarMenu();
  };

  const handleEliminar = () => {
    setModalEliminar({
      visible: true,
      user: menu.user,
    });

    cerrarMenu();
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await getUsers(token);

      if (!response.ok) {
        setError("No se pudieron cargar los usuarios.");
        console.error("Error cargando usuarios:", response.status, response.statusText);
        return;
      }

      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      setError("Error de red al cargar los usuarios.");
      console.error("Error cargando usuarios:", fetchError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const cargarAreas = async () => {
      try {
        const response = await getAreas();
        if (response.ok) {
          const data = await response.json();
          setAreas(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error cargando áreas:", error);
      }
    };

    cargarAreas();
  }, []);

  // FILTRO EN TIEMPO REAL
  const filteredUsers = users.filter((user) => {
    const texto = criterio.toLowerCase();
    return (
      (user.nombre?.toLowerCase().includes(texto) ||
        user.iniciales?.toLowerCase().includes(texto) ||
        user.area?.toLowerCase().includes(texto) ||
        (user.email || user.correo)?.toLowerCase().includes(texto)) &&
      !user.roles?.some(r => r.rol.includes('ADMIN'))
    );
  });

  const mostrarValor = (valor, fallback = "N/A") => {
    if (
      valor === null ||
      valor === undefined ||
      (typeof valor === "string" && valor.trim() === "")
    ) {
      return (
        <span className="text-gray-400 italic">
          {fallback}
        </span>
      );
    }

    return valor;
  };

  const [modalEditar, setModalEditar] = useState({
    visible: false,
    user: null,
  });

  const [areas, setAreas] = useState([]);
  const [busquedaArea, setBusquedaArea] = useState("");
  const [mostrarOpcionesArea, setMostrarOpcionesArea] = useState(false);

  const [modalEliminar, setModalEliminar] = useState({
    visible: false,
    user: null,
  });

  const [formEditar, setFormEditar] = useState({
    nombre: "",
    iniciales: "",
    sexo: "",
    area: "",
    telefono: "",
    ext: "",
    email: "",
    rol: "",
    copia: false,
  });

  const areasFiltradas = areas.filter((area) =>
    (area.nombre || "")
      .toLowerCase()
      .includes(busquedaArea.toLowerCase())
  );

  const handleGuardarCambios = async () => {
    const result = await Swal.fire({
      title: "¿Guardar cambios?",
      text: "Se actualizará la información del usuario.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#8B1538",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, guardar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      focusCancel: true,
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await updateUser(
        modalEditar.user?.userId,
        {
          nombre: formEditar.nombre,
          iniciales: formEditar.iniciales,
          sexo: formEditar.sexo,
          area: formEditar.area,
          telefono: formEditar.telefono,
          ext: formEditar.ext,
          email: formEditar.email,
          roles: formEditar.rol ? [{ rol: formEditar.rol }] : [],
        },
        token
      );

      if (!response.ok) {
        throw new Error("No se pudo actualizar el usuario");
      }

      await fetchUsers();

      Swal.fire({
        icon: "success",
        title: "Usuario actualizado",
        text: "Los cambios se guardaron correctamente.",
        showConfirmButton: false,
        timer: 2000,
        position: "top-end",
        toast: true,
        timerProgressBar: true,
      });

      setModalEditar({
        visible: false,
        user: null,
      });
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No fue posible guardar los cambios.",
        confirmButtonColor: "#8B1538",
      });
    }
  };

  const handleEliminarConfirmado = async () => {
    // const result = await Swal.fire({
    //   title: "¿Eliminar usuario?",
    //   text: `Se eliminará a ${modalEliminar.user?.nombre || "este usuario"}.`,
    //   icon: "warning",
    //   showCancelButton: true,
    //   confirmButtonColor: "#dc2626",
    //   cancelButtonColor: "#6b7280",
    //   confirmButtonText: "Sí, eliminar",
    //   cancelButtonText: "Cancelar",
    //   reverseButtons: true,
    // });

    // if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await deleteUser(modalEliminar.user?.userId, token);

      if (!response.ok) {
        throw new Error("No se pudo eliminar el usuario");
      }

      await fetchUsers();
      
      setModalEliminar({
        visible: false,
        user: null,
      });

      Swal.fire({
        icon: "success",
        title: "Usuario eliminado",
        text: "El usuario se eliminó correctamente.",
        showConfirmButton: false,
        timer: 2000,
        position: "top-end",
        toast: true,
        timerProgressBar: true,
      });

    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No fue posible eliminar el usuario.",
        confirmButtonColor: "#8B1538",
      });
    }
  };

  const [paginaActual, setPaginaActual] = useState(1);

  const usuariosPorPagina = 10;

  const totalPaginas = Math.ceil(
    filteredUsers.length / usuariosPorPagina
  );

  const indiceInicio = (paginaActual - 1) * usuariosPorPagina;
  const indiceFin = indiceInicio + usuariosPorPagina;

  const usuariosPaginados = filteredUsers.slice(
    indiceInicio,
    indiceFin
  );

  return (
    <div className="flex-1 p-6 bg-gray-100 overflow-y-auto" onClick={cerrarMenu}>
      {/* HEADER */}
      <div className="bg-gray-300 rounded-t-md flex items-center justify-between px-4 py-2">
        <h1 className="text-sm font-semibold text-gray-800">
          Consulta de usuarios
        </h1>

        <button className="w-6 h-6 flex items-center justify-center rounded-full bg-[#8B1538] text-white">
          <Minus size={14} />
        </button>
      </div>

      {/* CONTENIDO */}
      <div className="bg-white p-6 rounded-b-md shadow-sm space-y-6 text-xs">
        {/* BUSCADOR */}
        <div>
          {/* <label className="block mb-2 font-medium">
            Buscar un usuario.
          </label> */}

          <input
            type="text"
            value={criterio}
            onChange={(e) => {
              setCriterio(e.target.value);
              setPaginaActual(1);
            }}
            className="w-full border rounded px-2 py-2"
            placeholder="Buscar por nombre, iniciales, área, correo..."
          />
        </div>

        {/* TABLA */}
        <AnimatePresence>
          <motion.div
            key="tabla"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="overflow-x-auto border rounded"
          >
            <table className="min-w-full text-xs">
              <thead className="bg-[#8B1538] text-white">
                <tr>
                  <th className="px-3 py-2 text-left">Nombre</th>
                  <th className="px-3 py-2 text-left">Iniciales</th>
                  <th className="px-3 py-2 text-left">Sexo</th>
                  <th className="px-3 py-2 text-left">Área</th>
                  <th className="px-3 py-2 text-left">Teléfono</th>
                  <th className="px-3 py-2 text-left">Ext</th>
                  <th className="px-3 py-2 text-left">Correo</th>
                  {/* <th className="px-3 py-2 text-left">Copia</th> */}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-6">
                      <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                        <Loader2 className="animate-spin" size={22} />
                        <span>Cargando usuarios...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : filteredUsers.length > 0 ? (
                  usuariosPaginados.map((user, index) => (
                    <motion.tr
                      key={index}
                      onClick={(e) => handleClick(e, user)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="cursor-pointer hover:bg-gray-100"
                    >
                      <td className="px-3 py-2">{mostrarValor(user.nombre)}</td>

                      <td className="px-3 py-2">{mostrarValor(user.iniciales)}</td>

                      <td className="px-3 py-2">{mostrarValor(user.sexo)}</td>

                      <td className="px-3 py-2">{mostrarValor(user.area)}</td>

                      <td className="px-3 py-2">{mostrarValor(user.telefono)}</td>

                      <td className="px-3 py-2">{mostrarValor(user.ext)}</td>

                      <td className="px-3 py-2">
                        {mostrarValor(user.email || user.correo)}
                      </td>
                      {/* 
                      <td className="px-3 py-2">
                        {user.copia === true ? (
                          "Sí"
                        ) : user.copia === false ? (
                          "No"
                        ) : (
                          <span className="text-gray-400 italic">N/A</span>
                        )}
                      </td> */}
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-gray-500">
                      No hay resultados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </motion.div>
        </AnimatePresence>

        {/* PAGINACIÓN */}
        {filteredUsers.length > 0 && totalPaginas > 1 && (
          <div className="border-t border-gray-100 px-3 py-3 bg-white rounded-b-md">
            <div className="flex items-center justify-center gap-2">

              {/* ANTERIOR */}
              <button
                onClick={() =>
                  setPaginaActual((prev) => Math.max(prev - 1, 1))
                }
                disabled={paginaActual === 1}
                className="
                  w-8 h-8 flex items-center justify-center
                  rounded-xl border border-gray-200 bg-white shadow-sm
                  hover:bg-[#8B1538] hover:text-white hover:border-[#8B1538]
                  transition-all duration-200
                  disabled:opacity-30
                  disabled:hover:bg-white
                  disabled:hover:text-gray-400
                "
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
                    inicio = Math.max(
                      1,
                      fin - maxVisible + 1
                    );
                  }

                  return Array.from(
                    { length: fin - inicio + 1 },
                    (_, i) => {
                      const numeroPagina = inicio + i;

                      return (
                        <button
                          key={numeroPagina}
                          onClick={() =>
                            setPaginaActual(numeroPagina)
                          }
                          className={`w-8 h-8 rounded-xl text-xs font-medium transition-all duration-200 ${
                            paginaActual === numeroPagina
                              ? "bg-[#8B1538] text-white shadow-md scale-105"
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
                className="
                  w-8 h-8 flex items-center justify-center
                  rounded-xl border border-gray-200 bg-white shadow-sm
                  hover:bg-[#8B1538] hover:text-white hover:border-[#8B1538]
                  transition-all duration-200
                  disabled:opacity-30
                  disabled:hover:bg-white
                  disabled:hover:text-gray-400
                "
              >
                <ChevronRight size={16} />
              </button>

            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {menu.visible && (
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed bg-white border shadow-lg rounded-md text-xs z-50 overflow-hidden"
            style={{
              top: menu.y,
              left: menu.x,
            }}
          >
            <button
              onClick={handleModificar}
              className="block w-full px-4 py-2 text-left hover:bg-gray-100 transition"
            >
              Modificar usuario
            </button>

            <button
              onClick={handleEliminar}
              className="block w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition"
            >
              Eliminar usuario
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalEditar.visible && (

          <motion.div
            className="
            fixed
            inset-0
            z-[1000]
            flex
            items-center
            justify-center
            overflow-y-auto
            p-3
            sm:p-4
            md:p-6
            "
            style={{ backgroundColor: "rgba(0,0,0,.4)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >

            <motion.div
              className="
              w-full
              max-w-5xl
              max-h-[92vh]
              flex
              flex-col
              rounded-md
              bg-white
              shadow-xl
              overflow-hidden
              "
              initial={{ scale: .95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: .95, opacity: 0, y: 20 }}
            >

              {/* HEADER */}

              <div className="bg-gray-300 flex justify-between items-center px-4 py-3">

                <h2 className="text-sm md:text-base font-semibold text-gray-800">
                    Modificar usuario
                </h2>

                <button
                  onClick={() => setModalEditar({ visible: false, user: null })}
                  className="w-8 h-8 rounded-full bg-[#8B1538] text-white flex justify-center items-center"
                >

                  <Minus size={16} />

                </button>

              </div>

              <div
                className="
                flex-1
                overflow-y-auto
                p-4
                sm:p-5
                md:p-6
                space-y-6
                ">

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-300" />
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-[#8B1538]">
                    Información personal
                  </h3>
                  <div className="flex-1 h-px bg-gray-300" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

                  <div className="md:col-span-2">

                    <label>Nombre</label>

                    <input
                      value={formEditar.nombre}
                      onChange={(e) => setFormEditar({ ...formEditar, nombre: e.target.value })}
                      className="w-full rounded-lg border px-3 py-2 bg-gray-100"
                      disabled
                    />

                  </div>

                  <div>

                    <label>Iniciales</label>

                    <input
                      value={formEditar.iniciales}
                      onChange={(e) => setFormEditar({ ...formEditar, iniciales: e.target.value })}
                      className="w-full rounded-lg border px-3 py-2 bg-gray-100"
                      disabled
                    />

                  </div>

                  <div>

                    <label>Sexo</label>

                    <select
                      value={formEditar.sexo}
                      onChange={(e) => setFormEditar({ ...formEditar, sexo: e.target.value })}
                      className="w-full rounded-lg border px-3 py-2"
                    >
                      <option>Masculino</option>
                      <option>Femenino</option>

                    </select>

                  </div>

                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-300" />
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-[#8B1538]">
                    Información institucional
                  </h3>
                  <div className="flex-1 h-px bg-gray-300" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  <div className="col-span-1 relative">

                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Área de destino
                    </label>

                    <div className="relative">
                      <div
                        className="
                        flex items-center
                        rounded-lg
                        border
                        border-gray-300
                        px-3
                        py-2.5
                        transition
                        focus-within:border-[#8B1538]
                        focus-within:ring-2
                        focus-within:ring-[#8B1538]/20"
                      >
                        <Search
                          size={16}
                          className="text-gray-400 mr-2 shrink-0"
                        />

                        <input
                          type="text"
                          value={busquedaArea}
                          onFocus={() => setMostrarOpcionesArea(true)}
                          onChange={(e) => {
                            setBusquedaArea(e.target.value);
                            setMostrarOpcionesArea(true);
                            if (!e.target.value.trim()) {
                              setFormEditar({ ...formEditar, area: "" });
                            }
                          }}
                          className="w-full outline-none bg-transparent text-sm"
                          placeholder="Buscar y seleccionar área"
                        />
                      </div>

                      {mostrarOpcionesArea && (
                        <div className="absolute z-10 mt-1 max-h-44 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                          {areasFiltradas.length > 0 ? (
                            areasFiltradas.map((area) => (
                              <button
                                key={area._id || area.nombre}
                                type="button"
                                onClick={() => {
                                  setFormEditar({ ...formEditar, area: area.nombre });
                                  setBusquedaArea(area.nombre);
                                  setMostrarOpcionesArea(false);
                                }}
                                className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                              >
                                {area.nombre}
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-sm text-gray-500">
                              No se encontraron áreas
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                  </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

                  <div className="md:col-span-2">

                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Teléfono institucional
                    </label>

                    <input
                      value={formEditar.telefono}
                      onChange={(e) =>
                        setFormEditar({
                          ...formEditar,
                          telefono: e.target.value
                        })
                      }
                      className="
                      w-full
                      rounded-lg
                      border
                      border-gray-300
                      px-3
                      py-2
                      focus:border-[#8B1538]
                      focus:ring-2
                      focus:ring-[#8B1538]/20
                      outline-none"
                    />

                  </div>

                  <div>

                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Ext.
                    </label>

                    <input
                      value={formEditar.ext}
                      onChange={(e) =>
                        setFormEditar({
                          ...formEditar,
                          ext: e.target.value
                        })
                      }
                      className="
                      w-full
                      rounded-lg
                      border
                      border-gray-300
                      px-3
                      py-2
                      focus:border-[#8B1538]
                      focus:ring-2
                      focus:ring-[#8B1538]/20
                      outline-none"
                    />

                  </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  <div>

                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Correo institucional
                    </label>

                    <input
                      value={formEditar.email}
                      onChange={(e) =>
                        setFormEditar({
                          ...formEditar,
                          email: e.target.value
                        })
                      }
                      className="
                      w-full
                      rounded-lg
                      border
                      border-gray-300
                      px-3
                      py-2
                      focus:border-[#8B1538]
                      focus:ring-2
                      focus:ring-[#8B1538]/20
                      outline-none"
                    />

                  </div>

                </div>

                <div className="flex items-center gap-3">

                  <div className="flex-1 h-px bg-gray-300" />

                  <h3 className="text-sm font-semibold uppercase tracking-wide text-[#8B1538]">
                    Configuración del usuario
                  </h3>

                  <div className="flex-1 h-px bg-gray-300" />

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  <div>

                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Rol
                    </label>

                    <select
                      value={formEditar.rol}
                      onChange={(e) =>
                        setFormEditar({
                          ...formEditar,
                          rol: e.target.value
                        })
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
                      outline-none"
                      >
                      <option value="">Seleccionar</option>
                      <option value="REGISTRADOR">REGISTRADOR</option>
                      <option value="EJECUTOR">EJECUTOR</option>
                      <option value="VALIDADOR">VALIDADOR</option>

                    </select>

                  </div>

                  {/* Si vuelves a usar copia */}

                  {/*
                  <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">

                      <label className="flex items-center gap-3 cursor-pointer">

                          <input
                              type="checkbox"
                              checked={formEditar.copia}
                              onChange={(e)=>
                                  setFormEditar({
                                      ...formEditar,
                                      copia:e.target.checked
                                  })
                              }
                              className="accent-[#8B1538]"
                          />

                          <div>

                              <p className="font-medium">
                                  Recibir copia de documentos
                              </p>

                              <p className="text-xs text-gray-500">
                                  El usuario recibirá copia de los documentos relacionados.
                              </p>

                          </div>

                      </label>

                  </div>
                  */}

                </div>
                <div className="flex justify-center">

                 <button
                  onClick={handleGuardarCambios}
                  className="bg-[#8B1538] text-white px-10 py-3 rounded-lg hover:bg-[#6f102c]"
                >
                  Guardar cambios
                </button>

                </div>

              </div>

            </motion.div>

          </motion.div>

        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalEliminar.visible && (

          <motion.div
            className="fixed inset-0 z-[1000] flex justify-center items-center"
            style={{ background: "rgba(0,0,0,.4)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >

            <motion.div
              className="bg-white rounded-md shadow-xl w-full max-w-md overflow-hidden"
              initial={{ scale: .95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: .95, y: 20 }}
            >

              <div className="bg-gray-300 px-4 py-3 flex justify-between">

                <h2 className="font-semibold text-sm">
                  Eliminar usuario
                </h2>

                <button
                  onClick={() => setModalEliminar({ visible: false, user: null })}
                  className="w-8 h-8 rounded-full bg-[#8B1538] text-white flex items-center justify-center"
                >

                  <Minus size={16} />

                </button>

              </div>

              <div className="p-6 text-center space-y-5">

                <p className="text-sm">
                  ¿Está seguro de eliminar al usuario
                  <strong> {modalEliminar.user?.nombre}</strong>?
                </p>

                <div className="flex justify-center gap-4">

                  <button
                    onClick={() => setModalEliminar({ visible: false, user: null })}
                    className="border rounded-lg px-6 py-2"
                  >
                    Cancelar
                  </button>

                  <button
                    onClick={handleEliminarConfirmado}
                    className="bg-red-600 text-white rounded-lg px-6 py-2 hover:bg-red-700"
                  >

                    Eliminar

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
