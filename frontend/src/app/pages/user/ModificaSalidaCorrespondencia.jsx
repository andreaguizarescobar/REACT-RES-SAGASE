import { Minus } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function ModificaSalidaCorrespondencia() {
  const [criterio, setCriterio] = useState("");
  const [resultados, setResultados] = useState([]);
  const [menuContextual, setMenuContextual] = useState({
    visible: false,
    x: 0,
    y: 0,
    registro: null,
  });

  // Datos simulados
  const dataMock = [
    {
      folioSalida: "1-2023",
      fechaRegistro: "2023-03-06T10:00",
      nivelImportancia: "urgente",
      folioSAGA: "4-2023",
      destinatario:
        "Leticia Solís Ramírez Administración Portuaria Integral de Tampico, S.A. de C.V. (API)",
    },
    {
      folioSalida: "2-2023",
      fechaRegistro: "2023-03-28T19:36",
      nivelImportancia: "urgente",
      folioSAGA: "1212",
      destinatario:
        "Luis Pérez Sánchez Administración Portuaria Integral de Dos Bocas, S.A. de C.V. (API)",
    },
    {
      folioSalida: "3-2023",
      fechaRegistro: "2023-04-18T12:30",
      nivelImportancia: "normal",
      folioSAGA: "220",
      destinatario:
        "ANTONIO AGUILAR OLARTE INSTITUTO PARA DEVOLVER AL PUEBLO LO ROBADO",
    },
  ];

  const resultadosFiltrados = dataMock.filter((item) => {
  const texto = criterio.toLowerCase();

  return (
    item.folioSalida.toLowerCase().includes(texto) ||
    item.folioSAGA.toLowerCase().includes(texto) ||
    item.destinatario.toLowerCase().includes(texto) ||
    item.nivelImportancia.toLowerCase().includes(texto)
  );
});

  const handleRightClick = (e, registro) => {
    e.preventDefault();

    setMenuContextual({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      registro,
    });
  };

  const handleModificar = () => {
    alert(`Modificar registro ${menuContextual.registro?.folioSalida}`);

    setMenuContextual({
      ...menuContextual,
      visible: false,
    });
  };

  return (
    <div
      className="flex-1 p-6 bg-gray-100 overflow-y-auto"
      onClick={() =>
        menuContextual.visible &&
        setMenuContextual({ ...menuContextual, visible: false })
      }
    >
      {/* Header */}
      <div className="bg-gray-300 rounded-t-md flex items-center justify-between px-4 py-2">
        <h1 className="text-sm font-semibold text-gray-800">
          Modifica Salida de correspondencia
        </h1>

        <button className="w-6 h-6 flex items-center justify-center rounded-full bg-[#8B1538] text-white">
          <Minus size={14} />
        </button>
      </div>

      {/* Contenedor */}
      <div className="bg-white p-6 rounded-b-md shadow-sm space-y-6 text-xs">
        {/* Buscador */}
        <div>
          <label className="block mb-2 font-medium">
            Criterio de búsqueda:
          </label>

          <textarea
            value={criterio}
            onChange={(e) => setCriterio(e.target.value)}
            className="w-full border rounded px-2 py-2 resize-none"
            rows={2}
          />
        </div>

        {/* Tabla */}
        <AnimatePresence>
          {resultadosFiltrados.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="overflow-x-auto border rounded"
            >
              <table className="min-w-full text-xs">
                <thead className="bg-[#8B1538] text-white">
                  <tr>
                    <th className="px-3 py-2 text-left">Folio de salida</th>
                    <th className="px-3 py-2 text-left">
                      Fecha y hora de registro
                    </th>
                    <th className="px-3 py-2 text-left">
                      Nivel de importancia
                    </th>
                    <th className="px-3 py-2 text-left">Folio SAGA</th>
                    <th className="px-3 py-2 text-left">
                      Nombre del destinatario o Institución
                    </th>
                    <th className="px-3 py-2 text-left">Número de Guía</th>
                  </tr>
                </thead>

                <tbody>
                  {resultadosFiltrados.map((registro, index) => (
                    <tr
                      key={index}
                      onContextMenu={(e) =>
                        handleRightClick(e, registro)
                      }
                      className="border-t hover:bg-gray-100 cursor-context-menu"
                    >
                      <td className="px-3 py-2">{registro.folioSalida}</td>
                      <td className="px-3 py-2">{registro.fechaRegistro}</td>
                      <td className="px-3 py-2 capitalize">
                        {registro.nivelImportancia}
                      </td>
                      <td className="px-3 py-2">{registro.folioSAGA}</td>
                      <td className="px-3 py-2">{registro.destinatario}</td>
                      <td className="px-3 py-2">
                        {registro.numeroGuia || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Menú contextual */}
      <AnimatePresence>
        {menuContextual.visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed bg-white border shadow-md rounded text-xs z-50"
            style={{
              top: menuContextual.y,
              left: menuContextual.x,
            }}
          >
            <button
              onClick={handleModificar}
              className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
            >
              Modificar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
