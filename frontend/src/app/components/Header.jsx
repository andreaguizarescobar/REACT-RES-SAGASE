import { User, Menu, LogOut, Bell, Check, CheckCheck, Trash2, Eye, Minus, Search, Upload, Download, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useState, useEffect } from "react";
import nayaritLogo from "../assets/images/nayaritLogo.png";
import { verifyTokenRequest } from "../services/auth.service";
import { getNotificaciones, marcarNotificacionLeida, marcarTodasNotificacionesLeidas, clearNotificaciones } from "../services/user.service";
import { getDocumentById } from "../services/document.service";
import Swal from "sweetalert2";

export function Header({ onToggleSidebar, onGoHome }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin =
    location?.pathname?.startsWith?.("/admin") ||
    localStorage.getItem("isAdmin") === "true";

  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);

  const currentDate = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const [notifications, setNotifications] = useState([]);
  const [usuario, setUsuario] = useState(null);

  // Estado para el modal de visualización de documento desde notificación
  const [mostrarModalNotifDoc, setMostrarModalNotifDoc] = useState(false);
  const [docNotifSeleccionado, setDocNotifSeleccionado] = useState(null);
  const [tabActivaNotif, setTabActivaNotif] = useState("datosAsunto");
  const [documentoAnexosNotif, setDocumentoAnexosNotif] = useState([]);
  const [turnosDocumentoNotif, setTurnosDocumentoNotif] = useState([]);
  const [copiasDocumentoNotif, setCopiasDocumentoNotif] = useState([]);
  const [bitacoraDocumentoNotif, setBitacoraDocumentoNotif] = useState([]);
  const [relacionadosDocumentoNotif, setRelacionadosDocumentoNotif] = useState([]);
  const [materialesAdicionalesNotif, setMaterialesAdicionalesNotif] = useState([]);
  const [busquedaTablaNotif, setBusquedaTablaNotif] = useState("");
  const [mostrarVisorNotif, setMostrarVisorNotif] = useState(false);
  const [archivoVistaNotif, setArchivoVistaNotif] = useState(null);

  useEffect(() => {
    const userStorage = localStorage.getItem("user");
    if (userStorage) {
      setUsuario(JSON.parse(userStorage));
    }
  }, []);

  useEffect(() => {
    if (usuario) {
      fetchNotifications();
    }
  }, [usuario]);

  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");
    return await getNotificaciones(usuario?.userId, token)
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Error al obtener notificaciones");
        }
      })
      .then((data) => {
        setNotifications(data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const tiempoTranscurrido = (fecha) => {
    const ahora = new Date();
    const fechaObj = new Date(fecha);

    const diffMs = ahora - fechaObj;

    const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const horas = Math.floor(diffMs / (1000 * 60 * 60));
    const minutos = Math.floor(diffMs / (1000 * 60));

    if (dias > 0) return `hace ${dias} día${dias > 1 ? "s" : ""}`;
    if (horas > 0) return `hace ${horas} hora${horas > 1 ? "s" : ""}`;
    if (minutos > 0) return `hace ${minutos} minuto${minutos > 1 ? "s" : ""}`;

    return "hace unos segundos";
  };

  const handleLogout = () => {
    navigate("/");
  };

  const verifyToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        title: "Sesión expirada",
        text: "Por favor, inicia sesión nuevamente.",
        icon: "warning",
        confirmButtonText: "Ir a login",
      }).then(() => {
        navigate("/");
      });
    }

    verifyTokenRequest(token)
      .then((response) => {
        if (!response.ok) {
          Swal.fire({
            title: "Sesión expirada",
            text: "Por favor, inicia sesión nuevamente.",
            icon: "warning",
            confirmButtonText: "Ir a login",
          }).then(() => {
            localStorage.removeItem("token");
            localStorage.removeItem("isAdmin");
            navigate("/");
          });
        }
      })
      .catch((error) => {
        console.error("Error verifying token:", error);
        navigate("/");
      });
  };

  useEffect(() => {
    verifyToken();
  }, []);

  const marcarComoLeida = (id) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif._id === id ? { ...notif, status: "Leida" } : notif
      )
    );
    const token = localStorage.getItem("token");
    marcarNotificacionLeida(id, usuario.userId, token);
  };

  const marcarTodasComoLeidas = async () => {
    notifications.forEach((notif, index) => {
      setTimeout(() => {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notif.id ? { ...n, status: "Leida" } : n
          )
        );
      }, index * 120);
    });

    const token = localStorage.getItem("token");
    marcarTodasNotificacionesLeidas(usuario.userId, token);
  };

  const limpiarNotificacionesLeidas = () => {
    Swal.fire({
      title: "¿Vaciar notificaciones leídas?",
      icon: "question",
      toast: true,
      position: "top-end",
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: "Vaciar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#79142A",
      cancelButtonColor: "#e5e7eb",
      background: "#ffffff",
      color: "#374151",
      width: "260px",
      padding: "0.75rem",
      timerProgressBar: false,
      buttonsStyling: false,
      customClass: {
        popup: "rounded-xl shadow-lg",
        title: "text-xs font-semibold text-left",
        actions: "w-full flex flex-row justify-end items-center gap-2 mt-2",
        confirmButton: "text-[11px] bg-[#79142A] text-white px-3 py-1.5 rounded-md font-medium",
        cancelButton: "text-[11px] bg-gray-100 text-gray-600 px-3 py-1.5 rounded-md font-medium",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        setNotifications((prev) => prev.filter((notif) => notif.status === "Sin leer"));
        const token = localStorage.getItem("token");
        clearNotificaciones(usuario.userId, token);

        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Bandeja actualizada",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          background: "#fff",
          color: "#374151",
          iconColor: "#16a34a",
          width: "260px",
          padding: "0.75rem",
        });
      }
    });
  };

  // ---- Funciones auxiliares para el modal ----

  const formatDateForInput = (value) => {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
  };

  const safeText = (value, fallback = "") => {
    if (value === undefined || value === null || value === "") return fallback;
    if (typeof value === "object") {
      if (Array.isArray(value)) {
        return value.map((item) => safeText(item)).filter(Boolean).join(", ");
      }
      return (
        value.descripcion ||
        value.tipo ||
        value.name ||
        value.nombre ||
        value.area ||
        value.dependencia ||
        value.cargo ||
        value.label ||
        JSON.stringify(value)
      );
    }
    return String(value);
  };

  const normalizeRelacionadoItem = (rel) => {
    if (!rel) return null;
    return {
      relationId: rel._id || rel.relationId || null,
      value: rel.item?._id || rel._id || rel.value || rel,
      folio: rel.item?.folio || rel.folio || rel.label || "",
      docId: rel.item?.docId || rel.docId || "",
      remitente: rel.item?.remitente
        ? rel.item.remitente.name || rel.item.remitente
        : rel.remitente
        ? rel.remitente.name || rel.remitente
        : "",
      asunto: rel.item?.asunto || rel.asunto || rel.observaciones || "",
    };
  };

  // ---- Manejador para abrir documento desde notificación ----
  const abrirDocumentoNotificacion = async (notif) => {
    // Obtener el ID del documento desde la notificación
    const docId = notif.documento?.docId || notif.documento?._id || notif.documento;
    if (!docId) {
      Swal.fire({
        icon: "info",
        title: "Sin documento",
        text: "Esta notificación no tiene un documento asociado.",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await getDocumentById(docId, token);
      if (!response.ok) throw new Error("No se pudo obtener el documento");

      const data = await response.json();
      const fullDoc = data.documento || data;

      setDocNotifSeleccionado(fullDoc);
      setDocumentoAnexosNotif(fullDoc.anexos || []);
      setTurnosDocumentoNotif(fullDoc.turnados || []);
      setCopiasDocumentoNotif(fullDoc.copias || []);
      setBitacoraDocumentoNotif(fullDoc.bitacora || []);
      setRelacionadosDocumentoNotif(
        (fullDoc.relacionados || []).map(normalizeRelacionadoItem).filter(Boolean)
      );
      setMaterialesAdicionalesNotif(fullDoc.adicional?.adicionales || []);
      setTabActivaNotif("datosAsunto");
      setMostrarModalNotifDoc(true);
      setShowNotifications(false);
    } catch (error) {
      console.error("Error cargando documento desde notificación:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo cargar el documento asociado.",
      });
    }
  };

  return (
    <header className="bg-white border-b border-[#60595D]-200 flex flex-col">
      <div className="h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-[#60595D]-100 rounded transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} className="text-[#60595D]-700" />
          </button>

          <button onClick={onGoHome} className="hover:opacity-80 transition">
            <img
              src={nayaritLogo}
              alt="Nayarit Secretaría de Educación"
              className="h-12 mb-2"
            />
          </button>

          <h1 className="text-lg text-[#60595D]-800">
            {isAdmin ? "Administración" : "Escritorio Virtual"}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-[#60595D]-600 capitalize">
            {currentDate}
          </span>

          {/* Notificaciones */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-[#60595D]-100 rounded transition-colors"
            >
              <Bell size={20} className="text-[#60595D]-700" />

              {notifications.filter((n) => n.status === "Sin leer").length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {notifications.filter((n) => n.status === "Sin leer").length}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <>
                  {/* Overlay */}
                  <motion.div
                    className="fixed inset-0 z-10"
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      if (!showNotifications) {
                        setShowAllNotifications(false);
                      }
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />

                  {/* Panel */}
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute right-2 -mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl z-20 overflow-hidden"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-[#79142A]">
                          Notificaciones
                        </span>
                        <span className="text-[11px] text-gray-500">
                          {notifications.length} en total
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {notifications.some((n) => n.status === "Sin leer") && (
                          <button
                            onClick={marcarTodasComoLeidas}
                            className="relative group p-2 rounded-lg hover:bg-[#79142A]/10 text-[#79142A] transition-colors"
                          >
                            <CheckCheck size={16} />
                            <div className="absolute -bottom-8 right-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 bg-gray-900 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap shadow-lg">
                              Marcar todas como leídas
                            </div>
                          </button>
                        )}

                        {notifications.some((n) => n.status === "Leida") && (
                          <button
                            onClick={limpiarNotificacionesLeidas}
                            className="relative group p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                          >
                            <Trash2 size={16} />
                            <div className="absolute -bottom-8 right-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 bg-gray-900 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap shadow-lg">
                              Vaciar leídas
                            </div>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Lista */}
                    <LayoutGroup>
                      <motion.div layout className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-10 text-center">
                            <Bell size={40} className="text-gray-300 mb-3" />
                            <p className="text-sm font-medium text-gray-500">
                              No hay notificaciones
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Tu bandeja está vacía
                            </p>
                          </div>
                        ) : (
                          (showAllNotifications
                            ? notifications
                            : notifications.slice(0, 3)
                          ).map((notif, index) => (
                            <motion.div
                              layout
                              key={notif._id || notif.id || index}
                              initial={{ opacity: 0, x: 20, scale: 0.95 }}
                              animate={{ opacity: 1, x: 0, scale: 1 }}
                              exit={{ opacity: 0, x: -20, scale: 0.9 }}
                              transition={{
                                duration: 0.22,
                                ease: "easeOut",
                                delay: index * 0.03,
                              }}
                              className={`px-4 py-3 border-b transition-all duration-300 group ${
                                notif.status === "Leida" ? "bg-white" : "bg-[#79142A]/[0.03]"
                              }`}
                            >
                              <div className="flex justify-between gap-3">
                                <div
                                  className="flex-1 cursor-pointer"
                                  onClick={() => {
                                    marcarComoLeida(notif._id);
                                    abrirDocumentoNotificacion(notif);
                                  }}
                                >
                                  <div className="flex items-center gap-2">
                                    {notif.status === "Sin leer" && (
                                      <motion.div
                                        layout
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        className="w-2 h-2 rounded-full bg-[#79142A]"
                                      />
                                    )}
                                    <p className="text-sm font-medium text-gray-800">
                                      {notif.tarea}
                                    </p>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {notif.descripcion}
                                  </p>
                                  <p className="text-[11px] text-gray-400 mt-1">
                                    {tiempoTranscurrido(notif.fecha)}
                                  </p>
                                </div>

                                {notif.status === "Sin leer" && (
                                  <button
                                    onClick={() => marcarComoLeida(notif._id)}
                                    className="relative group/check opacity-0 group-hover:opacity-100 transition-opacity h-fit mt-1 p-1 rounded-md hover:bg-green-100 text-green-600"
                                  >
                                    <Check size={15} />
                                    <div className="absolute top-1/2 right-6 -translate-y-1/2 opacity-0 group-hover/check:opacity-100 pointer-events-none transition-opacity duration-200 bg-gray-900 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap shadow-lg">
                                      Marcar como leída
                                    </div>
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          ))
                        )}
                      </motion.div>
                    </LayoutGroup>

                    {/* Footer */}
                    {notifications.length >= 4 && !showAllNotifications && (
                      <div
                        onClick={() => setShowAllNotifications(true)}
                        className="text-center py-3 text-xs font-medium text-[#8B1538] hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        Ver todas
                      </div>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Usuario */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-100 px-3 py-2 rounded transition-colors"
            >
              <User size={18} />
              <span>{usuario ? `${usuario.nombre || usuario.username}` : "Usuario"}</span>
            </button>

            <AnimatePresence>
              {showDropdown && (
                <>
                  <motion.div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowDropdown(false)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 origin-top-right"
                  >
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LogOut size={16} />
                      <span>Cerrar sesión</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* FRANJA DECORATIVA */}
      <div className="w-full h-[90px] overflow-hidden">
        <img
          src="src/app/assets/images/personajenayarit2.jpg"
          alt="Decoración Nayarit"
          className="w-full h-full object-cover"
        />
      </div>

      {/* MODAL DE DOCUMENTO DESDE NOTIFICACIÓN */}
      <AnimatePresence>
        {mostrarModalNotifDoc && docNotifSeleccionado && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-start sm:items-center justify-center p-4 sm:p-6 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* BACKDROP */}
            <motion.div
              className="absolute inset-0 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMostrarModalNotifDoc(false)}
            />

            {/* MODAL */}
            <motion.div
              className="relative bg-white w-full max-w-6xl h-[90vh] sm:h-[85vh] rounded-2xl shadow-2xl flex flex-col pt-6"
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* HEADER */}
              <div className="flex justify-between items-start px-6 pb-4 border-b shrink-0">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">
                    Documento desde notificación
                  </span>
                  <h2 className="text-2xl font-bold text-[#8B1538] leading-tight">
                    Folio: {docNotifSeleccionado.folio || docNotifSeleccionado.docId || "Sin folio"}
                  </h2>
                </div>
                <button
                  onClick={() => setMostrarModalNotifDoc(false)}
                  className="bg-[#8B1538] hover:bg-red-700 text-white p-2 rounded-full flex items-center justify-center transition"
                  title="Cerrar"
                >
                  <Minus size={16} />
                </button>
              </div>

              {/* TABS */}
              <div className="flex border-b mb-1 text-sm overflow-x-auto">
                {[
                  { id: "datosAsunto", label: "Datos del registro" },
                  { id: "anexo", label: "Anexos" },
                  ...(docNotifSeleccionado.adicional?.tiene
                    ? [{ id: "materialAdicional", label: "Soporte adicional" }]
                    : []),
                  { id: "verTurnos", label: "Todos los turnos" },
                  { id: "copias", label: "Copias" },
                  { id: "bitacora", label: "Bitácora" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setTabActivaNotif(tab.id)}
                    className={`px-4 py-2 whitespace-nowrap transition ${
                      tabActivaNotif === tab.id
                        ? "border-b-2 border-[#8B1538] text-[#8B1538] font-semibold"
                        : "text-gray-600 hover:text-[#8B1538]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* CONTENIDO */}
              <div className="flex-1 overflow-y-auto p-4">
                <AnimatePresence>
                  <motion.div
                    key={tabActivaNotif}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* DATOS DEL REGISTRO */}
                    {tabActivaNotif === "datosAsunto" && (
                      <div className="space-y-6">
                        <div>
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-80">
                              <h2 className="text-sm font-semibold text-gray-600 mb-2">
                                Ejercicio
                              </h2>
                              <select
                                className="w-full border rounded px-2 py-1 bg-gray-100 cursor-not-allowed"
                                disabled
                              >
                                <option>
                                  {docNotifSeleccionado.ejercicio || ""}
                                </option>
                              </select>
                            </div>
                          </div>

                          <div className="mb-4">
                            <h2 className="text-sm font-semibold text-gray-600 mb-2">
                              Datos específicos
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                              <div>
                                <label className="block text-gray-500 mb-1">
                                  Tipo de documento
                                </label>
                                <input
                                  value={safeText(
                                    docNotifSeleccionado.tipo?.tipo ||
                                      docNotifSeleccionado.tipo,
                                    "No disponible"
                                  )}
                                  disabled
                                  className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-gray-700"
                                />
                              </div>
                              <div>
                                <label className="block text-gray-500 mb-1">
                                  Asunto
                                </label>
                                <input
                                  value={
                                    docNotifSeleccionado.asunto ||
                                    docNotifSeleccionado.tarea ||
                                    "Sin asunto"
                                  }
                                  disabled
                                  className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-gray-700"
                                />
                              </div>
                              <div>
                                <label className="block text-gray-500 mb-1">
                                  Soporte adicional
                                </label>
                                <input
                                  value={
                                    docNotifSeleccionado.adicional?.tiene
                                      ? "Sí"
                                      : "No"
                                  }
                                  disabled
                                  className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-gray-700"
                                />
                              </div>
                            </div>
                          </div>

                          <h2 className="text-sm font-semibold text-gray-600 mb-2">
                            Datos generales
                          </h2>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div>
                              <label className="block text-gray-500 mb-1">
                                No. de documento
                              </label>
                              <input
                                value={
                                  docNotifSeleccionado.folio ||
                                  docNotifSeleccionado.docId ||
                                  ""
                                }
                                disabled
                                className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-gray-700"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-500 mb-1">
                                Fecha de documento
                              </label>
                              <input
                                type="date"
                                value={
                                  formatDateForInput(
                                    docNotifSeleccionado.fechaDoc ||
                                      docNotifSeleccionado.fechaDocumento ||
                                      docNotifSeleccionado.registro
                                  )
                                }
                                disabled
                                className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-gray-700"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-500 mb-1">
                                Fecha de recibido
                              </label>
                              <input
                                type="date"
                                value={formatDateForInput(
                                  docNotifSeleccionado.acuse ||
                                    docNotifSeleccionado.fechaAcuse
                                )}
                                disabled
                                className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-gray-700"
                              />
                            </div>
                          </div>
                        </div>

                        {/* REMITENTE */}
                        <div>
                          <h2 className="text-sm font-semibold text-gray-600 mb-2">
                            Remitente
                          </h2>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div>
                              <label className="block text-gray-500 mb-1">
                                Tipo de remitente
                              </label>
                              <input
                                value={safeText(
                                  docNotifSeleccionado.remitente?.tipo ||
                                    docNotifSeleccionado.remitente?.role ||
                                    docNotifSeleccionado.turnados?.at(-1)
                                      ?.remitente?.tipo ||
                                    "Interno"
                                )}
                                disabled
                                className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-gray-700"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-gray-500 mb-1">
                                Nombre del remitente
                              </label>
                              <input
                                value={safeText(
                                  docNotifSeleccionado.remitente?.name ||
                                    docNotifSeleccionado.remitente?.nombre ||
                                    docNotifSeleccionado.turnados?.at(-1)
                                      ?.remitente?.name ||
                                    docNotifSeleccionado.turnados?.at(-1)
                                      ?.remitente?.nombre ||
                                    docNotifSeleccionado.remitente ||
                                    ""
                                )}
                                disabled
                                className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-gray-700"
                              />
                            </div>
                          </div>
                        </div>

                        {/* INFORMACIÓN COMPLEMENTARIA */}
                        <div>
                          <h2 className="text-sm font-semibold text-gray-600 mb-2">
                            Información complementaria
                          </h2>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div className="md:col-span-3">
                              <label className="block text-gray-500 mb-1">
                                Síntesis del asunto
                              </label>
                              <textarea
                                value={
                                  docNotifSeleccionado.sintesis ||
                                  "Sin información"
                                }
                                disabled
                                rows={3}
                                className="w-full border border-gray-300 rounded px-2 py-2 bg-gray-50 text-gray-700 resize-none"
                              />
                            </div>
                            <div className="md:col-span-3">
                              <label className="block text-gray-500 mb-1">
                                Observaciones
                              </label>
                              <input
                                value={safeText(
                                  docNotifSeleccionado.observaciones,
                                  "Sin observaciones"
                                )}
                                disabled
                                className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-gray-700"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ANEXOS */}
                    {tabActivaNotif === "anexo" && (
                      <div className="space-y-4">
                        {/* Buscador anexos */}
                        <div className="flex items-center border rounded px-2">
                          <Search size={16} className="text-gray-400" />
                          <input
                            value={busquedaTablaNotif}
                            onChange={(e) => setBusquedaTablaNotif(e.target.value)}
                            className="w-full px-2 py-2 outline-none text-sm"
                            placeholder="Buscar anexo..."
                          />
                        </div>

                        <div className="overflow-x-auto">
                          <table className="min-w-[700px] w-full text-xs border border-gray-200">
                            <thead className="bg-[#8B1538] text-white">
                              <tr>
                                <th className="px-3 py-2 text-left">
                                  Registrador
                                </th>
                                <th className="px-3 py-2 text-left">Mensaje</th>
                                <th className="px-3 py-2 text-left">Archivo</th>
                                <th className="px-3 py-2 text-left">
                                  Nombre documento
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {(documentoAnexosNotif || []).length > 0 ? (
                                (documentoAnexosNotif || [])
                                  .filter((a) => {
                                    const text = [
                                      a.mensaje,
                                      a.nombre,
                                      a.ruta,
                                    ]
                                      .join(" ")
                                      .toLowerCase();
                                    return text.includes(
                                      busquedaTablaNotif.toLowerCase()
                                    );
                                  })
                                  .map((anexo) => (
                                    <tr
                                      key={anexo._id || anexo.nombre}
                                      className="border-t hover:bg-gray-50"
                                    >
                                      <td className="px-3 py-2 text-gray-700">
                                        {anexo.registrador?.nombre || "N/A"}
                                      </td>
                                      <td className="px-3 py-2 text-gray-700">
                                        {anexo.mensaje || "Sin mensaje"}
                                      </td>
                                      <td className="px-3 py-2">
                                        {anexo.ruta ? (
                                          <button
                                            onClick={() => {
                                              const url = anexo.ruta.startsWith("http")
                                                ? anexo.ruta
                                                : `${import.meta.env.VITE_ARCHIVOS_PATH}${anexo.ruta.replace(
                                                    /^\.\.\//,
                                                    ""
                                                  )}`;
                                              setArchivoVistaNotif(url);
                                              setMostrarVisorNotif(true);
                                            }}
                                            className="inline-flex items-center gap-1 bg-[#8B1538] text-white px-2 py-1 rounded text-xs hover:opacity-90"
                                          >
                                            <Eye size={12} /> Ver
                                          </button>
                                        ) : (
                                          <span className="text-gray-400 text-[11px]">
                                            Sin archivo
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-3 py-2 text-gray-700 truncate max-w-[200px]">
                                        {anexo.nombre || "Sin nombre"}
                                      </td>
                                    </tr>
                                  ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan={4}
                                    className="text-center py-4 text-gray-400"
                                  >
                                    Sin anexos registrados
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Documentos relacionados */}
                        <div className="flex items-center border rounded px-2 mt-4">
                          <Search size={16} className="text-gray-400" />
                          <input
                            value={busquedaTablaNotif}
                            onChange={(e) => setBusquedaTablaNotif(e.target.value)}
                            className="w-full px-2 py-2 outline-none text-sm"
                            placeholder="Buscar documento relacionado..."
                          />
                        </div>

                        <div className="overflow-x-auto">
                          <table className="min-w-[600px] w-full text-xs border border-gray-200">
                            <thead className="bg-[#8B1538] text-white">
                              <tr>
                                <th className="px-3 py-2 text-left">Folio</th>
                                <th className="px-3 py-2 text-left">DocId</th>
                                <th className="px-3 py-2 text-left">
                                  Remitente
                                </th>
                                <th className="px-3 py-2 text-left">Asunto</th>
                              </tr>
                            </thead>
                            <tbody>
                              {relacionadosDocumentoNotif.length > 0 ? (
                                relacionadosDocumentoNotif.map((rel) => (
                                  <tr
                                    key={rel.value}
                                    className="border-t hover:bg-gray-50"
                                  >
                                    <td className="px-3 py-2 text-gray-700">
                                      {rel.folio || "Sin folio"}
                                    </td>
                                    <td className="px-3 py-2 text-gray-700">
                                      {rel.docId || "Sin docId"}
                                    </td>
                                    <td className="px-3 py-2 text-gray-700">
                                      {rel.remitente || "N/A"}
                                    </td>
                                    <td className="px-3 py-2 text-gray-700">
                                      {rel.asunto || "Sin asunto"}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan={4}
                                    className="text-center py-4 text-gray-400"
                                  >
                                    Sin documentos relacionados
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* MATERIAL ADICIONAL */}
                    {tabActivaNotif === "materialAdicional" && (
                      <div className="space-y-4">
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs border border-gray-200">
                            <thead className="bg-[#8B1538] text-white">
                              <tr>
                                <th className="px-4 py-2 text-left">
                                  Tipo de material
                                </th>
                                <th className="px-4 py-2 text-left">
                                  Descripción
                                </th>
                                <th className="px-4 py-2 text-left">
                                  Registrador
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {materialesAdicionalesNotif.length > 0 ? (
                                materialesAdicionalesNotif.map((item, idx) => (
                                  <tr
                                    key={item._id || idx}
                                    className="border-t hover:bg-gray-50"
                                  >
                                    <td className="px-4 py-2 text-gray-700">
                                      {safeText(
                                        item.tipo || item.tipoMaterial,
                                        "N/A"
                                      )}
                                    </td>
                                    <td className="px-4 py-2 text-gray-700">
                                      {item.descripcion ||
                                        item.detalle ||
                                        "Sin descripción"}
                                    </td>
                                    <td className="px-4 py-2 text-gray-700">
                                      {item.registrador?.nombre ||
                                        item.registrador?.name ||
                                        item.registrador ||
                                        "N/A"}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan={3}
                                    className="text-center py-4 text-gray-400"
                                  >
                                    Este documento no cuenta con material
                                    adicional.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* TODOS LOS TURNOS */}
                    {tabActivaNotif === "verTurnos" && (
                      <div className="space-y-4">
                        <div className="flex items-center border rounded px-2 mb-3">
                          <Search size={16} className="text-gray-400" />
                          <input
                            value={busquedaTablaNotif}
                            onChange={(e) => setBusquedaTablaNotif(e.target.value)}
                            className="w-full px-2 py-2 outline-none text-sm"
                            placeholder="Buscar turno..."
                          />
                        </div>

                        <div className="overflow-x-auto">
                          <table className="min-w-[1000px] w-full text-xs border border-gray-200">
                            <thead className="bg-[#8B1538] text-white">
                              <tr>
                                <th className="px-3 py-2 text-left">
                                  Instrucción
                                </th>
                                <th className="px-3 py-2 text-left">
                                  Funcionario que turna
                                </th>
                                <th className="px-3 py-2 text-left">
                                  Área de destino
                                </th>
                                <th className="px-3 py-2 text-left">
                                  Prioridad
                                </th>
                                <th className="px-3 py-2 text-left">
                                  Fecha de termino
                                </th>
                                <th className="px-3 py-2 text-left">
                                  Área que turna
                                </th>
                                <th className="px-3 py-2 text-left">
                                  Quién lo turna
                                </th>
                                <th className="px-3 py-2 text-left">
                                  Estatus
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {(turnosDocumentoNotif || []).length > 0 ? (
                                turnosDocumentoNotif
                                  .filter((turno) => {
                                    const text = [
                                      turno?.instruccion?.descripcion ||
                                        turno?.instruccion ||
                                        "",
                                      turno?.remitente?.name ||
                                        turno?.remitente?.nombre ||
                                        "",
                                      turno?.areaDestino?.nombre ||
                                        turno?.areaDestino ||
                                        "",
                                      turno?.prioridad || "",
                                      turno?.status || "",
                                    ]
                                      .join(" ")
                                      .toLowerCase();
                                    return text.includes(
                                      busquedaTablaNotif.toLowerCase()
                                    );
                                  })
                                  .map((turno, idx) => (
                                    <tr
                                      key={turno._id || idx}
                                      className="border-t hover:bg-gray-50"
                                    >
                                      <td className="px-3 py-2 text-gray-700">
                                        {safeText(
                                          turno.instruccion?.descripcion ||
                                            turno.instruccion,
                                          "-"
                                        )}
                                      </td>
                                      <td className="px-3 py-2 text-gray-700">
                                        {safeText(turno.remitente, "-")}
                                      </td>
                                      <td className="px-3 py-2 text-gray-700">
                                        {safeText(turno.areaDestino, "-")}
                                      </td>
                                      <td className="px-3 py-2 text-gray-700">
                                        {turno.prioridad || "-"}
                                      </td>
                                      <td className="px-3 py-2 text-gray-700">
                                        {formatDateForInput(
                                          turno.compromiso ||
                                            turno.fechaTurnado
                                        ) || "-"}
                                      </td>
                                      <td className="px-3 py-2 text-gray-700">
                                        {safeText(
                                          turno.dirigido?.area || turno.turna,
                                          "-"
                                        )}
                                      </td>
                                      <td className="px-3 py-2 text-gray-700">
                                        {safeText(
                                          turno.quienTurna || turno.turna,
                                          "-"
                                        )}
                                      </td>
                                      <td className="px-3 py-2 font-medium">
                                        {turno.status || turno.estatus || "-"}
                                      </td>
                                    </tr>
                                  ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan={8}
                                    className="text-center py-4 text-gray-400"
                                  >
                                    Sin datos en la tabla.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* COPIAS */}
                    {tabActivaNotif === "copias" && (
                      <div className="space-y-4">
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs border border-gray-200">
                            <thead className="bg-[#8B1538] text-white">
                              <tr>
                                <th className="px-4 py-2 text-left">
                                  Funcionario
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {(copiasDocumentoNotif || []).length > 0 ? (
                                copiasDocumentoNotif.map((copia, idx) => (
                                  <tr
                                    key={copia._id || idx}
                                    className="border-t hover:bg-gray-50"
                                  >
                                    <td className="px-4 py-2 text-gray-700">
                                      {copia.funcionario?.nombre ||
                                        copia.funcionario?.label ||
                                        copia.funcionario ||
                                        "N/A"}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td className="text-center py-4 text-gray-400">
                                    Sin copias registradas
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* BITÁCORA */}
                    {tabActivaNotif === "bitacora" && (
                      <div className="w-full flex justify-center bg-[#2f2f2f] py-6">
                        <div className="w-full max-w-4xl">
                          <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                            <div className="text-center py-6 border-b">
                              <h2 className="text-xl font-bold text-gray-800">
                                Bitácora
                              </h2>
                              <p className="text-sm text-gray-500 mt-1">
                                Folio:{" "}
                                {docNotifSeleccionado?.folio || "Sin folio"}
                              </p>
                            </div>
                            <div className="p-6 space-y-4">
                              {(bitacoraDocumentoNotif || []).length > 0 ? (
                                bitacoraDocumentoNotif.map(
                                  (movimiento, index) => {
                                    const esPrincipal =
                                      movimiento.tipo === "registro" ||
                                      movimiento.tipo === "turnado" ||
                                      movimiento.tipo === "autorizado";
                                    return (
                                      <div
                                        key={index}
                                        className={`rounded-xl px-4 py-3 text-sm flex justify-between items-start ${
                                          esPrincipal
                                            ? "bg-[#79142A] text-white"
                                            : "bg-[#CDB19C] text-gray-800"
                                        }`}
                                      >
                                        <div>
                                          <p className="font-semibold">
                                            {movimiento.usuario ||
                                              movimiento.user?.nombre ||
                                              "N/A"}
                                          </p>
                                          <p
                                            className={`text-xs mt-1 ${
                                              esPrincipal ? "opacity-90" : ""
                                            }`}
                                          >
                                            {movimiento.descripcion}
                                          </p>
                                        </div>
                                        <div className="text-right text-xs whitespace-nowrap">
                                          <p>{movimiento.fecha || ""}</p>
                                          <p>{movimiento.hora || ""}</p>
                                        </div>
                                      </div>
                                    );
                                  }
                                )
                              ) : (
                                <div className="text-center text-gray-500 text-sm">
                                  No hay movimientos registrados.
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* FOOTER */}
              <div className="border-t px-6 py-4 flex justify-end bg-gray-50 shrink-0">
                <button
                  onClick={() => setMostrarModalNotifDoc(false)}
                  className="bg-[#8B1538] hover:bg-[#74112F] text-white px-5 py-2.5 rounded-lg transition-all duration-200 shadow-sm text-sm"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* MODAL VISOR DE ARCHIVO */}
      <AnimatePresence>
        {mostrarVisorNotif && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white w-[80%] h-[80%] rounded-lg shadow-lg p-4 relative"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <button
                onClick={() => setMostrarVisorNotif(false)}
                className="absolute top-2 right-2 bg-[#8B1538] hover:bg-[#74112F] text-white rounded-full p-1 transition"
              >
                <Minus size={18} />
              </button>

              <div className="w-full h-full flex items-center justify-center">
                {typeof archivoVistaNotif === "string" ? (
                  archivoVistaNotif.endsWith(".pdf") ? (
                    <iframe
                      src={archivoVistaNotif}
                      className="w-full h-full rounded"
                    />
                  ) : (
                    <img
                      src={archivoVistaNotif}
                      alt="preview"
                      className="max-h-full rounded"
                    />
                  )
                ) : archivoVistaNotif?.type?.includes("image") ? (
                  <img
                    src={URL.createObjectURL(archivoVistaNotif)}
                    alt="preview"
                    className="max-h-full rounded"
                  />
                ) : archivoVistaNotif?.type === "application/pdf" ? (
                  <iframe
                    src={URL.createObjectURL(archivoVistaNotif)}
                    className="w-full h-full rounded"
                  />
                ) : (
                  <p className="text-gray-500">
                    No se puede previsualizar este archivo
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}