import { Minus, FileText, FileSpreadsheet } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import { getCorrespondencias } from "../../services/correspondencia.service";

export function ConsultaSalidaCorrespondencia() {
  const [criterio, setCriterio] = useState("");
  const [correspondencias, setCorrespondencias] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [menuContextual, setMenuContextual] = useState({
    visible: false,
    x: 0,
    y: 0,
    registro: null,
  });
  const [modalVisible, setModalVisible] = useState(false);

  // Cargar correspondencias al montar el componente
  useEffect(() => {
    cargarCorrespondencias();
  }, []);

  const cargarCorrespondencias = async () => {
    setCargando(true);
    try {
      const response = await getCorrespondencias();
      if (!response.ok) {
        console.log('Error cargando correspondencias:', await response.json());
        throw new Error('Error al cargar correspondencias');
      }
      const datos = await response.json();
      // Mapear datos a estructura esperada por la tabla
      const correspondenciasFormateadas = (datos || []).map((item) => ({
        _id: item._id,
        folioSalida: item.folio || '',
        fechaRegistro: item.fecha ? new Date(item.fecha).toLocaleString() : '',
        nivelImportancia: item.importancia || '',
        folioSAGA: item.doc ? item.doc.docId || 'Sin datos' : 'Sin datos',
        asunto: item.asunto || '',
        soporte: item.soporte || '',
        destinatario: item.destinatario ? item.destinatario.name || 'Sin datos' : 'Sin datos',
      }));
      setCorrespondencias(correspondenciasFormateadas);
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las correspondencias',
      });
    } finally {
      setCargando(false);
    }
  };

  const resultadosFiltrados = correspondencias.filter((item) => {
    const texto = criterio.toLowerCase();

    return (
      (item.folioSalida && item.folioSalida.toLowerCase().includes(texto)) ||
      (item.destinatario && item.destinatario.toLowerCase().includes(texto)) ||
      (item.folioSAGA && item.folioSAGA.toLowerCase().includes(texto)) ||
      (item.nivelImportancia && item.nivelImportancia.toLowerCase().includes(texto)) ||
      (item.asunto && item.asunto.toLowerCase().includes(texto))
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

  const handleConsultar = () => {
    setModalVisible(true);
    setMenuContextual({ ...menuContextual, visible: false });
  };

  const handleCerrarModal = () => {
    setModalVisible(false);
    setMenuContextual({ ...menuContextual, visible: false, registro: null });
  };

  const exportToCSV = () => {
    const headers =
      "Folio,Fecha,Nivel,Folio SAGA,Destinatario\n";

    const rows = resultadosFiltrados
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

        {/* Exportar */}
        <AnimatePresence>
          {resultadosFiltrados.length > 0 && (
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

        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="overflow-x-auto border rounded"
          >
            <table className="min-w-full text-xs">
              <thead className="bg-[#79142A] text-white">
                <tr>
                  <th className="px-3 py-2 text-left">Folio</th>
                  <th className="px-3 py-2 text-left">Fecha</th>
                  <th className="px-3 py-2 text-left">Nivel</th>
                  <th className="px-3 py-2 text-left">Folio SAGA</th>
                  <th className="px-3 py-2 text-left">Destinatario</th>
                </tr>
              </thead>

              <tbody>
        {cargando ? (
          <div className="text-center py-4 text-gray-500">Cargando correspondencias...</div>
        ) : resultadosFiltrados.length === 0 ? (
          <tr>
            <td colSpan="5" className="text-center py-4 text-gray-500">
              Sin resultados
            </td>
          </tr>
        ) : (
          <>
            {resultadosFiltrados.map((registro, index) => (
              <tr
                key={registro._id || index}
                onContextMenu={(e) => handleRightClick(e, registro)}
                className="border-t hover:bg-gray-100 cursor-context-menu"
              >
                <td className="px-3 py-2">{registro.folioSalida}</td>
                <td className="px-3 py-2">{registro.fechaRegistro}</td>
                <td className="px-3 py-2 capitalize">
                  {registro.nivelImportancia}
                </td>
                <td className="px-3 py-2">{registro.folioSAGA}</td>
                <td className="px-3 py-2">{registro.destinatario}</td>
              </tr>
            ))}
          </>
        )}
              </tbody>
            </table>
          </motion.div>
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

      {/* Modal de consulta */}
      <AnimatePresence>
        {modalVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 flex items-center justify-center bg-transparent z-50"
          >
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-lg font-semibold mb-4">
                Detalles de la correspondencia
              </h2>

              <div className="mb-4">
                <p>
                  <span className="font-medium">Folio de salida:</span>{" "}
                  {menuContextual.registro?.folioSalida}
                </p>
                <p>
                  <span className="font-medium">Fecha de registro:</span>{" "}
                  {menuContextual.registro?.fechaRegistro}
                </p>
                <p>
                  <span className="font-medium">Nivel de importancia:</span>{" "}
                  {menuContextual.registro?.nivelImportancia}
                </p>
                <p>
                  <span className="font-medium">Soporte:</span>{" "}
                  {menuContextual.registro?.soporte}
                </p>
                <p>
                  <span className="font-medium">Folio SAGA:</span>{" "}
                  {menuContextual.registro?.folioSAGA || 'Sin datos'}
                </p>
                <p>
                  <span className="font-medium">Asunto:</span>{" "}
                  {menuContextual.registro?.asunto}
                </p>
                <p>
                  <span className="font-medium">Destinatario:</span>{" "}
                  {menuContextual.registro?.destinatario}
                </p>
              </div>

              <button
                onClick={handleCerrarModal}
                className="px-4 py-2 bg-[#79142A] text-white rounded"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
