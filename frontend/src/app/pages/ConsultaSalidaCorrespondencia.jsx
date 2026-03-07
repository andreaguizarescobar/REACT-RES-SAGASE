import { Minus, FileText, FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function ConsultaSalidaCorrespondencia() {
  const [criterio, setCriterio] = useState("");
  const [resultados, setResultados] = useState([]);
  const [menuContextual, setMenuContextual] = useState({
    visible: false,
    x: 0,
    y: 0,
    registro: null,
  });
  const [modalVisible, setModalVisible] = useState(false);

  const dataMock = [
    {
      folioSalida: "1-2023",
      fechaRegistro: "2023-03-06T10:00",
      nivelImportancia: "urgente",
      folioSAGA: "4-2023",
      destinatario:
        "Leticia Solís Ramírez Administración Portuaria Integral de Tampico",
    },
    {
      folioSalida: "2-2023",
      fechaRegistro: "2023-03-28T19:36",
      nivelImportancia: "urgente",
      folioSAGA: "1212",
      destinatario:
        "Luis Pérez Sánchez Administración Portuaria Integral Dos Bocas",
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

  const handleBuscar = () => {
    const texto = criterio.toLowerCase();

    const filtrado = dataMock.filter(
      (item) =>
        item.folioSalida.toLowerCase().includes(texto) ||
        item.destinatario.toLowerCase().includes(texto) ||
        item.folioSAGA.toLowerCase().includes(texto) ||
        item.nivelImportancia.toLowerCase().includes(texto)
    );

    setResultados(filtrado);
  };

  const handleRightClick = (e, registro) => {
    e.preventDefault();

    setMenuContextual({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      registro,
    });
  };

  const handleConsultar = () => {
    setModalVisible(true);
    setMenuContextual({ ...menuContextual, visible: false });
  };

  const exportToCSV = () => {
    const headers =
      "Folio,Fecha,Nivel,Folio SAGA,Destinatario\n";

    const rows = resultados
      .map(
        (r) =>
          `${r.folioSalida},${r.fechaRegistro},${r.nivelImportancia},${r.folioSAGA},"${r.destinatario}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "consulta_salida.csv";
    link.click();
  };

  const exportToPDF = () => {
    window.print();
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
          Consulta Salida de correspondencia
        </h1>

        <button className="w-6 h-6 flex items-center justify-center rounded-full bg-[#8B1538] text-white">
          <Minus size={14} />
        </button>
      </div>

      <div className="bg-white p-6 rounded-b-md shadow-sm space-y-6 text-xs">

        {/* Buscador */}
        <div>
          <label className="block mb-2 font-medium">
            Criterio de búsqueda:
          </label>

          <textarea
            value={criterio}
            onChange={(e) => setCriterio(e.target.value)}
            className="w-full border rounded px-2 py-2"
            rows={2}
          />
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleBuscar}
            className="bg-red-600 text-white px-12 py-2 rounded hover:opacity-90"
          >
            Buscar
          </button>
        </div>

        {/* Exportar */}
        <AnimatePresence>
          {resultados.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex gap-4"
            >

              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
              >
                <FileText size={16} /> Exportar PDF
              </button>

              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
              >
                <FileSpreadsheet size={16} /> Exportar Excel
              </button>

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
              onClick={handleConsultar}
              className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
            >
              Consultar registro
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
