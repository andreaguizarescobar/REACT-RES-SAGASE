import { Minus } from 'lucide-react';
import { useState } from 'react';
import { reporteAsuntos } from '../../services/document.service';

import Swal from "sweetalert2";
import jsPDF from "jspdf";

import logoGobierno from "../../assets/images/nayaritLogo.png";
import { AnimatePresence, motion } from "framer-motion";

import GothamRoundedBold from "../../../styles/fonts/GothamRounded-Bold.ttf";
import GothamRoundedBook from "../../../styles/fonts/GothamRounded-Book.ttf";
import MontserratBold from "../../../styles/fonts/Montserrat-Bold.ttf";
import MontserratRegular from "../../../styles/fonts/Montserrat-Regular.ttf";

  const Toggle = ({ label, checked, onChange, className = '' }) => (
    <div className={`flex items-center justify-between gap-4 w-full ${className}`}>
      <span className="flex-1 text-xs sm:text-sm">
        {label}
      </span>

      <button
        type="button"
        onClick={onChange}
        className={`relative flex-shrink-0 w-10 h-5 rounded-full transition-colors ${
          checked ? 'bg-[#8B1538]' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute top-[2px] left-[2px] h-4 w-4 bg-white rounded-full transition-transform ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </div>
  );

export function ReporteAsuntos() {

  const [form, setForm] = useState({
    origen: '',
    unidadAdministrativa: '',
    fechaInicio: '',
    fechaFin: '',
    autorizadoYTurnado: false,
    Recibido: false,
    Concluido: false,
    Validado: false,
    cerrados: false
  });

  const [datosReporte, setDatosReporte] = useState([]);

  const [mostrarReporte, setMostrarReporte] = useState(false);
  const [mostrarVisorReporte, setMostrarVisorReporte] = useState(false);
  const [archivoReporte, setArchivoReporte] = useState(null);

  const handleToggle = (name) => {
    setForm((prev) => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const handleOrigenToggle = (value) => {
    setForm((prev) => ({
      ...prev,
      origen: prev.origen === value ? '' : value
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await reporteAsuntos(
        form,
        localStorage.getItem("token")
      );

      const data = await response.json();

      if (!data || data.length === 0) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "info",
          title: "No se encontraron asuntos.",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });

        return;
      }

      setDatosReporte(data);

      const pdfData = await generarDocumentoReporteAsuntos(data);

      setArchivoReporte(pdfData);
      setMostrarVisorReporte(true);

    } catch (error) {
      console.error(error);

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Ocurrió un error al generar el reporte.",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    }
  };

  const exportarExcel = () => {
    const encabezados = [
      "Folio",
      "Número de documento",
      "Origen del turno",
      "Área turnada",
      "Asunto",
      "Fecha compromiso",
      "Instrucción",
      "Estatus"
    ];

    const filas = datosReporte.map((item) =>
      item.turnados.map((turnado) =>
      [
        item.folio,
        item.docId,
        item.remitente.name,
        item.remitente.area,
        item.asunto,
        turnado.compromiso.splt("T")[0],
        turnado.instruccion.descripcion,
        item.status
      ].join(","))
    );

    const csvContenido =
      encabezados.join(",") + "\n" + filas.join("\n");

    const blob = new Blob([csvContenido], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "reporte_asuntos.csv";
    link.click();
  };

  const generarDocumentoReporteAsuntos = async (datos) => {
    const doc = new jsPDF("p", "mm", "a4");

    // FUENTES
    doc.addFont(GothamRoundedBook, "GothamRounded", "normal");
    doc.addFont(GothamRoundedBold, "GothamRounded", "bold");

    doc.addFont(MontserratRegular, "Montserrat", "normal");
    doc.addFont(MontserratBold, "Montserrat", "bold");

    const COLORS = {
      grisPrincipal: [96, 89, 93],
      beige1: [197, 176, 153],
      beige2: [205, 177, 156],
      beige3: [218, 206, 192],
      vino: [121, 20, 42],
      blanco: [255, 255, 255],
      negro: [0, 0, 0],
    };
  
    const hoy = new Date();
  
    const fechaHoy =
      String(hoy.getDate()).padStart(2, "0") +
      "/" +
      String(hoy.getMonth() + 1).padStart(2, "0") +
      "/" +
      hoy.getFullYear();
  
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
    
      const margin = 10;
      const contentWidth = pageWidth - margin * 2;
    
      // =========================
      // HEADER
      // =========================
    
    const dibujarEncabezadoPagina = () => {

      doc.setLineWidth(0.2);

      doc.setFillColor(...COLORS.beige3);

      doc.rect(
        margin,
        12,
        contentWidth,
        18,
        "F"
      );

      doc.addImage(
        logoGobierno,
        "PNG",
        margin + 2,
        12,
        75,
        18
      );

      doc.setFillColor(...COLORS.vino);

      doc.roundedRect(
        pageWidth - 60,
        17,
        25,
        8,
        2,
        2,
        "F"
      );

      doc.setTextColor(...COLORS.blanco);

      doc.setFont("GothamRounded", "bold");
      doc.setFontSize(9);

      doc.text(
        "FECHA",
        pageWidth - 47,
        22,
        {
          align: "center"
        }
      );

      doc.setTextColor(...COLORS.grisPrincipal);

      doc.text(
        fechaHoy,
        pageWidth - 22,
        22,
        {
          align: "center"
        }
      );
    };

    // DIBUJAR HEADER EN LA PRIMERA PÁGINA
      dibujarEncabezadoPagina();

        
  // =========================
  // TITULO
  // =========================

    let y = 40;

    doc.setFont("GothamRounded", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...COLORS.vino);

    doc.text(
      "REPORTE DE ASUNTOS",
      pageWidth / 2,
      y,
      { align: "center" }
    );

    y += 6;

    doc.setFontSize(10);
    doc.setTextColor(...COLORS.grisPrincipal);

    const formatearFecha = (fecha) => {
      if (!fecha) return "-";

      const d = new Date(fecha);

      return (
        String(d.getDate()).padStart(2, "0") +
        "/" +
        String(d.getMonth() + 1).padStart(2, "0") +
        "/" +
        d.getFullYear()
      );
    };

    doc.text(
      `Periodo: ${formatearFecha(form.fechaInicio)} al ${formatearFecha(form.fechaFin)}`,
      pageWidth / 2,
      y,
      { align: "center" }
    );

    y += 10;

    const columnas = [
      "FOLIO",
      "NO DOC.",
      "ORIGEN",
      "TURNADO A",
      "ASUNTO",
      "COMPROMISO",
      "INSTRUCCIÓN",
      "ESTATUS"
    ];

    const anchos = [
      18,
      20,
      25,
      25,
      40,
      20,
      28,
      20
    ];

    const dibujarEncabezadoTabla = () => {

      let x = margin;

      columnas.forEach((titulo, index) => {

        doc.setFillColor(...COLORS.vino);

        doc.rect(
          x,
          y,
          anchos[index],
          10,
          "F"
        );

        doc.setTextColor(...COLORS.blanco);

        doc.setFont("Montserrat", "bold");
        doc.setFontSize(8);

        doc.text(
          titulo,
          x + anchos[index] / 2,
          y + 6,
          { align: "center" }
        );

        x += anchos[index];
      });

      y += 10;
    };

    dibujarEncabezadoTabla();

    let fila = 0;

    datos.forEach((item) => {

      (item.turnados || []).forEach((turnado) => {

        const valores = [
          item.folio || "-",
          item.docId || "-",
          item.remitente?.name || "-",
          item.remitente?.area || "-",
          item.asunto || "-",
          formatearFecha(turnado.compromiso),
          turnado.instruccion?.descripcion || "-",
          item.status || "-"
        ];

        const lineasPorCelda = valores.map(
          (valor, i) =>
            doc.splitTextToSize(
              String(valor),
              anchos[i] - 3
            )
        );

        const maxLineas = Math.max(
          ...lineasPorCelda.map(
            l => l.length
          )
        );

        const rowHeight =
          Math.max(10, maxLineas * 4 + 4);

        if (y + rowHeight > 270) {

          doc.addPage();

          dibujarEncabezadoPagina();

          y = 40;

          dibujarEncabezadoTabla();
        }

        const fondo =
          fila % 2 === 0
            ? COLORS.beige3
            : COLORS.blanco;

        let x = margin;

        lineasPorCelda.forEach((lineas, i) => {

          doc.setFillColor(...fondo);

          doc.rect(
            x,
            y,
            anchos[i],
            rowHeight,
            "F"
          );

          doc.setDrawColor(...COLORS.beige1);

          doc.rect(
            x,
            y,
            anchos[i],
            rowHeight
          );

          doc.setTextColor(...COLORS.negro);

          doc.setFont("Montserrat", "normal");
          doc.setFontSize(8);

          doc.text(
            lineas,
            x + 1.5,
            y + 4
          );

          x += anchos[i];
        });

        y += rowHeight;

        fila++;
      });

    });

    const footerY = pageHeight - 15;

    doc.setDrawColor(...COLORS.vino);

    doc.line(
      margin,
      footerY,
      pageWidth - margin,
      footerY
    );

    doc.setFontSize(8);

    doc.text(
      "Sistema Automatizado de Gestión y Archivo de la Secretaría de Educación (SAGASE)",
      pageWidth / 2,
      footerY + 5,
      { align: "center" }
    );

    const nombrePDF =
      `Reporte_Asuntos_${Date.now()}.pdf`;

    const pdfBlob = doc.output("blob");

    const pdfUrl = URL.createObjectURL(pdfBlob);

    doc.save(nombrePDF);

    return {
      url: pdfUrl,
      nombre: nombrePDF,
    };
  };

  return (
    <div className="flex-1 w-full p-6 bg-gray-100 overflow-y-auto">

      {/* Header */}
      <div className="bg-gray-300 rounded-t-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3">
        <h1 className="text-sm font-semibold text-gray-800">
          Reporte de Asuntos
        </h1>
        <button className="w-6 h-6 flex items-center justify-center rounded-full bg-[#8B1538] text-white">
          <Minus size={14} />
        </button>
      </div>

      {/* Contenedor */}
      <div className="w-full bg-white p-4 sm:p-6 md:p-8 rounded-b-md shadow-sm space-y-10 text-xs">

        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Origen del turno
          </h2>

          <div className="space-y-8">

            {form.origen === 'enviado' && (
              <div className="space-y-4 max-w-3xl">

                <p className="text-xs text-gray-700">
                  Se muestran todos los asuntos ENVIADOS DESDE su área,
                  si desea filtrar los asuntos que envió a un área específica
                  indíquelo en el campo siguiente:
                </p>

                <div>
                  <label className="block mb-1">
                    Unidad Administrativa:
                  </label>

                  <select
                    value={form.unidadAdministrativa}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        unidadAdministrativa: e.target.value
                      })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                  >
                    <option value="">Seleccione una unidad</option>
                    <option value="direccion_general">Dirección General</option>
                    <option value="finanzas">Finanzas</option>
                    <option value="administracion">Administración</option>
                    <option value="juridico">Jurídico</option>
                  </select>
                </div>

              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 max-w-2xl">
              <input
                type="date"
                value={form.fechaInicio}
                onChange={(e) =>
                  setForm({ ...form, fechaInicio: e.target.value })
                }
                className="w-full border border-gray-300 rounded px-2 py-1"
              />

              <input
                type="date"
                value={form.fechaFin}
                onChange={(e) =>
                  setForm({ ...form, fechaFin: e.target.value })
                }
                className="w-full border border-gray-300 rounded px-2 py-1"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
              <Toggle label="Autorizados y turnados" checked={form.autorizadoYTurnado} onChange={() => handleToggle('autorizadoYTurnado')} />
              <Toggle label="Recibidos en ejecución" checked={form.Recibido} onChange={() => handleToggle('Recibido')} />
                <Toggle label="Con respuesta registrada" checked={form.Concluido} onChange={() => handleToggle('Concluido')} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
              <Toggle label="Con atención validada" checked={form.Validado} onChange={() => handleToggle('Validado')} />
              <Toggle label="Cerrados" checked={form.cerrados} onChange={() => handleToggle('cerrados')} />
            </div>

          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center pt-6">
          <button
            onClick={handleSubmit}
            className="w-full sm:w-auto bg-[#8B1538] text-white px-12 py-2 rounded hover:opacity-90 transition"
          >
            Generar
          </button>

          <AnimatePresence>
            {mostrarVisorReporte && archivoReporte && (
              <motion.div
                className="fixed inset-0 z-[999] bg-black/60 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white w-[90%] h-[90%] rounded-lg overflow-hidden"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <div className="bg-[#8B1538] text-white flex justify-between items-center p-3">
                    <span>{archivoReporte.nombre}</span>

                    <button
                      onClick={() => setMostrarVisorReporte(false)}
                      className="px-3 py-1 bg-white text-[#8B1538] rounded"
                    >
                      Cerrar
                    </button>
                  </div>

                  <iframe
                    src={archivoReporte.url}
                    className="w-full h-[calc(100%-56px)]"
                    title="Reporte Asuntos"
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>
    </div>
  );
}
