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

const Toggle = ({ label, checked, onChange }) => (
    <div
      className={`
        rounded-xl
        border
        p-4
        transition-all
        duration-200
        ${
          checked
            ? "border-[#8B1538] bg-[#8B1538]/5 shadow-sm"
            : "border-gray-200 bg-white hover:border-gray-300"
        }
      `}
    >

        <div className="flex items-center gap-3">

            <span className="flex-1 text-sm font-medium text-gray-700">
                {label}
            </span>

            <button
                type="button"
                onClick={onChange}
                className={`
                relative
                w-11
                h-6
                rounded-full
                transition
                ${
                    checked
                        ? "bg-[#8B1538]"
                        : "bg-gray-300"
                }
                `}
            >
                <span
                    className={`
                    absolute
                    top-0.5
                    left-0.5
                    h-5
                    w-5
                    rounded-full
                    bg-white
                    transition-transform
                    ${
                        checked
                            ? "translate-x-5"
                            : ""
                    }
                    `}
                />
            </button>

        </div>

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
     // VALIDAR FECHAS
      if (!form.fechaInicio || !form.fechaFin) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "warning",
          title: "Seleccione la fecha inicial y la fecha final.",
          showConfirmButton: false,
          timer: 3500,
          timerProgressBar: true,
          width: "380px",
        });

        return;
      }

      if (new Date(form.fechaInicio) > new Date(form.fechaFin)) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "warning",
          title: "La fecha inicial no puede ser mayor que la fecha final.",
          showConfirmButton: false,
          timer: 3500,
          timerProgressBar: true,
          width: "420px",
        });

        return;
      }

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
    const doc = new jsPDF("p", "mm", "letter");

    // FUENTES
    doc.addFont(GothamRoundedBook, "GothamRounded", "normal");
    doc.addFont(GothamRoundedBold, "GothamRounded", "bold");

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
      grisPrincipal: [96, 89, 93],   // #60595D
      grisSecundario: [155, 157, 154], // #9B9D9A
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

    doc.setFont("GothamRounded", "bold");
    doc.setFontSize(16);
    // doc.setTextColor(...COLORS.vino);
    doc.setTextColor(...COLORS.grisPrincipal);

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

      return d.toLocaleDateString("es-MX", {
        timeZone: "UTC",
      });
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

    // =========================
    // FILTROS SELECCIONADOS
    // =========================

    const criterios = [];

      if (form.autorizadoYTurnado)
        criterios.push("Autorizados y turnados");

      if (form.Recibido)
        criterios.push("Recibidos en ejecución");

      if (form.Concluido)
        criterios.push("Con respuesta registrada");

      if (form.Validado)
        criterios.push("Con atención validada");

      if (form.cerrados)
        criterios.push("Cerrados");

      if (form.unidadAdministrativa)
        criterios.push(`Unidad: ${form.unidadAdministrativa}`);

      // Encabezado
      // doc.setFillColor(...COLORS.vino);
      doc.setFillColor(...COLORS.grisPrincipal);

      doc.roundedRect(
        margin,
        y,
        contentWidth,
        8,
        2,
        2,
        "F"
      );

      doc.setTextColor(...COLORS.blanco);
      doc.setFont("GothamRounded", "bold");
      doc.setFontSize(10);

      doc.text(
        "FILTROS APLICADOS",
        margin + 4,
        y + 5.5
      );

      y += 10;

      // Contenedor
      const alturaCaja = Math.max(
        12,
        criterios.length * 6 + 6
      );

      // doc.setFillColor(...COLORS.beige3);
      doc.setFillColor(...COLORS.blanco);

      doc.roundedRect(
        margin,
        y,
        contentWidth,
        alturaCaja,
        2,
        2,
        "F"
      );

      // doc.setDrawColor(...COLORS.beige1);
      doc.setDrawColor(...COLORS.grisSecundario);

      doc.roundedRect(
        margin,
        y,
        contentWidth,
        alturaCaja,
        2,
        2
      );

      doc.setTextColor(...COLORS.grisPrincipal);
      doc.setFont("Montserrat", "normal");
      doc.setFontSize(9);

      if (criterios.length === 0) {
        doc.text(
          "Sin filtros específicos.",
          margin + 5,
          y + 7
        );
      } else {
        criterios.forEach((criterio, index) => {
          doc.text(
            `• ${criterio}`,
            margin + 5,
            y + 7 + index * 6
          );
        });
      }

      y += alturaCaja + 8;
    // =========================
    // TABLA
    // =========================

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

        // const fondo =
        //   fila % 2 === 0
        //     ? COLORS.beige3
        //     : COLORS.blanco;
        const fondo =
          fila % 2 === 0
            ? COLORS.blanco
            : COLORS.grisSecundario;

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

    // doc.setDrawColor(...COLORS.vino);
    doc.setDrawColor(...COLORS.grisPrincipal);

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
  `Reporte_Asuntos_${fechaInicioNombre}_al_${fechaFinNombre}.pdf`;

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
      <div className="bg-white p-6 rounded-b-md shadow-sm text-xs space-y-6">

        <div>
          <div className="flex items-center gap-3 mb-3">
              <div className="h-px flex-1 bg-gray-300" />

              <h2 className="text-sm font-semibold text-[#8B1538] uppercase tracking-wide">
                  Parámetros del reporte
              </h2>

              <div className="h-px flex-1 bg-gray-300" />
          </div>

          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Seleccione la fecha inicial y fecha final para generar el reporte de asuntos
          </h3>

          <div className="space-y-8">

            {form.origen === 'enviado' && (
              <div className="space-y-4 max-w-3xl">

                <p className="text-xs text-gray-700">
                  Se muestran todos los asuntos ENVIADOS DESDE su área,
                  si desea filtrar los asuntos que envió a un área específica
                  indíquelo en el campo siguiente:
                </p>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
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
                    className="
                    w-full
                    rounded-lg
                    border
                    border-gray-300
                    px-3
                    py-2.5
                    bg-white
                    transition
                    focus:border-[#8B1538]
                    focus:ring-2
                    focus:ring-[#8B1538]/20
                    outline-none
                    "
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

            <div className="flex justify-center ">
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

            <div>
              <div className="flex items-center gap-3 mb-3">
                  <div className="h-px flex-1 bg-gray-300" />

                  <h2 className="text-sm font-semibold text-[#8B1538] uppercase tracking-wide">
                      ESTADOS DEL REPORTE
                  </h2>

                  <div className="h-px flex-1 bg-gray-300" />
              </div>
            </div>
            
            <div className="flex justify-center">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 max-w-5xl w-full">
              <Toggle label="Autorizados y turnados" checked={form.autorizadoYTurnado} onChange={() => handleToggle('autorizadoYTurnado')} />
              <Toggle label="Recibidos en ejecución" checked={form.Recibido} onChange={() => handleToggle('Recibido')} />
              <Toggle label="Con respuesta registrada" checked={form.Concluido} onChange={() => handleToggle('Concluido')} />
              </div>
            </div>

            <div className="flex justify-center">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 max-w-5xl w-full">
              <Toggle label="Con atención validada" checked={form.Validado} onChange={() => handleToggle('Validado')} />
              <Toggle label="Cerrados" checked={form.cerrados} onChange={() => handleToggle('cerrados')} />
              </div>
            </div>

          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center pt-6">
          <button
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

          <AnimatePresence>
            {mostrarVisorReporte && archivoReporte && (
              <motion.div
                  className="fixed inset-0 flex items-center justify-center z-[9999]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: .2 }}
                  style={{ backgroundColor: "rgba(0,0,0,.4)" }}
              >
                <motion.div
                    className="bg-white rounded shadow-lg w-[92%] h-[92%] relative"
                    initial={{ opacity: 0, scale: .95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: .95, y: 20 }}
                    transition={{ duration: .2 }}
                >
                  <div className="bg-[#8B1538] text-white flex justify-between items-center p-3">
                    <span >{archivoReporte.nombre}</span>

                    <button
                      onClick={() => setMostrarVisorReporte(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-[#8B1538]"
                    >
                      <Minus size={16} />
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
