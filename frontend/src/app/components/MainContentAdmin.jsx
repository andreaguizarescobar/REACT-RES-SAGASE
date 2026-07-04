// Importación de hooks principales de React para manejo de estado y ciclo de vida
import { useState, useEffect } from "react";

// Íconos utilizados en el dashboard (UI visual de métricas)
import {
  FolderKanban,
  Users2,
  ShieldCheck,
  UserPlus,
  Play,
  FilePlus2
} from "lucide-react";

// Switch UI (no se usa actualmente pero está disponible para futuras funcionalidades)
import { Switch } from "./ui/switch";

// Componentes de vistas administrativas según navegación del sidebar
import { Projects } from "../pages/admin/Projects";
import { Users } from "../pages/admin/Users";
import { Roles } from "../pages/admin/Roles";
import { SistemRoles } from "../pages/admin/SistemRoles";
import { AltaUsuarios } from "../pages/admin/AltaUsuarios";
import { AsignacionRoles } from "../pages/admin/AsignacionRoles";
import { SolicitudAltaUsuarios } from "../pages/admin/SolicitudAltaUsuarios";
import { GestionAreas } from "../pages/admin/GestionAreas";

// Animaciones para transiciones entre vistas
import { motion, AnimatePresence } from "framer-motion";

// Servicio API que obtiene las métricas del dashboard desde backend
import { getDashboard } from "../services/dashboard.service";

export function MainContentAdmin({ currentView, selectedAreaId }) {

  /**
   * Estado global del dashboard
   * Contiene métricas principales del sistema:
   * - usuarios: total de usuarios registrados
   * - roles: desglose por tipo de rol
   * - solicitudes: solicitudes pendientes
   * - proyectos: total de proyectos
   */
  const [dashboard, setDashboard] = useState({
    usuarios: 0,
    roles: {
      totalTipos: 4,
      admin: 0,
      validadores: 0,
      ejecutores: 0,
      registradores: 0
    },
    solicitudes: 0,
    proyectos: 0
  });

  /**
   * useEffect ejecuta la carga del dashboard al montar el componente
   */
  useEffect(() => {
    cargarDashboard();
  }, []);

  /**
   * Calcula el total de usuarios por roles no administrativos
   * (puede usarse para métricas adicionales)
   */
  const totalRoles =
    dashboard.roles.validadores +
    dashboard.roles.ejecutores +
    dashboard.roles.registradores;

  /**
   * Función que consume la API del backend para obtener métricas del dashboard
   * Maneja la respuesta y la guarda en el estado global
   */
  const cargarDashboard = async () => {
    try {
      const data = await getDashboard(); // petición al backend
      console.log("Dashboard:", data);   // debug temporal
      setDashboard(data);                // actualización de estado
    } catch (error) {
      console.error(error);              // manejo básico de errores
    }
  };

  /**
   * Animación del contenedor de las tarjetas del dashboard.
   * Permite que las tarjetas aparezcan de forma escalonada.
   */
  const dashboardContainer = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.12
      }
    }
  };

  /**
   * Animación individual de cada tarjeta del dashboard.
   */
  const dashboardItem = {
    hidden: {
      opacity: 0,
      y: 25,
      scale: 0.96
    },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.35,
        ease: "easeOut"
      }
    }
  };

  /**
   * Configuración de animaciones entre vistas del dashboard
   */
  const pageTransition = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.2, ease: "easeInOut" },
  };

  /**
   * Renderizado dinámico de vistas según la opción seleccionada en el sidebar
   * Permite navegación sin recargar la página
   */
  const renderView = () => {
    switch (currentView) {

      case "proyectos-admin":
        return <Projects />;

      case "usuarios-admin":
        return <Users />;

      case "roles-admin":
        return <Roles />;

      case "roles-sistema-admin":
        return <SistemRoles />;

      case "alta-usuarios-admin":
        return <AltaUsuarios />;

      case "asignacion-roles-admin":
        return <AsignacionRoles />;

      case "solicitudes-usuarios-admin":
        return <SolicitudAltaUsuarios />;

      case "gestion-areas-admin":
        return <GestionAreas selectedAreaId={selectedAreaId} />;

      // Vista por defecto: dashboard principal
      default:
        return (
          <main className="flex-1 bg-[#F8F9FB] overflow-y-auto">
            <div className="max-w-7xl mx-auto p-8">

              {/* Encabezado de bienvenida */}
              <div className="mb-8">
                <h1 className="text-3xl font-semibold text-gray-800">
                  Bienvenido, Administrador
                </h1>

                <p className="text-gray-500 mt-2">
                  Administre usuarios, proyectos y roles del sistema SAGASE.
                </p>
              </div>

              {/* Tarjetas de métricas principales */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
                variants={dashboardContainer}
                initial="hidden"
                animate="show"
              >
                {/* Proyectos */}
                <motion.div
                  variants={dashboardItem}
                  whileHover={{
                    y: -5,
                    transition: { duration: 0.2 }
                  }}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
                >
                    <div className="flex justify-between items-center">
                    <FolderKanban className="text-[#8B1538]" size={30} />
                    <span className="text-4xl font-bold text-[#8B1538]">1</span>
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-gray-800">
                    Proyectos
                  </h3>

                  <p className="text-sm text-gray-500">
                    Proyectos registrados.
                  </p>
                </motion.div>

                {/* Usuarios */}
                <motion.div
                  variants={dashboardItem}
                  whileHover={{
                    y: -5,
                    transition: { duration: 0.2 }
                  }}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
                >
                    <div className="flex justify-between items-center">
                    <Users2 className="text-[#8B1538]" size={30} />
                    <span className="text-4xl font-bold text-[#8B1538]">
                      {dashboard.usuarios}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-gray-800">
                    Usuarios
                  </h3>

                  <p className="text-sm text-gray-500">
                    Total de usuarios registrados en SAGASE.
                  </p>
                </motion.div>

                {/* Roles del sistema */}
                <motion.div
                  variants={dashboardItem}
                  whileHover={{
                    y: -5,
                    transition: { duration: 0.2 }
                  }}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
                >
                    <div className="flex justify-between items-center">
                    <ShieldCheck className="text-[#8B1538]" size={30} />

                    <span className="text-4xl font-bold text-[#8B1538]">
                      {dashboard.roles.totalTipos}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-gray-800">
                    Tipos de Roles
                  </h3>

                  <p className="text-sm text-gray-500 mb-4">
                    Total de usuarios por rol del sistema
                  </p>

                  {/* Desglose por rol */}
                  <div className="text-sm text-gray-600 space-y-2">

                    <div className="flex items-center gap-2">
                      <ShieldCheck size={16} className="text-purple-500" />
                      <span>
                        Validadores: {dashboard.roles?.validadores ?? 0}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Play size={16} className="text-yellow-500" />
                      <span>
                        Ejecutores: {dashboard.roles?.ejecutores ?? 0}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <FilePlus2 size={16} className="text-green-500" />
                      <span>
                        Registradores: {dashboard.roles?.registradores ?? 0}
                      </span>
                    </div>

                  </div>
                </motion.div>

                {/* Solicitudes */}
                <motion.div
                  variants={dashboardItem}
                  whileHover={{
                    y: -5,
                    transition: { duration: 0.2 }
                  }}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
                >
                    <div className="flex justify-between items-center">
                    <UserPlus className="text-[#8B1538]" size={30} />
                    <span className="text-4xl font-bold text-[#8B1538]">
                      {dashboard.solicitudes}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-gray-800">
                    Solicitudes
                  </h3>

                  <p className="text-sm text-gray-500">
                    Pendientes por revisar que envían usuarios para crear cuenta.
                    <br />
                    Accede a "Solicitudes de Usuarios" para gestionarlas.
                  </p>
                </motion.div>

              </motion.div>

            </div>
          </main>
        );
    }
  };

  /**
   * Contenedor principal con animación entre vistas
   */
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentView}
        {...pageTransition}
        className="flex-1 flex flex-col overflow-hidden"
      >
        {renderView()}
      </motion.div>
    </AnimatePresence>
  );
}