import { User, Menu, LogOut, Bell } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import nayaritLogo from "/src/app/assets/nayaritLogo.png";

export function Header({ onToggleSidebar, onGoHome }) {
  const navigate = useNavigate();
  const location = useLocation();
  // Determina si es admin por la ruta o por una bandera en localStorage (ajusta según tu auth)
  const isAdmin =
    location?.pathname?.startsWith?.("/admin") ||
    localStorage.getItem("isAdmin") === "true";

  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const currentDate = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const notifications = [
    {
      id: 1,
      title: "Nuevo documento registrado",
      description: "Folio SC-004 fue registrado correctamente",
      time: "Hace 5 minutos",
    },
    {
      id: 2,
      title: "Documento entregado",
      description: "SC-002 fue entregado a Recursos Humanos",
      time: "Hace 1 hora",
    },
    {
      id: 3,
      title: "Recordatorio",
      description: "Tienes 2 documentos pendientes de entrega",
      time: "Ayer",
    },
  ];

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} className="text-gray-700" />
        </button>

        <button onClick={onGoHome} className="hover:opacity-80 transition">
          <img
            src={nayaritLogo}
            alt="Nayarit Secretaría de Educación"
            className="h-12 mb-2"
          />
        </button>

        <h1 className="text-lg text-gray-800">
          {isAdmin ? "Administración" : "Escritorio Virtual"}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600 capitalize">{currentDate}</span>

        {/* Notificaciones */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-gray-100 rounded transition-colors"
          >
            <Bell size={20} className="text-gray-700" />

            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowNotifications(false)}
              />

              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                <div className="px-4 py-3 border-b text-sm font-semibold text-gray-700">
                  Notificaciones
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="px-4 py-3 border-b hover:bg-gray-50 cursor-pointer"
                    >
                      <p className="text-sm font-medium text-gray-800">
                        {notif.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        {notif.description}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        {notif.time}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="text-center py-2 text-xs text-[#8B1538] hover:bg-gray-50 cursor-pointer">
                  Ver todas
                </div>
              </div>
            </>
          )}
        </div>

        {/* Usuario */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-100 px-3 py-2 rounded transition-colors"
          >
            <User size={18} />
            <span>
              {isAdmin ? "Administración_SAGA" : "Andrea Escobar"}
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
    </header>
  );
}