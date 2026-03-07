import { useState } from "react";
import { Inbox, ListTodo, Send } from "lucide-react";
import { Switch } from "./ui/switch";

import { TableroControl } from "../pages/TableroControl";
import { RegistrarDocumento } from "../pages/RegistrarDocumento.jsx";
import BuscadorDocumentos from "../pages/BuscadorDocumentos.jsx";
import { ReporteAsuntos } from "../pages/ReporteAsunto";
import { GeneracionOficios } from "../pages/GeneracionOficios";
import { ControlOficios } from "../pages/ControlOficios";
import { SalidaCorrespondencia } from "../pages/SalidaCorrespondencia";
import { ModificaSalidaCorrespondencia } from "../pages/ModificaSalidaCorrespondencia";
import { ConsultaSalidaCorrespondencia } from "../pages/ConsultaSalidaCorrespondencia";
import { ReporteSalidaCorrespondencia } from "../pages/ReporteSalidaCorrespondencia";
import { TableroControlSalidaCorrespondencia } from "../pages/TableroControlSalidaCorrespondencia";
import { RegistraInstruccionesSolicitudesNotificacionesInt } from "../pages/RegistraInstruccionesSolicitudesNotificacionesInt";
import { ReporteAcuerdos } from "../pages/ReporteAcuerdos";

import { motion, AnimatePresence } from "framer-motion";

export function MainContent({ currentView }) {
  const [soloTurnados, setSoloTurnados] = useState(false);

  const pageTransition = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.2, ease: "easeInOut" },
  };

  const renderView = () => {
    switch (currentView) {
      case "tablero-control":
        return <TableroControl />;

      case "registra-documento":
        return <RegistrarDocumento />;

      case "buscador-documento":
        return <BuscadorDocumentos />;

      case "reporte-asuntos":
        return <ReporteAsuntos />;

      case "reporte-acuerdos":
        return <ReporteAcuerdos />;

      case "generacion-oficios":
        return <GeneracionOficios />;

      case "control-oficios":
        return <ControlOficios />;

      case "salida-correspondencia":
        return <SalidaCorrespondencia />;

      case "modificaS-correspondencia":
        return <ModificaSalidaCorrespondencia />;

      case "consultaS-correspondencia":
        return <ConsultaSalidaCorrespondencia />;

      case "reporteS-correspondencia":
        return <ReporteSalidaCorrespondencia />;

      case "tableroS-correspondencia":
        return <TableroControlSalidaCorrespondencia />;

      case "registra-notinternas":
        return <RegistraInstruccionesSolicitudesNotificacionesInt />;

      default:
        return (
          <main className="flex-1 flex flex-col bg-white overflow-hidden">
            {/* Header secciones */}
            <div className="border-b border-gray-200 flex items-stretch">
              <div className="flex-1 px-4 py-3 flex items-center gap-2 border-r border-gray-200">
                <Inbox size={16} className="text-[#8B1538]" />
                <span className="text-xs text-gray-700">Entrada</span>
              </div>

              <div className="flex-1 px-4 py-3 flex items-center justify-between border-r border-gray-200">
                <div className="flex items-center gap-2">
                  <ListTodo size={16} className="text-[#8B1538]" />
                  <span className="text-xs text-gray-700">
                    Mis Pendientes
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">
                    Sólo no turnados
                  </span>
                  <Switch
                    checked={soloTurnados}
                    onCheckedChange={setSoloTurnados}
                  />
                </div>
              </div>

              <div className="flex-1 px-4 py-3 flex items-center gap-2">
                <Send size={16} className="text-[#8B1538]" />
                <span className="text-xs text-gray-700">Salida</span>
              </div>
            </div>

            {/* Contenido columnas */}
            <div className="flex-1 flex overflow-y-auto">
              <div className="flex-1 flex items-start justify-center pt-8 px-4 border-r border-gray-200">
                <p className="text-gray-400 text-xs">
                  No hay instancias en esta bandeja.
                </p>
              </div>

              <div className="flex-1 flex items-start justify-center pt-8 px-4 border-r border-gray-200">
                <p className="text-gray-400 text-xs">
                  No hay instancias en esta bandeja.
                </p>
              </div>

              <div className="flex-1 flex items-start justify-center pt-8 px-4">
                <p className="text-gray-400 text-xs">
                  No hay instancias en esta bandeja.
                </p>
              </div>
            </div>
          </main>
        );
    }
  };

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