import { Minus, Search, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import { fetchAPI } from "../../services/api";
import logoGobierno from "../../assets/images/nayaritLogo.png";

import GothamRoundedBold from "../../../styles/fonts/GothamRounded-Bold.ttf";
import GothamRoundedBook from "../../../styles/fonts/GothamRounded-Book.ttf";
import MontserratBold from "../../../styles/fonts/Montserrat-Bold.ttf";
import MontserratRegular from "../../../styles/fonts/Montserrat-Regular.ttf";

export function ControlOficios() {
  const [oficios, setOficios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [reporteUrl, setReporteUrl] = useState("");
  const [nombreReporte, setNombreReporte] = useState("");
  const [mostrarReporte, setMostrarReporte] = useState(false);
  const [error, setError] = useState("");

  const userData = JSON.parse(localStorage.getItem("user") || "{}");

  const normalizarTexto = (valor) =>
    String(valor || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const cargarOficios = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const response = await fetchAPI("/oficios", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error("No se pudieron cargar los oficios");
      }

      const data = await response.json();
      setOficios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("No fue posible cargar los oficios generados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarOficios();
  }, []);

  const oficiosFiltrados = oficios.filter((oficio) => {
    const areaUsuario = normalizarTexto(userData?.area || "");
    const areaOficio = normalizarTexto(oficio?.area || "");

    const coincideArea = !areaUsuario || !areaOficio || areaOficio.includes(areaUsuario) || areaUsuario.includes(areaOficio);

    if (!coincideArea) return false;

    const textoBusqueda = [
      oficio?.folio,
      oficio?.numero,
      oficio?.tipo,
      oficio?.asunto,
      oficio?.contenido,
      oficio?.dirigido,
      oficio?.generado,
      oficio?.area,
      oficio?.fechaTexto,
      oficio?.plantillaId?.nombre,
      oficio?.remitenteId?.name,
      oficio?.destinatarioId?.name,
      oficio?.creadoPor?.nombre,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (busqueda && !textoBusqueda.includes(busqueda.toLowerCase())) {
      return false;
    }

    const fechaOficio = new Date(oficio?.fecha || oficio?.createdAt || "");
    if (Number.isNaN(fechaOficio.getTime())) return true;

    if (fechaInicio) {
      const inicio = new Date(fechaInicio);
      inicio.setHours(0, 0, 0, 0);
      if (fechaOficio < inicio) return false;
    }

    if (fechaFin) {
      const fin = new Date(fechaFin);
      fin.setHours(23, 59, 59, 999);
      if (fechaOficio > fin) return false;
    }

    return true;
  });

  const generarReporte = () => {

    if (!fechaInicio || !fechaFin) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "warning",
        title: "Seleccione fecha inicial y final.",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      return;
    }

    if (new Date(fechaInicio) > new Date(fechaFin)) {
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

    const doc = new jsPDF("p", "mm", "letter");

    // Gotham
    doc.addFont(GothamRoundedBook, "GothamRounded", "normal");
    doc.addFont(GothamRoundedBold, "GothamRounded", "bold");

    // Montserrat
    doc.addFont(MontserratRegular, "Montserrat", "normal");
    doc.addFont(MontserratBold, "Montserrat", "bold");

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

const fechaHoy =
  String(hoy.getDate()).padStart(2, "0") +
  "/" +
  String(hoy.getMonth() + 1).padStart(2, "0") +
  "/" +
  hoy.getFullYear();

const dibujarEncabezadoPagina = () => {

  doc.setLineWidth(0.2);

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
    {
      align: "center",
    }
  );

  doc.setTextColor(...COLORS.grisPrincipal);

  doc.text(
    fechaHoy,
    pageWidth - 22,
    22,
    {
      align: "center",
    }
  );
};

dibujarEncabezadoPagina();

let y = 40;

doc.setTextColor(...COLORS.grisPrincipal);
doc.setFont("GothamRounded", "bold");
doc.setFontSize(16);

doc.text(
  "REPORTE DE OFICIOS",
  pageWidth / 2,
  y,
  { align: "center" }
);

y += 6;

doc.setFont("Montserrat", "normal");
doc.setFontSize(10);

const formatearFecha = (fecha) => {
  if (!fecha) return "-";

  const [anio, mes, dia] = fecha.split("-");

  return `${dia}/${mes}/${anio}`;
};

doc.text(
  `Periodo: ${formatearFecha(fechaInicio)} al ${formatearFecha(fechaFin)}`,
  pageWidth / 2,
  y,
  { align: "center" }
);

y += 8;

const columnas = [
  "FOLIO",
  "TIPO",
  "ASUNTO",
  "DESTINATARIO",
  "REMITENTE",
  "FECHA",
];

const anchos = [
  20,
  20,
  58,
  38,
  38,
  20,
];

const dibujarEncabezadoTabla = () => {

  let x = margin;

  columnas.forEach((titulo, index) => {

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
      {
        align: "center",
      }
    );

    x += anchos[index];
  });

  y += 10;
};

dibujarEncabezadoTabla();

let fila = 0;

oficiosFiltrados.forEach((oficio) => {

  const valores = [
    oficio?.folio || oficio?.numero || "-",
    oficio?.tipo || "-",
    oficio?.asunto || "-",
    oficio?.destinatarioId?.name ||
      oficio?.dirigido ||
      "-",
    oficio?.remitenteId?.name ||
      oficio?.generado ||
      "-",
    formatDate(
      oficio?.fecha ||
      oficio?.createdAt
    ),
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
    Math.max(
      10,
      maxLineas * 4 + 4
    );

  if (y + rowHeight > pageHeight - 20) {

    doc.addPage();

    dibujarEncabezadoPagina();

    y = 40;

    dibujarEncabezadoTabla();
  }

  const fondo =
    fila % 2 === 0
      ? COLORS.blanco
      : [245, 245, 245];

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

    doc.setTextColor(...COLORS.negro);

    doc.setFont(
      "Montserrat",
      "normal"
    );

    doc.setFontSize(9);

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

const footerY = pageHeight - 15;

doc.setDrawColor(...COLORS.grisPrincipal);

doc.line(
  margin,
  footerY,
  pageWidth - margin,
  footerY
);

doc.setTextColor(...COLORS.grisPrincipal);

doc.setFont("Montserrat", "normal");
doc.setFontSize(8);

doc.text(
  "Sistema Automatizado de Gestión y Archivo de la Secretaría de Educación (SAGASE)",
  pageWidth / 2,
  footerY + 5,
  {
    align: "center",
  }
);

const formatearFechaNombre = (fecha) => {
  if (!fecha) return "";

  const [anio, mes, dia] = fecha.split("-");

  return `${dia}-${mes}-${anio}`;
};

const nombrePDF =
  `Reporte_Oficios_${
    formatearFechaNombre(fechaInicio)
  }_al_${
    formatearFechaNombre(fechaFin)
  }.pdf`;

    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);

    setReporteUrl(pdfUrl);
    setNombreReporte(nombrePDF);
    setMostrarReporte(true);
    doc.save(nombrePDF);
  };

  return (
    <div className="flex-1 w-full p-3 sm:p-4 md:p-6 bg-gray-100 overflow-y-auto">
      <div className="w-full">
        <div className="bg-gray-300 rounded-t-md flex items-center justify-between px-4 py-2">
          <h1 className="text-sm font-semibold text-gray-800">Control de oficios</h1>
          <button className="w-7 h-7 flex items-center justify-center rounded-full bg-[#8B1538] text-white">
            <Minus size={14} />
          </button>
        </div>

        <div className="bg-white p-6 rounded-b-md shadow-sm text-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-300" />
            <h2 className="text-sm font-semibold text-[#8B1538] uppercase tracking-wide">Oficios generados</h2>
            <div className="h-px flex-1 bg-gray-300" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2 relative">
              <label className="block mb-2 text-sm font-medium text-gray-700">Buscar</label>
              <div className="flex items-center rounded-xl border border-gray-300 px-3 py-2 bg-white">
                <Search size={16} className="text-gray-400 mr-2" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por folio, asunto, destinatario, área, estado..."
                  className="w-full border-0 outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Fecha inicial</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#8B1538] focus:ring-2 focus:ring-[#8B1538]/20"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Fecha final</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#8B1538] focus:ring-2 focus:ring-[#8B1538]/20"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-sm text-gray-600">
              {loading ? "Cargando..." : `Mostrando ${oficiosFiltrados.length} oficio(s) de su área.`}
            </div>
            <button
              onClick={generarReporte}
              className="inline-flex items-center gap-2 bg-[#8B1538] text-white font-semibold px-6 py-2.5 rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              <FileText size={16} />
              Generar reporte
            </button>
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
          ) : null}

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Folio</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Tipo</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Asunto</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Destinatario</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Remitente</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {oficiosFiltrados.length > 0 ? (
                  oficiosFiltrados.map((oficio) => (
                    <tr key={oficio._id || oficio.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-800">{oficio.folio || oficio.numero || "-"}</td>
                      <td className="px-3 py-2 text-gray-700">{oficio.tipo || "-"}</td>
                      <td className="px-3 py-2 text-gray-700 max-w-[240px] truncate" title={oficio.asunto || "-"}>{oficio.asunto || "-"}</td>
                      <td className="px-3 py-2 text-gray-700">{oficio.destinatarioId?.name || oficio.dirigido || "-"}</td>
                      <td className="px-3 py-2 text-gray-700">{oficio.remitenteId?.name || oficio.generado || "-"}</td>
                      <td className="px-3 py-2 text-gray-700">{formatDate(oficio.fecha || oficio.createdAt)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-3 py-6 text-center text-gray-500">
                      No se encontraron oficios con los filtros aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mostrarReporte && reporteUrl && (
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
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <div className="bg-[#8B1538] text-white flex justify-between items-center p-3">
                <span>{nombreReporte}</span>
                <button onClick={() => setMostrarReporte(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-[#8B1538]"><Minus size={16} /></button>
              </div>
              <iframe src={reporteUrl} className="w-full h-[calc(100%-56px)]" title="Reporte de oficios" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
