import { User, Menu, LogOut, Bell, Check, CheckCheck , Trash2} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useState, useEffect } from "react";
import nayaritLogo from "../assets/images/nayaritLogo.png";
import { verifyTokenRequest } from "../services/auth.service";
import  Swal from "sweetalert2";

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

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Nuevo documento registrado",
      description: "Folio SC-004 fue registrado correctamente",
      time: "Hace 5 minutos",
      read: false,
    },
    {
      id: 2,
      title: "Documento entregado",
      description: "SC-002 fue entregado a Recursos Humanos",
      time: "Hace 1 hora",
      read: false,
    },
    {
      id: 3,
      title: "Recordatorio",
      description: "Tienes 2 documentos pendientes de entrega",
      time: "Ayer",
      read: true,
    },
    {
      id: 4,
      title: "Recordatorio",
      description: "Tienes 2 documentos pendientes de entrega",
      time: "Ayer",
      read: false,
    },
  ]);

  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const userStorage = localStorage.getItem("user");
    if (userStorage) {
      setUsuario(JSON.parse(userStorage));
    }
  }, []);

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
          }
          );
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
        notif.id === id
          ? { ...notif, read: true }
          : notif
      )
    );
  };

  const marcarTodasComoLeidas = async () => {

    notifications.forEach((notif, index) => {
      setTimeout(() => {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notif.id
              ? { ...n, read: true }
              : n
          )
        );
      }, index * 120);
    });

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

      actions:
        "w-full flex flex-row justify-end items-center gap-2 mt-2",

      confirmButton:
        "text-[11px] bg-[#79142A] text-white px-3 py-1.5 rounded-md font-medium",

      cancelButton:
        "text-[11px] bg-gray-100 text-gray-600 px-3 py-1.5 rounded-md font-medium",
    },
  }).then((result) => {
      if (result.isConfirmed) {

        setNotifications((prev) =>
          prev.filter((notif) => !notif.read)
        );

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
        <span className="text-sm text-[#60595D]-600 capitalize">{currentDate}</span>

        {/* Notificaciones */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-[#60595D]-100 rounded transition-colors"
          >
            <Bell size={20} className="text-[#60595D]-700" />

            {notifications.filter((n) => !n.read).length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {notifications.filter((n) => !n.read).length}
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
                  transition={{
                    duration: 0.2,
                    ease: "easeOut",
                  }}
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

                      {/* Marcar todas */}
                      {notifications.some((n) => !n.read) && (
                        <button
                          onClick={marcarTodasComoLeidas}
                          className="relative group p-2 rounded-lg hover:bg-[#79142A]/10 text-[#79142A] transition-colors"
                        >
                          <CheckCheck size={16} />

                          {/* Tooltip */}
                          <div className="absolute -bottom-8 right-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 bg-gray-900 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap shadow-lg">
                            Marcar todas como leídas
                          </div>
                        </button>
                      )}

                      {/* Vaciar bandeja */}
                      {notifications.some((n) => n.read) && (
                        <button
                          onClick={limpiarNotificacionesLeidas}
                          className="relative group p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                        >
                          <Trash2 size={16} />

                          {/* Tooltip */}
                          <div className="absolute -bottom-8 right-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 bg-gray-900 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap shadow-lg">
                            Vaciar leídas
                          </div>
                        </button>
                      )}

                    </div>
                  </div>

                {/* Lista */}
                <LayoutGroup>
                <motion.div
                  layout
                  className="max-h-80 overflow-y-auto"
                >

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
                ) : (showAllNotifications
                      ? notifications
                      : notifications.slice(0, 3)
                    ).map((notif, index) => (
                      <motion.div
                        layout
                        key={notif.id}
                        initial={{
                          opacity: 0,
                          x: 20,
                          scale: 0.95,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                          x: -20,
                          scale: 0.9,
                        }}
                        transition={{
                          duration: 0.22,
                          ease: "easeOut",
                          delay: index * 0.03,
                        }}
                        className={`px-4 py-3 border-b transition-all duration-300 group ${                          notif.read
                            ? "bg-white"
                            : "bg-[#79142A]/[0.03]"
                        }`}
                      >

                        <div className="flex justify-between gap-3">

                          <div
                            className="flex-1 cursor-pointer"
                            onClick={() => marcarComoLeida(notif.id)}
                          >
                            <div className="flex items-center gap-2">

                              {!notif.read && (
                                <motion.div
                                  layout
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                  className="w-2 h-2 rounded-full bg-[#79142A]"
                                />
                              )}

                              <p className="text-sm font-medium text-gray-800">
                                {notif.title}
                              </p>
                            </div>

                            <p className="text-xs text-gray-500 mt-1">
                              {notif.description}
                            </p>

                            <p className="text-[11px] text-gray-400 mt-1">
                              {notif.time}
                            </p>
                          </div>

                          {!notif.read && (
                            <button
                              onClick={() => marcarComoLeida(notif.id)}
                              className="relative group/check opacity-0 group-hover:opacity-100 transition-opacity h-fit mt-1 p-1 rounded-md hover:bg-green-100 text-green-600"
                            >
                              <Check size={15} />

                            {/* Tooltip */}
                            <div className="absolute top-1/2 right-6 -translate-y-1/2 opacity-0 group-hover/check:opacity-100 pointer-events-none transition-opacity duration-200 bg-gray-900 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap shadow-lg">
                              Marcar como leída
                            </div>
                            </button>
                          )}

                        </div>
                      </motion.div>
                    ))}
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
            <span>
              {usuario
                ? `${usuario.nombre || usuario.username}`
                : "Usuario"}
            </span>

          </button>

          <AnimatePresence>
            {showDropdown && (
              <>
                {/* Overlay */}
                <motion.div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />

                {/* Dropdown */}
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
    {/* 🎨 FRANJA DECORATIVA */}
      <div className="w-full h-[90px] overflow-hidden">
        <img
          src="src/app/assets/images/personajenayarit2.jpg" 
          alt="Decoración Nayarit"
          className="w-full h-full object-cover"
        />
      </div>
      
    </header>
  );
}