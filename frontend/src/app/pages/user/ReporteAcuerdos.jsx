import { Minus } from "lucide-react";
import { useState, useEffect } from "react";
import { reporteAcuerdos } from "../../services/document.service";
import jsPDF from "jspdf";
import logoGobierno from "../../assets/images/nayaritLogo.png";
import Swal from "sweetalert2";
import { AnimatePresence, motion } from "framer-motion";

import GothamRoundedBold from "../../../styles/fonts/GothamRounded-Bold.ttf";
import GothamRoundedBook from "../../../styles/fonts/GothamRounded-Book.ttf";
import MontserratBold from "../../../styles/fonts/Montserrat-Bold.ttf";
import MontserratRegular from "../../../styles/fonts/Montserrat-Regular.ttf";

export function ReporteAcuerdos() {

  const [form, setForm] = useState({
    fechaInicio: "",
    fechaFin: ""
  });

  const [datosAcuerdos, setDatosAcuerdos] = useState([]);

 const handleSubmit = async () => {
    // Validar fecha inicial
    if (!form.fechaInicio) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "warning",
        title: "Debe seleccionar la fecha inicial.",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      return;
    }

    // Validar fecha final
    if (!form.fechaFin) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "warning",
        title: "Debe seleccionar la fecha final.",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      return;
    }

    // Validar rango de fechas
    if (new Date(form.fechaInicio) > new Date(form.fechaFin)) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "warning",
        title: "La fecha inicial no puede ser mayor a la fecha final.",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      return;
    }

    try {
      const response = await reporteAcuerdos(
        {
          fechaInicio: form.fechaInicio,
          fechaFin: form.fechaFin,
        },
        localStorage.getItem("token")
      );

      const datos = await response.json();

      // Si no hay resultados
      if (!datos || datos.length === 0) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "info",
          title: "No se encontraron acuerdos para el rango seleccionado.",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
        return;
      }

      setDatosAcuerdos(datos);

      // Mostrar reporte solamente si todo es válido
      const pdfData = await generarDocumentoReporteAcuerdos(datos);

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

  const [mostrarVisorReporte, setMostrarVisorReporte] = useState(false);
  const [archivoReporte, setArchivoReporte] = useState(null);

  const generarDocumentoReporteAcuerdos = async (datos) => {

    const doc = new jsPDF("p", "mm", "letter");

    // =========================
    // FUENTES PERSONALIZADAS
    // =========================

    // Gotham
    doc.addFont(GothamRoundedBook, "GothamRounded", "normal");
    doc.addFont(GothamRoundedBold, "GothamRounded", "bold");

    // Montserrat
    doc.addFont(MontserratRegular, "Montserrat", "normal");
    doc.addFont(MontserratBold, "Montserrat", "bold");

    // const COLORS = {
    //   grisPrincipal: [96, 89, 93],
    //   beige1: [197, 176, 153],
    //   beige2: [205, 177, 156],
    //   beige3: [218, 206, 192],
    //   vino: [121, 20, 42],
    //   blanco: [255, 255, 255],
    //   negro: [0, 0, 0],
    // };
    const COLORS = {
      grisPrincipal: [96, 89, 93],      // #60595D
      grisSecundario: [155, 157, 154],  // #9B9D9A
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

        // doc.setFillColor(...COLORS.beige3);
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

        // doc.setFillColor(...COLORS.vino);
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

    // doc.setTextColor(...COLORS.vino);
    doc.setTextColor(...COLORS.grisPrincipal);
    doc.setFontSize(16);
    doc.setFont("GothamRounded", "bold");

    doc.text(
      "REPORTE DE ACUERDOS",
      pageWidth / 2,
      y,
      { align: "center" }
    );

    y += 6;

    doc.setTextColor(...COLORS.grisPrincipal);
    doc.setFontSize(10);

    const formatearFecha = (fecha) => {
      if (!fecha) return "-";

      const [anio, mes, dia] = fecha.split("-");

      return `${dia}/${mes}/${anio}`;
    };

    doc.text(
      `Periodo: ${formatearFecha(form.fechaInicio)} al ${formatearFecha(form.fechaFin)}`,
      pageWidth / 2,
      y,
      { align: "center" }
    );

    y += 5;

    const formatearFechaBackend = (fecha) => {
      if (!fecha) return "-";

      const d = new Date(fecha);

      return d.toLocaleDateString("es-MX", {
        timeZone: "UTC",
      });
    };
    // =========================
    // TABLA
    // =========================

    const columnas = [
      "FOLIO",
      "TIPO",
      "NO DOC.",
      "REMITENTE",
      "ASUNTO",
      "INSTRUCCIÓN",
      "FECHA"
    ];

    const anchos = [
      19, // folio
      19, // tipo
      23, // documento
      28, // remitente
      45, // asunto
      33, // instruccion
      22  // fecha
    ];

    const dibujarEncabezadoTabla = () => {

      let x = margin;

      columnas.forEach((titulo, index) => {

        // doc.setFillColor(...COLORS.vino);
        doc.setFillColor(...COLORS.grisPrincipal);

        doc.rect(
          x,
          y,
          anchos[index],
          10,
          "F"
        );

        doc.setTextColor(...COLORS.blanco);
        doc.setFont("Montserrat", "bold");
        doc.setFontSize(9);

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

      (item.turnados || []).forEach((turno) => {

        const valores = [
          item?.folio || "-",
          item?.tipo?.tipo || "-",
          item?.docId || "-",
          item?.remitente?.name ||
          item?.remitente?.nombre ||
          "-",
          item?.asunto || "-",
          turno?.instruccion?.descripcion ||
          turno?.instruccion ||
          "-",
          formatearFechaBackend(turno?.fechaTurnado) || "-"
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

        const rowHeight = Math.max(10, maxLineas * 4 + 4);
        const limiteInferior = pageHeight - 20;

        if (y + rowHeight > limiteInferior) {

          doc.addPage();

          dibujarEncabezadoPagina();

          y = 40;

          dibujarEncabezadoTabla();
        }

        // const fondo =
        //   fila % 2 === 0
        //     ? COLORS.beige3
        //     : COLORS.blanco;
        const fondo =
          fila % 2 === 0
            ? COLORS.blanco
            : [245, 245, 245]; // Gris muy claro

        let x = margin;

        lineasPorCelda.forEach(
          (lineas, i) => {

            doc.setFillColor(...fondo);

            doc.rect(
              x,
              y,
              anchos[i],
              rowHeight,
              "F"
            );

            // doc.setDrawColor(...COLORS.beige1);
            doc.setDrawColor(...COLORS.grisSecundario);

            doc.rect(
              x,
              y,
              anchos[i],
              rowHeight
            );

            doc.setTextColor(...COLORS.negro);
            doc.setFont("Montserrat", "normal");
            doc.setFontSize(9);

            doc.text(
              lineas,
              x + 1.5,
              y + 4
            );

            x += anchos[i];
          }
        );

        y += rowHeight;

        fila++;
      });
    });

    // =========================
    // FOOTER
    // =========================

    const footerY =
      pageHeight - 15;

    // doc.setDrawColor(...COLORS.vino);
    doc.setDrawColor(...COLORS.grisPrincipal);

    doc.line(
      margin,
      footerY,
      pageWidth - margin,
      footerY
    );

    doc.setTextColor(...COLORS.grisPrincipal);

    doc.setFontSize(8);

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

      const fechaInicioNombre =
        formatearFechaNombre(form.fechaInicio);

      const fechaFinNombre =
        formatearFechaNombre(form.fechaFin);

      const nombrePDF =
        `Reporte_Acuerdos_${fechaInicioNombre}_al_${fechaFinNombre}.pdf`;

    const pdfBlob = doc.output("blob");

    const pdfUrl = URL.createObjectURL(pdfBlob);

    // Descargar automáticamente
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
          Reporte de Acuerdos
        </h1>

        <button className="w-6 h-6 flex items-center justify-center rounded-full bg-[#8B1538] text-white">
          <Minus size={14} />
        </button>
      </div>

      {/* Contenedor */}
      <div className="bg-white p-6 rounded-b-md shadow-sm text-xs space-y-6">

        <div>
          {/* Título de sección */}
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1 bg-gray-300" />

            <h2 className="text-sm font-semibold text-[#8B1538] uppercase tracking-wide">
              PARÁMETROS DEL REPORTE
            </h2>

            <div className="h-px flex-1 bg-gray-300" />
          </div>

          <h3 className="text-sm text-center text-gray-600 mb-6">
            Seleccione la fecha inicial y fecha final para generar el reporte de acuerdos
          </h3>

            {/* Fechas centradas */}
          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Fecha inicial
                </label>

                <input
                  type="date"
                  value={form.fechaInicio}
                  onChange={(e) =>
                    setForm({ ...form, fechaInicio: e.target.value })
                  }
                  className="
                    w-full
                    rounded-lg
                    border
                    border-gray-300
                    px-3
                    py-2.5
                    transition
                    focus:border-[#8B1538]
                    focus:ring-2
                    focus:ring-[#8B1538]/20
                    outline-none
                  "
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Fecha final
                </label>

                <input
                  type="date"
                  value={form.fechaFin}
                  onChange={(e) =>
                    setForm({ ...form, fechaFin: e.target.value })
                  }
                  className="
                    w-full
                    rounded-lg
                    border
                    border-gray-300
                    px-3
                    py-2.5
                    transition
                    focus:border-[#8B1538]
                    focus:ring-2
                    focus:ring-[#8B1538]/20
                    outline-none
                  "
                />
              </div>

            </div>
          </div>

        </div>

        {/* Botón */}
        <div className="flex justify-center pt-6">
          <button
            title="Generar reporte de acuerdos"
            onClick={handleSubmit}
            className="
              bg-[#8B1538]
              text-white
              font-semibold
              px-12
              py-3.5
              rounded-xl
              shadow-md
              hover:shadow-xl
              hover:scale-105
              transition-all
              duration-200
            "
          >
            Generar
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
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white w-[90%] h-[90%] rounded-lg overflow-hidden"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{
                duration: 0.25,
                ease: "easeOut",
              }}
            >
              <div className="bg-[#8B1538] text-white flex justify-between items-center p-3">
                <span>{archivoReporte.nombre}</span>

                <button
                  onClick={() => setMostrarVisorReporte(false)}
                  className="px-3 py-1 bg-white text-[#8B1538] rounded hover:bg-gray-100 transition"
                >
                  Cerrar
                </button>
              </div>

              <iframe
                src={archivoReporte.url}
                className="w-full h-[calc(100%-56px)]"
                title="Reporte Acuerdos"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
