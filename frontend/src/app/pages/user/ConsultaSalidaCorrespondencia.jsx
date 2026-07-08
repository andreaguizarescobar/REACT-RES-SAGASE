import { Minus, FileText, FileSpreadsheet } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import { getCorrespondencias } from "../../services/correspondencia.service";
import jsPDF from "jspdf";
import logoGobierno from "../../assets/images/nayaritLogo.png";
import GothamRoundedBold from "../../../styles/fonts/GothamRounded-Bold.ttf";
import GothamRoundedBook from "../../../styles/fonts/GothamRounded-Book.ttf";
import MontserratBold from "../../../styles/fonts/Montserrat-Bold.ttf";
import MontserratRegular from "../../../styles/fonts/Montserrat-Regular.ttf";

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

  const [mostrarVisorPDF, setMostrarVisorPDF] = useState(false);
  const [archivoPDF, setArchivoPDF] = useState(null);

  const handleConsultar = () => {
    setModalVisible(true);
    setMenuContextual({ ...menuContextual, visible: false });
  };

  const handleCerrarModal = () => {
    setModalVisible(false);
    setMenuContextual({ ...menuContextual, visible: false, registro: null });
  };


const exportarExcel = async () => {
  const hoy = new Date();

  const fecha =
    String(hoy.getDate()).padStart(2, "0") +
    "-" +
    String(hoy.getMonth() + 1).padStart(2, "0") +
    "-" +
    hoy.getFullYear();

  const nombreAutomatico = `Salida_Correspondencia_${fecha}`;

  const headers = "Folio,Fecha,Nivel,Folio SAGA,Destinatario\n";

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

  // 🔥 MISMO NOMBRE QUE EL PDF
  link.download = `${nombreAutomatico}.csv`;

  link.click();
};

const exportarPDF = async () => {
  const hoy = new Date();

  const fecha =
    String(hoy.getDate()).padStart(2, "0") +
    "-" +
    String(hoy.getMonth() + 1).padStart(2, "0") +
    "-" +
    hoy.getFullYear();

  const nombreAutomatico = `Salida_Correspondencia_${fecha}`;

  // IMPRIMIR FILTRADOS, SINO SE INGRESÓ IMPRIMIR TODOS
  const datosParaPDF =
    criterio.trim().length > 0
      ? resultadosFiltrados
      : correspondencias;

  const pdf = await generarSalidaCorrespondencia(
    datosParaPDF,
    nombreAutomatico
  );

  setArchivoPDF(pdf);
  setMostrarVisorPDF(true);
};

const generarSalidaCorrespondencia = async (datos, nombreArchivo) => {
  const doc = new jsPDF("p", "mm", "letter");

  // =========================
  // FUENTES (opcional si ya las tienes importadas)
  // =========================
  doc.addFont(GothamRoundedBook, "GothamRounded", "normal");
  doc.addFont(GothamRoundedBold, "GothamRounded", "bold");

  doc.addFont(MontserratRegular, "Montserrat", "normal");
  doc.addFont(MontserratBold, "Montserrat", "bold");

  // =========================
  // COLORES
  // =========================
  const COLORS = {
    grisPrincipal: [96, 89, 93],
    grisSecundario: [155, 157, 154],
    blanco: [255, 255, 255],
    negro: [0, 0, 0],
  };

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const margin = 10;
  const contentWidth = pageWidth - margin * 2;

  const hoy = new Date();
  const fechaHoy = `${String(hoy.getDate()).padStart(2, "0")}/${String(
    hoy.getMonth() + 1
  ).padStart(2, "0")}/${hoy.getFullYear()}`;

  let y = 40;

  // =========================
  // HEADER (ESTILO SAGASE)
  // =========================
  const dibujarEncabezadoPagina = () => {
    doc.setLineWidth(0.2);

    // Fondo header
    doc.setFillColor(...COLORS.grisSecundario);
    doc.rect(margin, 12, contentWidth, 18, "F");

    // LOGO (igual que acuerdos)
    doc.addImage(
      logoGobierno,
      "PNG",
      margin + 2,
      12,
      85,
      18
    );

    // Bloque fecha
    doc.setFillColor(...COLORS.grisPrincipal);
    doc.roundedRect(pageWidth - 60, 17, 25, 8, 2, 2, "F");

    doc.setFont("Montserrat", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.blanco);
    doc.text("FECHA", pageWidth - 47, 22, { align: "center" });

    doc.setTextColor(...COLORS.grisPrincipal);
    doc.text(fechaHoy, pageWidth - 22, 22, { align: "center" });
  };

  dibujarEncabezadoPagina();

  // =========================
  // TITULO
  // =========================
  doc.setFont("GothamRounded", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.grisPrincipal);

  doc.text(
    "REPORTE DE SALIDA DE CORRESPONDENCIA",
    pageWidth / 2,
    y,
    { align: "center" }
  );

  y += 6;

  doc.setFont("Montserrat", "normal");
  doc.setFontSize(10);

  // doc.text(
  //   `Periodo de consulta`,
  //   pageWidth / 2,
  //   y,
  //   { align: "center" }
  // );

  // y += 8;

  // =========================
  // TABLA
  // =========================
  const columnas = [
    "FOLIO",
    "FECHA",
    "NIVEL",
    "SAGA",
    "DESTINATARIO",
  ];

  const anchos = [25, 40, 25, 35, 65];

  const dibujarEncabezadoTabla = () => {
    let x = margin;

    columnas.forEach((titulo, i) => {
      doc.setFillColor(...COLORS.grisPrincipal);
      doc.rect(x, y, anchos[i], 10, "F");

      doc.setFont("Montserrat", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.blanco);

      doc.text(titulo, x + anchos[i] / 2, y + 6, {
        align: "center",
      });

      x += anchos[i];
    });

    y += 10;
  };

  dibujarEncabezadoTabla();

  let fila = 0;

  // =========================
  // DATA
  // =========================
  datos.forEach((r) => {
    const valores = [
      r.folioSalida || "-",
      r.fechaRegistro || "-",
      r.nivelImportancia || "-",
      r.folioSAGA || "-",
      r.destinatario || "-",
    ];

    const lineas = valores.map((v, i) =>
      doc.splitTextToSize(String(v), anchos[i] - 3)
    );

    const maxLines = Math.max(...lineas.map((l) => l.length));
    const rowHeight = Math.max(10, maxLines * 4 + 4);

    if (y + rowHeight > pageHeight - 20) {
      doc.addPage();
      dibujarEncabezadoPagina();
      y = 40;
      dibujarEncabezadoTabla();
    }

    let x = margin;

    lineas.forEach((l, i) => {
      const fondo =
        fila % 2 === 0 ? [255, 255, 255] : [245, 245, 245];

      doc.setFillColor(...fondo);
      doc.rect(x, y, anchos[i], rowHeight, "F");

      doc.setDrawColor(...COLORS.grisSecundario);
      doc.rect(x, y, anchos[i], rowHeight);

      doc.setFont("Montserrat", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.negro);

      doc.text(l, x + 2, y + 5);

      x += anchos[i];
    });

    y += rowHeight;
    fila++;
  });

  // =========================
  // FOOTER
  // =========================
  const footerY = pageHeight - 15;

  doc.setDrawColor(...COLORS.grisPrincipal);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  doc.setFont("Montserrat", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.grisPrincipal);

  doc.text(
    "Sistema Automatizado de Gestión de Correspondencia",
    pageWidth / 2,
    footerY + 5,
    { align: "center" }
  );

  // =========================
  // DESCARGA
  // =========================
  const nombrePDF = `${nombreArchivo}.pdf`;

  const pdfBlob = doc.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);

  doc.save(nombrePDF);

  return {
    url: pdfUrl,
    nombre: nombrePDF,
  };
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
          <label className="block text-sm font-medium text-gray-700">
            Criterio de búsqueda
          </label>

          <textarea
            value={criterio}
            onChange={(e) => setCriterio(e.target.value)}
            placeholder="Ingrese folio, fecha, destinatario ..."
            className="
                w-full
                rounded-lg
                border
                border-gray-300
                px-3
                py-2
                text-sm
                focus:border-[#8B1538]
                focus:ring-2
                focus:ring-[#8B1538]/20
                outline-none
                resize-none
            "
            rows={1}
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

              <div className="flex items-center gap-3">

              {/* Exportar PDF */}
              <button
                onClick={exportarPDF}
                className="
                  flex
                  items-center
                  gap-2
                  px-5
                  h-11
                  rounded-xl
                  bg-[#8B1538]
                  text-white
                  font-medium
                  shadow-md
                  hover:shadow-lg
                  hover:scale-105
                  transition-all
                  duration-200
                "
              >
                <FileText size={18} />
                Exportar PDF
              </button>

              {/* Exportar Excel */}
              <button
                onClick={exportarExcel}
                className="
                  flex
                  items-center
                  gap-2
                  px-5
                  h-11
                  rounded-xl
                  bg-emerald-600
                  text-white
                  font-medium
                  shadow-md
                  hover:bg-emerald-700
                  hover:shadow-lg
                  hover:scale-105
                  transition-all
                  duration-200
                "
              >
                <FileSpreadsheet size={18} />
                Exportar Excel
              </button>

            </div>

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
                  <th className="px-3 py-2 text-left">Folio salida</th>
                  <th className="px-3 py-2 text-left">Fecha</th>
                  <th className="px-3 py-2 text-left">Nivel</th>
                  <th className="px-3 py-2 text-left">No. Documento</th>
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

      <AnimatePresence>
        {mostrarVisorPDF && archivoPDF && (
          <motion.div
            className="fixed inset-0 z-[999] bg-black/60 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white w-[90%] h-[90%] rounded-lg overflow-hidden"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
            >
              <div className="bg-[#8B1538] text-white flex justify-between items-center p-3">
                <span>{archivoPDF.nombre}</span>

                <button
                  onClick={() => setMostrarVisorPDF(false)}
                  className="px-3 py-1 bg-white text-[#8B1538] rounded"
                >
                  Cerrar
                </button>
              </div>

              <iframe
                src={archivoPDF.url}
                className="w-full h-[calc(100%-56px)]"
                title="PDF"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
