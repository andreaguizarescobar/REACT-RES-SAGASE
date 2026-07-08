import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getDocuments, getEliminados } from "../../services/document.service";
import { Minus, FileText, FileSpreadsheet, ChevronLeft, ChevronRight,} from "lucide-react";
import { getAreas } from "../../services/catalogos.service";

import jsPDF from "jspdf";
import logoGobierno from "../../assets/images/nayaritLogo.png";
import GothamRoundedBold from "../../../styles/fonts/GothamRounded-Bold.ttf";
import GothamRoundedBook from "../../../styles/fonts/GothamRounded-Book.ttf";
import MontserratBold from "../../../styles/fonts/Montserrat-Bold.ttf";
import MontserratRegular from "../../../styles/fonts/Montserrat-Regular.ttf";

const fichasGestion = [
  { name: "Sin instrucciones", value: 0, color: "#9CA3AF" },
  {
    name: "Con instrucción turnada",
    value: 0,
    color: "#0F766E",
  },
  { name: "Con gestión cerrada", value: 0, color: "#1D4ED8" },
  { name: "Eliminados", value: 0, color: "#991B1B" },
];

const instruccionesEnviadas = [
  { name: "Cerrado", value: 0, color: "#1D4ED8" },
  { name: "Con respuesta registrada", value: 0, color: "#0F766E" },
  {
    name: "Recibido, en ejecución",
    value: 0,
    color: "#3B82F6",
  },
  { name: "Validado", value: 0, color: "#8B1538" },
  {
    name: "Autorizado y turnado",
    value: 0,
    color: "#F59E0B",
  },
  { name: "Registrado", value: 0, color: "#111827" },
];

const instruccionesUsuario = [
  { id: "Validado de usuario", name: "Validado", value: 0, color: "#8B1538" },
  { id: "Con respuesta registrada de usuario", name: "Con respuesta registrada", value: 0, color: "#0F766E" },
  {
    id: "Recibido, en ejecución de usuario",
    name: "Recibido, en ejecución",
    value: 0,
    color: "#3B82F6",
  },
  { id: "Registrado de usuario", name: "Registrado", value: 0, color: "#111827" },
];

const copiasConocimiento = [
  { name: "Leído", value: 0, color: "#0F766E" },
  { name: "Por leer", value: 0, color: "#9CA3AF" },
];


/* ============================
   COMPONENTE DONUT
============================ */

function DonutChart({
  title,
  data,
  clickable,
  onClickSegment,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h3 className="text-base font-semibold text-[#60595D] mb-4">
        {title}
      </h3>

      <div className="w-full h-64">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius="55%"
              outerRadius="80%"
              paddingAngle={3}
              style={{ outline: "none" }}
              activeShape={false}
              onClick={(entry) =>
                clickable && onClickSegment?.(entry.name)
              }
            >
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.color}
                  style={{
                    cursor: clickable ? "pointer" : "default",
                  }}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Leyenda */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        {data.map((item, index) => (
          <div key={index} className="flex items-start gap-2">
            <span
              className="w-3 h-3 rounded-sm mt-1"
              style={{ backgroundColor: item.color }}
            />
            <span className="break-words text-gray-600">
              {item.name} ({item.value})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================
   COMPONENTE PRINCIPAL
============================ */

export function TableroControl() {
  const [estatusSeleccionado, setEstatusSeleccionado] = useState(null);

  const [documentoEditar, setDocumentoEditar] =useState(null);
  const [mostrarVisorPDF, setMostrarVisorPDF] = useState(false);
  const [archivoPDF, setArchivoPDF] = useState(null);

  const [documentos, setDocumentos] = useState([]);
  const [eliminados, setEliminados] = useState([]);
  const [fichas, setFichasGestion] = useState(fichasGestion);
  const [Enviadas, setInstruccionesEnviadas] = useState(instruccionesEnviadas);
  const [usuarioInstrucciones, setInstruccionesUsuario] = useState(instruccionesUsuario);
  const [documentosInternos, setDocumentosInternos] = useState(0);
  const [Copias, setCopiasConocimiento] = useState(copiasConocimiento);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
  const fetchDocuments = async () => {
    try {      
      const documentos = await getDocuments(localStorage.getItem("token"));
      const docs = await documentos.json();
      setDocumentos(docs);

      // Fetch deleted documents count
      let eliminadosCount = 0;
      try {
        const eliminadosRes = await getEliminados(localStorage.getItem("token"));
        if (eliminadosRes.ok) {
          const eliminadosData = await eliminadosRes.json();
          setEliminados(eliminadosData);
          eliminadosCount = eliminadosData.length;
        }
      } catch (e) {
        console.error("Error al obtener eliminados:", e);
      }

      const contador = {
        "Sin instrucciones": 0,
        "Con instrucción turnada": 0,
        "Con gestión cerrada": 0,
        "Eliminados": eliminadosCount,
        "Cerrado": 0,
        "Con respuesta registrada": 0,
        "Recibido, en ejecución": 0,
        "Validado de usuario": 0,
        "Con respuesta registrada de usuario": 0,
        "Recibido, en ejecución de usuario": 0,
        "Validado": 0,
        "Autorizado y turnado": 0,
        "Registrado": 0,
        "Registrado de usuario": 0,
        "Leído": 0,
        "Por leer": 0,
      }

      docs.map((doc) => { 
        if (doc.turnados.some((t) => t.dirigido.area === user.area) || user.roles.some((r) => r.rol === "VALIDADOR" || r.rol === "REGISTRADOR")) {
        if (doc.status === "Sin instrucciones" && doc.turnados.length === 0) {
          contador["Sin instrucciones"] += 1;
        }else if(doc.status === "Autorizado y turnado" || doc.status === "Validado" || doc.status === "Con respuesta registrada" || doc.status === "Recibido, en ejecución") {
          contador["Con instrucción turnada"] += 1; 
          if(doc.status === "Recibido, en ejecución") {
            if(doc.registrador._id === user._id || doc.validador === user._id || doc.turnados?.some((t) => t.dirigido._id === user._id)) {
              contador["Recibido, en ejecución de usuario"] += 1;
            }
            contador["Recibido, en ejecución"] += 1;
          }else if (doc.status === "Autorizado y turnado") {
              contador["Autorizado y turnado"] += 1;
          } else {
            if(doc.status === "Validado") {
              if(doc.registrador._id === user._id || doc.validador === user._id || doc.turnados?.some((t) => t.dirigido._id === user._id)) {
                contador["Validado de usuario"] += 1;
              }
              contador["Validado"] += 1;
            } else if(doc.status === "Con respuesta registrada") {
              if(doc.registrador._id === user._id || doc.validador === user._id || doc.turnados?.some((t) => t.dirigido._id === user._id)) {
                contador["Con respuesta registrada de usuario"] += 1;
              }
              contador["Con respuesta registrada"] += 1;
            }
          }
        }else if(doc.status === "Cerrado") {
          contador["Con gestión cerrada"] += 1;
          contador["Cerrado"] += 1;
        }
        if (doc.registrador._id === user._id || doc.validador === user._id || doc.turnados?.some((t) => t.dirigido._id === user._id)) {
          contador["Registrado de usuario"] += 1;
        }
        contador["Registrado"] += 1;
        
        doc.copias.map(copia => {
        if(copia.status === "Leído") {
          contador["Leído"] += 1;
        }else if(copia.status === "Por leer") {
          contador["Por leer"] += 1;
        }
      });
      }});

      setDocumentosInternos({value: contador["Registrado"]});

      const updatedFichasGestion = fichas.map((ficha) => ({
        ...ficha, 
        value: contador[ficha.name]
      })
      );

      const updatedInstruccionesEnviadas = Enviadas.map((item) => ({
        ...item,
        value: contador[item.name]
      }));

      const updatedInstruccionesUsuario = usuarioInstrucciones.map((item) => ({
        ...item,
        value: contador[item.id]
      }));

      const updatedCopiasConocimiento = Copias.map((item) => ({
        ...item,
        value: contador[item.name]
      }));

      setFichasGestion(updatedFichasGestion);
      setInstruccionesEnviadas(updatedInstruccionesEnviadas);
      setInstruccionesUsuario(updatedInstruccionesUsuario);
      setCopiasConocimiento(updatedCopiasConocimiento);
    } catch (error) {
      console.error("Error al obtener documentos:", error);
    }
  };

  fetchDocuments();
}, []);

  const esEliminados = estatusSeleccionado === "Eliminados";

  const documentosFiltrados = esEliminados ? [] : documentos.filter(
    (doc) => (estatusSeleccionado === "Registrado" ||
    (doc.status === estatusSeleccionado) || (doc.status !== "Sin instrucciones" && estatusSeleccionado === "Con instrucción turnada") ||
    (doc.status === "Cerrado" && estatusSeleccionado === "Con gestión cerrada") || 
    (doc.eliminado && estatusSeleccionado === "Eliminados") ||
    (doc.copias.some(copia => copia.status === "Leído") && estatusSeleccionado === "Leído") ||
    (doc.copias.some(copia => copia.status === "Por leer") && estatusSeleccionado === "Por leer")) && (doc.registrador.area === user.area || doc.turnados?.some((t) => t.dirigido.area === user.area) || user.roles.some((r) => r.rol === "VALIDADOR" || r.rol === "REGISTRADOR"))
    || (estatusSeleccionado === "Validado de usuario" && doc.status === "Validado" && (doc.registrador._id === user._id || doc.validador === user._id || doc.turnados?.some((t) => t.dirigido._id === user._id))) ||
    estatusSeleccionado === "Con respuesta registrada de usuario" && doc.status === "Con respuesta registrada" && (doc.registrador._id === user._id || doc.validador === user._id || doc.turnados?.some((t) => t.dirigido._id === user._id))
    || (estatusSeleccionado === "Recibido, en ejecución de usuario" && doc.status === "Recibido, en ejecución" && (doc.registrador._id === user._id || doc.validador === user._id || doc.turnados?.some((t) => t.dirigido._id === user._id)))
    || (estatusSeleccionado === "Registrado de usuario" && (doc.registrador._id === user._id || doc.validador === user._id || doc.turnados?.some((t) => t.dirigido?._id === user._id)))
  );

  const tablaModalRef = useRef(null);
  const bitacoraRef = useRef(null);
    
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 6;

  const dataSource = esEliminados ? eliminados : documentosFiltrados;

  const totalPaginas = Math.ceil(
    dataSource.length / registrosPorPagina,
  );

  const indexInicio = (paginaActual - 1) * registrosPorPagina;
  const indexFin = indexInicio + registrosPorPagina;

  const documentosPaginados = dataSource.slice(
    indexInicio,
    indexFin,
  );

  const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);
  const bitacora = documentoSeleccionado?.bitacora || [];

  const [tabActiva, setTabActiva] = useState("datosAsunto");

//  const [menuContextual, setMenuContextual] = useState(null);

//   useEffect(() => {
//     const cerrarMenu = () => setMenuContextual(null);
//     window.addEventListener("click", cerrarMenu);
//     return () =>
//       window.removeEventListener("click", cerrarMenu);
//   }, []);


  const generarNombreArchivo = () => {
    const hoy = new Date();
    const fecha =
      String(hoy.getDate()).padStart(2, "0") +
      "-" +
      String(hoy.getMonth() + 1).padStart(2, "0") +
      "-" +
      hoy.getFullYear();

    const estatusArchivo = (estatusSeleccionado || "Documentos").replace(
      /[^a-zA-Z0-9À-ÿ ]/g,
      ""
    ).trim().replace(/\s+/g, "_");

    return `Documentos_${estatusArchivo}_${fecha}`;
  };

  const exportarExcel = () => {
    const datos = documentosFiltrados;

    if (!datos.length) return;

    const nombreAutomatico = generarNombreArchivo();

    const encabezados = [
      "Folio",
      "No. Documento",
      "Fecha del documento",
      "Síntesis del asunto",
      "Remitente",
      "Estatus",
    ];

    const escaparCelda = (valor) =>
      `"${String(valor ?? "").replace(/"/g, '""')}"`;

    const filas = datos.map((doc) => {
      const fechaDoc = doc.fechaDoc
        ? new Date(doc.fechaDoc).toLocaleDateString("es-MX", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })
        : "";

      return [
        doc.folio,
        doc.docId,
        fechaDoc,
        doc.asunto,
        doc.remitente?.name || "N/A",
        doc.status,
      ]
        .map(escaparCelda)
        .join(",");
    });

    const contenidoCSV = encabezados.join(",") + "\n" + filas.join("\n");

    const blob = new Blob(["\uFEFF" + contenidoCSV], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${nombreAutomatico}.csv`;
    link.click();
  };

  const exportarPDF = async () => {
    const datos = documentosFiltrados;

    if (!datos.length) return;

    const nombreAutomatico = generarNombreArchivo();

    const pdf = await generarReporteDocumentos(datos, nombreAutomatico);

    setArchivoPDF(pdf);
    setMostrarVisorPDF(true);
  };

  const generarReporteDocumentos = async (datos, nombreArchivo) => {
    const doc = new jsPDF("p", "mm", "letter");

    // =========================
    // FUENTES
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

      doc.setFillColor(...COLORS.grisSecundario);
      doc.rect(margin, 12, contentWidth, 18, "F");

      doc.addImage(logoGobierno, "PNG", margin + 2, 12, 85, 18);

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

    doc.text("REPORTE DE DOCUMENTOS", pageWidth / 2, y, { align: "center" });

    y += 6;

    doc.setFont("Montserrat", "normal");
    doc.setFontSize(10);
    doc.text(`Estatus: ${estatusSeleccionado}`, pageWidth / 2, y, {
      align: "center",
    });

    y += 8;

    // =========================
    // TABLA
    // =========================
    const columnas = [
      "FOLIO",
      "NO. DOCUMENTO",
      "FECHA",
      "SÍNTESIS",
      "REMITENTE",
      "ESTATUS",
    ];

    const anchos = [22, 26, 22, 55, 38, 27];

    const dibujarEncabezadoTabla = () => {
      let x = margin;

      columnas.forEach((titulo, i) => {
        doc.setFillColor(...COLORS.grisPrincipal);
        doc.rect(x, y, anchos[i], 10, "F");

        doc.setFont("Montserrat", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.blanco);

        doc.text(titulo, x + anchos[i] / 2, y + 6, { align: "center" });

        x += anchos[i];
      });

      y += 10;
    };

    dibujarEncabezadoTabla();

    let fila = 0;

    // =========================
    // DATA
    // =========================
    datos.forEach((docItem) => {
      const fechaDoc = docItem.fechaDoc
        ? new Date(docItem.fechaDoc).toLocaleDateString("es-MX", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })
        : "-";

      const valores = [
        docItem.folio || "-",
        docItem.docId || "-",
        fechaDoc,
        docItem.asunto || "-",
        docItem.remitente?.name || "N/A",
        docItem.status || "-",
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
        const fondo = fila % 2 === 0 ? [255, 255, 255] : [245, 245, 245];

        doc.setFillColor(...fondo);
        doc.rect(x, y, anchos[i], rowHeight, "F");

        doc.setDrawColor(...COLORS.grisSecundario);
        doc.rect(x, y, anchos[i], rowHeight);

        doc.setFont("Montserrat", "normal");
        doc.setFontSize(8);
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

  const [busquedaVerTurnos, setBusquedaVerTurnos] = useState("");

  const turnosVerTodos = [
    {
      instruccion:
        "Atender el tema y dar respuesta al interesado, marcando copia a esta oficina",
      funcionario: "María Verónica Leal Camarena",
      areaDestino: "Dirección de Administración",
      prioridad: "Trámite Extra-urgente",
      fecha: "2022-10-13",
      areaTurna:
        "Dirección de Desarrollo Archivístico Nacional",
      quienTurna: "María Verónica Leal Camarena",
      estatus: "Autorizado y turnado",
    },
    {
      instruccion: "Distribuir los materiales",
      funcionario: "Guillermo Bonilla Tenorio",
      areaDestino:
        "Dirección de Desarrollo Archivístico Nacional",
      prioridad: "Trámite Extra-urgente",
      fecha: "2022-10-13",
      areaTurna:
        "Dirección de Desarrollo Archivístico Nacional",
      quienTurna: "Víctor Manuel Enríquez Paniagua",
      estatus: "Concluido",
    },
  ];

  const turnosVerFiltrados = turnosVerTodos.filter((item) =>
    Object.values(item)
      .join(" ")
      .toLowerCase()
      .includes(busquedaVerTurnos.toLowerCase())
  );

  const descargarBitacora = async () => {
  const doc = new jsPDF("p", "mm", "letter");

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

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const margin = 10;
  const contentWidth = pageWidth - margin * 2;

  const hoy = new Date();

  const fechaHoy = `${String(hoy.getDate()).padStart(2, "0")}/${String(
    hoy.getMonth() + 1
  ).padStart(2, "0")}/${hoy.getFullYear()}`;

  let y = 40;

  // HEADER
  const dibujarHeader = () => {
    doc.setFillColor(...COLORS.grisSecundario);
    doc.rect(margin, 12, contentWidth, 18, "F");

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

    doc.setFont("Montserrat", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.blanco);

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

  dibujarHeader();

  // TITULO
  doc.setFont("GothamRounded", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.grisPrincipal);

  doc.text(
    "REPORTE DE BITÁCORA",
    pageWidth / 2,
    y,
    { align: "center" }
  );

  y += 10;

  // TABLA
  const columnas = [
    "USUARIO",
    "DESCRIPCIÓN",
    "FECHA",
    "HORA",
  ];

  const anchos = [40, 90, 30, 25];

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
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.blanco);

    doc.text(
      titulo,
      x + anchos[i] / 2,
      y + 6,
      {
        align: "center",
      }
    );

    x += anchos[i];
  });

  y += 10;

  // MOVIMIENTOS
  bitacora.forEach((mov, index) => {
    const valores = [
      mov.user?.nombre || "-",
      mov.descripcion || "-",
      mov.fecha || "-",
      mov.hora || "-",
    ];

    const lineas = valores.map((v, i) =>
      doc.splitTextToSize(
        String(v),
        anchos[i] - 4
      )
    );

    const maxLineas = Math.max(
      ...lineas.map((l) => l.length)
    );

    const altoFila = Math.max(
      10,
      maxLineas * 4 + 4
    );

    if (y + altoFila > pageHeight - 20) {
      doc.addPage();

      dibujarHeader();

      y = 40;

      let xx = margin;

      columnas.forEach((titulo, i) => {
        doc.setFillColor(
          ...COLORS.grisPrincipal
        );

        doc.rect(
          xx,
          y,
          anchos[i],
          10,
          "F"
        );

        doc.setTextColor(
          ...COLORS.blanco
        );

        doc.text(
          titulo,
          xx + anchos[i] / 2,
          y + 6,
          {
            align: "center",
          }
        );

        xx += anchos[i];
      });

      y += 10;
    }

    let xx = margin;

    lineas.forEach((texto, i) => {
      const fondo =
        index % 2 === 0
          ? [255, 255, 255]
          : [245, 245, 245];

      doc.setFillColor(...fondo);

      doc.rect(
        xx,
        y,
        anchos[i],
        altoFila,
        "F"
      );

      doc.setDrawColor(
        ...COLORS.grisSecundario
      );

      doc.rect(
        xx,
        y,
        anchos[i],
        altoFila
      );

      doc.setFont(
        "Montserrat",
        "normal"
      );

      doc.setFontSize(9);

      doc.setTextColor(
        ...COLORS.negro
      );

      doc.text(
        texto,
        xx + 2,
        y + 5
      );

      xx += anchos[i];
    });

    y += altoFila;
  });

  // FOOTER
  const footerY = pageHeight - 15;

  doc.setDrawColor(
    ...COLORS.grisPrincipal
  );

  doc.line(
    margin,
    footerY,
    pageWidth - margin,
    footerY
  );

  doc.setFont(
    "Montserrat",
    "normal"
  );

  doc.setFontSize(8);

  doc.setTextColor(
    ...COLORS.grisPrincipal
  );

  doc.text(
    "Sistema Automatizado de Gestión de Correspondencia",
    pageWidth / 2,
    footerY + 5,
    {
      align: "center",
    }
  );

  doc.save(
    `Bitacora_${documentoSeleccionado?.folio || "SAGASE"}.pdf`
  );
  };

  const generarBitacoraPDF = async () => {
    const doc = new jsPDF("p", "mm", "letter");

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

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const margin = 10;
  const contentWidth = pageWidth - margin * 2;

  const hoy = new Date();

  const fechaHoy = `${String(hoy.getDate()).padStart(2, "0")}/${String(
    hoy.getMonth() + 1
  ).padStart(2, "0")}/${hoy.getFullYear()}`;

  let y = 40;

  // HEADER
  const dibujarHeader = () => {
    doc.setFillColor(...COLORS.grisSecundario);
    doc.rect(margin, 12, contentWidth, 18, "F");

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

    doc.setFont("Montserrat", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.blanco);

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

  dibujarHeader();

  // TITULO
  doc.setFont("GothamRounded", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.grisPrincipal);

  doc.text(
    "REPORTE DE BITÁCORA",
    pageWidth / 2,
    y,
    { align: "center" }
  );

  y += 10;

  // TABLA
  const columnas = [
    "USUARIO",
    "DESCRIPCIÓN",
    "FECHA",
    "HORA",
  ];

  const anchos = [40, 90, 30, 25];

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
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.blanco);

    doc.text(
      titulo,
      x + anchos[i] / 2,
      y + 6,
      {
        align: "center",
      }
    );

    x += anchos[i];
  });

  y += 10;

  // MOVIMIENTOS
  bitacora.forEach((mov, index) => {
    const valores = [
      mov.user?.nombre || "-",
      mov.descripcion || "-",
      mov.fecha || "-",
      mov.hora || "-",
    ];

    const lineas = valores.map((v, i) =>
      doc.splitTextToSize(
        String(v),
        anchos[i] - 4
      )
    );

    const maxLineas = Math.max(
      ...lineas.map((l) => l.length)
    );

    const altoFila = Math.max(
      10,
      maxLineas * 4 + 4
    );

    if (y + altoFila > pageHeight - 20) {
      doc.addPage();

      dibujarHeader();

      y = 40;

      let xx = margin;

      columnas.forEach((titulo, i) => {
        doc.setFillColor(
          ...COLORS.grisPrincipal
        );

        doc.rect(
          xx,
          y,
          anchos[i],
          10,
          "F"
        );

        doc.setTextColor(
          ...COLORS.blanco
        );

        doc.text(
          titulo,
          xx + anchos[i] / 2,
          y + 6,
          {
            align: "center",
          }
        );

        xx += anchos[i];
      });

      y += 10;
    }

    let xx = margin;

    lineas.forEach((texto, i) => {
      const fondo =
        index % 2 === 0
          ? [255, 255, 255]
          : [245, 245, 245];

      doc.setFillColor(...fondo);

      doc.rect(
        xx,
        y,
        anchos[i],
        altoFila,
        "F"
      );

      doc.setDrawColor(
        ...COLORS.grisSecundario
      );

      doc.rect(
        xx,
        y,
        anchos[i],
        altoFila
      );

      doc.setFont(
        "Montserrat",
        "normal"
      );

      doc.setFontSize(9);

      doc.setTextColor(
        ...COLORS.negro
      );

      doc.text(
        texto,
        xx + 2,
        y + 5
      );

      xx += anchos[i];
    });

    y += altoFila;
  });

  // FOOTER
  const footerY = pageHeight - 15;

  doc.setDrawColor(
    ...COLORS.grisPrincipal
  );

  doc.line(
    margin,
    footerY,
    pageWidth - margin,
    footerY
  );

  doc.setFont(
    "Montserrat",
    "normal"
  );

  doc.setFontSize(8);

  doc.setTextColor(
    ...COLORS.grisPrincipal
  );

  doc.text(
    "Sistema Automatizado de Gestión de Correspondencia",
    pageWidth / 2,
    footerY + 5,
    {
      align: "center",
    }
  );

  doc.save(
    `Bitacora_${documentoSeleccionado?.folio || "SAGASE"}.pdf`
  );


    const blob = doc.output("blob");

    return {
      blob,
      url: URL.createObjectURL(blob),
      nombre: `Bitacora_${documentoSeleccionado?.folio || "SAGASE"}.pdf`,
    };
  };

  const [pdfBitacora, setPdfBitacora] = useState(null);

  useEffect(() => {

    const cargarPreview = async () => {
      const pdf = await generarBitacoraPDF();
      setPdfBitacora(pdf.url);
    };

    if (tabActiva === "bitacora") {
      cargarPreview();
    }
  }, [tabActiva, bitacora]);

  return (
    <div className="flex-1 p-6 bg-gray-100 overflow-y-auto">
      <h1 className="text-3xl font-bold text-[#79142A] mb-6">
        Tablero de Control
      </h1>

      {/* GRID DE GRÁFICAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 ">
        {/* PRIMERA INTERACTIVA */}
        <DonutChart
          title="Fichas de Gestión"
          data={fichas}
          clickable
          onClickSegment={(estatus) => {
            setEstatusSeleccionado(estatus);
            setPaginaActual(1);
          }}
        />

        <DonutChart
          title={user.roles.some((r) => r.rol === "VALIDADOR" || r.rol === "REGISTRADOR") ? "Documentos gestionados" : "Documentos gestionados por el área del usuario"}
          data={Enviadas}
          clickable
          onClickSegment={(estatus) => {
            setEstatusSeleccionado(estatus);
            setPaginaActual(1);
          }}
        />  

        <DonutChart
          title="Mis Documentos"
          data={usuarioInstrucciones}
          clickable
          onClickSegment={(estatus) => {
            setEstatusSeleccionado(`${estatus} de usuario`);
            setPaginaActual(1);
          }}
        />

        {/*<DonutChart
          title="Copias de conocimiento"
          data={Copias}
        />*/}

        {/* Documentos internos */}
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col justify-center items-center text-center">
          <h3 className="text-base font-semibold text-gray-700 mb-4">
            Documentos internos
          </h3>
          <span className="text-5xl font-bold text-[#8B1538]">
            {documentosInternos.value}
          </span>
        </div>
      </div>

      {/* ============================
         MODAL DINÁMICO
      ============================ */}

      <AnimatePresence>
        {estatusSeleccionado && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center print:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >

          {/* Fondo oscuro */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm no-print"
            onClick={() => setEstatusSeleccionado(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Ventana */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl w-11/12 max-w-5xl max-h-[85vh] flex flex-col overflow-hidden print:shadow-none print:max-h-none print:w-full"
            initial={{ scale: 0.9, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 40, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50 shrink-0">
              <div>
                <h3 className="text-xl font-semibold text-[#8B1538]">
                  Documentos en estatus: {estatusSeleccionado}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {dataSource.length}{" "}
                  {dataSource.length === 1
                    ? "documento encontrado"
                    : "documentos encontrados"}
                </p>
              </div>
              <button
                onClick={() => setEstatusSeleccionado(null)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#8B1538] text-white hover:opacity-90 shrink-0"
              >
                <Minus size={18} />
              </button>
            </div>

            {/* Botones de exportación */}
            <AnimatePresence>
              {documentosFiltrados.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex justify-start gap-3 px-6 pt-4 no-print shrink-0"
                >
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
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex-1 overflow-y-auto p-6">
              <div
                ref={tablaModalRef}
                className="zona-tabla-modal overflow-x-auto print-area rounded-xl border border-gray-200"
              >
                {/* Título visible solo en impresión */}
                <div className="hidden print:block mb-6 text-center">
                  <h1 className="text-2xl font-bold text-[#8B1538] mb-2">
                    SAGASE-INTERFACES - Figma Make
                  </h1>
                  <h2 className="text-lg font-semibold text-gray-700">
                    Documentos en estatus: {estatusSeleccionado}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Fecha de impresión: {new Date().toLocaleString('es-MX', { 
                      year: 'numeric', 
                      month: '2-digit', 
                      day: '2-digit', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>

                <table className="min-w-full text-xs tabla-documentos">
                  <thead className="bg-[#79142A] text-white">
                    <tr>
                      {esEliminados ? (
                        <>
                          <th className="px-3 py-2 text-left">Folio</th>
                          <th className="px-3 py-2 text-left">No. de Documento</th>
                          <th className="px-3 py-2 text-left">Motivo de eliminación</th>
                          <th className="px-3 py-2 text-left">Eliminado por</th>
                          <th className="px-3 py-2 text-left">Fecha de eliminación</th>
                        </>
                      ) : (
                        <>
                          <th className="px-3 py-2 text-left">Folio</th>
                          <th className="px-3 py-2 text-left">No. de Documento</th>
                          <th className="px-3 py-2 text-left">Fecha del documento</th>
                          <th className="px-3 py-2 text-left">Síntesis del asunto</th>
                          <th className="px-3 py-2 text-left">Remitente</th>
                          <th className="px-3 py-2 text-left">Estatus</th>
                        </>
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {documentosPaginados.length > 0 ? (
                      documentosPaginados.map((doc, index) => (
                        <tr
                          key={index}
                          className="border-t hover:bg-gray-100 cursor-context-menu"
                        >
                          {esEliminados ? (
                            <>
                              <td className="px-3 py-2">{doc.folio || "-"}</td>
                              <td className="px-3 py-2">{doc.docId || "-"}</td>
                              <td className="px-3 py-2">{doc.motivoEliminacion || "-"}</td>
                              <td className="px-3 py-2">{doc.usuario?.nombre || "N/A"}</td>
                              <td className="px-3 py-2">
                                {doc.fechaEliminacion
                                  ? new Date(doc.fechaEliminacion).toLocaleDateString("es-MX", {
                                      year: "numeric",
                                      month: "2-digit",
                                      day: "2-digit",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "-"}
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-3 py-2">{doc.folio}</td>
                              <td className="px-3 py-2">{doc.docId}</td>
                              <td className="px-3 py-2">
                                {doc.fechaDoc
                                  ? new Date(doc.fechaDoc).toLocaleDateString("es-MX", {
                                      year: "numeric",
                                      month: "2-digit",
                                      day: "2-digit",
                                    })
                                  : ""}
                              </td>
                              <td className="px-3 py-2">{doc.asunto}</td>
                              <td className="px-3 py-2">{doc.remitente?.name || "N/A"}</td>
                              <td className="px-3 py-2">{doc.status}</td>
                            </>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={esEliminados ? 5 : 6}
                          className="text-center py-4 text-gray-500"
                        >
                          No hay documentos en este estatus
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* {menuContextual && (
                <div
                  className="fixed bg-white shadow-lg rounded-lg border text-sm z-50"
                  style={{
                    top: menuContextual.y,
                    left: menuContextual.x,
                  }}
                >
                  <button
                    className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                    onClick={() => {
                      setDocumentoSeleccionado(
                        menuContextual.documento,
                      );
                      setMenuContextual(null);
                    }}
                  >
                    Ver documento
                  </button>
                  

                </div>
              )} */}
          
              {/* PAGINACIÓN */}
              {totalPaginas > 1 && (
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <div className="flex items-center justify-center gap-2">

                    {/* ANTERIOR */}
                    <button
                      onClick={() =>
                        setPaginaActual((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={paginaActual === 1}
                      className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm hover:bg-[#8B1538] hover:text-white hover:border-[#8B1538] transition-all duration-200 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-400 disabled:hover:border-gray-200"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {/* NÚMEROS */}
                    <div className="flex items-center gap-2">
                      {(() => {
                        const maxVisible = 3;

                        let inicio = Math.max(1, paginaActual - 1);
                        let fin = inicio + maxVisible - 1;

                        if (fin > totalPaginas) {
                          fin = totalPaginas;
                          inicio = Math.max(1, fin - maxVisible + 1);
                        }

                        return Array.from(
                          { length: fin - inicio + 1 },
                          (_, i) => {
                            const numeroPagina = inicio + i;

                            return (
                              <button
                                key={numeroPagina}
                                onClick={() => setPaginaActual(numeroPagina)}
                                className={`w-9 h-9 rounded-xl text-sm font-medium transition-all duration-200 ${
                                  paginaActual === numeroPagina
                                    ? "bg-[#8B1538] text-white shadow-md scale-105"
                                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                                }`}
                              >
                                {numeroPagina}
                              </button>
                            );
                          }
                        );
                      })()}
                    </div>

                    {/* SIGUIENTE */}
                    <button
                      onClick={() =>
                        setPaginaActual((prev) =>
                          Math.min(prev + 1, totalPaginas)
                        )
                      }
                      disabled={paginaActual === totalPaginas}
                      className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm hover:bg-[#8B1538] hover:text-white hover:border-[#8B1538] transition-all duration-200 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-400 disabled:hover:border-gray-200"
                    >
                      <ChevronRight size={16} />
                    </button>

                  </div>
                </div>
              )}
            </div>

          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Visor de PDF generado */}
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
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-[#8B1538]"
                >
                  <Minus size={14} />
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