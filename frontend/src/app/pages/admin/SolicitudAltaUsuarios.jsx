import { Minus, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getSolicitudes, approveSolicitud } from "../../services/user.service.js";
import Swal from "sweetalert2";

export function SolicitudAltaUsuarios() {
  const [criterio, setCriterio] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menu, setMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    request: null,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedRol, setSelectedRol] = useState("");
  const [approvedCredentials, setApprovedCredentials] = useState(null);

  const fetchSolicitudes = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await getSolicitudes(token);
      if (!response.ok) {
        setError("No se pudieron cargar las solicitudes.");
        return;
      }
      const data = await response.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      console.error("Error cargando solicitudes:", fetchError);
      setError("Error de red al cargar las solicitudes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const filteredRequests = requests.filter((request) => {
    const texto = criterio.toLowerCase();
    return (
      request.nombre?.toLowerCase().includes(texto) ||
      request.sexo?.toLowerCase().includes(texto) ||
      request.telefono?.toLowerCase().includes(texto) ||
      request.email?.toLowerCase().includes(texto) ||
      request.area?.nombre?.toLowerCase().includes(texto) ||
      String(request.area)?.toLowerCase().includes(texto)
    );
  });

  const handleClick = (e, request) => {
    e.stopPropagation();
    setMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      request,
    });
  };

  const cerrarMenu = () => {
    setMenu({ ...menu, visible: false });
  };

  const handleOpenModal = () => {
    setSelectedRequest(menu.request);
    setSelectedRol("");
    setModalVisible(true);
    cerrarMenu();
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedRequest(null);
    setSelectedRol("");
  };

  const handleApprove = async () => {
    if (!selectedRequest || !selectedRol) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "warning",
        title: "Complete los campos obligatorios.",
        text: "Seleccione un rol antes de aprobar la solicitud.",
        showConfirmButton: false,
        timer: 3500,
        timerProgressBar: true,
        customClass: {
          popup: "text-sm",
        },
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        },
      });
      return;
    }

     // Confirmación
    const result = await Swal.fire({
      title: "¿Aprobar solicitud?",
      text: `Se aprobará la solicitud y se asignará el rol "${selectedRol}".`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, aprobar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#8B1538",
      cancelButtonColor: "#6B7280",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await approveSolicitud(selectedRequest._id, { rol: selectedRol }, token);
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "No se pudo aprobar la solicitud.");
      }

      const data = await response.json();
      setApprovedCredentials(data.credentials);
      setRequests((prev) => prev.filter((item) => item._id !== selectedRequest._id));
      handleCloseModal();

      Swal.fire({
        toast: true,
        position: "top-end",
        title: "Solicitud aprobada",
        text: `Usuario generado: ${data.credentials.username}`,
        icon: "success",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    } catch (error) {
      console.error("Error aprobando solicitud:", error);
      Swal.fire({
        icon: "error",
        title: "Error al aprobar",
        text: error.message || "No se pudo aprobar la solicitud.",
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
                                <span>Cargando solicitudes...</span>
                            </div>
                        </td>
                    </tr>
                ) : filteredRequests.length === 0 ? (
                    <tr>
                        <td colSpan="5" className="py-10 text-center text-gray-400 italic">
                            No hay resultados
                        </td>
                    </tr>
                ) : (
                    filteredRequests.map((request, index) => {
                        const areaLabel = request.area?.nombre || request.area || "No disponible";
                        return (
                            <motion.tr
                                key={request._id}
                                onClick={(e) => handleClick(e, request)}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className="border-t cursor-pointer hover:bg-gray-100"
                            >
                                <td className="px-3 py-2">{request.nombre}</td>
                                <td className="px-3 py-2">
                                    {request.sexo || <span className="italic">No disponible</span>}
                                </td>
                                <td className="px-3 py-2">{areaLabel}</td>
                                <td className="px-3 py-2">
                                    {request.telefono || <span className="italic">No disponible</span>}
                                </td>
                                <td className="px-3 py-2">
                                    {request.email || <span className="italic">No disponible</span>}
                                </td>
                            </motion.tr>
                        );
                    })
                )}
            </tbody>
          </table>
        </div>

        {approvedCredentials && (
          <div className="bg-green-50 border border-green-200 rounded p-4 text-xs">
            <p className="font-semibold text-green-700">Usuario creado</p>
            <p className="mt-2">Nombre de usuario: <span className="font-medium">{approvedCredentials.username}</span></p>
            <p>Contraseña: <span className="font-medium">{approvedCredentials.password}</span></p>
          </div>
        )}

        {error && (
          <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-xs">
            {error}
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
            className="fixed bg-white border shadow-md rounded text-xs z-50"
            style={{ top: menu.y, left: menu.x }}
          >
            <button
              onClick={handleOpenModal}
              className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
            >
              Ver solicitud de alta
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalVisible && selectedRequest && (
        <motion.div
          className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto p-4"
          style={{ backgroundColor: "rgba(0,0,0,.4)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="
            w-full
            max-w-4xl
            max-h-[90vh]
            flex
            flex-col
            rounded-md
            bg-white
            shadow-xl
            overflow-hidden
            "
            initial={{ opacity: 0, scale: .95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: .95, y: 20 }}
            transition={{ duration: .2 }}
          >
             {/* HEADER */}
             <div className="bg-gray-300 flex items-center justify-between px-4 py-3">
              <h2 className="text-sm font-semibold text-gray-800">
                Aprobar solicitud de alta
              </h2>

              <button
                onClick={handleCloseModal}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#8B1538] text-white"
              >
                <Minus size={16} />
              </button>
            </div>
            
              <div className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* INFORMACIÓN PERSONAL */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-300" />
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-[#8B1538]">
                    Información personal
                  </h3>
                  <div className="flex-1 h-px bg-gray-300" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">Nombre completo</label>
                    <input
                      value={selectedRequest.nombre || ""}
                      readOnly
                      className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-gray-600"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="mb-1 block text-sm font-medium text-gray-700">Iniciales</label>
                    <input
                      value={selectedRequest.iniciales || ""}
                      readOnly
                      className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-gray-600"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="mb-1 block text-sm font-medium text-gray-700">Sexo</label>
                    <input
                      value={selectedRequest.sexo || ""}
                      readOnly
                      className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-gray-600"
                    />
                  </div>

                </div>

               {/* INFORMACIÓN INSTITUCIONAL */}  
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-300" />
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-[#8B1538]">
                    Información institucional
                  </h3>
                  <div className="flex-1 h-px bg-gray-300" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">Área de destino</label>
                    <input
                      value={selectedRequest.area?.nombre || selectedRequest.area || ""}
                      readOnly
                      className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-gray-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">Teléfono institucional</label>
                    <input
                      value={selectedRequest.telefono || ""}
                      readOnly
                      className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-gray-600"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="mb-1 block text-sm font-medium text-gray-700">Ext</label>
                    <input
                      value={selectedRequest.ext || ""}
                      readOnly
                      className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-gray-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-1">
                    <label className="mb-1 block text-sm font-medium text-gray-700">Correo institucional</label>
                    <input
                      value={selectedRequest.email || ""}
                      readOnly
                      className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-gray-600"
                    />
                  </div>
   
                </div>

                {/* CONFIGURACIÓN */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-300" />
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-[#8B1538]">
                    Configuración del usuario
                  </h3>
                  <div className="flex-1 h-px bg-gray-300" />
                </div>
                
                <div className="grid grid-cols-2 gap-5">
               
                  <div className="col-span-1">
                    <label className="mb-1 block text-sm font-medium text-gray-700">Rol <span className="text-red-600">*</span></label>
                    <select
                      value={selectedRol}
                      onChange={(e) => setSelectedRol(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 transition
                      focus:border-[#8B1538]
                      focus:ring-2
                      focus:ring-[#8B1538]/20
                      outline-none"
                    >
                      <option value="">Seleccionar</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="REGISTRADOR">REGISTRADOR</option>
                      <option value="EJECUTOR">EJECUTOR</option>
                      <option value="VALIDADOR">VALIDADOR</option>
                    </select>
                  </div>

                  {/* <div className="flex items-center gap-2 mt-5">
                    <label>¿Recibe copia?</label>
                    <input
                      type="checkbox"
                      checked={selectedRequest.copia || false}
                      readOnly
                      className="accent-[#8B1538]"
                    />
                  </div> */}
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    onClick={handleApprove}
                    className="bg-[#8B1538]
                      text-white
                      font-medium
                      px-10
                      py-3
                      rounded-lg
                      hover:bg-[#6f102c]
                      transition
                      shadow-md
                      hover:shadow-lg"
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
