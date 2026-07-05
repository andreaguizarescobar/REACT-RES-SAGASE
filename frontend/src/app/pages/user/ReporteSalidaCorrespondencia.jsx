import { Minus, Printer, FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import { getCorrespondencias } from "../../services/correspondencia.service";
import Swal from "sweetalert2";
import { AnimatePresence, motion } from "framer-motion";
import jsPDF from "jspdf";

import logoGobierno from "../../assets/images/nayaritLogo.png";

import GothamRoundedBold from "../../../styles/fonts/GothamRounded-Bold.ttf";
import GothamRoundedBook from "../../../styles/fonts/GothamRounded-Book.ttf";
import MontserratBold from "../../../styles/fonts/Montserrat-Bold.ttf";
import MontserratRegular from "../../../styles/fonts/Montserrat-Regular.ttf";

export function ReporteSalidaCorrespondencia() {
  const [form, setForm] = useState({
    fechaInicio: "",
    fechaFin: "",
  });
  const [datosCorrespondencia, setDatosCorrespondencia] = useState([]);
  const [mostrarVisorReporte, setMostrarVisorReporte] = useState(false);
  const [archivoReporte, setArchivoReporte] = useState(null);

  const [cargando, setCargando] = useState(false);

  const handleConsultar = async () => {
    // No seleccionó ninguna fecha
    if (!form.fechaInicio && !form.fechaFin) {
      Swal.fire({
        icon: "warning",
        title: "Rango de fechas requerido",
        text: "Selecciona una fecha de inicio y una fecha fin para generar el reporte.",
        showConfirmButton: false,
        position: "top-end",
        timerProgressBar: true,
        timer: 2500,
        toast: true,
      });
      return;
    }

    // Falta fecha de inicio
    if (!form.fechaInicio) {
      Swal.fire({
        icon: "warning",
        title: "Fecha de inicio requerida",
        text: "Selecciona la fecha de inicio.",
        showConfirmButton: false,
        position: "top-end",
        timerProgressBar: true,
        timer: 2500,
        toast: true,
      });
      return;
    }

    // Falta fecha fin
    if (!form.fechaFin) {
      Swal.fire({
        icon: "warning",
        title: "Fecha fin requerida",
        text: "Selecciona la fecha fin.",
        showConfirmButton: false,
        position: "top-end",
        timerProgressBar: true,
        timer: 2500,
        toast: true,
      });
      return;
    }

    // Validar que la fecha inicial no sea mayor
    if (new Date(form.fechaInicio) > new Date(form.fechaFin)) {
      Swal.fire({
        icon: "warning",
        title: "Rango de fechas inválido",
        text: "La fecha de inicio no puede ser mayor que la fecha fin.",
        confirmButtonColor: "#8B1538",
      });
      return;
    }

    setCargando(true);

    try {
      const response = await getCorrespondencias({
        fechaInicio: form.fechaInicio,
        fechaFin: form.fechaFin,
      });

      if (!response.ok) {
        throw new Error("Error al consultar correspondencias");
      }

      const datos = await response.json();
      // setDatosCorrespondencia(datos);
      // setMostrarReporte(true);
      setDatosCorrespondencia(datos);

      const pdfData = await generarDocumentoReporte(datos);

      setArchivoReporte(pdfData);
      setMostrarVisorReporte(true);

    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un problema al generar el reporte.",
        confirmButtonColor: "#8B1538",
      });

      setDatosCorrespondencia([]);
    } finally {
      setCargando(false);
    }
  };

  const exportarExcel = () => {
    const encabezados = [
      "Folio",
      "Fecha",
      "Folio SAGA",
      "Destinatario",
      "Asunto",
      "Soporte",
      "Importancia",
      "Estatus",
    ];

    const filas = datosCorrespondencia.map((item) => {
      const fecha = item.fecha ? item.fecha.split("T")[0] : "";
      const folioSAGA = item.doc?.docId || "Sin datos";
      const destinatario = item.destinatario?.name || "Sin datos";
      return [
        item.folio || "",
        fecha,
        folioSAGA,
        destinatario,
        item.asunto || "",
        item.soporte || "",
        item.importancia || "",
        item.status || "",
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(",");
    });

    const csvContenido = encabezados.join(",") + "\n" + filas.join("\n");
    const blob = new Blob([csvContenido], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "reporte_salida_correspondencia.csv";
    link.click();
  };

const generarDocumentoReporte = async (datos) => {

  const doc = new jsPDF("p", "mm", "letter");

  // =========================
  // FUENTES
  // =========================

  doc.addFont(GothamRoundedBook, "GothamRounded", "normal");
  doc.addFont(GothamRoundedBold, "GothamRounded", "bold");

  doc.addFont(MontserratRegular, "Montserrat", "normal");
  doc.addFont(MontserratBold, "Montserrat", "bold");

  const COLORS = {
    grisPrincipal: [96, 89, 93],
    grisSecundario: [155, 157, 154],
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

  //==========================================================
  // HEADER
  //==========================================================

  const dibujarEncabezadoPagina = () => {

    doc.setFillColor(...COLORS.grisSecundario);

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
      85,
      18
    );

    doc.setFillColor(...COLORS.grisPrincipal);

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
      { align: "center" }
    );

    doc.setTextColor(...COLORS.grisPrincipal);

    doc.text(
      fechaHoy,
      pageWidth - 22,
      22,
      { align: "center" }
    );
  };

  dibujarEncabezadoPagina();

  //==========================================================
  // TITULO
  //==========================================================

  let y = 40;

  doc.setFont("GothamRounded", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.grisPrincipal);

  doc.text(
    "REPORTE DE SALIDA DE CORRESPONDENCIA",
    pageWidth / 2,
    y,
    { align: "center" }
  );

  y += 7;

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";

    const [anio, mes, dia] = fecha.split("-");

    return `${dia}/${mes}/${anio}`;
  };

  doc.setFontSize(10);

  doc.text(
    `Periodo: ${formatearFecha(form.fechaInicio)} al ${formatearFecha(form.fechaFin)}`,
    pageWidth / 2,
    y,
    { align: "center" }
  );

  y += 7;

  //==========================================================
  // TABLA
  //==========================================================

  const columnas = [
    "FOLIO",
    "FECHA",
    "FOLIO SAGA",
    "DESTINATARIO",
    "ASUNTO",
    "SOPORTE",
    "IMPORTANCIA",
    "ESTATUS"
  ];

  const anchos = [
    18,
    20,
    22,
    34,
    48,
    18,
    20,
    20
  ];

  const dibujarEncabezadoTabla = () => {

    let x = margin;

    columnas.forEach((titulo, i) => {

      doc.setFillColor(...COLORS.grisPrincipal);

      doc.rect(
        x,
        y,
        anchos[i],
        10,
        "F"
      );

      doc.setFont("Montserrat", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.blanco);

      doc.text(
        titulo,
        x + anchos[i] / 2,
        y + 6,
        { align: "center" }
      );

      x += anchos[i];
    });

    y += 10;
  };

  dibujarEncabezadoTabla();

  let fila = 0;

  datos.forEach((item) => {

    const valores = [

      item.folio || "-",

      item.fecha
        ? new Date(item.fecha).toLocaleDateString("es-MX")
        : "-",

      item.doc?.docId || "-",

      item.destinatario?.name || "-",

      item.asunto || "-",

      item.soporte || "-",

      item.importancia || "-",

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
      ...lineasPorCelda.map(l => l.length)
    );

    const rowHeight = Math.max(
      10,
      maxLineas * 4 + 4
    );

    const limiteInferior =
      pageHeight - 20;

    if (y + rowHeight > limiteInferior) {

      doc.addPage();

      dibujarEncabezadoPagina();

      y = 40;

      dibujarEncabezadoTabla();

    }

    const fondo =
      fila % 2 === 0
        ? COLORS.blanco
        : [245,245,245];

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

      doc.setDrawColor(...COLORS.grisSecundario);

      doc.rect(
        x,
        y,
        anchos[i],
        rowHeight
      );

      doc.setFont("Montserrat","normal");
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.negro);

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

  //==========================================================
  // FOOTER
  //==========================================================

  const footerY =
    pageHeight - 15;

  doc.setDrawColor(...COLORS.grisPrincipal);

  doc.line(
    margin,
    footerY,
    pageWidth - margin,
    footerY
  );

  doc.setFontSize(8);

  doc.setTextColor(...COLORS.grisPrincipal);

  doc.text(
    "Sistema Automatizado de Gestión y Archivo de la Secretaría de Educación (SAGASE)",
    pageWidth / 2,
    footerY + 5,
    { align: "center" }
  );

  const formatearFechaNombre = (fecha) => {

    if (!fecha) return "";

    const [anio, mes, dia] = fecha.split("-");

    return `${dia}-${mes}-${anio}`;

  };

  const nombrePDF =
    `Reporte_Salida_Correspondencia_${formatearFechaNombre(form.fechaInicio)}_al_${formatearFechaNombre(form.fechaFin)}.pdf`;

  const pdfBlob =
    doc.output("blob");

  const pdfUrl =
    URL.createObjectURL(pdfBlob);

  // Descarga automática
  doc.save(nombrePDF);

  return {
    url: pdfUrl,
    nombre: nombrePDF,
  };

};

  return (
    <div className="flex-1 p-6 bg-gray-100 overflow-y-auto">
      <div className="bg-gray-300 rounded-t-md flex items-center justify-between px-4 py-2">
        <h1 className="text-sm font-semibold text-gray-800">
          Reporte Salida de Correspondencia
        </h1>
        <button className="w-6 h-6 flex items-center justify-center rounded-full bg-[#8B1538] text-white">
          <Minus size={14} />
        </button>
      </div>

      <div className="bg-white rounded-b-xl shadow-lg border border-gray-200 p-8 space-y-8">
        <div className="flex items-center gap-3 mb-5">

              <div className="h-px flex-1 bg-gray-300"/>

              <h2 className="text-sm font-semibold uppercase tracking-wide text-[#8B1538]">
                  Parámetros del reporte
              </h2>

              <div className="h-px flex-1 bg-gray-300"/>

          </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Fecha de inicio</label>
            <input
              type="date"
              value={form.fechaInicio}
              onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
              className="
                w-full
                h-11
                rounded-lg
                border
                border-gray-300
                px-4
                text-sm
                focus:border-[#8B1538]
                focus:ring-2
                focus:ring-[#8B1538]/20
                outline-none
                transition
                "
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Fecha fin</label>
            <input
              type="date"
              value={form.fechaFin}
              onChange={(e) => setForm({ ...form, fechaFin: e.target.value })}
              className="
                w-full
                h-11
                rounded-lg
                border
                border-gray-300
                px-4
                text-sm
                focus:border-[#8B1538]
                focus:ring-2
                focus:ring-[#8B1538]/20
                outline-none
                transition
                "
            />
          </div>

          <div className="flex justify-center md:justify-start">
            <button
              onClick={handleConsultar}
              className="
                h-11
                px-8
                rounded-lg
                bg-[#8B1538]
                text-white
                font-medium
                shadow
                hover:bg-[#731230]
                transition
                "
            >
              Consultar
            </button>
          </div>
        </div>

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
                      initial={{ opacity: 0, scale: .95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: .95 }}
                  >
                      <div className="bg-[#8B1538] text-white flex items-center justify-between px-4 py-3">

                        <span className="text-sm font-medium truncate">
                            {archivoReporte.nombre}
                        </span>

                        <button
                            onClick={() => setMostrarVisorReporte(false)}
                            title="Cerrar visor"
                            className="
                                w-7
                                h-7
                                flex
                                items-center
                                justify-center
                                rounded-full
                                bg-white
                                text-[#8B1538]
                                hover:scale-105
                                hover:bg-gray-100
                                transition
                            "
                        >
                            <Minus size={16} />
                        </button>

                    </div>
                      <iframe
                          src={archivoReporte.url}
                          className="w-full h-[calc(100%-56px)]"
                          title="Reporte"
                      />

                  </motion.div>
              </motion.div>
          )}
      </AnimatePresence>
      </div>
    </div>
  );
}
