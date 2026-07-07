import { useState, useRef, useEffect } from "react";
import { FileText, Trash2, Search, Inbox, ListTodo, Send,  Eye, ThumbsUp, Minus, ClipboardCheck, MapPin, Check, Upload, ChevronDown, Download, ArrowRight, CheckCircle2 } from "lucide-react";
import { Switch } from "./ui/switch";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import { TableroControl } from "../pages/user/TableroControl";
import { RegistrarDocumento } from "../pages/user/RegistrarDocumento.jsx";
import BuscadorDocumentos from "../pages/user/BuscadorDocumentos.jsx";
import { ReporteAsuntos } from "../pages/user/ReporteAsunto";
import { GeneracionOficios } from "../pages/user/GeneracionOficios";
import { ControlOficios } from "../pages/user/ControlOficios";
import { SalidaCorrespondencia } from "../pages/user/SalidaCorrespondencia";
import { ConsultaSalidaCorrespondencia } from "../pages/user/ConsultaSalidaCorrespondencia";
import { ReporteSalidaCorrespondencia } from "../pages/user/ReporteSalidaCorrespondencia";
import { ReporteAcuerdos } from "../pages/user/ReporteAcuerdos";
import { VisualizaDocumento } from "../pages/user/VisualizaDocumento";

import { updateDocument, uploadAnexo, removeAnexo, removeRelacionado, addTurnado, getDocumentById, enviarRespuesta } from "../services/document.service";
import { getAreas, getInstrucciones } from "../services/catalogos.service.js";
import { getRemitentes } from "../services/remitente.service.js";
import { getUsers, getTareas, moveTarea, concluirTarea, validarTarea, devolverTarea } from "../services/user.service.js";

import { motion, AnimatePresence } from "framer-motion";
import logoGobierno from "../assets/images/nayaritLogo.png";

import GothamRoundedBold from "../../styles/fonts/GothamRounded-Bold.ttf";
import GothamRoundedBook from "../../styles/fonts/GothamRounded-Book.ttf";
import MontserratBold from "../../styles/fonts/Montserrat-Bold.ttf";
import MontserratRegular from "../../styles/fonts/Montserrat-Regular.ttf";

export default function MainContent({ currentView }) {

  const [documentos, setDocumentos] = useState([]);

  const [entradas, setEntradas] = useState([]);
  const [salidas, setSalidas] = useState([]);
  const [pendientes, setPendientes] = useState([]);

  const cargarTareas = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      const userId = JSON.parse(user).userId;
      const tareas = await getTareas(userId, token);
      const tareasData = await tareas.json();
      const tareasLista = tareasData?.tareas || [];
      const entradas = [];
      const salidas = [];
      const pendientes = [];
  
      tareasLista.forEach((tarea) => {
        if (tarea.status === "entrada") {
          entradas.push(tarea);
        } else if (tarea.status === "salida") {
          salidas.push(tarea);
        } else if (tarea.status === "pendiente") {
          pendientes.push(tarea);
        }
      });
       // Ordenar pendientes por fecha de término del último turno si es ejecutor o validador
      const usuarioData = JSON.parse(localStorage.getItem("user"));
      const esValidador = usuarioData?.roles?.some((r) => r.rol === "VALIDADOR");
      const esEjecutor = usuarioData?.roles?.some((r) => r.rol === "EJECUTOR");
      
      if ((esValidador || esEjecutor) && pendientes.length > 0) {
        pendientes.sort((a, b) => {
          const fechaA = a.documento?.turnados?.at(-1)?.compromiso;
          const fechaB = b.documento?.turnados?.at(-1)?.compromiso;

          // Si alguno no tiene fecha, enviar al final
          if (!fechaA && !fechaB) return 0;
          if (!fechaA) return 1;
          if (!fechaB) return -1;

          // Ordenar ascendente: primero los que vencen antes
          return new Date(fechaA) - new Date(fechaB);
        });
      }
      setEntradas(entradas);
      setSalidas(salidas);
      setPendientes(pendientes);
    } catch (error) {
      console.error("Error al obtener las tareas:", error);
    }
  };

  useEffect(() => {
    cargarTareas();
  }, []);

  // Recargar tareas cuando se vuelve al tablero principal desde otra vista
  useEffect(() => {
    const vistasPaginas = [
      "tablero-control",
      "registra-documento",
      "buscador-documento",
      "reporte-asuntos",
      "reporte-acuerdos",
      "generacion-oficios",
      "control-oficios",
      "salida-correspondencia",
      "consultaS-correspondencia",
      "reporteS-correspondencia",
      "visualiza-documento",
    ];
    
    // Si no es una vista de página específica, es la vista por defecto (tablero)
    if (!vistasPaginas.includes(currentView)) {
      cargarTareas();
    }
  }, [currentView]);

  const [docSeleccionado, setDocSeleccionado] = useState(null);
  const [docSeleccionadoPendientes, setDocSeleccionadoPendientes] = useState(null);
  const [misPendientes, setMisPendientes] = useState([]);
  const [misSalidas, setMisSalidas] = useState([]);

  const formatDateForInput = (value) => {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? ""
      : date.toISOString().split("T")[0];
  };

    const formatDateValue = (value, withTime = false) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return withTime ? date.toISOString().slice(0, 16) : date.toISOString().slice(0, 10);
  };

  const safeText = (value, fallback = "") => {
    if (value === undefined || value === null || value === "") {
      return fallback;
    }
    if (typeof value === "object") {
      if (Array.isArray(value)) {
        return value
          .map((item) => safeText(item))
          .filter(Boolean)
          .join(", ");
      }
      return (
        value.descripcion ||
        value.tipo ||
        value.name ||
        value.nombre ||
        value.area ||
        value.dependencia ||
        value.cargo ||
        value.label ||
        JSON.stringify(value)
      );
    }
    return String(value);
  };

  const handleTomarAsunto = async (doc) => {
    const result = await Swal.fire({
      title: "Tomar asunto",
      text: "¿Desea tomar este asunto?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí",
      cancelButtonText: "No",
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) return;

    setMisPendientes((prev) => {
      const existe = prev.some((item) => item.folio === doc.folio);
      if (existe) return prev;
      return [
        ...prev,
        {
          ...doc,
          estado: "Pendiente",
        },
      ];
    });

    const tareaId = doc._id || doc.id || doc.tareaId;
    if (!tareaId) return;

    try {
      const token = localStorage.getItem("token");
      const respuesta = await moveTarea(tareaId, token);

      if (respuesta.ok) {
        setEntradas((prev) =>
          prev.filter(
            (item) =>
              item._id !== doc._id &&
              item.id !== doc.id &&
              item.tareaId !== doc.tareaId
          )
        );

        setPendientes((prev) => {
          const existe = prev.some(
            (item) =>
              item._id === doc._id ||
              item.id === doc.id ||
              item.tareaId === doc.tareaId
          );
          if (existe) return prev;
          return [
            ...prev,
            {
              ...doc,
              status: "pendiente",
            },
          ];
        });

        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Asunto tomado correctamente",
          showConfirmButton: false,
          timer: 2000,
        });

        cargarTareas();
        seleccionarDocPendiente(doc);
      } else {
        const msg = await respuesta.text();
        console.error("Error al mover tarea:", msg);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo mover la tarea al servidor",
        });
      }
    } catch (error) {
      console.error("Error en moveTarea:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo mover la tarea al servidor",
      });
    } finally {
      setMostrarModal(false);
    }
  };

  const getDocumentoIdFromPending = (pending) => {
    const documento = pending?.documento || pending || {};
    return (
      documento?.docId ||
      documento?._id ||
      documento?.folio ||
      (typeof documento === "string" ? documento : "")
    );
  };

  const getDocumentoIdForRequest = (documento) => {
    return (
      documento?.docId ||
      documento?._id ||
      documento?.folio ||
      (typeof documento === "string" ? documento : "")
    );
  };

  const seleccionarDocPendiente = async (doc) => {
    const documento = doc?.documento || doc;
    const tareaId = doc?._id || doc?.tareaId || documento?.tareaId;

    setDocSeleccionadoPendientes({ ...documento, tareaId });
    esEjecutor ? setTabActiva("turnoRecibido") : setTabActiva("verTurnos");

    const token = localStorage.getItem("token");
    const docId = getDocumentoIdFromPending(doc);
    if (!docId || !token) return;

    try {
      const response = await getDocumentById(docId, token);
      if (!response.ok) {
        const message = await response.text();
        console.error("Error cargando documento completo:", message);
        return;
      }

      const data = await response.json();
      const fullDoc = data.documento || data;
      setDocSeleccionadoPendientes({ ...fullDoc, tareaId });

      setDocumentoSeleccionado(fullDoc);

      setDocumentoAnexos(fullDoc.anexos || []);
      setTurnosDocumento(fullDoc.turnados || []);
      setCopiasDocumento(fullDoc.copias || []);
      setBitacoraDocumento(fullDoc.bitacora || []);
      setMaterialesAdicionales(fullDoc.adicional?.adicionales || []);

      setRelacionadosDocumento(
        (fullDoc.relacionados || [])
          .map(normalizeRelacionadoItem)
          .filter(Boolean)
      );

      // Cargar información al formulario de atención
      setFormEditar({
        ejercicio: fullDoc.ejercicio || "",
        noDocumento: fullDoc.docId || "",
        fechaDocumento: formatDateForInput(fullDoc.fechaDoc),
        fechaAcuse: formatDateForInput(fullDoc.acuse),
        fechaRegistro: formatDateForInput(fullDoc.registro),
        tipoRemitente: fullDoc.interno ? "interno" : "externo",
        remitenteInterno: fullDoc.interno
          ? fullDoc.remitente?._id || fullDoc.remitente || ""
          : "",
        remitenteExterno: !fullDoc.interno
          ? fullDoc.remitente?._id || fullDoc.remitente || ""
          : "",
        tipoDocumento: fullDoc.tipo?._id || fullDoc.tipo || "",
        tipoOtro: fullDoc.tipoOtro || "",
        temaPrincipal: fullDoc.tema?._id || fullDoc.tema || "",
        temaSecundario:
          fullDoc.secundario?._id || fullDoc.secundario || "",
        sintesis: fullDoc.asunto || "",
        observaciones: fullDoc.observaciones || "",
        documentoInterno: !!fullDoc.interno,
        faltaInformacion: !!fullDoc.faltaInformacion,
        otroFuncionario: !!fullDoc.otroFuncionario,
        altaTipoDocumento: false,
        relacionadoCon: !!fullDoc.relacionadoCon,
        materialAdicional:
          fullDoc.adicional?._id || fullDoc.adicional || "",
      });

      // Reflejar labels visibles en inputs de búsqueda
      setBusquedaTipoDoc(
        fullDoc.tipoOtro ||
        fullDoc.tipo?.tipo ||
        fullDoc.tipo?.descripcion ||
        ""
      );

      setBusquedaTemaPrincipal(
        fullDoc.tema?.descripcion || ""
      );

      setBusquedaTemaSecundario(
        fullDoc.secundario?.descripcion || ""
      );

      setBusquedaMaterial(
        fullDoc.adicional?.descripcion || ""
      );

    } catch (error) {
      console.error("Error cargando documento completo:", error);
    }
  };

const tiempoTranscurrido = (fecha) => {
  const ahora = new Date();
  const fechaObj = new Date(fecha);

  const diffMs = ahora - fechaObj;

  const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const horas = Math.floor(diffMs / (1000 * 60 * 60));
  const minutos = Math.floor(diffMs / (1000 * 60));

  if (dias > 0) return `hace ${dias} día${dias > 1 ? "s" : ""}`;
  if (horas > 0) return `hace ${horas} hora${horas > 1 ? "s" : ""}`;
  if (minutos > 0) return `hace ${minutos} minuto${minutos > 1 ? "s" : ""}`;

  return "hace unos segundos";
};

const tiempoRestante = (fecha) => {
  const ahora = new Date();
  const fechaObj = new Date(fecha);

  const diffMs = fechaObj - ahora;

  const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const horas = Math.floor(diffMs / (1000 * 60 * 60));
  const minutos = Math.floor(diffMs / (1000 * 60));

  if (dias > 0) return `Tiempo restante: ${dias} dia${dias > 1 ? "s" : ""} `;
  if (horas > 0) return `Tiempo restante: ${horas} hora${horas > 1 ? "s" : ""} `;
  if (minutos > 0) return `Tiempo restante: ${minutos} minuto${minutos > 1 ? "s" : ""} `;

  return `Finalizó ${tiempoTranscurrido(fecha)}`;
};

const moverAPendientes = () => {
  if (!docSeleccionado) return;

  // evitar duplicados
  const existe = misPendientes.some(
    (item) => item.folio === docSeleccionado.folio
  );

  if (!existe) {
    setMisPendientes((prev) => [
      ...prev,
      {
        ...docSeleccionado,
        estado: "Pendiente",
        tarea: esValidador
          ? "Validar respuesta de la instrucción"
          : "Atender asunto",
      },
    ]);

    // eliminar de entrada
    setDocumentos((prev) =>
      prev.filter((doc) => doc.id !== docSeleccionado.id)
    );
  }

  // cerrar modal
  setDocSeleccionado(null);
};

 const moverASalidas = async () => {
  if (!docSeleccionadoPendientes) return;

  if (concluirTurno !== "si") {
    Swal.fire({
      icon: "warning",
      title: "Completa la acción",
      text: "Debes seleccionar 'Sí, concluir turno' antes de continuar a salidas.",
      confirmButtonColor: "#8B1538"
    });
    return;
  }

  const tareaId = docSeleccionadoPendientes.tareaId || docSeleccionadoPendientes._id;
  const tokenValue = token || localStorage.getItem("token");

  if (!tareaId || !tokenValue) {
    Swal.fire({
      icon: "error",
      title: "No se pudo concluir el turno",
      text: "No se encontró el identificador de tarea o el token de autenticación.",
      confirmButtonColor: "#8B1538"
    });
    return;
  }

  try {
    const response = await concluirTarea(tareaId, tokenValue, notasAtencion);
    if (!response.ok) {
      const message = await response.text();
      console.error("Error concluyendo tarea:", message);
      Swal.fire({
        icon: "error",
        title: "Error al concluir turno",
        text: message || "Ocurrió un error al finalizar el turno.",
        confirmButtonColor: "#8B1538"
      });
      return;
    }

    // evitar duplicados
    const existe = misSalidas.some(
      (item) => item.folio === docSeleccionadoPendientes.folio
    );

    if (!existe) {
      setMisSalidas((prev) => [
        {
          ...docSeleccionadoPendientes,
          estado: "Salida",
          concluido: true,
          fechaConclusion: new Date(),
          notas: notasAtencion,
        },
        ...prev,
      ]);

      setMisPendientes((prev) =>
        prev.filter(
          (doc) =>
            doc.folio !== docSeleccionadoPendientes.folio &&
            doc.docId !== docSeleccionadoPendientes.docId &&
            doc._id !== docSeleccionadoPendientes._id &&
            doc.id !== docSeleccionadoPendientes.id
        )
      );
    }

    Swal.fire({
      icon: "success",
      title: "Turno concluido",
      text: "El turno fue enviado a salidas con las notas registradas.",
      confirmButtonColor: "#8B1538"
    });

    cargarTareas();
    setDocSeleccionadoPendientes(null);
    setNotasAtencion("");
    setConcluirTurno("");
  } catch (error) {
    console.error("Error concluyendo tarea:", error);
    Swal.fire({
      icon: "error",
      title: "Error al concluir turno",
      text: "No se pudo completar la operación. Intenta nuevamente.",
      confirmButtonColor: "#8B1538"
    });
  }
};

  const [mostrarModal, setMostrarModal] = useState(false);
  const [tabActiva, setTabActiva] = useState("datosAsunto");
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [documentoEditar, setDocumentoEditar] = useState(null);

  const [soloTurnados, setSoloTurnados] = useState(false);
  const [turnosDocumento, setTurnosDocumento] = useState([]);
  const [busquedaVerTurnos, setBusquedaVerTurnos] = useState("");

  // Respuesta (Atender turno recibido)
  const [respuestaMensaje, setRespuestaMensaje] = useState("");
  const [respuestaArchivo, setRespuestaArchivo] = useState(null);
  const [enviandoRespuesta, setEnviandoRespuesta] = useState(false);
  const [notasAtencion, setNotasAtencion] = useState("");
  const [concluirTurno, setConcluirTurno] = useState("");

  const turnosVerFiltrados = (turnosDocumento.length > 0 ? turnosDocumento : []).filter((item) => {
    const text = [
      item?.instruccion?.descripcion || item?.instruccion || "",
      item?.remitente?.name || item?.remitente?.nombre || "",
      item?.dirigido?.nombre || item?.dirigido?.name || "",
      item?.areaDestino?.nombre || item?.areaDestino || "",
      item?.turna?.nombre || item?.turna?.name || "",
      item?.prioridad || "",
      item?.status || "",
      item?.compromiso ? formatDateForInput(item.compromiso) : "",
      item?.fechaTurnado ? formatDateForInput(item.fechaTurnado) : "",
    ]
      .join(" ")
      .toLowerCase();

    return text.includes(busquedaVerTurnos.toLowerCase());
  });

  const bitacoraRef = useRef(null);

  const handlePrint = () => {
    window.print();
  };

const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);
const bitacora = docSeleccionado?.bitacora || [];

const formatearFecha = (fecha) => {
  if (!fecha) return "-";

  return new Date(fecha).toLocaleDateString("es-MX", {
    timeZone: "America/Mexico_City",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatearHora = (fecha) => {
  if (!fecha) return "-";

  return new Date(fecha).toLocaleTimeString("es-MX", {
    timeZone: "America/Mexico_City",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

const descargarBitacora = async () => {
    const pdf = await generarBitacoraPDF();

    const enlace = document.createElement("a");
    enlace.href = pdf.url;
    enlace.download = pdf.nombre;
    enlace.click();

    URL.revokeObjectURL(pdf.url);
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

  // FOLIO DEL DOCUMENTO
  y += 7;

  doc.setFont("Montserrat", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.negro);

  doc.text(
    ` ${docSeleccionado?.folio || documentoSeleccionado?.folio || "-"}`,
    pageWidth / 2,
    y,
    { align: "center" }
  );

  y += 5;

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
      formatearFecha(mov.fecha),
      formatearHora(mov.fecha),
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

  // doc.save(
  //   `Bitacora_${documentoSeleccionado?.folio || "SAGASE"}.pdf`
  // );

    const blob = doc.output("blob");

    return {
      blob,
      url: URL.createObjectURL(blob),
      nombre: `Bitacora_${docSeleccionado?.folio || "SAGASE"}.pdf`,
    };
  };

const [pdfBitacora, setPdfBitacora] = useState(null);
const [pdfGenerado, setPdfGenerado] = useState(false);

useEffect(() => {
    if (tabActiva !== "bitacora") return;

    if (pdfGenerado) return;

    const cargar = async () => {
        const pdf = await generarBitacoraPDF();
        setPdfBitacora(pdf.url);
        setPdfGenerado(true);
    };

    cargar();
}, [tabActiva]);
    const [formEditar, setFormEditar] = useState({
      ejercicio: "",
      noDocumento: "",
      fechaDocumento: "",
      fechaAcuse: "",
      fechaRegistro: "",
      tipoRemitente: "",
      remitenteInterno: "",
      remitenteExterno: "",
      tipoDocumento: "",
      temaPrincipal: "",
      temaSecundario: "",
      sintesis: "",
      observaciones: "",
      documentoInterno: false,
      faltaInformacion: false,
      otroFuncionario: false,
      altaTipoDocumento: false,
      relacionadoCon: false,
      materialAdicional: false,
    });
  
    useEffect(() => {
    setPdfGenerado(false);
    setPdfBitacora(null);
}, [documentoSeleccionado]);

  const [errores, setErrores] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormEditar((prev) => ({ ...prev, [name]: value }));
    setErrores((prev) => ({ ...prev, [name]: !value.trim() }));
  };

  const Toggle = ({ checked, onChange }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${checked ? "bg-[#79142A]" : "bg-gray-300"}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-5" : "translate-x-1"}`} />
    </button>
  );

  const handleToggleFaltaInformacion = (value) => {
    setFormEditar((prev) => ({ ...prev, faltaInformacion: value }));
    if (value) {
      const anioActual = new Date().getFullYear();
      const numeroAleatorio = Math.floor(Math.random() * 900) + 100;
      setFolioGenerado(`Folio ${numeroAleatorio}-${anioActual}`);
    } else {
      setFolioGenerado("");
    }
  };

   // refs + dropdown states usados en UI
    const refTipoDoc = useRef(null);
    const refRemitenteExt = useRef(null);
    const refMaterial = useRef(null);
    const refAsunto = useRef(null);
    const refTemaPrincipal = useRef(null);
    const refTemaSecundario = useRef(null);

     const [busquedaTipoDoc, setBusquedaTipoDoc] = useState("");
      const [mostrarOpcionesTipoDoc, setMostrarOpcionesTipoDoc] = useState(false);

        const [folioGenerado, setFolioGenerado] = useState("");

        const [documentoAnexos, setDocumentoAnexos] = useState([]);
        const [relacionadosDocumento, setRelacionadosDocumento] = useState([]);
        const [bitacoraDocumento, setBitacoraDocumento] = useState([]);
        const [tiposDocumento, setTiposDocumento] = useState([]);
        const [temasPrincipales, setTemasPrincipales] = useState([]);
        const [materialesAdicionales, setMaterialesAdicionales] = useState([]);
        const [areas, setAreas] = useState([]);
        const [instrucciones, setInstrucciones] = useState([]);
        const [usuarios, setUsuarios] = useState([]);
        const [remitentes, setRemitentes] = useState([]);
        const [copiasDocumento, setCopiasDocumento] = useState([]);
          const [mostrarModalTurno, setMostrarModalTurno] = useState(false);
        const [loading, setLoading] = useState(false);
        const [token, setToken] = useState(localStorage.getItem("token") || "");

      const tiposFiltrados = tiposDocumento.filter((tipo) =>
        tipo.label.toLowerCase().includes(busquedaTipoDoc.toLowerCase())
      );
    
        const [asuntoSeleccionado, setAsuntoSeleccionado] = useState(null);
      
        const [busquedaAsunto, setBusquedaAsunto] = useState("");
        const [mostrarOpcionesAsunto, setMostrarOpcionesAsunto] = useState(false);
      
        const [mostrarModalRelacionado, setMostrarModalRelacionado] = useState(false);
      
        const [documentosSeleccionados, setDocumentosSeleccionados] = useState([]);
        const [busquedaTemaPrincipal, setBusquedaTemaPrincipal] = useState("");
        const [mostrarOpcionesTemaPrincipal, setMostrarOpcionesTemaPrincipal] = useState(false);
        const [busquedaTemaSecundario, setBusquedaTemaSecundario] = useState("");
        const [mostrarOpcionesTemaSecundario, setMostrarOpcionesTemaSecundario] = useState(false);
      
        
        const temasFiltradosPrincipal = temasPrincipales.filter((t) =>
          t.label.toLowerCase().includes(busquedaTemaPrincipal.toLowerCase())
        );
        const temasFiltradosSecundario = temasPrincipales.filter((t) =>
          t.label.toLowerCase().includes(busquedaTemaSecundario.toLowerCase())
        );

      useEffect(() => {
        if (!docSeleccionadoPendientes) {
          setDocumentoAnexos([]);
          setRelacionadosDocumento([]);
          setTurnosDocumento([]);
          setCopiasDocumento([]);
          setBitacoraDocumento([]);
          setMaterialesAdicionales([]);
          return;
        }

        setDocumentoAnexos(docSeleccionadoPendientes.anexos || []);
        setTurnosDocumento(docSeleccionadoPendientes.turnados || []);
        setCopiasDocumento(docSeleccionadoPendientes.copias || []);
        setBitacoraDocumento(docSeleccionadoPendientes.bitacora || []);
        setMaterialesAdicionales(docSeleccionadoPendientes.adicional?.adicionales || []);
        setRelacionadosDocumento(
          (docSeleccionadoPendientes.relacionados || []).map(normalizeRelacionadoItem)
        );
      }, [docSeleccionadoPendientes]);
      
        const [busquedaMaterial, setBusquedaMaterial] = useState("");
        const [mostrarOpcionesMaterial, setMostrarOpcionesMaterial] = useState(false);
        const materialesFiltrados = materialesAdicionales.filter((m) =>
          m.tipo.toLowerCase().includes(busquedaMaterial.toLowerCase()) ||
          m.descripcion.toLowerCase().includes(busquedaMaterial.toLowerCase())
        );
      
        useEffect(() => {
          const handleClickOutside = (event) => {
            if (refTipoDoc.current && !refTipoDoc.current.contains(event.target)) {
              setMostrarOpcionesTipoDoc(false);
            }
            if (refMaterial.current && !refMaterial.current.contains(event.target)) {
              setMostrarOpcionesMaterial(false);
            }
            if (refAsunto.current && !refAsunto.current.contains(event.target)) {
              setMostrarOpcionesAsunto(false);
            }
            if (refTemaPrincipal.current && !refTemaPrincipal.current.contains(event.target)) {
              setMostrarOpcionesTemaPrincipal(false);
            }
            if (refTemaSecundario.current && !refTemaSecundario.current.contains(event.target)) {
              setMostrarOpcionesTemaSecundario(false);
            }
          };
          document.addEventListener("mousedown", handleClickOutside);
          return () => document.removeEventListener("mousedown", handleClickOutside);
        }, []);
      
         const validarFormulario = () => {
            const nuevosErrores = {};
            if (!formEditar.tipoDocumento) nuevosErrores.tipoDocumento = true;
            if (!formEditar.temaPrincipal) nuevosErrores.temaPrincipal = true;
            if (!formEditar.sintesis) nuevosErrores.sintesis = true;
            setErrores(nuevosErrores);
            return Object.keys(nuevosErrores).length === 0;
          };
        
          const handleSave = () => {
            if (!validarFormulario()) {
              Swal.fire({
                toast: true,
                position: "top-end",
                icon: "error",
                title: "Faltan campos obligatorios",
                showConfirmButton: false,
                timer: 2500,
              });
              return;
            }
        
            Swal.fire({
              title: "Confirmación",
              text: "¿Seguro que desea continuar?, su información está correcta?",
              icon: "question",
              showCancelButton: true,
              confirmButtonText: "OK",
              cancelButtonText: "Cancelar",
              confirmButtonColor: "#8B1538",
              cancelButtonColor: "#6B7280",
            }).then(async (result) => {
              if (result.isConfirmed) {
                try {
                  const currentDocId = documentoEditar?.docId || documentoEditar?.numeroDocumento || documentoEditar?._id;
                  if (!currentDocId) {
                    throw new Error("Documento no válido para actualizar");
                  }
        
                  const payload = {
                    docId: formEditar.noDocumento,
                    ejercicio: formEditar.ejercicio,
                    fechaDoc: formEditar.fechaDocumento,
                    acuse: formEditar.fechaAcuse,
                    registro: formEditar.fechaRegistro,
                    interno: formEditar.documentoInterno,
                    faltaInformacion: formEditar.faltaInformacion,
                    remitente:
                      formEditar.tipoRemitente === "interno"
                        ? formEditar.remitenteInterno
                        : formEditar.remitenteExterno,
                    tipo: formEditar.tipoDocumento,
                    tema: formEditar.temaPrincipal,
                    secundario: formEditar.temaSecundario,
                    adicional: formEditar.materialAdicional,
                    observaciones: formEditar.observaciones,
                    asunto: formEditar.sintesis,
                  };
        
                  const response = await updateDocument(currentDocId, payload, token);
                  if (response.ok) {
                    const updatedDocumento = await response.json();
                    setDocumentos((prev) =>
                      prev.map((doc) =>
                        doc.docId === currentDocId || doc.numeroDocumento === currentDocId
                          ? { ...doc, ...updatedDocumento, remitente: updatedDocumento.remitente || doc.remitente }
                          : doc
                      )
                    );
                    setModalEditarAbierto(false);
                    Swal.fire({
                      toast: true,
                      position: "top-end",
                      icon: "success",
                      title: "Documento actualizado correctamente",
                      showConfirmButton: false,
                      timer: 2000,
                    });
                  } else {
                    const errorResponse = await response.json().catch(() => null);
                    Swal.fire({
                      icon: "error",
                      title: "Error",
                      text: errorResponse?.error || "No se pudo actualizar el documento",
                    });
                  }
                } catch (error) {
                  console.error(error);
                  Swal.fire({
                    icon: "error",
                    title: "Error de conexión",
                    text: "No se pudo actualizar el documento",
                  });
                }
              }
            });
          };
        
            const [busquedaSubirAnexo, setBusquedaSubirAnexo] = useState("");
            const [mostrarModalSubirAnexo, setMostrarModalSubirAnexo] = useState(false);
            const [archivo, setArchivo] = useState(null);
            const [mostrarVisor, setMostrarVisor] = useState(false);
            const [archivoVista, setArchivoVista] = useState(null);
          
            const documentoAnexosFiltrados = documentoAnexos.filter((anexo) =>
              [anexo.mensaje, anexo.nombre, anexo.ruta]
                .join(" ")
                .toLowerCase()
                .includes(busquedaSubirAnexo.toLowerCase())
          
          
            );
          
            const relacionadosFiltrados = relacionadosDocumento.filter((doc) =>
              [doc.folio, doc.docId, doc.remitente, doc.asunto]
                .join(" ")
                .toLowerCase()
                .includes(busquedaVerTurnos.toLowerCase())
            );
            const [dragActivo, setDragActivo] = useState(false);
          
            const inputRef = useRef(null);
          
            const eliminarArchivo = () => {
              setArchivo(null);
              if (inputRef.current) {
                inputRef.current.value = ""; // reset input file
              }
            };
          
            const [mensaje, setMensaje] = useState("");
            const [nombreDoc, setNombreDoc] = useState("");
            const [erroresAnexos, setErroresAnexos] = useState({});
          
            const validarAgregarAnexo = () => {
              let nuevosErrores = {};
          
              if (!mensaje.trim()) {
                nuevosErrores.mensaje = true;
              }
          
              if (!archivo) {
                nuevosErrores.archivo = true;
              }
          
              if (!nombreDoc.trim()) {
                nuevosErrores.nombreDoc = true;
              }
          
              setErroresAnexos(nuevosErrores);
          
              return Object.keys(nuevosErrores).length === 0;
            };
          
            const normalizeRelacionadoItem = (rel) => {
              if (!rel) return null;
              return {
                relationId: rel._id || rel.relationId || null,
                value: rel.item?._id || rel._id || rel.value || rel,
                folio: rel.item?.folio || rel.folio || rel.label || "",
                docId: rel.item?.docId || rel.docId || "",
                remitente: rel.item?.remitente ? (rel.item.remitente.name || rel.item.remitente) : (rel.remitente ? (rel.remitente.name || rel.remitente) : ""),
                asunto: rel.item?.asunto || rel.asunto || rel.observaciones || "",
              };
            };

            const openAnexo = async (anexo) => {
              try {
                let url = anexo?.ruta || anexo;
                if (typeof url === 'string' && !/^https?:\/\//i.test(url)) {
                  url = import.meta.env.VITE_ARCHIVOS_PATH.replace(/\/$/, '') + '/' + String(url).replace(/^\/+/, '');
                }

                // intentar fetch para obtener Blob y evitar problemas de CORS/headers; si falla, usar URL directa
                try {
                  const resp = await fetch(url);
                  if (resp.ok) {
                    const blob = await resp.blob();
                    setArchivoVista(blob);
                    setMostrarVisor(true);
                    return;
                  }
                } catch (fetchErr) {
                  console.warn('No se pudo obtener anexo por fetch, usando URL directa', fetchErr);
                }
                
                // Si fetch falla, usar URL directa
                setArchivoVista(url);
                setMostrarVisor(true);
              } catch (err) {
                console.error('openAnexo error', err);
                setArchivoVista(null);
                setMostrarVisor(false);
              }
            };

            const loadCatalogos = async () => {
              try {
                setLoading(true);
                const remsRes = await getRemitentes();
                if (remsRes.ok) {
                  const rems = await remsRes.json();
                  setRemitentes((rems || []).filter(r => r.activo).map((r) => ({
                    value: r._id,
                    label: `${r.name || r.nombre} - ${r.cargo || ''} - ${r.area || r.dependencia || ''}`.trim(),
                    tipo: (r.tipo || '').toString().trim().toLowerCase(),
                    name: r.name || r.nombre || '',
                  })));
                }

                const areasRes = await getAreas();
                if (areasRes.ok) {
                  const areasData = await areasRes.json();
                  setAreas((areasData || []).map((a) => ({ value: a._id, label: a.nombre || a.descripcion || 'Área desconocida' })));
                }

                const instruccionRes = await getInstrucciones();
                if (instruccionRes.ok) {
                  const insts = await instruccionRes.json();
                  setInstrucciones((insts || []).map((i) => ({ value: i._id, label: i.descripcion || i.nombre || 'Instrucción' })));
                }

                if (token) {
                  const usersRes = await getUsers(token);
                  if (usersRes.ok) {
                    const users = await usersRes.json();
                    setUsuarios((users || []).map((u) => ({ value: u._id, label: `${u.name || u.nombre || ''}`.trim(), areaId: u.areaId })));
                  }
                }
              } catch (error) {
                console.error('Error cargando catálogos:', error);
              } finally {
                setLoading(false);
              }
            };
          
            const handleUploadAnexo = async () => {
              if (!validarAgregarAnexo()) return;
              const currentDocId = documentoEditar?.docId || documentoEditar?._id;
              if (!currentDocId) {
                Swal.fire({
                  icon: "error",
                  title: "Documento no seleccionado",
                  text: "Abre un documento antes de subir anexos.",
                });
                return;
              }
          
              try {
                const formData = new FormData();
                const user = JSON.parse(localStorage.getItem("user"));
                formData.append('registrador', user._id || "Desconocido");
                formData.append('archivo', archivo);
                formData.append('mensaje', mensaje);
                formData.append('nombre', nombreDoc);
                formData.append('docId', currentDocId);

                console.log("Subiendo anexo con datos:", currentDocId);
                const response = await uploadAnexo(formData, token);
                if (!response.ok) throw new Error('Error subiendo el anexo');
          
                const updatedDocumento = await response.json();
                setDocumentoAnexos(updatedDocumento.anexos || []);
                setDocumentoEditar(updatedDocumento);
                setDocumentoSeleccionado(updatedDocumento);
                setMensaje("");
                setNombreDoc("");
                setArchivo(null);
                setErroresAnexos({});
                setMostrarModalSubirAnexo(false);
          
                Swal.fire({
                  toast: true,
                  position: 'top-end',
                  icon: 'success',
                  title: 'Anexo subido correctamente',
                  showConfirmButton: false,
                  timer: 2000,
                });
              } catch (error) {
                console.error(error);
                Swal.fire({
                  icon: 'error',
                  title: 'Error al subir el anexo',
                  text: 'No se pudo guardar el archivo en el servidor.',
                });
              }
            };
          
            const handleRemoveAnexo = async (anexoId) => {
              const currentDocId = documentoEditar?.docId || documentoEditar?._id;
              if (!currentDocId) return;
          
              try {
                const response = await removeAnexo(currentDocId, { anexoId }, token);
                if (!response.ok) throw new Error('Error eliminando anexo');
          
                const updatedDocumento = await response.json();
                setDocumentoAnexos(updatedDocumento.anexos || []);
                setDocumentoEditar(updatedDocumento);
                setDocumentoSeleccionado(updatedDocumento);
              } catch (error) {
                console.error(error);
                Swal.fire({
                  icon: 'error',
                  title: 'Error al eliminar el anexo',
                  text: 'No se pudo eliminar el archivo.',
                });
              }
            };
          
            const handleRemoveRelacionado = async (relatedId) => {
              const currentDocId = documentoEditar?.docId || documentoEditar?._id;
              if (!currentDocId) return;
          
              try {
                const response = await removeRelacionado(currentDocId, { relacionadoId: relatedId }, token);
                if (!response.ok) throw new Error('Error eliminando documento relacionado');
          
                const updatedDocumento = await response.json();
                setRelacionadosDocumento(
                  (updatedDocumento.relacionados || [])
                    .map(normalizeRelacionadoItem)
                    .filter(Boolean)
                );
                setDocumentosSeleccionados(
                  (updatedDocumento.relacionados || []).map((rel) =>
                    typeof rel === 'object' ? (rel._id || rel.value) : rel
                  )
                );
                setDocumentoEditar(updatedDocumento);
                setDocumentoSeleccionado(updatedDocumento);
              } catch (error) {
                console.error(error);
                Swal.fire({
                  icon: 'error',
                  title: 'Error al eliminar documento relacionado',
                  text: 'No se pudo remover la relación.',
                });
              }
            };
              
            const [mostrarModalAnexos, setMostrarModalAnexos] = useState(false);
            const [anexosDisponibles, setAnexosDisponibles] = useState([
              {
                id: 1,
                folio: "ANX-001",
                nombre: "Contrato.pdf",
                archivo: null,
              },
              {
                id: 2,
                folio: "ANX-002",
                nombre: "Identificación.jpg",
                archivo: null,
              },
            ]);
          
            const [anexosSeleccionados, setAnexosSeleccionados] = useState([]);
          
          
            const [materiales, setMateriales] = useState([]);

            const materialesAdicionalesFiltrados = materialesAdicionales.filter((m) =>
              m.tipo?.toLowerCase().includes(busquedaMaterial.toLowerCase()) ||
              m.descripcion?.toLowerCase().includes(busquedaMaterial.toLowerCase()) ||
              m.registrador?.nombre?.toLowerCase().includes(busquedaMaterial.toLowerCase())
            );
          
            const [mostrarModalMaterial, setMostrarModalMaterial] = useState(false);
          
            const [nuevoMaterial, setNuevoMaterial] = useState({
              tipo: "",
              descripcion: "",
            });
          
  const pageTransition = {
    initial: { opacity: 0.96, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0.98, y: -6 },
    transition: { duration: 0.16, ease: "easeInOut" },
  };

    // const pageTransition = {
    //   initial: { opacity: 0},
    //   animate: { opacity: 1},
    //   exit: { opacity: 0},
    //   transition: { duration: 0.12, ease: "easeOut" },
    // };

  const renderView = () => {
    switch (currentView) {
      case "tablero-control":
        return <TableroControl />;

      case "registra-documento":
        return <RegistrarDocumento />;

      case "buscador-documento":
        return <BuscadorDocumentos />;

      case "reporte-asuntos":
        return <ReporteAsuntos />;

      case "reporte-acuerdos":
        return <ReporteAcuerdos />;

      case "generacion-oficios":
        return <GeneracionOficios />;

      case "control-oficios":
        return <ControlOficios />;

      case "salida-correspondencia":
        return <SalidaCorrespondencia />;

      case "consultaS-correspondencia":
        return <ConsultaSalidaCorrespondencia />;

      case "reporteS-correspondencia":
        return <ReporteSalidaCorrespondencia />;

      case "visualiza-documento":
        return <VisualizaDocumento />;

      default:
        return (
          <main className="flex-1 flex flex-col bg-white overflow-hidden">
            {/* Header secciones */}
            <div className="border-b border-gray-200 flex items-stretch">
              <div className="flex-1 px-4 py-3 flex items-center gap-2 border-r border-gray-200">
                <Inbox size={16} className="text-[#8B1538]" />
                <span className="text-xs text-gray-700">Entrada</span>
              </div>

              <div className="flex-1 px-4 py-3 flex items-center justify-between border-r border-gray-200">
                <div className="flex items-center gap-2">
                  <ListTodo size={16} className="text-[#8B1538]" />
                  <span className="text-xs text-gray-700">
                    Mis Pendientes
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">
                    Sólo no turnados
                  </span>
                  <Switch
                    checked={soloTurnados}
                    onCheckedChange={setSoloTurnados}
                  />
                </div>
              </div>

              <div className="flex-1 px-4 py-3 flex items-center gap-2">
                <Send size={16} className="text-[#8B1538]" />
                <span className="text-xs text-gray-700">Salida</span>
              </div>
            </div>

            {/* Contenido columnas */}
            <div className="flex-1 flex overflow-hidden">

              <div className="flex-1 overflow-y-auto border-r border-gray-200">
                <div className="flex items-start justify-center pt-8 px-4 min-h-full">
                    <div className="w-full flex flex-col gap-3">
                  {entradas.map((doc) => (
                    <div
                      key={doc.id}
                      className="relative bg-white border rounded-lg shadow p-3 text-xs hover:shadow-md transition"
                    >
                      {/* ICONOS SUPERIORES */}
                      <div className="absolute top-2 right-2 flex gap-2">

                        {/* VISUALIZAR */}
                        <button
                          onClick={async () => { 
                            try { 
                              const token = localStorage.getItem("token"); 
                              const docId = doc?.documento?.docId || doc?.documento?._id || doc?.documento?.folio; 
                              
                              if (!docId) { 
                                setDocSeleccionado(doc); 
                                setMostrarModal(true); 
                                
                                return; 
                              } 
                              const response = await getDocumentById(docId, token); 
                              if (!response.ok) { 
                                throw new Error("No se pudo obtener el documento"); 
                              } 
                              
                              const data = await response.json(); 
                              const fullDoc = data.documento || data; setDocSeleccionado(fullDoc); 
                              setDocumentoAnexos(fullDoc.anexos || []); 
                              setTurnosDocumento(fullDoc.turnados || []); 
                              setCopiasDocumento(fullDoc.copias || []); 
                              setBitacoraDocumento(fullDoc.bitacora || []); 
                              setRelacionadosDocumento( (fullDoc.relacionados || []) .map(normalizeRelacionadoItem) .filter(Boolean) ); 
                              setMostrarModal(true); } catch (error) { 
                                console.error("Error cargando documento:", error); 
                                Swal.fire({ icon: "error", title: "Error", text: "No se pudo cargar el documento completo.", confirmButtonColor: "#8B1538", }); } 
                              }
                            }
                          className="p-1 rounded hover:bg-gray-100 text-[#8B1538]"
                          title="Visualizar documento"
                        >
                          <Eye size={16} />
                        </button>

                      {/* TURNAR SOLO SI ES VALIDADOR */}
                      {(esValidador || esEjecutor) && (
                        <button
                          onClick={() => handleTomarAsunto(doc)}
                          className="p-1 rounded hover:bg-green-100 text-green-600"
                          title="Tomar asunto"
                        >
                          <ThumbsUp size={16} />
                        </button>
                      )}
                      </div>

                      {/* 🔹 CONTENIDO */}
                      <p className="font-semibold text-gray-800 pr-10">
                        { doc.documento.docId || doc.documento.folio || "Documento sin folio"}
                      </p>
                      <p className="text-gray-500">{doc.descripcion}</p>

                      <div className="mt-2 space-y-1">
                        <p>
                          <span className="font-medium">Síntesis Asunto:</span> { doc.documento.asunto || "Sin síntesis disponible"}
                        </p>
                        <p>
                          <span className="font-medium">Folio:</span> {doc.documento.folio}
                        </p>
                        <p>
                          <span className="font-medium">Dirigido a:</span> {doc.documento.turnados?.at(-1).dirigido?.nombre || "Sin información de turno"}
                        </p>
                        <p className="text-gray-400">{doc.documento.fechaTurnado}</p>
                      </div>
                    </div>
                  ))}
                </div>

                </div>

              </div>

              <div className="flex-1 overflow-y-auto border-r border-gray-200">
                <div className="flex items-start justify-center pt-8 px-4 min-h-full">
                  <div className="w-full flex flex-col gap-4">

                  {pendientes.map((doc) => (
                    <motion.div
                      key={doc._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border rounded-xl shadow-sm p-4 text-xs hover:shadow-md transition"
                    >
                      {/* HEADER */}
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {doc.documento.noDocumento || doc.documento.docId || doc.documento.folio || "Documento sin folio"}
                          </p>
                              <p className="text-gray-500 text-[11px]">
                                {safeText(doc.documento.tipoOtro || doc.documento.tipo?.tipo, "No disponible")} / {doc.tarea}
                              </p>
                        </div>
                        { doc.documento.turnados && doc.documento.turnados.length > 0 && (
                          <div className="text-right" >
                            {(() => {
                              const prioridad = (doc.documento.turnados?.at(-1)?.prioridad || '').toLowerCase();
                              let colorClass = 'bg-blue-100 text-blue-800 border-blue-300';
                              
                              if (prioridad.includes('extra-urgente')) {
                                colorClass = 'bg-red-100 text-red-800 border-red-300';
                              } else if (prioridad.includes('urgente')) {
                                colorClass = 'bg-orange-100 text-orange-800 border-orange-300';
                              } else if (prioridad.includes('normal')) {
                                colorClass = 'bg-blue-100 text-green-800 border-green-300';
                              }
                              
                              return (
                                <span className={`text-[11px] px-3 py-1 rounded border font-medium ${colorClass}`}>
                                  {doc.documento.turnados?.at(-1)?.prioridad}
                                </span>
                              );
                            })()}
                          </div>
                        )}
                        {/* ICONOS LATERALES */}
                        <div className="flex flex-col gap-2">
                          {/* Ver documento */}
                          {/* <button
                            onClick={() => {
                              setDocSeleccionadoPendientes(doc);
                              setMostrarModal(true);
                            }}
                            className="w-6 h-6 bg-blue-500 text-white flex items-center justify-center rounded-full hover:scale-110 transition"
                            title="Visualizar documento"
                          >
                            <Eye size={12} />
                          </button> */}

                          {/* No mostrar botón "Eye" si el usuario es validador */}
                          {!esValidador && (
                            <button
                              onClick={() => seleccionarDocPendiente(doc)}
                              className="w-6 h-6 bg-blue-500 text-white flex items-center justify-center rounded-full hover:scale-110 transition"
                              title="Visualizar documento"
                            >
                              <Eye size={12} />
                            </button>
                          )}
                          {/* Concluir turno */}
                          {/* <button
                            onClick={() => alert("Turno concluido correctamente")}
                            className="w-6 h-6 bg-green-500 text-white flex items-center justify-center rounded-full hover:scale-110 transition"
                            title="Concluir turno"
                          >
                            <Check size={12} />
                          </button> */}
                        </div>

                      </div>

                      {/* TABLA INFO */}
                      <div className="mt-3 border rounded overflow-hidden">
                        <div className="grid grid-cols-4 bg-gray-100 text-[10px] font-semibold text-gray-600">
                          <div className="p-1">Síntesis Asunto</div>
                          <div className="p-1">Folio</div>
                          <div className="p-1">Dirigido a</div>
                          <div className="p-1">Remitente</div>
                        </div>

                        <div className="grid grid-cols-4 text-[10px] text-gray-700">
                          <div className="p-1">{doc.documento.asunto || "Sin síntesis disponible"}</div>
                          <div className="p-1">{doc.documento.folio}</div>
                          {doc.documento.turnados && doc.documento.turnados.length > 0 ? (
                            <><div className="p-1">{doc.documento.turnados?.at(-1).dirigido?.nombre || "Sin información de turno"}</div><div className="p-1">{doc.documento.turnados.at(-1).remitente?.name}</div></>
                          ) : (
                            <><div className="p-1 text-gray-400">Sin información de turno</div><div className="p-1 text-gray-400">Sin información de turno</div></>
                          )}
                        </div>
                      </div>

                      {/* FOOTER */}
                      <div className="flex justify-between items-center mt-3 text-[10px] text-gray-500">
                        {doc.documento.turnados?.at(-1)?.prioridad==="Urgente" ? (
                          <span>{tiempoRestante(doc.documento.turnados?.at(-1).compromiso)}</span>
                        ) : (
                          <span>Creado {tiempoTranscurrido(doc.documento.registro)}</span>
                        )}

                        <div className="flex gap-2 mt-2">
                          {/* Atiende asunto */}
                          {!esValidador && (
                            <button
                              type="button"
                              title="Atender asunto"
                              onClick={() => seleccionarDocPendiente(doc)}
                              className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition"
                            >
                              <ClipboardCheck size={14} />
                              Atiende
                            </button>
                          )}

                          {/* VALIDAR RESPUESTA */}
                          {esValidador && (
                            <button
                              onClick={() => seleccionarDocPendiente(doc)}
                              className="flex items-center gap-1 text-xs bg-green-50 text-green-600 px-2 py-1 rounded hover:bg-green-100 transition"
                            >
                              <Check size={14} />
                              Validar respuesta
                            </button>
                          )}

                          {/* Ubica asunto
                          <button
                            className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200 transition"
                            title="Ubicar asunto"
                          >
                            <MapPin size={14} />
                            Ubica
                          </button> */}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="flex items-start justify-center pt-8 px-4 min-h-full">

                  {salidas.length === 0 ? (

                    <div className="text-xs text-gray-400">
                      No hay instancias en esta bandeja.
                    </div>

                  ) : (

                    <div className="w-full flex flex-col gap-4">

                      {salidas.map((doc) => (

                        <motion.div
                          key={doc.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white border rounded-xl shadow-sm p-4 text-xs hover:shadow-md transition"
                        >
                          {/* HEADER */}
                          <div className="flex justify-between items-start">
                            
                            <div>
                              <p className="font-semibold text-gray-800">
                                {doc.documento?.docId || "Sin título disponible"}
                              </p>

                              <p className="text-gray-500 text-[11px]">
                                {safeText(doc.documento?.tipoOtro || doc.documento?.tipo?.tipo, "No disponible")} / Documento atendido
                              </p>
                            </div>

                            {/* VISUALIZAR DOCUMENTO */}
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={async () => {
                                  try {
                                    const token = localStorage.getItem("token");
                                    const docId = doc?.documento?.docId || doc?.documento?._id || doc?.documento?.folio;
                                    if (!docId) return;

                                    const response = await getDocumentById(docId, token);
                                    if (!response.ok) return;

                                    const data = await response.json();
                                    const fullDoc = data.documento || data;
                                    setDocSeleccionado(fullDoc);
                                    setDocumentoAnexos(fullDoc.anexos || []);
                                    setTurnosDocumento(fullDoc.turnados || []);
                                    setCopiasDocumento(fullDoc.copias || []);
                                    setBitacoraDocumento(fullDoc.bitacora || []);
                                    setRelacionadosDocumento(
                                      (fullDoc.relacionados || [])
                                        .map(normalizeRelacionadoItem)
                                        .filter(Boolean)
                                    );
                                    setMaterialesAdicionales(fullDoc.adicional?.adicionales || []);
                                    setMostrarModal(true);
                                  } catch (error) {
                                    console.error("Error cargando documento:", error);
                                  }
                                }}
                                className="p-1 rounded hover:bg-gray-100 text-[#8B1538]"
                                title="Visualizar documento"
                              >
                                <Eye size={16} />
                              </button>
                            </div>

                          </div>

                          {/* TABLA INFO */}
                          <div className="mt-3 border rounded overflow-hidden">

                            <div className="grid grid-cols-4 bg-gray-100 text-[10px] font-semibold text-gray-600">
                              <div className="p-1">Síntesis Asunto</div>
                              <div className="p-1">Folio</div>
                              <div className="p-1">Dirigido a</div>
                              <div className="p-1">Remitente</div>
                            </div>

                            <div className="grid grid-cols-4 text-[10px] text-gray-700">
                              <div className="p-1">{doc.documento?.asunto}</div>
                              <div className="p-1">{doc.documento?.folio}</div>
                              <div className="p-1">{doc.documento?.turnados?.at(-1)?.dirigido ? doc.documento.turnados?.at(-1).dirigido.nombre : "No disponible"}</div>
                              <div className="p-1">{doc.documento?.turnados?.at(-1)?.remitente?.name}</div>
                            </div>

                          </div>

                          {/* FOOTER */}
                          <div className="flex justify-between items-center mt-3 text-[10px] text-gray-500">

                            <span>Concluido {tiempoTranscurrido(doc.fecha)}</span>

                          </div>

                        </motion.div>

                      ))}

                    </div>

                  )}

                </div>
              </div>
            </div>
          </main>
        );
    }

  };

  const [form, setForm] = useState({
      instruccion: "",
      remitente: "",
      areaDestino: "",
      dirigido: "",
      prioridad: "",
      fecha: "",
      turna: "",
      notas: "",
      autorizar: false,
    });
    const [erroresTurno, setErroresTurno] = useState({});
  
    const validarFormularioAltaInstruccion = () => {
      let nuevosErrores = {};
  
      if (!form.instruccion) nuevosErrores.instruccion = true;
      if (!form.areaDestino) nuevosErrores.areaDestino = true;
      if (!form.prioridad) nuevosErrores.prioridad = true;
      if (!form.fecha && form.prioridad === "Urgente") nuevosErrores.fecha = true;
  
      setErroresTurno(nuevosErrores);
  
      return Object.keys(nuevosErrores).length === 0;
    };
  
    const handleGuardarAltaInstruccion = async () => {
      if (!validarFormularioAltaInstruccion()) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "error",
          title: "Faltan campos obligatorios",
          showConfirmButton: false,
          timer: 2500,
        });
        return;
      }
  
      const currentDocId = documentoEditar?.docId || documentoEditar?._id;
      if (!currentDocId) {
        Swal.fire({
          icon: "error",
          title: "Documento no seleccionado",
          text: "Abre un documento antes de guardar el turno.",
        });
        return;
      }
  
      try {
        const turnadoData = {
          instruccion: form.instruccion,
          remitente: documentoEditar.remitente,
          areaDestino: form.areaDestino,
          dirigido: form.dirigido,
          prioridad: form.prioridad,
          compromiso: form.fecha,
          turna: user?.id || user?._id || "Desconocido",
          notas: form.notas,
        };
  
        const response = await addTurnado(currentDocId, turnadoData, token);
        if (!response.ok) throw new Error("Error agregando el turno");
  
        const updatedDocumento = await response.json();
        setDocumentoEditar(updatedDocumento);
        setDocumentoSeleccionado(updatedDocumento);
        setDocSeleccionadoPendientes({ ...updatedDocumento, tareaId: docSeleccionadoPendientes?.tareaId });
        setTurnosDocumento(updatedDocumento.turnados || []);
        setMostrarModalTurno(false);
        
        // Actualizar estado de la tarea a salida
        if (docSeleccionadoPendientes?.tareaId) {
          try {
            const tareaId = docSeleccionadoPendientes.tareaId;
            // Mover de pendientes a salidas
            setPendientes((prev) => prev.filter((t) => t._id !== tareaId));
            setSalidas((prev) => [...prev, { ...docSeleccionadoPendientes, documento: updatedDocumento }]);
          } catch (taskError) {
            console.warn("Advertencia: No se pudo concluir la tarea automáticamente", taskError);
          }
        }
        
        setForm({
          instruccion: "",
          remitente: "",
          areaDestino: "",
          dirigido: "",
          prioridad: "",
          fecha: "",
          turna: "",
          notas: "",
          autorizar: false,
        });
        setErroresTurno({});
  
        Swal.fire({
          icon: "success",
          title: "Turno guardado",
          text: "El turno se agregó correctamente y la tarea se movió a salidas.",
          showConfirmButton: false,
          timer: 2000,
        });

        cargarTareas();
      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: "error",
          title: "Error al guardar el turno",
          text: "No se pudo guardar el turno.",
        });
      }
    };

    const [mostrarModalMensaje, setMostrarModalMensaje] = useState(false);
    const [modalMensajeTexto, setModalMensajeTexto] = useState("");
    const [modalMensajeArchivo, setModalMensajeArchivo] = useState(null);
    const [modalMensajeNombre, setModalMensajeNombre] = useState("");
    const [modalMensajeGuardando, setModalMensajeGuardando] = useState(false);

    const abrirModalMensaje = () => {
      setModalMensajeTexto("");
      setModalMensajeArchivo(null);
      setModalMensajeNombre("");
      setMostrarModalMensaje(true);
    };

    const handleGuardarMensajeModal = async () => {
      const documentoActivo = docSeleccionadoPendientes || docSeleccionado;
      const docId = getDocumentoIdForRequest(documentoActivo);
      if (!docId) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se identificó el documento.' });
        return;
      }
      if (!modalMensajeTexto && !modalMensajeArchivo) {
        Swal.fire({ icon: 'warning', title: 'Atención', text: 'Agrega un mensaje o archivo antes de enviar.' });
        return;
      }

      setModalMensajeGuardando(true);
      try {
        const token = localStorage.getItem('token');
        const form = new FormData();
        form.append('docId', docId);
        form.append('mensaje', JSON.stringify({ mensaje: modalMensajeTexto, nombre: modalMensajeNombre || (modalMensajeArchivo ? modalMensajeArchivo.name : '') }));
        if (modalMensajeArchivo) form.append('archivo', modalMensajeArchivo);

        const resp = await enviarRespuesta(form, token);
        if (!resp.ok) {
          const text = await resp.text();
          console.error('Error guardando mensaje:', text);
          Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar el mensaje.' });
          return;
        }

        Swal.fire({ icon: 'success', title: 'Mensaje guardado', timer: 1500, showConfirmButton: false });
        setModalMensajeTexto('');
        setModalMensajeArchivo(null);
        setModalMensajeNombre('');
        setMostrarModalMensaje(false);

        const r2 = await getDocumentById(docId, token);
        if (r2.ok) {
          const data = await r2.json();
          const fullDoc = data.documento || data;
          setDocSeleccionadoPendientes(fullDoc);
        }
      } catch (error) {
        console.error('Error guardando mensaje:', error);
        Swal.fire({ icon: 'error', title: 'Error', text: 'Ocurrió un error al guardar el mensaje.' });
      } finally {
        setModalMensajeGuardando(false);
      }
    };

    const user = JSON.parse(localStorage.getItem("user"));
    const esValidador = user?.roles?.some((r) => r.rol === "VALIDADOR");
    const esEjecutor = user?.roles?.some((r) => r.rol === "EJECUTOR");

    const [validacionRespuesta, setValidacionRespuesta] = useState("");
    const [respuestaGuardada, setRespuestaGuardada] = useState(false);

    // FUNCIÓN GUARDAR VALIDACIÓN
  const guardarValidacion = () => {

    if (!validacionRespuesta) {
      Swal.fire({
        icon: "warning",
        title: "Seleccione una opción",
        text: "Debe indicar si la respuesta es válida o no.",
        confirmButtonColor: "#8B1538"
      });

      return;
    }

    setRespuestaGuardada(true);

    Swal.fire({
      icon: "success",
      title: "Validación guardada",
      text: "La respuesta fue guardada correctamente.",
      timer: 1800,
      showConfirmButton: false
    });
  };


  // FUNCIÓN CONTINUAR
  const validarRespuesta = async () => {

    if (!respuestaGuardada) {
      Swal.fire({
        icon: "warning",
        title: "Guardar información",
        text: "Primero debe guardar la validación.",
        confirmButtonColor: "#8B1538"
      });

      return;
    }

    const tareaId = docSeleccionadoPendientes?.tareaId || docSeleccionadoPendientes?._id;
    const tokenValue = localStorage.getItem("token");

    if (!tareaId || !tokenValue) {
      Swal.fire({
        icon: "error",
        title: "No se pudo validar la tarea",
        text: "No se encontró la tarea o el token de usuario.",
        confirmButtonColor: "#8B1538"
      });
      return;
    }

    // ❌ REGRESAR AL EJECUTOR
    if (validacionRespuesta === "no") {
      try {
        const response = await devolverTarea(tareaId, tokenValue);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Ocurrió un error al devolver la tarea.");
        }

        await cargarTareas();

        Swal.fire({
          icon: "info",
          title: "Respuesta regresada",
          text: "La respuesta fue enviada de nuevo al último usuario dirigido.",
          confirmButtonColor: "#8B1538"
        });
      } catch (error) {
        console.error("Error al devolver la tarea:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Ocurrió un error al devolver la tarea.",
          confirmButtonColor: "#8B1538"
        });
      } finally {
        setMostrarModal(false);
        setDocSeleccionadoPendientes(false);
        setRespuestaGuardada(false);
        setValidacionRespuesta("");
      }

      return;
    }

    // ✅ VALIDACIÓN CORRECTA
    if (validacionRespuesta === "si") {
      try {
        const response = await validarTarea(tareaId, tokenValue);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Ocurrió un error al validar la tarea.");
        }

        await cargarTareas();

        Swal.fire({
          icon: "success",
          title: "Proceso concluido",
          text: "La instancia fue validada correctamente.",
          confirmButtonColor: "#8B1538"
        });
      } catch (error) {
        console.error("Error al validar la tarea:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Ocurrió un error al validar la tarea.",
          confirmButtonColor: "#8B1538"
        });
      } finally {
        setMostrarModal(false);
        setDocSeleccionadoPendientes(false);
        setRespuestaGuardada(false);
        setValidacionRespuesta("");
      }
    }

  };

const [mostrarVisorTurno, setMostrarVisorTurno] = useState(false);
const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);

const obtenerTextoPlano = (valor, fallback = "-") => {
  if (!valor) return fallback;

  // Si ya es string o número
  if (typeof valor === "string" || typeof valor === "number") {
    return String(valor);
  }

  // Si es objeto
  if (typeof valor === "object") {
    return (
      valor.nombre ||
      valor.descripcion ||
      valor.label ||
      valor.value ||
      fallback
    );
  }

  return fallback;
};

const generarDocumentoTurno = async (turno) => {
  
  const formatearFechaPDF = (fecha) => {
    if (!fecha) return "-";

    const date = new Date(fecha);

    if (isNaN(date.getTime())) return fecha;

    const dia = String(date.getDate()).padStart(2, "0");
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const anio = date.getFullYear();

    return `${dia}/${mes}/${anio}`;
  };

  console.log("TURNO COMPLETO:", turno);

  // ===== OBTENER ID DEL DOCUMENTO =====

  const documentoId = docSeleccionado?._id || docSeleccionado?.docId || docSeleccionadoPendientes?._id || docSeleccionadoPendientes?.docId;

  let documentoCompleto = {};

  // ===== CONSULTAR DOCUMENTO =====

  if (documentoId) {
    try {

      const token = localStorage.getItem("token");

      const response = await getDocumentById(documentoId, token);

      if (response.ok) {
        const data = await response.json();

        documentoCompleto = data.documento || data;

      }

    } catch (error) {
      console.error("Error obteniendo documento:", error);
    }
  }
  
  // const doc = new jsPDF();
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

  
  // ===== PALETA OFICIAL =====
  // const COLORS = {
  //   grisPrincipal: [96, 89, 93],      // #60595D
  //   beige1: [197, 176, 153],          // #C5B099
  //   beige2: [205, 177, 156],          // #CDB19C
  //   beige3: [218, 206, 192],          // #DACEC0
  //   vino: [121, 20, 42],              // #79142A
  //   blanco: [255, 255, 255],
  //   negro: [0, 0, 0],
  //   grisBorde: [180, 180, 180],
  // };

  const COLORS = {
    grisPrincipal: [96, 89, 93],      // #60595D
    grisSecundario: [155, 157, 154],  // #9B9D9A
    blanco: [255, 255, 255],
    negro: [0, 0, 0],
  };

  const fechaHoy = formatearFechaPDF(new Date());

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // ===== TIPOGRAFÍA =====
  // jsPDF no incluye Gotham Rounded ni Montserrat por defecto.
  // Aquí usamos helvetica simulando:
  // - bold = Gotham Rounded Bold
  // - normal = Montserrat Regular

  // ===== HEADER =====

  // Fondo decorativo header
  // doc.setFillColor(...COLORS.beige3);
  doc.setFillColor(...COLORS.grisSecundario);
  doc.rect(margin, 12, contentWidth, 18, "F");

  // ===== LOGO INSTITUCIONAL =====

  // IMPORTANTE:
  // logoGobierno debe ser una imagen en base64 o importada

  doc.addImage(
    logoGobierno, // imagen
    "PNG",        // formato
    margin + 2,   // X
    12,           // Y
    85,           // ancho
    18            // alto
  );

  // ===== FECHA =====
  // doc.setFillColor(...COLORS.vino);
  doc.setFillColor(...COLORS.grisPrincipal);
  doc.roundedRect(130, 17, 25, 8, 2, 2, "F");

  doc.setTextColor(...COLORS.blanco);
  doc.setFontSize(9);
  doc.setFont("GothamRounded", "bold");
  doc.text("FECHA", 142.5, 22, { align: "center" });

  doc.setTextColor(...COLORS.grisPrincipal);
  doc.setFont("GothamRounded", "bold");
  doc.text(fechaHoy, 175, 22, { align: "center" });

  // ===== LÍNEA SEPARADORA =====
  // doc.setDrawColor(...COLORS.beige2);
  doc.setDrawColor(...COLORS.grisSecundario);
  doc.setLineWidth(0.7);
  doc.line(margin, 35, pageWidth - margin, 35);

  // ===== TABLA =====
  let y = 42;
  const col1 = margin;
  const col2 = 68;
  const col3 = 110;
  const col4 = 142;
  const rowHeight = 10;

  const dibujarFila = (label1, val1, label2, val2, yPos) => {
    const texto1 = obtenerTextoPlano(val1, "-");
    const texto2 = obtenerTextoPlano(val2, "-");

    // Anchuras disponibles
    const anchoValor1 = 38;
    const anchoValor2 = 48;

    const lineas1 = doc.splitTextToSize(texto1, anchoValor1);
    const lineas2 = doc.splitTextToSize(texto2, anchoValor2);
      
    const maxLineas = Math.max(
      lineas1.length,
      lineas2.length,
      1
    );

    const alturaFila = Math.max(
      rowHeight,
      maxLineas * 5 + 4
    );

    // Fondo
    // doc.setFillColor(...COLORS.beige3);
    doc.setFillColor(...COLORS.blanco);
    doc.rect(col1, yPos - 6, contentWidth, alturaFila, "F");

    // Label izquierda
    doc.setFillColor(...COLORS.grisPrincipal);
    doc.rect(col1, yPos - 6, 50, alturaFila, "F");

    doc.setTextColor(...COLORS.blanco);
    doc.setFont("GothamRounded", "bold");
    doc.setFontSize(10);
    doc.text(label1, col1 + 2, yPos);

    // Valor izquierda
    doc.setTextColor(...COLORS.negro);
    doc.setFont("Montserrat", "normal");
    doc.text(lineas1, col2, yPos);

    if (label2) {
      // Label derecha
      // doc.setFillColor(...COLORS.vino);
      doc.setFillColor(...COLORS.grisPrincipal);
      doc.rect(col3, yPos - 6, 28, alturaFila, "F");

      doc.setTextColor(...COLORS.blanco);
      doc.setFont("GothamRounded", "bold");
      doc.text(label2, col3 + 2, yPos);

      // Valor derecha
      doc.setTextColor(...COLORS.negro);
      doc.setFont("Montserrat", "normal");
      doc.text(lineas2, col4 + 3, yPos);
    }

    // doc.setDrawColor(...COLORS.beige1);
    doc.setDrawColor(...COLORS.grisSecundario);
    doc.rect(col1, yPos - 6, contentWidth, alturaFila);

    return alturaFila;
  };

  const dibujarFilaSimple = (label, valor, yPos) => {
    const texto = obtenerTextoPlano(valor, "-");

    const anchoDisponible = 130;

    const lineas = doc.splitTextToSize(
      texto,
      anchoDisponible
    );

    const alturaFila = Math.max(
      rowHeight,
      lineas.length * 5 + 4
    );

    // doc.setFillColor(...COLORS.beige3);
    doc.setFillColor(...COLORS.blanco);
    doc.rect(col1, yPos - 6, contentWidth, alturaFila, "F");

    doc.setFillColor(...COLORS.grisPrincipal);
    doc.rect(col1, yPos - 6, 50, alturaFila, "F");

    doc.setTextColor(...COLORS.blanco);
    doc.setFont("GothamRounded", "bold");
    doc.setFontSize(10);
    doc.text(label, col1 + 2, yPos);

    doc.setTextColor(...COLORS.negro);
    doc.setFont("Montserrat", "normal");
    doc.text(lineas, col2, yPos);

    // doc.setDrawColor(...COLORS.beige1);
    doc.setDrawColor(...COLORS.grisSecundario);
    doc.rect(col1, yPos - 6, contentWidth, alturaFila);

    return alturaFila;
  };

  // ===== DATOS =====

  y += dibujarFilaSimple(
    "ÁREA DE ATENCIÓN",
    turno?.areaDestino?.nombre ||
    turno?.destinatario?.nombre ||
    "COORDINACIÓN DE ARCHIVO",
    y
  );

  y += dibujarFila(
    "TURNO NÚMERO",
    turno?.numeroTurno || "000000",
    "FOLIO",
    documentoCompleto?.folio ||
    documentoCompleto?.numeroFolio ||
    "N/A",
    y
  );

  y +=dibujarFila(
    "FECHA DOCUMENTO",
    formatearFechaPDF(
      documentoCompleto?.fechaDocumento ||
      documentoCompleto?.fechaDoc
    ) || formatearFechaPDF(turno?.fecha) || fechaHoy,
    "DOCUMENTO",
    documentoCompleto?.documento ||
    documentoCompleto?.numeroDocumento ||
    documentoCompleto?.docId ||
    "N/A",
    y
  );

  // RECIBIDO EN
  // doc.setFillColor(...COLORS.beige3);
  doc.setFillColor(...COLORS.blanco);
  doc.rect(col1, y - 6, contentWidth, rowHeight, "F");

  // doc.setDrawColor(...COLORS.beige1);
  doc.setDrawColor(...COLORS.grisSecundario);
  doc.rect(col1, y - 6, contentWidth, rowHeight);

  // doc.setFillColor(...COLORS.vino);
  doc.setFillColor(...COLORS.grisPrincipal);
  doc.rect(col3, y - 6, 28, rowHeight, "F");

  doc.setTextColor(...COLORS.blanco);
  doc.setFont("GothamRounded", "bold");
  doc.setFontSize(10);
  doc.text("RECIBIDO EN", col3 + 2, y);

  doc.setTextColor(...COLORS.negro);
  doc.setFont("Montserrat", "normal");
  doc.text(
    formatearFechaPDF(turno?.fechaAcuse) ||
    formatearFechaPDF(turno?.fechaTurnado) ||
    fechaHoy,
    col4 + 3,
    y
  );

  y += dibujarFilaSimple(
    "ÁREA DE PROCEDENCIA",
    safeText(
      turno?.remitente?.nombre ||
      turno?.remitente?.name ||
      turno?.quienTurna?.nombre ||
      turno?.turna?.nombre,
      ""
    ),
    y
  );

  y +=dibujarFilaSimple(
    "INSTRUCCIÓN",
    turno?.referencia ||
    turno?.instruccion?.descripcion ||
    turno?.instruccion ||
    "INFORMA",
    y
  );


  y +=dibujarFila(
    "PRIORIDAD",
    turno?.prioridad || "-",
    "ESTATUS",
    turno?.status || turno?.estatus || "-",
    y
  );

  y += dibujarFila(
    "ÁREA TURNA",
    turno?.turna?.area ||
    turno?.areaTurna ||
    turno?.turna ||
    "-",
    "QUIÉN TURNA",
    turno?.quienTurna || turno?.turna,
    y
  );
  
  const esUrgente =
    String(turno?.prioridad || "")
      .toUpperCase()
      .trim() === "URGENTE";

  if (esUrgente) {
    y += dibujarFilaSimple(
      "FECHA TÉRMINO",
      formatearFechaPDF(turno?.compromiso) ||
      formatearFechaPDF(turno?.fechaTurnado) ||
      "-",
      y
    );
  }

  y += 3;

  // ===== ASUNTO =====

  // doc.setFillColor(...COLORS.vino);
  doc.setFillColor(...COLORS.grisPrincipal);
  doc.roundedRect(col1, y - 6, 32, 8, 2, 2, "F");

  doc.setTextColor(...COLORS.blanco);
  doc.setFont("Montserrat", "bold");
  doc.setFontSize(10);
  doc.text("ASUNTO", col1 + 2, y);

  y += 7;

  const asuntoTexto =
    documentoCompleto?.asunto ||
    turno?.asunto ||
    turno?.descripcion ||
    turno?.comentario ||
    turno?.instruccion?.descripcion ||
    "Sin asunto especificado.";

  const asuntoLineas = doc.splitTextToSize(
    asuntoTexto,
    contentWidth - 10
  );

  const asuntoHeight = asuntoLineas.length * 5 + 10;

  // doc.setFillColor(...COLORS.beige3);
  doc.setFillColor(...COLORS.blanco);
  doc.rect(col1, y - 4, contentWidth, asuntoHeight, "F");

  // doc.setDrawColor(...COLORS.beige1);
  doc.setDrawColor(...COLORS.grisSecundario);
  doc.rect(col1, y - 4, contentWidth, asuntoHeight);

  doc.setTextColor(...COLORS.negro);
  doc.setFont("Montserrat", "normal");
  doc.setFontSize(10);
  doc.text(asuntoLineas, col1 + 5, y + 4);

  y += asuntoHeight + 10;

  // ===== ACUERDO =====

  doc.setFillColor(...COLORS.grisPrincipal);
  doc.roundedRect(col1, y - 6, 35, 8, 2, 2, "F");

  doc.setTextColor(...COLORS.blanco);
  doc.setFont("Montserrat", "bold");
  doc.setFontSize(10);
  doc.text("ACUERDO", col1 + 2, y);

  y += 7;

  const acuerdoTexto = `${turno.instruccion.descripcion}.\n${turno?.notas ? `Notas: ${turno.notas}` : ""}`;

  const acuerdoLineas = doc.splitTextToSize(
    acuerdoTexto,
    contentWidth - 10
  );

  const acuerdoHeight = acuerdoLineas.length * 5 + 20;

  // doc.setFillColor(...COLORS.beige3);
  doc.setFillColor(...COLORS.blanco);
  doc.rect(col1, y - 4, contentWidth, acuerdoHeight, "F");

  // doc.setDrawColor(...COLORS.beige1);
  doc.setDrawColor(...COLORS.grisSecundario);
  doc.rect(col1, y - 4, contentWidth, acuerdoHeight);

  doc.setTextColor(...COLORS.negro);
  doc.setFont("GothamRounded", "normal");
  doc.setFontSize(9);
  doc.text(acuerdoLineas, col1 + 5, y + 4);

  y += acuerdoHeight + 30;

  // ===== FIRMA =====

  doc.setTextColor(...COLORS.grisPrincipal);
  doc.setFont("GothamRounded", "normal");
  doc.setFontSize(7);

/*  doc.text(
    "GOBIERNO DEL ESTADO DE NAYARIT",
    margin + 40,
    y,
    { align: "center" }
  );
*/
  // Línea firma
  // doc.setDrawColor(...COLORS.vino);
  doc.setDrawColor(...COLORS.grisPrincipal);
  doc.setLineWidth(1);
  doc.line(margin + 5, y + 15, margin + 75, y + 15);

  // Firmante
  const firmante =
  turno?.remitente?.name ||
  turno?.remitente?.nombre ||
  turno?.turna?.nombre ||
  "MTRA. NOMBRE DEL TITULAR";

  // doc.setTextColor(...COLORS.vino);
  doc.setTextColor(...COLORS.grisPrincipal);
  doc.setFont("Montserrat", "bold");
  doc.setFontSize(9);

  doc.text(
    firmante.toUpperCase(),
    margin + 40,
    y + 22,
    { align: "center" }
  );

  // Cargo
  doc.setTextColor(...COLORS.grisPrincipal);
  doc.setFont("Montserrat", "normal");
  doc.setFontSize(8);

  doc.text(
    "SECRETARÍA DE EDUCACIÓN",
    margin + 40,
    y + 28,
    { align: "center" }
  );

  // ===== SELLO =====

  // doc.setTextColor(...COLORS.vino);
  doc.setTextColor(...COLORS.grisPrincipal);
  doc.setFont("Montserrat", "bold");
  doc.setFontSize(7);


  doc.text(
    "RECIBE: ____________________________",
    pageWidth - 50,
    y + 25,
    { align: "center" }
  );

  // ===== PDF =====
  const nombrePDF =
    `Turno_${documentoCompleto?.folio || "SIN_FOLIO"}_${
      turno?.numeroTurno || "000000"
    }.pdf`;

  const pdfBlob = doc.output("blob");

  const pdfUrl = URL.createObjectURL(pdfBlob);

  doc.save(nombrePDF);

  return {
    url: pdfUrl,
    nombre: nombrePDF,
  };

};

  return (
    <div className="flex-1 overflow-y-auto overflow-x-auto p-4 md:p-2">
      <AnimatePresence mode="wait">
      <motion.div
        key={currentView}
        {...pageTransition}
        className="flex-1 flex flex-col overflow-hidden"
      >
        {renderView()}

      <AnimatePresence>
        {docSeleccionado && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-start sm:items-center justify-center p-4 sm:p-6 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* 🔹 BACKDROP */}
            <motion.div
              className="absolute inset-0 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDocSeleccionado(null)}
            />

            {/* 🔹 MODAL */}
            <motion.div
              className="relative bg-white w-full max-w-6xl h-[90vh] sm:h-[85vh] rounded-2xl shadow-2xl flex flex-col pt-6"
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 🔹 HEADER */}
              <div className="flex justify-between items-start px-6 pb-4 border-b shrink-0">

                {/* TITULOS */}
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">
                    ENTRADAS
                  </span>

                  <h2 className="text-2xl font-bold text-[#8B1538] leading-tight">
                    Folio: {docSeleccionado.folio}
                  </h2>
                </div>

                {/* BOTON CERRAR */}
                <button
                  onClick={() => setDocSeleccionado(null)}
                  className="bg-[#8B1538] hover:bg-red-700 text-white p-2 rounded-full flex items-center justify-center transition"
                  title="Cerrar"
                >
                  <Minus size={16} />
                </button>

              </div>

              {/* 🔹 TABS */}
              <div className="flex border-b mb-1 text-sm overflow-x-auto">
                {[
                  { id: "datosAsunto", label: "Datos del registro" },
                  { id: "anexo", label: "Anexos" },
                  ...(docSeleccionado.adicional?.tiene ? [{ id: "materialAdicional", label: "Soporte adicional" }] : []),
                  ...(!esEjecutor ? [] : [{ id: "turnoRecibido", label: "Atender turno recibido" }]),
                  { id: "verTurnos", label: "Todos los turnos" },
                  { id: "copias", label: "Copias" },
                  { id: "bitacora", label: "Bitácora" },
                  
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setTabActiva(tab.id)}
                    className={`px-4 py-2 whitespace-nowrap transition ${
                      tabActiva === tab.id
                        ? "border-b-2 border-[#8B1538] text-[#8B1538] font-semibold"
                        : "text-gray-600 hover:text-[#8B1538]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* CONTENIDO CON ANIMACIÓN */}
              <div className="flex-1 overflow-y-auto p-4">
                <AnimatePresence>
                  <motion.div
                    key={tabActiva}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {tabActiva === "datosAsunto" && (
                      <div className="space-y-6">
                        {/* DATOS GENERALES */}
                        <div>

                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-80">
                            <h2 className="text-sm font-semibold text-gray-600 mb-2">Ejercicio</h2>
                            <select name="ejercicio"className="w-full border rounded px-2 py-1 bg-gray-100 cursor-not-allowed">
                              <option value={docSeleccionado.ejercicio}>{docSeleccionado.ejercicio}</option>
                            </select>
                          </div>
                        </div>

                          {/* DATOS ESPECÍFICOS */}
                        <div className="mb-4">
                          <h2 className="text-sm font-semibold text-gray-600 mb-2">
                            Datos específicos
                          </h2>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div>
                              <label className="block text-gray-500 mb-1">
                                Tipo de documento*
                              </label>
                              <input
                                value={
                                  docSeleccionado.tipo || docSeleccionado.tipoOtro
                                }
                                disabled
                                className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-gray-700"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-gray-500 mb-1">
                                Asunto*
                              </label>
                              <input
                                value={
                                  docSeleccionado.asunto
                                }
                                disabled
                                className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-gray-700"
                              />
                            </div>

                            <div>
                              <label className="block text-gray-500 mb-1">
                                Soporte adicional
                              </label>
                              <input
                                value={
                                  docSeleccionado.adicional?.tiene ? "Sí" : "No"
                                }
                                disabled
                                className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-gray-700"
                              />
                            </div>

                          </div>
                        </div>

                          <h2 className="text-sm font-semibold text-gray-600 mb-2">
                            Datos generales
                          </h2>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div>
                              <label className="block text-gray-500 mb-1">
                                No. de documento*
                              </label>
                              <input
                                value={
                                  docSeleccionado.folio
                                }
                                disabled
                                className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-gray-700"
                              />
                            </div>

                            <div>
                              <label className="block text-gray-500 mb-1">
                                Fecha de documento*
                              </label>
                              <input
                                type="date"
                                value={
                                  formatDateForInput(docSeleccionado.fechaDoc) ||
                                  formatDateForInput(docSeleccionado.fechaDocumento) ||
                                  formatDateForInput(docSeleccionado.registro)
                                }
                                disabled
                                className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-gray-700"
                              />
                            </div>

                            <div>
                              <label className="block text-gray-500 mb-1">
                                Fecha de recibido*
                              </label>
                              <input
                                type="date"
                                value={
                                  formatDateForInput(docSeleccionado.acuse)
                                }
                                disabled
                                className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-gray-700"
                              />
                            </div>
                            
                          </div>
                        </div>

                        {/* REMITENTE */}
                        <div>
                          <h2 className="text-sm font-semibold text-gray-600 mb-2">
                            Remitente
                          </h2>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div>
                              <label className="block text-gray-500 mb-1">
                                Tipo de remitente*
                              </label>
                              <input
                                value={safeText(
                                  docSeleccionado?.remitente?.tipo ||
                                  docSeleccionado?.remitente?.role ||
                                  docSeleccionado?.turnados?.at(-1)?.remitente?.tipo ||
                                  "Interno"
                                )}
                                disabled
                                className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-gray-700"
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-gray-500 mb-1">
                                Nombre del remitente
                              </label>

                              <input
                                value={safeText(
                                  docSeleccionado?.remitente?.name ||
                                  docSeleccionado?.remitente?.nombre ||
                                  docSeleccionado?.turnados?.at(-1)?.remitente?.name ||
                                  docSeleccionado?.turnados?.at(-1)?.remitente?.nombre ||
                                  docSeleccionado?.remitente ||
                                  ""
                                )}
                                disabled
                                className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-gray-700"
                              />
                            </div>

                          </div>
                        </div>

                        {/* INFORMACION COMPLEMENTARIA */}
                        <div>
                          <h2 className="text-sm font-semibold text-gray-600 mb-2">
                            Información complementaria
                          </h2>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                           
                            <div className="md:col-span-3">
                              <label className="block text-gray-500 mb-1">
                                Síntesis del asunto*
                              </label>
                              <textarea
                                value={
                                  safeText(docSeleccionado.sintesis, "") ||
                                  safeText(docSeleccionado.tema, "") ||
                                  ""
                                }
                                disabled
                                rows={3}
                                className="w-full border border-gray-300 rounded px-2 py-2 bg-gray-50 text-gray-700 resize-none"
                              />
                            </div>

                            <div className="md:col-span-3">
                              <label className="block text-gray-500 mb-1">
                                Observaciones
                              </label>
                              <input
                                value={
                                  safeText(docSeleccionado.observaciones, "") ||
                                  ""
                                }
                                disabled
                                className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-gray-700"
                              />
                            </div>

                          </div>
                        </div>

                        {/* VISUALIZAR ARCHIVO */}
                        <div className="mb-6">
                          <h2 className="text-sm font-semibold text-gray-600 mb-2">
                            Documento digital
                          </h2>

                          <div className="flex justify-center">
                            
                            <div className="w-full max-w-xl">

                              {/* Vista del archivo */}
                              <div
                                className="relative flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50"
                              >
                                {/* Icono */}
                                <Upload size={30} className="text-[#8B1538]" />

                                {/* Nombre archivo */}
                                <p className="text-sm text-gray-700 text-center font-medium break-all">
                                  {docSeleccionado.anexos[0].nombre ? docSeleccionado.anexos[0].nombre : "No hay archivo cargado"}
                                </p>

                                {/* Información */}
                                <span className="text-xs text-gray-400">
                                  Archivo adjunto en modo lectura
                                </span>

                                {/* Botón visualizar */}
                                {archivo && (
                                  <button
                                    type="button"
                                    onClick={() => window.open(URL.createObjectURL(archivo), "_blank")}
                                    className="mt-2 px-4 py-1 bg-[#8B1538] text-white rounded text-sm hover:bg-[#79142A]"
                                  >
                                    Ver archivo
                                  </button>
                                )}
                              </div>

                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                   
                    {tabActiva === "anexo" && (
                      <div className="space-y-4">
                      
                          <div className="flex items-center gap-2 mb-2">
    
                              {/* 🔍 Buscador */}
                              <div className="flex-1 flex items-center border rounded px-2">
                                <Search size={16} className="text-gray-400" />
                                <input
                                  value={busquedaSubirAnexo}
                                  onChange={(e) => setBusquedaSubirAnexo(e.target.value)}
                                  className="w-full px-2 py-2 outline-none text-sm"
                                  placeholder="Buscar anexo..."
                                />
    
                              </div>
    
                            </div>
  
                          
                            {/* Tabla de subir anexos */}                        
                            <div className="overflow-x-auto">
                              <table className="min-w-[900px] w-full text-xs border border-gray-200">
    
                                {/* 🔴 HEADER */}
                                <thead className="bg-[#8B1538] text-white">
                                  <tr>
                                    <th className="px-3 py-2 text-left">Eliminar</th>
                                    <th className="px-3 py-2 text-left">Registrador</th>
                                    <th className="px-3 py-2 text-left">Mensaje</th>
                                    <th className="px-3 py-2 text-left">Archivo</th>
                                    <th className="px-3 py-2 text-left">Número de documento</th>
                                  </tr>
                                </thead>
    
                                {/* 🧾 BODY */}
                                <tbody>
                                  {documentoAnexosFiltrados.length > 0 ? (
                                    documentoAnexosFiltrados.map((anexo) => (
                                      <tr
                                        key={anexo._id || anexo.nombre}
                                        className="border-t hover:bg-gray-50"
                                      >
                                        {/* ELIMINAR */}
                                        <td className="px-3 py-2">
                                          <button
                                            onClick={() => handleRemoveAnexo(anexo._id)}
                                            className="p-2 rounded hover:bg-red-100 text-gray-500 hover:text-red-600 transition"
                                          >
                                            <Trash2 size={14} />
                                          </button>
                                        </td>
    
                                        {/* REGISTRADOR */}
                                        <td className="px-3 py-2 text-gray-700">
                                          {anexo.registrador?.nombre ? anexo.registrador.nombre : "N/A"}
                                        </td>
    
                                        {/*  MENSAJE */}
                                        <td className="px-3 py-2 text-gray-700">
                                          {anexo.mensaje || "Sin mensaje"}
                                        </td>
    
                                        {/* BOTÓN ARCHIVO */} 
                                        <td className="px-3 py-2"> 
                                          <button 
                                          title="Ver archivo"
                                          onClick={() => { 
                                            openAnexo(anexo);
                                          }} 
                                          className="bg-[#8B1538] text-white px-3 py-1 rounded text-xs hover:opacity-90 flex items-center gap-2" > 
                                            <Eye size={14} /> 
                                          </button> 
                                        </td>
    
                                        {/* NOMBRE */}
                                        <td className="px-3 py-2 text-gray-700 truncate max-w-[300px]">
                                          {anexo.nombre || "Sin nombre"}
                                        </td>
                                      </tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td colSpan={5} className="text-center py-4 text-gray-400">
                                        Sin resultados
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
    
                              </table>
                            </div>
    
                            <div className="flex items-center gap-2 mb-2">
    
                              {/* 🔍 Buscador */}
                              <div className="flex-1 flex items-center border rounded px-2">
                                <Search size={16} className="text-gray-400" />
                                <input
                                  value={busquedaVerTurnos}
                                  onChange={(e) => setBusquedaVerTurnos(e.target.value)}
                                  className="w-full px-2 py-2 outline-none text-sm"
                                  placeholder="Buscar documento relacionado..."
                                />
                              </div>
    
                            </div>
    
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm border border-gray-200">
                                <thead className="bg-[#8B1538] text-white">
                                  <tr>
                                    <th className="px-4 py-2 text-left">Folio</th>
                                    <th className="px-4 py-2 text-left">DocId</th>
                                    <th className="px-4 py-2 text-left">Remitente</th>
                                    <th className="px-4 py-2 text-left">Asunto</th>
                                    <th className="px-4 py-2 text-left">Eliminar</th>
                                  </tr>
                                </thead>
    
                                <tbody>
                                  {relacionadosFiltrados.length > 0 ? (
                                    relacionadosFiltrados.map((relacionado) => (
                                      <tr
                                        key={relacionado.value}
                                        className="border-t hover:bg-gray-50"
                                      >
                                        <td className="px-4 py-2 text-gray-700">{relacionado.folio || 'Sin folio'}</td>
                                        <td className="px-4 py-2 text-gray-700">{relacionado.docId || 'Sin docId'}</td>
                                        <td className="px-4 py-2 text-gray-700">{relacionado.remitente || 'N/A'}</td>
                                        <td className="px-4 py-2 text-gray-700">{relacionado.asunto || 'Sin asunto'}</td>
                                        <td className="px-4 py-2">
                                          <button
                                            onClick={() => handleRemoveRelacionado(relacionado.value)}
                                            className="text-red-500 hover:text-red-700 transition"
                                          >
                                            <Trash2 size={16} />
                                          </button>
                                        </td>
                                      </tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td colSpan={5} className="text-center py-4 text-gray-400">
                                        Sin documentos relacionados
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
    
                              </table>
                            </div>
                              
    
                          </div>
                    
                    )}

                    {tabActiva === "materialAdicional" && (
                      <div className="space-y-4">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm border border-gray-200">
                            <thead className="bg-[#8B1538] text-white">
                              <tr>
                                <th className="px-4 py-2 text-left">Tipo de material</th>
                                <th className="px-4 py-2 text-left">Descripción</th>
                                <th className="px-4 py-2 text-left">Registrador</th>
                              </tr>
                            </thead>

                            <tbody>
                              {(docSeleccionado?.adicional?.adicionales || docSeleccionadoPendientes?.adicional?.adicionales || []).length > 0 ? (
                                (docSeleccionado?.adicional?.adicionales || docSeleccionadoPendientes?.adicional?.adicionales || []).map((item, index) => (
                                  <tr key={item._id || index} className="border-t hover:bg-gray-50">
                                    <td className="px-4 py-2 text-gray-700">
                                      {safeText(item.tipo || item.tipoMaterial, "N/A")}
                                    </td>
                                    <td className="px-4 py-2 text-gray-700">
                                      {item.descripcion || item.detalle || "Sin descripción"}
                                    </td>
                                    <td className="px-4 py-2 text-gray-700">
                                      {item.registrador?.nombre || item.registrador?.name || item.registrador || "N/A"}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={3} className="text-center py-4 text-gray-400">
                                    Este documento no cuenta con material adicional.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {tabActiva === "verTurnos" && (
                      <div className="space-y-4">
                        <div className="overflow-x-auto">
                          <div className="mb-3">
                            <input
                              type="text"
                              placeholder="Buscar en turnos..."
                              value={busquedaVerTurnos}
                              onChange={(e) => setBusquedaVerTurnos(e.target.value)}
                              className="w-full md:w-1/3 border border-gray-300 rounded px-3 py-2 text-sm"
                            />
                          </div>
                          <table className="min-w-[1200px] w-full text-xs border border-gray-200">
                            <thead className="bg-[#8B1538] text-white">
                              <tr>
                                <th className="px-3 py-2 text-left">Turno</th>
                                <th className="px-3 py-2 text-left">Instrucción</th>
                                <th className="px-3 py-2 text-left">Funcionario que turna</th>
                                <th className="px-3 py-2 text-left">Área de destino</th>
                                <th className="px-3 py-2 text-left">Prioridad</th>
                                <th className="px-3 py-2 text-left">Fecha de termino</th>
                                <th className="px-3 py-2 text-left">Área que turna</th>
                                <th className="px-3 py-2 text-left">Quién lo turna</th>
                                <th className="px-3 py-2 text-left">Estatus</th>
                              </tr>
                            </thead>

                            <tbody>
                              
                              {turnosVerFiltrados.length > 0 ? (
                                turnosVerFiltrados.map((turno) => (
                                  <tr
                                      key={turno._id}
                                      className="border-t hover:bg-gray-50"
                                    >
                                    <td className="px-3 py-2">
                                      <div className="flex items-center justify-center">

                                        {/* VER TURNO */}
                                        <button
                                          title="Descargar turno"
                                          onClick={async () => {
                                            const pdfData = await generarDocumentoTurno(turno);

                                            setTurnoSeleccionado(pdfData);
                                            setMostrarVisorTurno(true);
                                          }}
                                          className="bg-[#8B1538] hover:bg-[#74112F] text-white p-2 rounded transition"
                                        >
                                          <Download size={14} />
                                        </button>

                                      </div>
                                    </td>
                                    <td className="px-3 py-2">{safeText(turno.instruccion?.descripcion || turno.instruccion, "-")}</td>
                                    <td className="px-3 py-2">{safeText(turno.remitente, "-")}</td>
                                    <td className="px-3 py-2">{safeText(turno.areaDestino, "-")}</td>
                                    <td className="px-3 py-2">{turno.prioridad || "-"}</td>
                                    <td className="px-3 py-2">{formatDateForInput(turno.compromiso) || formatDateForInput(turno.fechaTurnado) || "-"}</td>
                                    <td className="px-3 py-2">{safeText(turno.dirigido?.area || turno.turna, "-")}</td>
                                    <td className="px-3 py-2">{safeText(turno.quienTurna || turno.turna, "-")}</td>
                                    <td className="px-3 py-2 font-medium">{turno.status || turno.estatus || "-"}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={9} className="text-center py-4 text-gray-400">
                                    Sin datos en la tabla.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <div className="flex gap-2">
                            <button className="px-2 py-1 border rounded disabled:opacity-40">
                              &lt;
                            </button>
                            <button className="px-2 py-1 border rounded bg-gray-100">
                              1
                            </button>
                            <button className="px-2 py-1 border rounded disabled:opacity-40">
                              &gt;
                            </button>
                          </div>
                        </div>

                        <AnimatePresence>
                          {mostrarVisorTurno && turnoSeleccionado && (
                            <motion.div
                              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              <motion.div
                                className="bg-white w-[80%] h-[80%] rounded-lg shadow-lg p-4 relative overflow-hidden"
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.8 }}
                              >

                                <div className="bg-[#8B1538] text-white flex justify-between items-center p-3">
                                  <span>{turnoSeleccionado.nombre}</span>

                                  {/* CERRAR */}
                                    <button
                                      onClick={() => setMostrarVisorTurno(false)}
                                      className="absolute top-2 right-2 z-50 bg-[#8B1538] hover:bg-[#74112F] text-white rounded-full p-1 transition"
                                    >
                                      <Minus size={18} />
                                    </button>
                                </div>

                                {/* VISTA */}
                                <iframe
                                  title="Vista previa turno"
                                  src={turnoSeleccionado.url}
                                  className="w-full h-[calc(100%-56px)]"
                                />

                              </motion.div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {tabActiva === "copias" && (
                      <div className="space-y-4">
                        {/* TABLA */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm border border-gray-200">
                            <thead className="bg-[#8B1538] text-white">
                              <tr>
                                <th className="px-4 py-2 text-left">
                                  Funcionario
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {copiasDocumento.map((copia, index) => (
                                <tr
                                  key={copia._id || index}
                                  className="border-t hover:bg-gray-50"
                                >
                                  <td className="px-4 py-2 text-gray-700">
                                    {copia.funcionario?.nombre || 'N/A'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* PAGINACIÓN */}
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <div className="flex gap-2">
                            <button className="px-2 py-1 border rounded disabled:opacity-40">
                              &lt;
                            </button>

                            <button className="px-2 py-1 border rounded bg-[#8B1538] text-white">
                              1
                            </button>

                            <button className="px-2 py-1 border rounded disabled:opacity-40">
                              &gt;
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {tabActiva === "bitacora" && (
                      <div className="w-full flex justify-center bg-[#2f2f2f] py-6">
                        <div className="w-full max-w-4xl">
                    
                          {/* Barra visor */}
                          <div className="flex justify-between items-center bg-white border border-gray-200 rounded-lg px-4 py-3 mb-4 shadow-sm">

                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 uppercase tracking-wide">
                                Vista previa
                              </span>

                              <span className="text-sm font-semibold text-gray-700">
                                {`Bitacora_${docSeleccionado?.folio || "SAGASE"}.pdf`}
                              </span>
                            </div>

                            <button
                              onClick={descargarBitacora}
                              className="
                                flex items-center gap-2
                                bg-[#E8EEF8]
                                hover:bg-[#D8E4F5]
                                text-[#2D4A73]
                                border border-[#C9D8EE]
                                px-4 py-2
                                rounded-lg
                                text-sm
                                font-semibold
                                transition-all
                                duration-200
                              "
                            >
                              Descargar PDF
                            </button>

                          </div>
                                                
                          {/* Hoja (estilo idéntico al PDF de Exportar PDF) */}
                          <div className="flex justify-center mt-4">
                            <iframe
                              title="Vista previa bitácora"
                              src={pdfBitacora}
                              style={{
                                width: "850px",
                                height: "1100px",
                                border: "none",
                                background: "#fff",
                                boxShadow: "0 10px 25px rgba(0,0,0,.15)",
                              }}
                            />
                          </div>
                    
                        </div>
                      </div>
                    )}
     

                    {tabActiva === "turnoRecibido" && (
                      <div className="border border-gray-300 rounded bg-white overflow-hidden text-xs">

                        {/* HEADER */}
                        <div className="bg-gray-100 border-b px-4 py-2 font-semibold text-gray-600 text-sm font-semibold text-gray-600 mb-2">
                          Atender turno recibido
                        </div>

                        {/* FORMULARIO */}
                        <div className="p-4 space-y-5">

                          {/* FILA 1 */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                            <div>
                              <label className="block text-gray-500 mb-1">
                                Área remitente
                              </label>

                              <div className="h-[42px] w-full border border-gray-300 rounded px-3 bg-gray-50 text-gray-700 flex items-center">
                                {docSeleccionado?.turnados?.at(-1)?.areaDestino?.nombre || "Dirección de Tecnologías de la Información y Comunicación..."}
                              </div>
                            </div>

                            <div>
                              <label className="block text-gray-500 mb-1">
                                Remitente
                              </label>

                              <div className="h-[42px] w-full border border-gray-300 rounded px-3 bg-gray-50 text-gray-700 flex items-center">
                                {docSeleccionado?.turnados?.at(-1)?.remitente?.nombre || docSeleccionado?.turnados?.at(-1)?.remitente?.name || "Omar César Juárez"}
                              </div>
                            </div>

                            <div>
                              <label className="block text-gray-500 mb-1">
                                Instrucción
                              </label>

                              <div className="h-[42px] w-full border border-gray-300 rounded px-3 bg-gray-50 text-gray-700 flex items-center">
                                {docSeleccionado?.turnados?.at(-1)?.instruccion?.descripcion || docSeleccionado?.turnados?.at(-1)?.instruccion || "Atender conforme proceda"}
                              </div>
                            </div>

                          </div>

                          {/* FILA 2 */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                            <div>
                              <label className="block text-gray-500 mb-1">
                                Área destino
                              </label>

                              <div className="h-[42px] w-full border border-gray-300 rounded px-3 bg-gray-50 text-gray-700 flex items-center">
                                {docSeleccionado?.turnados?.at(-1)?.areaDestino?.nombre || "Dirección de Tecnologías de la Información y Comunicación..."}
                              </div>
                            </div>

                            <div>
                              <label className="block text-gray-500 mb-1">
                                Fecha de acuse
                              </label>

                              <input
                                type="date"
                                value={docSeleccionado?.turnados?.at(-1)?.acuse ? formatDateForInput(docSeleccionado?.turnados?.at(-1)?.acuse) : (docSeleccionado?.turnados?.at(-1)?.fechaAcuse ? formatDateForInput(docSeleccionado?.turnados?.at(-1)?.fechaAcuse) : "2023-07-04")}
                                disabled
                                className="h-[42px] w-full border border-gray-300 rounded px-3 bg-gray-50 text-gray-700"
                              />
                            </div>

                            {
                            docSeleccionado?.turnados?.at(-1)?.compromiso ? (
                            <div>
                              <label className="block text-gray-500 mb-1">
                                Fecha de termino
                              </label>

                              <input
                                type="date"
                                value={docSeleccionado?.turnados?.at(-1)?.compromiso ? formatDateForInput(docSeleccionado?.turnados?.at(-1)?.compromiso) : "2023-07-10"}
                                disabled
                                className="h-[42px] w-full border border-gray-300 rounded px-3 bg-gray-50 text-gray-700"
                              />
                            </div>)
                            : null
                            }

                          </div>
                        </div>

                       {/* MENSAJES */}
                      <div className="border-t">

                        {/* TITULO */}
                        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
                          <h2 className="text-sm font-semibold text-gray-600">
                            Mensajes
                          </h2>
                        </div>

                        {/* TABLA */}
                        <div className="p-4 overflow-x-auto">

                          <table className="min-w-full border border-gray-200 text-xs">

                            <thead>
                              <tr className="bg-[#D8B2BC] text-white">
                                <th className="px-3 py-2 text-left border-r">
                                  Registrador del mensaje
                                </th>

                                <th className="px-3 py-2 text-left border-r">
                                  Documento anexo
                                </th>

                                <th className="px-3 py-2 text-left border-r">
                                  Número de documento
                                </th>

                                <th className="px-3 py-2 text-left">
                                  Mensaje
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {(docSeleccionadoPendientes?.respuestas || []).length > 0 ? (
                                docSeleccionadoPendientes.respuestas.map((respuesta, index) => (
                                  <tr key={index} className="border-b hover:bg-gray-50">
                                    <td className="px-3 py-3 text-gray-700 align-top">
                                      {respuesta.registrador.nombre || 'Usuario'}
                                    </td>
                                    <td className="px-3 py-3 align-top">
                                      {respuesta.ruta ? (
                                        <a
                                          href={`${import.meta.env.VITE_ARCHIVOS_PATH}${respuesta.ruta.replace(/^\.\./, '')}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="group flex items-center gap-2 px-3 py-2 rounded-lg border border-[#8B1538]/20 bg-[#8B1538]/5 hover:bg-[#8B1538] transition-all duration-200"
                                        >
                                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                            <Download size={16} className="text-[#8B1538] group-hover:text-[#8B1538]" />
                                          </div>

                                          <div className="flex flex-col items-start">
                                            <span className="text-[#8B1538] group-hover:text-white font-semibold text-xs">
                                              {respuesta.nombre || 'Archivo adjunto'}
                                            </span>

                                            <span className="text-[10px] text-gray-500 group-hover:text-pink-100">
                                              Descargar documento
                                            </span>
                                          </div>
                                        </a>
                                      ) : (
                                        <span className="text-gray-500 text-[11px]">Sin documento adjunto</span>
                                      )}
                                    </td>
                                    <td className="px-3 py-3 align-top">
                                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-100 text-red-700 text-[11px] font-medium">
                                        {respuesta.nombre || 'Respuesta'}
                                      </span>
                                    </td>
                                    <td className="px-3 py-3 text-gray-700 align-top">
                                      {respuesta.mensaje}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="4" className="px-3 py-4 text-center text-gray-500">
                                    No hay mensajes registrados.
                                  </td>
                                </tr>
                              )}
                            </tbody>

                          </table>

                        </div>
                      </div>  
                      
                        {/* RESPONDER */}
                        <div className="border-t p-4 bg-white">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Agregar respuesta</label>

                          <textarea
                            value={respuestaMensaje}
                            onChange={(e) => setRespuestaMensaje(e.target.value)}
                            rows={4}
                            className="w-full border border-gray-300 rounded p-2 text-sm mb-2"
                            placeholder="Escribe un mensaje de respuesta..."
                          />

                          <div className="flex items-center gap-3">
                            <input
                              type="file"
                              onChange={(e) => setRespuestaArchivo(e.target.files?.[0] || null)}
                              className="text-sm"
                            />

                            <button
                              onClick={async () => {
                                const documentoActivo = docSeleccionadoPendientes || docSeleccionado;
                                const docId = getDocumentoIdForRequest(documentoActivo);
                                if (!docId) {
                                  Swal.fire({ icon: 'error', title: 'Error', text: 'No se identificó el documento.' });
                                  return;
                                }

                                if (!respuestaMensaje && !respuestaArchivo) {
                                  Swal.fire({ icon: 'warning', title: 'Atención', text: 'Agrega un mensaje o archivo antes de enviar.' });
                                  return;
                                }

                                setEnviandoRespuesta(true);
                                try {
                                  const token = localStorage.getItem('token');
                                  const form = new FormData();
                                  form.append('docId', docId);
                                  form.append('mensaje', JSON.stringify({ mensaje: respuestaMensaje, nombre: respuestaArchivo ? respuestaArchivo.name : '' }));
                                  if (respuestaArchivo) form.append('archivo', respuestaArchivo);

                                  const resp = await enviarRespuesta(form, token);
                                  if (resp.ok) {
                                    Swal.fire({ icon: 'success', title: 'Respuesta enviada', timer: 1500, showConfirmButton: false });
                                    setRespuestaMensaje('');
                                    setRespuestaArchivo(null);

                                    // refrescar documento completo
                                    try {
                                      const r2 = await getDocumentById(docId, token);
                                      if (r2.ok) {
                                        const data = await r2.json();
                                        const fullDoc = data.documento || data;
                                        setDocSeleccionadoPendientes(fullDoc);
                                      }
                                    } catch (e) {
                                      console.error('Error refrescando documento:', e);
                                    }
                                  } else {
                                    const text = await resp.text();
                                    console.error('Error enviando respuesta:', text);
                                    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo enviar la respuesta.' });
                                  }
                                } catch (error) {
                                  console.error(error);
                                  Swal.fire({ icon: 'error', title: 'Error', text: 'Ocurrió un error al enviar la respuesta.' });
                                } finally {
                                  setEnviandoRespuesta(false);
                                }
                              }}
                              className="ml-auto bg-[#8B1538] text-white px-4 py-2 rounded hover:bg-[#74112F] transition"
                              disabled={enviandoRespuesta}
                            >
                              {enviandoRespuesta ? 'Enviando...' : 'Enviar respuesta'}
                            </button>
                          </div>
                        </div>
                        </div>
                    )}

                   
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* FOOTER ACCIÓN */}
              {esEjecutor && (
                <div className="border-t px-6 py-4 flex justify-end items-center bg-gray-50 shrink-0">

                  <button
                    onClick={moverAPendientes}
                    className="group flex items-center gap-3 bg-[#8B1538] hover:bg-[#74112F] text-white px-5 py-2.5 rounded-lg transition-all duration-200 shadow-sm"
                  >
                    <span className="text-sm font-medium">
                      Continuar a pendientes
                    </span>

                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                      <ArrowRight size={18} />
                    </div>
                  </button>

                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
          {modalEditarAbierto && (
            <motion.div
              className="fixed inset-0 z-[70] flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="absolute inset-0 bg-black/40"
                onClick={() => setModalEditarAbierto(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />

              <motion.div
                className="relative bg-white w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex flex-col "
                initial={{ scale: 0.9, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 40 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                <div className="flex justify-between items-center bg-gray-400 px-4 py-2">
                  <span className="text-white text-sm">
                    Registro concluido: {documentoEditar?.folio || ""}
                  </span>
                  <button
                    onClick={() => setModalEditarAbierto(false)}
                    className="bg-[#8B1538] text-white p-2 rounded-full flex items-center justify-center"
                  >
                    <Minus size={16} />
                  </button>
                </div>

                <div className="flex border-b text-sm overflow-x-auto">
                  {[
                     {
                        id: "datosAsunto",
                        label: "Datos del registro",
                      },
                      {
                        id: "anexo",
                        label: "Anexos",
                      },
                      ...(documentoEditar?.adicional?.tiene ? [{
                        id: "materialAdicional",
                        label: "Soporte adicional",
                      }] : []),
                      {
                        id: "verTurnos",
                        label: "Ver todos los turnos",
                      },
                      {
                        id: "copias",
                        label: "Copias de conocimiento",
                      },
                      {
                        id: "bitacora",
                        label: "Bitácora",
                      },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setTabActiva(tab.id)}
                      className={`px-4 py-2 whitespace-nowrap ${
                        tabActiva === tab.id
                          ? "border-b-2 border-[#8B1538] text-[#8B1538] font-semibold"
                          : "text-gray-600"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}

                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {tabActiva === "datosAsunto" && (
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-80">
                            <h2 className="text-sm font-semibold text-gray-600 mb-2">Ejercicio</h2>
                            <select name="ejercicio" value={formEditar.ejercicio} disabled onChange={handleChange} className="w-full border rounded px-2 py-1 bg-gray-100 cursor-not-allowed">
                              <option value="">Seleccionar</option>
                              <option value="2024">2024</option>
                              <option value="2025">2025</option>
                              <option value="2026">2026</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-sm font-semibold text-gray-600 mb-2">Datos generales</h2>
                          <div className="grid grid-cols-4 gap-4 items-end">
                            <div>
                              <label className="text-xs text-gray-500">No. de documento *</label>
                              <input name="noDocumento" value={formEditar.noDocumento} disabled className="w-full border rounded px-2 py-1 bg-gray-100 cursor-not-allowed" />
                            </div>

                            <div>
                              <label className="text-xs text-gray-500">Fecha de documento *</label>
                              <input type="date" name="fechaDocumento" value={formEditar.fechaDocumento} disabled className="w-full border rounded px-2 py-1 bg-gray-100 cursor-not-allowed" />
                            </div>

                            <div>
                              <label className="text-xs text-gray-500">Fecha de acuse *</label>
                              <input type="date" name="fechaAcuse" value={formEditar.fechaAcuse} disabled className="w-full border rounded px-2 py-1 bg-gray-100 cursor-not-allowed" />
                            </div>

                            <div>
                              <label className="text-xs text-gray-500">Fecha de registro *</label>
                              <input type="datetime-local" name="fechaRegistro" value={formEditar.fechaRegistro} disabled className="w-full border rounded px-2 py-1 bg-gray-100 cursor-not-allowed" />
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">Falta información:</span>
                              <Toggle checked={formEditar.faltaInformacion} onChange={handleToggleFaltaInformacion} />
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">Documento interno:</span>
                              <Toggle checked={formEditar.documentoInterno} onChange={(v) => setFormEditar((p) => ({ ...p, documentoInterno: v }))} />
                            </div>
                          </div>
                        </div>
                    

                        <div>
                          <h2 className="text-sm font-semibold text-gray-600 mt-2">Remitente</h2>
                          <div className="grid grid-cols-6 gap-4 items-end">
                            <div className="col-span-2">
                              <label className="text-xs text-gray-500">Tipo de remitente *</label>
                              <select name="tipoRemitente" value={formEditar.tipoRemitente} disabled className="w-full border rounded px-2 py-1 bg-gray-100 cursor-not-allowed">
                                <option value="">Seleccionar</option>
                                <option value="interno">Interno</option>
                                <option value="externo">Externo</option>
                              </select>
                            </div>

                            {formEditar.tipoRemitente === "interno" && (
                              <div className="col-span-2">
                                <label className="text-xs text-gray-500">Funcionario / Área *</label>
                                <select name="remitenteInterno" value={formEditar.remitenteInterno} onChange={handleChange} className={`w-full border rounded px-2 py-1 ${errores.remitenteInterno ? "border-red-500 bg-red-50" : ""}`}>
                                  <option value="">Seleccionar</option>
                                </select>
                              </div>
                            )}

                            {formEditar.tipoRemitente === "externo" && (
                              <div className="col-span-4">
                                <label className="text-xs text-gray-500">Selecciona remitente externo *</label>
                                <div className="flex items-center gap-3">
                                  <div ref={refRemitenteExt} className="flex-1 relative">
                                    <div className={`flex items-center border rounded px-2 ${errores.remitenteExterno ? "border-red-500 bg-red-50" : ""}`}>
                                      <Search size={16} className="text-gray-400" />
                                      <input
                                        className="w-full px-2 py-1 outline-none"
                                        placeholder="Buscar y seleccionar opción"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* DATOS ESPECÍFICOS */}
                        <div>
                          <h2 className="text-sm font-semibold text-gray-600 mt-2">
                            Datos específicos
                          </h2>

                          <div className="grid grid-cols-6 gap-4 items-end">

                            {/* Tipo documento con buscador */}
                            <div ref={refTipoDoc} className="col-span-2 relative">
                              <label className="text-xs text-gray-500">
                                Selecciona tipo de documento *
                              </label>
                              <div
                                className={`flex items-center border rounded px-2 ${
                                  errores.tipoDocumento ? "border-red-500 bg-red-50" : ""
                                }`}
                              >
                                <Search size={16} className="text-gray-400" />
                                <input
                                  value={busquedaTipoDoc}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    setBusquedaTipoDoc(value);
                                    setMostrarOpcionesTipoDoc(true);

                                    // 🔥 IMPORTANTE: limpiar selección real
                                    setFormEditar((prev) => ({
                                      ...prev,
                                      tipoDocumento: "",
                                    }));

                                    // validar si está vacío o no es válido
                                    setErrores((prev) => ({
                                      ...prev,
                                      tipoDocumento: !value.trim(),
                                    }));
                                  }}
                                  onFocus={() => setMostrarOpcionesTipoDoc(true)}
                                  className="w-full px-2 py-1 outline-none"
                                  placeholder="Buscar y seleccionar opción"

                                />
                              </div>

                              {mostrarOpcionesTipoDoc && (
                                <div className="absolute bg-white border w-full mt-1 max-h-40 overflow-y-auto z-10">
                                  {tiposFiltrados.map((t) => (
                                    <div
                                      key={t.value}
                                      onClick={() => {
                                        setFormEditar((prev) => ({
                                          ...prev,
                                          tipoDocumento: t.value,
                                        }));

                                        setBusquedaTipoDoc(t.label);
                                        setMostrarOpcionesTipoDoc(false);

                                        setErrores((prev) => ({
                                          ...prev,
                                          tipoDocumento: false,
                                        }));
                                      }}
                                      className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                                    >
                                      {t.label}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Toggle alta tipo */}
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                Alta tipo de documento:
                              </span>
                              <Toggle
                                checked={formEditar.altaTipoDocumento}
                                onChange={(v) => {
                                  setFormEditar({ ...formEditar, altaTipoDocumento: v });
                                }}
                              />
                            </div>

                            {/* Relacionado */}
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-gray-500">Relacionado con:</span>
                              <Toggle
                                checked={formEditar.relacionadoCon}
                                onChange={(v) => {
                                  setFormEditar({ ...formEditar, relacionadoCon: v });

                                  if (v) {
                                    setMostrarModalRelacionado(true);
                                  } else {
                                    setMostrarModalRelacionado(false);

                                    // 👇 LIMPIAR ASUNTO
                                    setAsuntoSeleccionado(null);
                                    setBusquedaAsunto("");
                                  }
                                }}
                              />
                            </div>

                            {/* Asunto */}
                            <div className="col-span-2">
                              <label className="text-xs text-gray-500">Anexos</label>
                              <textarea
                                value={asuntoSeleccionado?.descripcion || ""}
                                disabled
                                className="w-full border rounded px-2 py-1 h-[34px] resize-none bg-gray-100 cursor-not-allowed"
                              />
                            </div>

                          </div>

                          <div className="grid grid-cols-4 gap-4 mt-4">

                            {/* Tema */}
                            <div>

                              <div ref={refTemaPrincipal} className="relative">
                                <label className="text-xs text-gray-500">
                                  Selecciona tema principal *
                                </label>

                                <div className={`flex items-center border rounded px-2 ${errores.temaPrincipal ? "border-red-500 bg-red-50" : ""
                                  }`}>
                                  <Search size={16} className="text-gray-400" />
                                  <input
                                    value={busquedaTemaPrincipal}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      setBusquedaTemaPrincipal(value);
                                      setMostrarOpcionesTemaPrincipal(true);

                                      setFormEditar((prev) => ({
                                        ...prev,
                                        temaPrincipal: "",
                                      }));

                                      setErrores((prev) => ({
                                        ...prev,
                                        temaPrincipal: !value.trim(),
                                      }));
                                    }}
                                    onFocus={() => setMostrarOpcionesTemaPrincipal(true)}
                                    className="w-full px-2 py-1 outline-none"
                                    placeholder="Buscar y seleccionar opción"
                                  />
                                </div>

                                {mostrarOpcionesTemaPrincipal && (
                                  <div className="absolute bg-white border w-full mt-1 max-h-40 overflow-y-auto z-10">
                                    {temasFiltradosPrincipal.length > 0 ? (
                                      temasFiltradosPrincipal.map((t) => (
                                        <div
                                          key={t.value}
                                          onClick={() => {
                                            setFormEditar({ ...formEditar, temaPrincipal: t.value });
                                            setBusquedaTemaPrincipal(t.label);
                                            setMostrarOpcionesTemaPrincipal(false);

                                            setErrores((prev) => ({
                                              ...prev,
                                              temaPrincipal: !t.value,
                                            }));
                                          }}
                                          className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                                        >
                                          {t.label}
                                        </div>
                                      ))
                                    ) : (
                                      <div className="px-2 py-1 text-gray-400">Sin resultados</div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div ref={refMaterial} className="relative">
                              <label className="text-xs text-gray-500">
                                Selecciona material adicional
                              </label>

                              <div className="flex items-center border rounded px-2">
                                <Search size={16} className="text-gray-400" />
                                <input
                                  value={busquedaMaterial}
                                  onChange={(e) => {
                                    setBusquedaMaterial(e.target.value);
                                    setMostrarOpcionesMaterial(true);
                                  }}
                                  onFocus={() => setMostrarOpcionesMaterial(true)}
                                  className="w-full px-2 py-1 outline-none"
                                  placeholder="Buscar y seleccionar opción"
                                />
                              </div>

                              {mostrarOpcionesMaterial && (
                                <div className="absolute bg-white border w-full mt-1 max-h-40 overflow-y-auto z-10">
                                  {materialesFiltrados.length > 0 ? (
                                    materialesFiltrados.map((m) => (
                                      <div
                                        key={m.value}
                                        onClick={() => {
                                          setFormEditar({ ...formEditar, materialAdicional: m.value });
                                          setBusquedaMaterial(m.label);
                                          setMostrarOpcionesMaterial(false);
                                        }}
                                        className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                                      >
                                        {m.label}
                                      </div>
                                    ))
                                  ) : (
                                    <div className="px-2 py-1 text-gray-400">
                                      Sin resultados
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>


                            <div className="col-span-4">
                              <label className="text-xs text-gray-500">
                                Síntesis del asunto *
                              </label>
                              <textarea
                                name="sintesis"
                                value={formEditar.sintesis}
                                onChange={handleChange}
                                className={`w-full border rounded px-2 py-1 ${errores.sintesis ? "border-red-500 bg-red-50" : ""
                                  }`}
                              />
                            </div>

                            <div className="col-span-4">
                              <label className="text-xs text-gray-500">Observaciones</label>
                              <textarea className="w-full border rounded px-2 py-1" 
                              value={formEditar.observaciones}
                              onChange={handleChange}
                              />
                            </div>

                          </div>


                          {/* BOTÓN */}
                          <div className="flex justify-end">
                            <button
                              onClick={handleSave}
                              className="bg-[#79142A] text-white px-6 py-2 rounded"
                            >
                              Modificar
                            </button>
                          </div>

                        </div>

                      </div>

                    </div>

                  )}

                  {tabActiva === "anexo" && (
                      <div className="space-y-4">

                      <div className="flex items-center gap-2 mb-2">

                          
                          {/* 🔍 Buscador */}
                          <div className="flex-1 flex items-center border rounded px-2">
                            <Search size={16} className="text-gray-400" />
                           <input
                              value={busquedaSubirAnexo}
                              onChange={(e) => setBusquedaSubirAnexo(e.target.value)}
                              className="w-full px-2 py-2 outline-none text-sm"
                              placeholder="Buscar anexo..."
                            />

                          </div>

                        </div>

                        <h3 className="text-sm font-semibold text-gray-600 mb-2">
                        Sube archivos de anexos.
                      </h3>
                      
                       {/* Tabla de subir anexos */}                        
                        <div className="overflow-x-auto">
                          <table className="min-w-[900px] w-full text-xs border border-gray-200">

                            {/* 🔴 HEADER */}
                            <thead className="bg-[#8B1538] text-white">
                              <tr>
                                <th className="px-3 py-2 text-left">Eliminar</th>
                                <th className="px-3 py-2 text-left">Registrador</th>
                                <th className="px-3 py-2 text-left">Mensaje</th>
                                <th className="px-3 py-2 text-left">Archivo</th>
                                <th className="px-3 py-2 text-left">Número de documento</th>
                              </tr>
                            </thead>

                            {/* 🧾 BODY */}
                            <tbody>
                              {documentoAnexosFiltrados.length > 0 ? (
                                documentoAnexosFiltrados.map((anexo) => (
                                  <tr
                                    key={anexo._id || anexo.nombre}
                                    className="border-t hover:bg-gray-50"
                                  >
                                    {/* 🗑 ELIMINAR */}
                                    <td className="px-3 py-2">
                                      <button
                                        onClick={() => handleRemoveAnexo(anexo._id)}
                                        className="p-2 rounded hover:bg-red-100 text-gray-500 hover:text-red-600 transition"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </td>

                                    {/* 👤 REGISTRADOR */}
                                    <td className="px-3 py-2 text-gray-700">
                                      {anexo.registrador?.nombre ? anexo.registrador.nombre : "N/A"}
                                    </td>

                                    {/* 💬 MENSAJE */}
                                    <td className="px-3 py-2 text-gray-700">
                                      {anexo.mensaje || "Sin mensaje"}
                                    </td>

                                        {/* BOTÓN ARCHIVO */} 
                                        <td className="px-3 py-2"> 
                                          <button 
                                          title="Ver archivo"
                                          onClick={() => { 
                                            console.log("Ruta del anexo:", anexo.ruta); 
                                            openAnexo(anexo);
                                          }} 
                                          className="bg-[#8B1538] text-white px-3 py-1 rounded text-xs hover:opacity-90 flex items-center gap-2" > 
                                            <Eye size={14} /> 
                                          </button> 
                                        </td>

                                    {/* 📑 NOMBRE */}
                                    <td className="px-3 py-2 text-gray-700 truncate max-w-[300px]">
                                      {anexo.nombre || "Sin nombre"}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={5} className="text-center py-4 text-gray-400">
                                    Sin resultados
                                  </td>
                                </tr>
                              )}
                            </tbody>

                          </table>
                        </div>

                        <div className="flex items-center gap-2 mb-2">


                          {/* 🔍 Buscador */}
                          <div className="flex-1 flex items-center border rounded px-2">
                            <Search size={16} className="text-gray-400" />
                            <input
                              value={busquedaVerTurnos}
                              onChange={(e) => setBusquedaVerTurnos(e.target.value)}
                              className="w-full px-2 py-2 outline-none text-sm"
                              placeholder="Buscar documento relacionado..."
                            />
                          </div>

                        </div>

                        <h3 className="text-sm font-semibold text-gray-600 mb-2">
                        Documentos relacionados al registro.
                      </h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm border border-gray-200">
                            <thead className="bg-[#8B1538] text-white">
                              <tr>
                                <th className="px-4 py-2 text-left">Folio</th>
                                <th className="px-4 py-2 text-left">DocId</th>
                                <th className="px-4 py-2 text-left">Remitente</th>
                                <th className="px-4 py-2 text-left">Asunto</th>
                                <th className="px-4 py-2 text-left">Eliminar</th>
                              </tr>
                            </thead>

                            <tbody>
                              {relacionadosFiltrados.length > 0 ? (
                                relacionadosFiltrados.map((relacionado) => (
                                  <tr
                                    key={relacionado.value}
                                    className="border-t hover:bg-gray-50"
                                  >
                                    <td className="px-4 py-2 text-gray-700">{relacionado.folio || 'Sin folio'}</td>
                                    <td className="px-4 py-2 text-gray-700">{relacionado.docId || 'Sin docId'}</td>
                                    <td className="px-4 py-2 text-gray-700">{relacionado.remitente || 'N/A'}</td>
                                    <td className="px-4 py-2 text-gray-700">{relacionado.asunto || 'Sin asunto'}</td>
                                    <td className="px-4 py-2">
                                      <button
                                        onClick={() => handleRemoveRelacionado(relacionado.value)}
                                        className="text-red-500 hover:text-red-700 transition"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={5} className="text-center py-4 text-gray-400">
                                    Sin documentos relacionados
                                  </td>
                                </tr>
                              )}
                            </tbody>

                          </table>
                        </div>

                        {/* Paginación estilo pequeño */}
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <div className="flex gap-2">
                            <button className="px-2 py-1 border rounded disabled:opacity-40">
                              &lt;
                            </button>
                            <button className="px-2 py-1 border rounded bg-gray-100">
                              1
                            </button>
                            <button className="px-2 py-1 border rounded disabled:opacity-40">
                              &gt;
                            </button>
                          </div>
                        </div>

                      {/* MODAL SUBIR ANEXO */}
                      <AnimatePresence>
                        {mostrarModalSubirAnexo && (
                          <motion.div
                            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <motion.div
                              className="bg-white w-[500px] rounded-lg shadow-lg p-6"
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.8, opacity: 0 }}
                            >
                              {/* Header */}
                              <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">Agregar anexo</h2>

                                <button
                                  onClick={() => setMostrarModalSubirAnexo(false)}
                                  className="bg-[#79142A]  text-white hover:bg-[#79142A]/80 rounded-full p-1 transition"
                                >
                                  <Minus size={18} />
                                </button>
                              </div>

                              {/* Mensaje */}
                              <div className="mb-4">
                                <label className="block text-sm mb-1">Mensaje:</label>
                                <textarea
                                  value={mensaje}
                                  onChange={(e) => setMensaje(e.target.value)}
                                  className={`w-full border rounded p-2 ${
                                    erroresAnexos.mensaje ? "border-red-500 bg-red-50" : ""
                                  }`}
                                  rows="3"
                                />
                              </div>

                              {/* Documento */}
                              <div className="mb-4">
                                <label className="block text-sm mb-2 font-medium">
                                  Documento anexo:
                                </label>

                                {/* Input oculto */}
                                <input
                                  ref={inputRef}
                                  type="file"
                                  id="fileUpload"
                                  className="hidden"
                                  onChange={(e) => setArchivo(e.target.files[0])}
                                />

                                {/* Zona Drag & Drop */}
                                <label
                                  htmlFor="fileUpload"
                                  onDragOver={(e) => {
                                    e.preventDefault();
                                    setDragActivo(true);
                                  }}
                                  onDragLeave={() => setDragActivo(false)}
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    setDragActivo(false);
                                    const file = e.dataTransfer.files[0];
                                    if (file) setArchivo(file);
                                  }}
                                  className={`relative flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-6 cursor-pointer transition  ${
                                    erroresAnexos.archivo
                                      ? "border-red-500 bg-red-50"
                                      : dragActivo
                                      ? "border-[#8B1538] bg-red-50"
                                      : "border-gray-300 hover:border-[#8B1538] hover:bg-gray-50"
                                  }`}
                                >
                                  {/* Botón eliminar */}
                                  {archivo && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault(); // evita abrir el file picker
                                        eliminarArchivo();
                                      }}
                                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                    >
                                      <X size={14} />
                                    </button>
                                  )}

                                  <Upload size={28} className="text-[#8B1538]" />

                                  <p className="text-sm text-gray-600">
                                    {archivo ? archivo.name : "Haz clic o arrastra un archivo aquí"}
                                  </p>

                                  <span className="text-xs text-gray-400">
                                    PDF, DOC, JPG (máx. 5MB)
                                  </span>
                                </label>
                              </div>

                              {/* Nombre */}
                              <div className="mb-4">
                                <label className="block text-sm mb-1">Número de documento:</label>
                                <input
                                  type="text"
                                  value={nombreDoc}
                                  onChange={(e) => setNombreDoc(e.target.value)}
                                  className={`w-full border rounded p-2 ${
                                    erroresAnexos.nombreDoc ? "border-red-500 bg-red-50" : ""
                                  }`}
                                />
                              </div>

                              {/* Botones */}
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setMostrarModalSubirAnexo(false)}
                                  className="px-4 py-2 bg-gray-300 rounded"
                                >
                                  Cancelar
                                </button>

                                <button
                                  onClick={handleUploadAnexo}
                                  className="px-4 py-2 bg-[#8B1538] text-white rounded"
                                >
                                  Guardar
                                </button>

                              </div>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <AnimatePresence>
                        {mostrarModalAnexos && (
                          <motion.div
                            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <motion.div
                              className="bg-white w-[600px] rounded-lg shadow-lg p-6"
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0.8 }}
                            >
                              {/* Header */}
                              <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Seleccionar anexos</h2>

                                <button
                                  onClick={() => setMostrarModalAnexos(false)}
                                  className="bg-[#8B1538] text-white rounded-full p-1"
                                >
                                   <Minus size={16} />
                                </button>
                              </div>

                              {/* Lista */}
                              <div className="max-h-[300px] overflow-y-auto border rounded">
                                {anexosDisponibles.map((anexo) => (
                                  <div
                                    key={anexo.id}
                                    className="flex items-center justify-between px-4 py-2 border-b hover:bg-gray-50"
                                  >
                                    <div>
                                      <p className="text-sm font-medium">{anexo.nombre}</p>
                                      <p className="text-xs text-gray-500">{anexo.folio}</p>
                                    </div>

                                    <button
                                      onClick={() => {
                                        // evitar duplicados
                                        const existe = anexosSeleccionados.some(
                                          (a) => a.id === anexo.id
                                        );

                                        if (!existe) {
                                          setAnexosSeleccionados([
                                            ...anexosSeleccionados,
                                            anexo,
                                          ]);
                                        }
                                      }}
                                      className="bg-[#8B1538] text-white px-3 py-1 rounded text-xs"
                                    >
                                      Añadir
                                    </button>
                                  </div>
                                ))}
                              </div>

                              {/* Footer */}
                              <div className="flex justify-end mt-4">
                                <button
                                  onClick={() => setMostrarModalAnexos(false)}
                                  className="bg-gray-300 px-4 py-2 rounded"
                                >
                                  Cerrar
                                </button>
                              </div>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      </div>
                      
                    )}

                    {tabActiva === "materialAdicional" && (
                    <div className="space-y-4">

                      {/* 🔥 HEADER */}
                      <div className="flex items-center gap-2 mb-2">

                        {/* Botón añadir */}
                        <button
                          onClick={() => setMostrarModalMaterial(true)}
                          className="bg-[#8B1538] text-white px-4 py-2 rounded shadow hover:opacity-90"
                        >
                          Añadir material adicional
                        </button>

                        {/* 🔍 Buscador */}
                        <div className="flex-1 flex items-center border rounded px-2">
                          <Search size={16} className="text-gray-400" />
                          <input
                            value={busquedaMaterial}
                            onChange={(e) => setBusquedaMaterial(e.target.value)}
                            className="w-full px-2 py-2 outline-none text-sm"
                            placeholder="Buscar material..."
                          />
                        </div>

                      </div>

                      {/* 🧾 TABLA */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border border-gray-200">

                          <thead className="bg-[#8B1538] text-white">
                            <tr>
                              <th className="px-4 py-2 text-left">Eliminar</th>
                              <th className="px-4 py-2 text-left">Tipo de material</th>
                              <th className="px-4 py-2 text-left">Descripción</th>
                              <th className="px-4 py-2 text-left">Registrador</th>
                            </tr>
                          </thead>

                          <tbody>
                            {materialesAdicionalesFiltrados.length > 0 ? (
                              materialesAdicionalesFiltrados.map((material) => (
                                <tr key={material.id} className="border-t hover:bg-gray-50">

                                  {/* 🗑 ELIMINAR */}
                                  <td className="px-4 py-2">
                                    <button
                                      onClick={() => {
                                        setMateriales((prev) =>
                                          prev.filter((m) => m.id !== material.id)
                                        );
                                      }}
                                      className="p-2 rounded hover:bg-red-100 text-gray-500 hover:text-red-600 transition"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </td>

                                  <td className="px-4 py-2 text-gray-700">
                                    {material.tipo}
                                  </td>

                                  <td className="px-4 py-2 text-gray-700">
                                    {material.descripcion}
                                  </td>

                                  <td className="px-4 py-2 text-gray-700">
                                    {material.registrador}
                                  </td>

                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={4} className="text-center py-4 text-gray-400">
                                  Sin materiales adicionales
                                </td>
                              </tr>
                            )}
                          </tbody>

                        </table>
                      </div>

                      <AnimatePresence>
                        {mostrarModalMaterial && (
                          <motion.div
                            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <motion.div
                              className="bg-white w-[400px] rounded-lg shadow-lg p-6"
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.8, opacity: 0 }}
                            >
                              {/* Header */}
                              <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">
                                  Agregar material adicional
                                </h2>

                                <button
                                  onClick={() => setMostrarModalMaterial(false)}
                                  className="bg-[#8B1538] text-white rounded-full p-1"
                                >
                                  <Minus size={16} />
                                </button>
                              </div>

                              {/* Tipo */}
                              <div className="mb-3">
                                <label className="block text-sm mb-1">Tipo de material</label>
                                <input
                                  type="text"
                                  value={nuevoMaterial.tipo}
                                  onChange={(e) =>
                                    setNuevoMaterial({ ...nuevoMaterial, tipo: e.target.value })
                                  }
                                  className="w-full border rounded p-2"
                                  placeholder="Ej. USB, CD, Documento físico..."
                                />
                              </div>

                              {/* Descripción */}
                              <div className="mb-4">
                                <label className="block text-sm mb-1">Descripción</label>
                                <textarea
                                  value={nuevoMaterial.descripcion}
                                  onChange={(e) =>
                                    setNuevoMaterial({
                                      ...nuevoMaterial,
                                      descripcion: e.target.value,
                                    })
                                  }
                                  className="w-full border rounded p-2"
                                  rows="3"
                                />
                              </div>

                              {/* Botones */}
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setMostrarModalMaterial(false)}
                                  className="px-4 py-2 bg-gray-300 rounded"
                                >
                                  Cancelar
                                </button>

                                <button
                                  onClick={async () => {
                                    // Validación
                                    if (!nuevoMaterial.tipo || !nuevoMaterial.descripcion) {
                                      Swal.fire({
                                        toast: true,
                                        position: "top-end",
                                        icon: "warning",
                                        title: "Todos los campos son obligatorios",
                                        showConfirmButton: false,
                                        timer: 2500,
                                      });
                                      return;
                                    }

                                    // Confirmación
                                    const result = await Swal.fire({
                                      title: "¿Agregar material?",
                                      text: "Se añadirá el material adicional al registro.",
                                      icon: "question",
                                      showCancelButton: true,
                                      confirmButtonText: "Sí, agregar",
                                      cancelButtonText: "Cancelar",
                                      confirmButtonColor: "#8B1538",
                                      cancelButtonColor: "#6B7280",
                                    });

                                    if (result.isConfirmed) {
                                      const nuevo = {
                                        id: Date.now(),
                                        ...nuevoMaterial,
                                        registrador: "Usuario actual",
                                      };

                                      setMateriales((prev) => [...prev, nuevo]);

                                      // Éxito
                                      await Swal.fire({
                                        icon: "success",
                                        title: "Material agregado",
                                        text: "Se agregó correctamente.",
                                        confirmButtonColor: "#8B1538",
                                      });

                                      // limpiar y cerrar
                                      setNuevoMaterial({ tipo: "", descripcion: "" });
                                      setMostrarModalMaterial(false);
                                    }
                                  }}
                                  className="px-4 py-2 bg-[#8B1538] text-white rounded"
                                >
                                  Guardar
                                </button>

                              </div>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </div>
                  )}

                    
                  {tabActiva === "turnar" && (
                    <div className="space-y-4">
                      
                      {/* Botón agregar */}
                      <div className="flex justify-start">
                        <button
                          className="bg-[#8B1538] text-white w-10 h-10 rounded-full text-xl flex items-center justify-center shadow hover:opacity-90"
                        >
                          +
                        </button>
                      </div>

                      {/* Tabla */}
                      <div className="overflow-x-auto">
                        <table className="min-w-[1100px] w-full text-xs border border-gray-200">
                          <thead className="bg-[#8B1538] text-white">
                            <tr>
                              <th className="px-3 py-2 text-left">Instrucción</th>
                              <th className="px-3 py-2 text-left">Funcionario que remite</th>
                              <th className="px-3 py-2 text-left">Área de destino</th>
                              <th className="px-3 py-2 text-left">Dirigido a</th>
                              <th className="px-3 py-2 text-left">Prioridad</th>
                              <th className="px-3 py-2 text-left">Fecha de termino</th>
                              <th className="px-3 py-2 text-left">Quién lo turna</th>
                            </tr>
                          </thead>

                          <tbody>
                            {/* Datos simulados */}
                            {[].length > 0 ? (
                              [].map((item, index) => (
                                <tr key={index} className="border-t hover:bg-gray-50">
                                  <td className="px-3 py-2">{item.instruccion}</td>
                                  <td className="px-3 py-2">{item.funcionario}</td>
                                  <td className="px-3 py-2">{item.areaDestino}</td>
                                  <td className="px-3 py-2">{item.dirigidoA}</td>
                                  <td className="px-3 py-2">{item.prioridad}</td>
                                  <td className="px-3 py-2">{item.fecha}</td>
                                  <td className="px-3 py-2">{item.quienTurna}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={7} className="text-center py-4 text-gray-400">
                                  Sin datos en la tabla.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                    </div>
                  )}
                  
                   {tabActiva === "verTurnos" && (
                      <div className="space-y-4">
                        <div className="overflow-x-auto">
                          <div className="flex items-center gap-2 mb-4">

                          {/* BOTÓN AÑADIR TURNO */}
                          <button
                            onClick={() => {
                              // asegurar que el documento actual esté referenciado para guardar el turno
                              setDocumentoEditar(docSeleccionadoPendientes || docSeleccionado || documentoSeleccionado);
                              loadCatalogos();
                              setMostrarModalTurno(true);
                            }}
                            className="bg-[#8B1538] text-white px-4 py-2 rounded flex items-center gap-2 shadow hover:opacity-90"
                          >
                            Añadir turno
                          </button>

                          {/* 🔍 BUSCADOR */}
                          <div className="flex-1 flex items-center border rounded px-2">
                            <Search size={16} className="text-gray-400" />
                            <input
                              value={busquedaVerTurnos}
                              onChange={(e) => setBusquedaVerTurnos(e.target.value)}
                              className="w-full px-2 py-2 outline-none"
                              placeholder="Buscar turno..."
                            />
                          </div>

                        </div>
                        
                          <table className="min-w-[1200px] w-full text-xs border border-gray-200">
                            <thead className="bg-[#8B1538] text-white">
                              <tr>
                                <th className="px-3 py-2 text-left">
                                  Instrucción
                                </th>
                                <th className="px-3 py-2 text-left">
                                  Funcionario que turna
                                </th>
                                <th className="px-3 py-2 text-left">
                                  Área de destino
                                </th>
                                <th className="px-3 py-2 text-left">
                                  Prioridad
                                </th>
                                <th className="px-3 py-2 text-left">
                                  Fecha de termino
                                </th>
                                <th className="px-3 py-2 text-left">
                                  Área que turna
                                </th>
                                <th className="px-3 py-2 text-left">
                                  Quién lo turna
                                </th>
                                <th className="px-3 py-2 text-left">
                                  Estatus
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {turnosVerFiltrados.length > 0 ? (
                                turnosVerFiltrados.map((turno, index) => (
                                  <tr
                                    key={index}
                                    className="border-t hover:bg-gray-50"
                                  >
                                    <td className="px-3 py-2 text-gray-700">
                                      {turno.instruccion?.descripcion || turno.instruccion?.label || turno.instruccion || "Sin instrucción"}
                                    </td>
                                    <td className="px-3 py-2 text-gray-700">
                                      {turno.dirigido?.nombre || turno.remitente?.label || turno.remitente || "-"}
                                    </td>
                                    <td className="px-3 py-2 text-gray-700">
                                      {turno.areaDestino?.nombre || turno.areaDestino?.label || turno.areaDestino || "Sin área"}
                                    </td>
                                    <td className="px-3 py-2 text-gray-700">{turno.prioridad || "-"}</td>
                                    <td className="px-3 py-2 text-gray-700">
                                      {turno.compromiso ? formatDateValue(turno.compromiso) : turno.fechaTurnado ? formatDateValue(turno.fechaTurnado) : "-"}
                                    </td>
                                    <td className="px-3 py-2 text-gray-700">
                                      {safeText( turno.turna?.area)}
                                    </td>
                                    <td className="px-3 py-2 text-gray-700">
                                      {turno.turna?.nombre || turno.turna?.label || turno.turna || "-"}
                                    </td>
                                    <td className="px-3 py-2 font-medium">{turno.status || "Pendiente"}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan={8}
                                    className="text-center py-4 text-gray-400"
                                  >
                                    Sin datos en la tabla.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Paginación pequeña inferior */}
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <div className="flex gap-2">
                            <button className="px-2 py-1 border rounded disabled:opacity-40">
                              &lt;
                            </button>
                            <button className="px-2 py-1 border rounded bg-gray-100">
                              1
                            </button>
                            <button className="px-2 py-1 border rounded disabled:opacity-40">
                              &gt;
                            </button>
                          </div>
                        </div>

                        {mostrarModalTurno && (
                          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                            <div className="bg-white w-[900px] max-h-[90vh] overflow-y-auto rounded-lg shadow-lg p-6 relative">

                              {/* Cerrar */}
                              <button
                                onClick={() => setMostrarModalTurno(false)}
                                className="absolute top-3 right-3 bg-[#8B1538] text-white p-2 rounded-full shadow hover:opacity-90 transition"
                              >
                                <Minus size={16} />
                              </button>

                              <h2 className="text-lg font-semibold mb-4">Alta de instrucción</h2>

                              <div className="grid grid-cols-2 gap-4 text-sm">

                                {/* Instrucción */}
                                <div className="col-span-2">
                                  <label>Instrucción*</label>
                                  <select
                                    value={form.instruccion}
                                    onChange={(e) => setForm({ ...form, instruccion: e.target.value })}
                                    className={`w-full border rounded px-3 py-2 ${erroresTurno.instruccion ? "border-red-500" : "border-gray-300"}`}
                                  >
                                    <option value="">Seleccionar</option>
                                    {instrucciones.map((inst) => (
                                      <option key={inst.value} value={inst.value}>
                                        {inst.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Área destino */}
                                <div>
                                  <label>Área de destino*</label>
                                  <select
                                    value={form.areaDestino}
                                    onChange={(e) => setForm({ ...form, areaDestino: e.target.value })}
                                    className={`w-full border rounded px-3 py-2 ${erroresTurno.areaDestino ? "border-red-500" : "border-gray-300"}`}
                                  >
                                    <option value="">Seleccionar</option>
                                    {areas.map((area) => (
                                      <option key={area.value} value={area.value}>
                                        {area.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Dirigido a */}
                                <div className="col-span-2">
                                  <label>Dirigido a</label>
                                  <select
                                    value={form.dirigido}
                                    onChange={(e) => setForm({ ...form, dirigido: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                  >
                                    <option value="">Seleccionar</option>
                                    {usuarios.map((user) => ( form.areaDestino === user.areaId && (
                                      <option key={user.value} value={user.value}>
                                        {user.label}
                                      </option>
                                    )))}
                                  </select>
                                </div>

                                {/* Prioridad */}
                                <div>
                                  <label>Prioridad*</label>
                                  <select
                                    value={form.prioridad}
                                    onChange={(e) => setForm({ ...form, prioridad: e.target.value })}
                                    className={`w-full border rounded px-3 py-2 ${erroresTurno.prioridad ? "border-red-500" : "border-gray-300"}`}
                                  >
                                    <option value="">Seleccionar</option>
                                    <option value="Urgente">Con fecha de termino</option>
                                    <option value="Normal">Normal</option>
                                  </select>
                                </div>

                                {/* Fecha */}
                                {form.prioridad === "Urgente" && (
                                <div>
                                  <label>Fecha de termino*</label>
                                  <input
                                    type="date"
                                    value={form.fecha}
                                    onChange={(e) =>
                                      setForm({ ...form, fecha: e.target.value })
                                    }
                                    className={`w-full border rounded px-3 py-2 ${
                                      errores.fecha ? "border-red-500" : "border-gray-300"
                                    }`}
                                  />

                                </div>) || null}

                                {/* Notas */}
                                <div className="col-span-2">
                                  <label>Notas</label>
                                  <textarea
                                    value={form.notas}
                                    onChange={(e) => setForm({ ...form, notas: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                  />
                                </div>

                              </div>

                              {/* Botón guardar */}
                              <div className="flex justify-end mt-6">
                                <button
                                  onClick={handleGuardarAltaInstruccion}
                                  className="bg-[#8B1538] text-white px-6 py-2 rounded hover:opacity-90"
                                >
                                  Guardar
                                </button>

                              </div>

                            </div>
                          </div>
                        )}

                      </div>
                      
                    )}

                  {tabActiva === "copias" && (
                      <div className="space-y-4">
                        {/* Botón agregar */}
                        <div className="flex justify-start">
                          <button
                             className="bg-[#8B1538] text-white px-4 py-2 rounded flex items-center gap-2 shadow hover:opacity-90"
                          >
                            Añadir funcionario
                          </button>
                        </div>
                        {/* TABLA */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm border border-gray-200">
                            <thead className="bg-[#8B1538] text-white">
                              <tr>
                                <th className="px-4 py-2 text-left">Eliminar</th>
                                <th className="px-4 py-2 text-left">Funcionario</th>
                              </tr>
                            </thead>

                            <tbody>
                              {copiasDocumento.length > 0 ? (
                                copiasDocumento.map((copia, index) => (
                                  <tr
                                    key={copia._id || index}
                                    className="border-t hover:bg-gray-50"
                                  >
                                    <td className="px-4 py-2">
                                      <button
                                        onClick={() => {
                                          setCopiasDocumento((prev) => prev.filter((_, i) => i !== index));
                                        }}
                                        className="text-red-500 hover:text-red-700 transition"
                                        title="Eliminar"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </td>

                                    <td className="px-4 py-2 text-gray-700">
                                      {copia.funcionario?.nombre || copia.funcionario?.label || copia.funcionario || "Sin funcionario"}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={2} className="text-center py-4 text-gray-400">
                                    Sin copias registradas
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* PAGINACIÓN */}
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <div className="flex gap-2">
                            <button className="px-2 py-1 border rounded disabled:opacity-40">
                              &lt;
                            </button>

                            <button className="px-2 py-1 border rounded bg-[#8B1538] text-white">
                              1
                            </button>

                            <button className="px-2 py-1 border rounded disabled:opacity-40">
                              &gt;
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                  
                     {tabActiva === "bitacora" && (
                      <div className="w-full flex justify-center bg-[#2f2f2f] py-6">
                        <div className="w-full max-w-4xl">
                    
                          {/* Barra visor */}
                          <div className="flex justify-between items-center bg-white border border-gray-200 rounded-lg px-4 py-3 mb-4 shadow-sm">

                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 uppercase tracking-wide">
                                Vista previa
                              </span>

                              <span className="text-sm font-semibold text-gray-700">
                                {`Bitacora_${docSeleccionado?.folio || "SAGASE"}.pdf`}
                              </span>
                            </div>

                            <button
                              onClick={descargarBitacora}
                              className="
                                flex items-center gap-2
                                bg-[#E8EEF8]
                                hover:bg-[#D8E4F5]
                                text-[#2D4A73]
                                border border-[#C9D8EE]
                                px-4 py-2
                                rounded-lg
                                text-sm
                                font-semibold
                                transition-all
                                duration-200
                              "
                            >
                              Descargar PDF
                            </button>

                          </div>
                                                
                          {/* Hoja (estilo idéntico al PDF de Exportar PDF) */}
                          <div className="flex justify-center mt-4">
                            <iframe
                              title="Vista previa bitácora"
                              src={pdfBitacora}
                              style={{
                                width: "850px",
                                height: "1100px",
                                border: "none",
                                background: "#fff",
                                boxShadow: "0 10px 25px rgba(0,0,0,.15)",
                              }}
                            />
                          </div>
                    
                        </div>
                      </div>
                    )}

                  </div>
              </motion.div>

            </motion.div>
          )}
      </AnimatePresence>
        
      </motion.div>
    </AnimatePresence>

    <AnimatePresence>

      <AnimatePresence>
        {docSeleccionadoPendientes && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-start sm:items-center justify-center p-4 sm:p-6 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* 🔹 BACKDROP */}
            <motion.div
              className="absolute inset-0 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDocSeleccionadoPendientes(null)}
            />

            {/* 🔹 MODAL */}
            <motion.div
              className="relative bg-white w-full max-w-6xl h-[90vh] sm:h-[85vh] rounded-2xl shadow-2xl flex flex-col pt-6"
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 🔹 HEADER */}
              <div className="flex justify-between items-start px-6 pb-4 border-b shrink-0">

                {/* TITULOS */}
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">
                    Mis pendientes
                  </span>

                  <h2 className="text-2xl font-bold text-[#8B1538] leading-tight">
                    Folio: {docSeleccionadoPendientes.folio}
                  </h2>
                </div>

                {/* BOTON CERRAR */}
                <button
                  onClick={() => setDocSeleccionadoPendientes(null)}
                  className="bg-[#8B1538] hover:bg-red-700 text-white p-2 rounded-full flex items-center justify-center transition"
                  title="Cerrar"
                >
                  <Minus size={16} />
                </button>

              </div>

              {/* 🔹 TABS */}
              <div className="flex border-b mb-1 text-sm overflow-x-auto">
                {[
                  { id: "datosAsunto", label: "Datos del registro" },
                  { id: "anexo", label: "Anexos" },
                  ...(docSeleccionadoPendientes.adicional?.tiene ? [{ id: "materialAdicional", label: "Soporte adicional" }] : []),
                  ...(esEjecutor ? [{ id: "turnoRecibido", label: "Atender turno recibido" }] : []),
                  // pestaña exclusiva para validadores (solo en Mis pendientes)
                  ...(esValidador ? [{ id: "respuestaValidar", label: "Respuesta a validar" }] : []),
                  { id: "verTurnos", label: "Todos los turnos" },
                  { id: "copias", label: "Copias" },
                  { id: "bitacora", label: "Bitácora" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setTabActiva(tab.id)}
                    className={`px-4 py-2 whitespace-nowrap transition ${
                      tabActiva === tab.id
                        ? "border-b-2 border-[#8B1538] text-[#8B1538] font-semibold"
                        : "text-gray-600 hover:text-[#8B1538]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* CONTENIDO CON ANIMACIÓN */}
              <div className="flex-1 overflow-y-auto p-4">
                <AnimatePresence>
                  <motion.div
                    key={tabActiva}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {tabActiva === "datosAsunto" && (
                      <div className="space-y-6">
                        {/* DATOS GENERALES */}
                        <div>

                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-80">
                            <h2 className="text-sm font-semibold text-gray-600 mb-2">Ejercicio</h2>
                            <select name="ejercicio"className="w-full border rounded px-2 py-1 bg-gray-100 cursor-not-allowed">
                              <option value="">{docSeleccionadoPendientes.ejercicio}</option>
                            </select>
                          </div>
                        </div>

                          {/* DATOS ESPECÍFICOS */}
                        <div className="mb-4">
                          <h2 className="text-sm font-semibold text-gray-600 mb-2">
                            Datos específicos
                          </h2>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div>
                              <label className="block text-gray-500 mb-1">
                                Tipo de documento*
                              </label>
                              <input
                                value={safeText(
                                  docSeleccionadoPendientes.tipoOtro ||
                                    docSeleccionadoPendientes.tipo?.tipo ||
                                    docSeleccionadoPendientes.tipo ||
                                    docSeleccionadoPendientes.tipoDocumento?.tipo ||
                                    docSeleccionadoPendientes.tipoDocumento,
                                  "Oficio"
                                )}
                                disabled
                                className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-gray-700"
                              />
                            </div>

                            <div>
                              <label className="block text-gray-500 mb-1">
                                Asunto*
                              </label>
                              <input
                                value={
                                  docSeleccionadoPendientes.asunto
                                }
                                disabled
                                className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-gray-700"
                              />
                            </div>

                            <div>
                              <label className="block text-gray-500 mb-1">
                                Soporte adicional
                              </label>
                              <input
                                value={
                                  docSeleccionadoPendientes.adicional.tiene
                                    ? "Sí"
                                    : "No"
                                }
                                disabled
                                className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-gray-700"
                              />
                            </div>

                          </div>
                        </div>

                          <h2 className="text-sm font-semibold text-gray-600 mb-2">
                            Datos generales
                          </h2>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div>
                              <label className="block text-gray-500 mb-1">
                                No. de documento*
                              </label>
                              <input
                                value={
                                  docSeleccionadoPendientes.docId ||
                                  docSeleccionadoPendientes.folio ||
                                  ""
                                }
                                disabled
                                className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-gray-700"
                              />
                            </div>

                            <div>
                              <label className="block text-gray-500 mb-1">
                                Fecha de documento*
                              </label>
                              <input
                                type="date"
                                value={
                                  formatDateForInput(docSeleccionadoPendientes.fechaDoc) ||
                                  formatDateForInput(docSeleccionadoPendientes.fechaDocumento) ||
                                  formatDateForInput(docSeleccionadoPendientes.registro)
                                }
                                disabled
                                className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-gray-700"
                              />
                            </div>

                            <div>
                              <label className="block text-gray-500 mb-1">
                                Fecha de recibido*
                              </label>
                              <input
                                type="date"
                                value={
                                  formatDateForInput(docSeleccionadoPendientes.acuse) ||
                                  formatDateForInput(docSeleccionadoPendientes.fechaAcuse) ||
                                  formatDateForInput(docSeleccionadoPendientes.registro)
                                }
                                disabled
                                className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-gray-700"
                              />
                            </div>
                            
                          </div>
                        </div>

                        {/* REMITENTE */}
                        <div>
                          <h2 className="text-sm font-semibold text-gray-600 mb-2">
                            Remitente
                          </h2>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div>
                              <label className="block text-gray-500 mb-1">
                                Tipo de remitente*
                              </label>
                              <input
                                value={
                                  docSeleccionadoPendientes.remitente?.tipo ||
                                  docSeleccionadoPendientes.remitente?.role ||
                                  "Interno"
                                }
                                disabled
                                className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-gray-700"
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-gray-500 mb-1">
                                Remitente
                              </label>
                              <input
                                value={safeText(docSeleccionadoPendientes.remitente.name, "")}
                                disabled
                                className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-gray-700"
                              />
                            </div>

                          </div>
                        </div>

                        {/* INFORMACION COMPLEMENTARIA */}
                        <div>
                          <h2 className="text-sm font-semibold text-gray-600 mb-2">
                            Información complementaria
                          </h2>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                           
                            <div className="md:col-span-3">
                              <label className="block text-gray-500 mb-1">
                                Síntesis del asunto*
                              </label>
                              <textarea
                                value={
                                  docSeleccionadoPendientes.sintesis
                                }
                                disabled
                                rows={3}
                                className="w-full border border-gray-300 rounded px-2 py-2 bg-gray-50 text-gray-700 resize-none"
                              />
                            </div>

                            <div className="md:col-span-3">
                              <label className="block text-gray-500 mb-1">
                                Observaciones
                              </label>
                              <input
                                value={
                                  docSeleccionadoPendientes.observaciones
                                }
                                disabled
                                className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-gray-700"
                              />
                            </div>

                          </div>
                        </div>

                        {/* VISUALIZAR ARCHIVO */}
                        <div className="mb-6">
                          <h2 className="text-sm font-semibold text-gray-600 mb-2">
                            Documento digital
                          </h2>

                          <div className="flex justify-center">
                            
                            <div className="w-full max-w-xl">

                              {/* Vista del archivo */}
                              <div
                                className="relative flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50"
                              >
                                {/* Icono */}
                                <Upload size={30} className="text-[#8B1538]" />

                                {/* Nombre archivo */}
                                <p className="text-sm text-gray-700 text-center font-medium break-all">
                                  {docSeleccionadoPendientes.anexos[0].nombre ? docSeleccionadoPendientes.anexos[0].nombre : "No hay archivo cargado"}
                                </p>

                                {/* Información */}
                                <span className="text-xs text-gray-400">
                                  Archivo adjunto en modo lectura
                                </span>

                                {/* Botón visualizar */}
                                {docSeleccionadoPendientes.anexos[0].url && (
                                  <button
                                    type="button"
                                    onClick={() => window.open(URL.createObjectURL(docSeleccionadoPendientes.anexos[0].url), "_blank")}
                                    className="mt-2 px-4 py-1 bg-[#8B1538] text-white rounded text-sm hover:bg-[#79142A]"
                                  >
                                    Ver archivo
                                  </button>
                                )}
                              </div>

                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                   
                    {tabActiva === "anexo" && (
                      <div className="space-y-4">
                      
                                            <div className="flex items-center gap-2 mb-2">
                      
                                                {/* 🔍 Buscador */}
                                                <div className="flex-1 flex items-center border rounded px-2">
                                                  <Search size={16} className="text-gray-400" />
                                                 <input
                                                    value={busquedaSubirAnexo}
                                                    onChange={(e) => setBusquedaSubirAnexo(e.target.value)}
                                                    className="w-full px-2 py-2 outline-none text-sm"
                                                    placeholder="Buscar anexo..."
                                                  />
                      
                                                </div>
                      
                                              </div>
                    
                                            
                                             {/* Tabla de subir anexos */}                        
                                              <div className="overflow-x-auto">
                                                <table className="min-w-[900px] w-full text-xs border border-gray-200">
                      
                                                  {/* 🔴 HEADER */}
                                                  <thead className="bg-[#8B1538] text-white">
                                                    <tr>
                                                      <th className="px-3 py-2 text-left">Eliminar</th>
                                                      <th className="px-3 py-2 text-left">Registrador</th>
                                                      <th className="px-3 py-2 text-left">Mensaje</th>
                                                      <th className="px-3 py-2 text-left">Archivo</th>
                                                      <th className="px-3 py-2 text-left">Número de documento</th>
                                                    </tr>
                                                  </thead>
                      
                                                  {/* 🧾 BODY */}
                                                  <tbody>
                                                    {documentoAnexosFiltrados.length > 0 ? (
                                                      documentoAnexosFiltrados.map((anexo) => (
                                                        <tr
                                                          key={anexo._id || anexo.nombre}
                                                          className="border-t hover:bg-gray-50"
                                                        >
                                                          {/* 🗑 ELIMINAR */}
                                                          <td className="px-3 py-2">
                                                            <button
                                                              onClick={() => handleRemoveAnexo(anexo._id)}
                                                              className="p-2 rounded hover:bg-red-100 text-gray-500 hover:text-red-600 transition"
                                                            >
                                                              <Trash2 size={14} />
                                                            </button>
                                                          </td>
                      
                                                          {/* 👤 REGISTRADOR */}
                                                          <td className="px-3 py-2 text-gray-700">
                                                            {anexo.registrador?.nombre ? anexo.registrador.nombre : "N/A"}
                                                          </td>
                      
                                                          {/* 💬 MENSAJE */}
                                                          <td className="px-3 py-2 text-gray-700">
                                                            {anexo.mensaje || "Sin mensaje"}
                                                          </td>
                      
                                        {/* BOTÓN ARCHIVO */} 
                                        <td className="px-3 py-2"> 
                                          <button 
                                          title="Ver archivo"
                                          onClick={() => { 
                                            openAnexo(anexo);
                                          }} 
                                          className="bg-[#8B1538] text-white px-3 py-1 rounded text-xs hover:opacity-90 flex items-center gap-2" > 
                                            <Eye size={14} /> 
                                          </button> 
                                        </td>
                      
                      
                                                          {/* 📑 NOMBRE */}
                                                          <td className="px-3 py-2 text-gray-700 truncate max-w-[300px]">
                                                            {anexo.nombre || "Sin nombre"}
                                                          </td>
                                                        </tr>
                                                      ))
                                                    ) : (
                                                      <tr>
                                                        <td colSpan={5} className="text-center py-4 text-gray-400">
                                                          Sin resultados
                                                        </td>
                                                      </tr>
                                                    )}
                                                  </tbody>
                      
                                                </table>
                                              </div>
                      
                                              <div className="flex items-center gap-2 mb-2">
                      
                                                {/* 🔍 Buscador */}
                                                <div className="flex-1 flex items-center border rounded px-2">
                                                  <Search size={16} className="text-gray-400" />
                                                  <input
                                                    value={busquedaVerTurnos}
                                                    onChange={(e) => setBusquedaVerTurnos(e.target.value)}
                                                    className="w-full px-2 py-2 outline-none text-sm"
                                                    placeholder="Buscar documento relacionado..."
                                                  />
                                                </div>
                      
                                              </div>
                      
                                              <div className="overflow-x-auto">
                                                <table className="w-full text-sm border border-gray-200">
                                                  <thead className="bg-[#8B1538] text-white">
                                                    <tr>
                                                      <th className="px-4 py-2 text-left">Folio</th>
                                                      <th className="px-4 py-2 text-left">DocId</th>
                                                      <th className="px-4 py-2 text-left">Remitente</th>
                                                      <th className="px-4 py-2 text-left">Asunto</th>
                                                      <th className="px-4 py-2 text-left">Eliminar</th>
                                                    </tr>
                                                  </thead>
                      
                                                  <tbody>
                                                    {relacionadosFiltrados.length > 0 ? (
                                                      relacionadosFiltrados.map((relacionado) => (
                                                        <tr
                                                          key={relacionado.value}
                                                          className="border-t hover:bg-gray-50"
                                                        >
                                                          <td className="px-4 py-2 text-gray-700">{relacionado.folio || 'Sin folio'}</td>
                                                          <td className="px-4 py-2 text-gray-700">{relacionado.docId || 'Sin docId'}</td>
                                                          <td className="px-4 py-2 text-gray-700">{relacionado.remitente || 'N/A'}</td>
                                                          <td className="px-4 py-2 text-gray-700">{relacionado.asunto || 'Sin asunto'}</td>
                                                          <td className="px-4 py-2">
                                                            <button
                                                              onClick={() => handleRemoveRelacionado(relacionado.value)}
                                                              className="text-red-500 hover:text-red-700 transition"
                                                            >
                                                              <Trash2 size={16} />
                                                            </button>
                                                          </td>
                                                        </tr>
                                                      ))
                                                    ) : (
                                                      <tr>
                                                        <td colSpan={5} className="text-center py-4 text-gray-400">
                                                          Sin documentos relacionados
                                                        </td>
                                                      </tr>
                                                    )}
                                                  </tbody>
                      
                                                </table>
                                            </div>
                    

                                            </div>
                    )}

                    {tabActiva === "materialAdicional" && (
                      <div className="space-y-4">
                        
                        {/* Tabla */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm border border-gray-200">
                            <thead className="bg-[#8B1538] text-white">
                              <tr>
                                <th className="px-4 py-2 text-left">
                                  Tipo de material
                                </th>
                                <th className="px-4 py-2 text-left">
                                  Descripción
                                </th>
                                <th className="px-4 py-2 text-left">
                                  Registrador
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {(docSeleccionadoPendientes?.adicional?.adicionales || []).length > 0 ? (
                                (docSeleccionadoPendientes?.adicional?.adicionales || []).map((item, index) => (
                                  <tr key={item._id || index} className="border-t hover:bg-gray-50">
                                    <td className="px-4 py-2 text-gray-700">
                                      {safeText(item.tipo || item.tipoMaterial, "N/A")}
                                    </td>

                                    <td className="px-4 py-2 text-gray-700">
                                      {item.descripcion || item.detalle || "Sin descripción"}
                                    </td>

                                    <td className="px-4 py-2 text-gray-700">
                                      {item.registrador?.nombre || item.registrador?.name || item.registrador || "N/A"}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={3} className="text-center py-4 text-gray-400">
                                    Este documento no cuenta con material adicional.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {tabActiva === "verTurnos" && (
                      <div className="space-y-4">
                        <div className="overflow-x-auto">
                          <div className="flex items-center gap-2 mb-4">
                          
                            {/* BOTÓN AÑADIR TURNO */}
                            <button
                              onClick={() => {
                                setDocumentoEditar(docSeleccionadoPendientes || docSeleccionado || documentoSeleccionado);
                                loadCatalogos();
                                setMostrarModalTurno(true);
                              }}
                              className="bg-[#8B1538] text-white px-4 py-2 rounded flex items-center gap-2 shadow hover:opacity-90"
                            >
                              Añadir turno
                            </button>
  
                            {/* 🔍 BUSCADOR */}
                            <div className="flex-1 flex items-center border rounded px-2">
                              <Search size={16} className="text-gray-400" />
                              <input
                                value={busquedaVerTurnos}
                                onChange={(e) => setBusquedaVerTurnos(e.target.value)}
                                className="w-full px-2 py-2 outline-none"
                                placeholder="Buscar turno..."
                              />
                            </div>
  
                          </div>
                          <table className="min-w-[1200px] w-full text-xs border border-gray-200">
                            <thead className="bg-[#8B1538] text-white">
                              <tr>
                                <th className="px-3 py-2 text-left">
                                  Instrucción
                                </th>
                                <th className="px-3 py-2 text-left">
                                  Funcionario que turna
                                </th>
                                <th className="px-3 py-2 text-left">
                                  Área de destino
                                </th>
                                <th className="px-3 py-2 text-left">
                                  Prioridad
                                </th>
                                <th className="px-3 py-2 text-left">
                                  Fecha de termino
                                </th>
                                <th className="px-3 py-2 text-left">
                                  Área que turna
                                </th>
                                <th className="px-3 py-2 text-left">
                                  Quién lo turna
                                </th>
                                <th className="px-3 py-2 text-left">
                                  Estatus
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {turnosVerFiltrados.length > 0 ? (
                                turnosVerFiltrados.map((turno, index) => (
                                  <tr
                                    key={index}
                                    className="border-t hover:bg-gray-50"
                                  >
                                    <td className="px-3 py-2">{safeText(turno.instruccion?.descripcion || turno.instruccion, "-")}</td>
                                    <td className="px-3 py-2">{safeText(turno.remitente, "-")}</td>
                                    <td className="px-3 py-2">{safeText(turno.areaDestino, "-")}</td>
                                    <td className="px-3 py-2">{turno.prioridad || "-"}</td>
                                    <td className="px-3 py-2">{formatDateForInput(turno.fechaTurnado) || "-"}</td>
                                    <td className="px-3 py-2">{safeText(turno.dirigido?.area, turno.turna, "-")}</td>
                                    <td className="px-3 py-2">{safeText(turno.turna || turno.dirigido?.area)}</td>
                                    <td className="px-3 py-2 font-medium">
                                      {turno.status || turno.estatus || "-"}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan={8}
                                    className="text-center py-4 text-gray-400"
                                  >
                                    Sin datos en la tabla.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Paginación pequeña inferior */}
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <div className="flex gap-2">
                            <button className="px-2 py-1 border rounded disabled:opacity-40">
                              &lt;
                            </button>
                            <button className="px-2 py-1 border rounded bg-gray-100">
                              1
                            </button>
                            <button className="px-2 py-1 border rounded disabled:opacity-40">
                              &gt;
                            </button>
                          </div>
                        </div>

                        {mostrarModalTurno && (
                          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                            <div className="bg-white w-[900px] max-h-[90vh] overflow-y-auto rounded-lg shadow-lg p-6 relative">

                              {/* Cerrar */}
                              <button
                                onClick={() => setMostrarModalTurno(false)}
                                className="absolute top-3 right-3 bg-[#8B1538] text-white p-2 rounded-full shadow hover:opacity-90 transition"
                              >
                                <Minus size={16} />
                              </button>

                              <h2 className="text-lg font-semibold mb-4">Alta de instrucción</h2>

                              <div className="grid grid-cols-2 gap-4 text-sm">

                                {/* Instrucción */}
                                <div className="col-span-2">
                                  <label>Instrucción*</label>
                                  <select
                                    value={form.instruccion}
                                    onChange={(e) => setForm({ ...form, instruccion: e.target.value })}
                                    className={`w-full border rounded px-3 py-2 ${erroresTurno.instruccion ? "border-red-500" : "border-gray-300"}`}
                                  >
                                    <option value="">Seleccionar</option>
                                    {instrucciones.map((inst) => (
                                      <option key={inst.value} value={inst.value}>
                                        {inst.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Área destino */}
                                <div>
                                  <label>Área de destino*</label>
                                  <select
                                    value={form.areaDestino}
                                    onChange={(e) => setForm({ ...form, areaDestino: e.target.value })}
                                    className={`w-full border rounded px-3 py-2 ${erroresTurno.areaDestino ? "border-red-500" : "border-gray-300"}`}
                                  >
                                    <option value="">Seleccionar</option>
                                    {areas.map((area) => (
                                      <option key={area.value} value={area.value}>
                                        {area.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Dirigido a */}
                                <div className="col-span-2">
                                  <label>Dirigido a</label>
                                  <select
                                    value={form.dirigido}
                                    onChange={(e) => setForm({ ...form, dirigido: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                  >
                                    <option value="">Seleccionar</option>
                                    {usuarios.map((user) => ( form.areaDestino === user.areaId && (
                                      <option key={user.value} value={user.value}>
                                        {user.label}
                                      </option>
                                    )))}
                                  </select>
                                </div>

                                {/* Prioridad */}
                                <div>
                                  <label>Prioridad*</label>
                                  <select
                                    value={form.prioridad}
                                    onChange={(e) => setForm({ ...form, prioridad: e.target.value })}
                                    className={`w-full border rounded px-3 py-2 ${erroresTurno.prioridad ? "border-red-500" : "border-gray-300"}`}
                                  >
                                    <option value="">Seleccionar</option>
                                    <option value="Urgente">Con fecha de termino</option>
                                    <option value="Normal">Normal</option>
                                  </select>
                                </div>

                                {/* Fecha */}
                                {form.prioridad === "Urgente" && (
                                <div>
                                  <label>Fecha de termino*</label>
                                  <input
                                    type="date"
                                    value={form.fecha}
                                    onChange={(e) =>
                                      setForm({ ...form, fecha: e.target.value })
                                    }
                                    className={`w-full border rounded px-3 py-2 ${
                                      errores.fecha ? "border-red-500" : "border-gray-300"
                                    }`}
                                  />

                                </div>) || null}

                                {/* Notas */}
                                <div className="col-span-2">
                                  <label>Notas</label>
                                  <textarea
                                    value={form.notas}
                                    onChange={(e) => setForm({ ...form, notas: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                  />
                                </div>

                              </div>

                              {/* Botón guardar */}
                              <div className="flex justify-end mt-6">
                                <button
                                  onClick={handleGuardarAltaInstruccion}
                                  className="bg-[#8B1538] text-white px-6 py-2 rounded hover:opacity-90"
                                >
                                  Guardar
                                </button>

                              </div>

                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {tabActiva === "copias" && (
                      <div className="space-y-4">
                        {/* TABLA */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm border border-gray-200">
                            <thead className="bg-[#8B1538] text-white">
                              <tr>
                                <th className="px-4 py-2 text-left">
                                  Funcionario
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {copiasDocumento.map((copia, index) => (
                                <tr
                                  key={copia._id || index}
                                  className="border-t hover:bg-gray-50"
                                >
                                  <td className="px-4 py-2 text-gray-700">
                                    {copia.funcionario?.nombre || 'N/A'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* PAGINACIÓN */}
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <div className="flex gap-2">
                            <button className="px-2 py-1 border rounded disabled:opacity-40">
                              &lt;
                            </button>

                            <button className="px-2 py-1 border rounded bg-[#8B1538] text-white">
                              1
                            </button>

                            <button className="px-2 py-1 border rounded disabled:opacity-40">
                              &gt;
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                     {tabActiva === "bitacora" && (
                      <div className="w-full flex justify-center bg-[#2f2f2f] py-6">
                        <div className="w-full max-w-4xl">
                    
                          {/* Barra visor */}
                          <div className="flex justify-between items-center bg-white border border-gray-200 rounded-lg px-4 py-3 mb-4 shadow-sm">

                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 uppercase tracking-wide">
                                Vista previa
                              </span>

                              <span className="text-sm font-semibold text-gray-700">
                                {`Bitacora_${docSeleccionado?.folio || "SAGASE"}.pdf`}
                              </span>
                            </div>

                            <button
                              onClick={descargarBitacora}
                              className="
                                flex items-center gap-2
                                bg-[#E8EEF8]
                                hover:bg-[#D8E4F5]
                                text-[#2D4A73]
                                border border-[#C9D8EE]
                                px-4 py-2
                                rounded-lg
                                text-sm
                                font-semibold
                                transition-all
                                duration-200
                              "
                            >
                              Descargar PDF
                            </button>

                          </div>
                                                
                          {/* Hoja (estilo idéntico al PDF de Exportar PDF) */}
                          <div className="flex justify-center mt-4">
                            <iframe
                              title="Vista previa bitácora"
                              src={pdfBitacora}
                              style={{
                                width: "850px",
                                height: "1100px",
                                border: "none",
                                background: "#fff",
                                boxShadow: "0 10px 25px rgba(0,0,0,.15)",
                              }}
                            />
                          </div>
                    
                        </div>
                      </div>
                    )}

                    {tabActiva === "turnoRecibido" && (
                      <div className="border border-gray-300 rounded bg-white overflow-hidden text-xs">

                        {/* HEADER */}
                        <div className="bg-gray-100 border-b px-4 py-2 font-semibold text-gray-600 text-sm font-semibold text-gray-600 mb-2">
                          Atender turno recibido
                        </div>

                        {/* FORMULARIO */}
                        <div className="p-4 space-y-5">

                          {/* FILA 1 */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                            <div>
                              <label className="block text-gray-500 mb-1">
                                Área remitente :
                              </label>

                              <div className="h-[42px] w-full border border-gray-300 rounded px-3 bg-gray-50 text-gray-700 flex items-center">
                                {docSeleccionadoPendientes.turnados?.at(-1)?.remitente?.area ||
                                  docSeleccionadoPendientes.remitente?.area ||
                                  docSeleccionadoPendientes.areaRemitente ||
                                  "Sin información"}
                              </div>
                            </div>

                            <div>
                              <label className="block text-gray-500 mb-1">
                                Remitente :
                              </label>

                              <div className="h-[42px] w-full border border-gray-300 rounded px-3 bg-gray-50 text-gray-700 flex items-center">
                                {safeText(
                                  docSeleccionadoPendientes.turnados?.at(-1)?.remitente?.name ||
                                    docSeleccionadoPendientes.remitente?.name ||
                                    docSeleccionadoPendientes.remitente,
                                  "Sin información"
                                )}
                              </div>
                            </div>

                            <div>
                              <label className="block text-gray-500 mb-1">
                                Instrucción :
                              </label>

                              <div className="h-[42px] w-full border border-gray-300 rounded px-3 bg-gray-50 text-gray-700 flex items-center">
                                {safeText(
                                  docSeleccionadoPendientes.turnados?.at(-1)?.instruccion?.descripcion ||
                                    docSeleccionadoPendientes.instruccion?.descripcion ||
                                    docSeleccionadoPendientes.instruccion,
                                  "Sin información"
                                )}
                              </div>
                            </div>

                          </div>

                          {/* FILA 2 */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                            <div>
                              <label className="block text-gray-500 mb-1">
                                Área destino :
                              </label>

                              <div className="h-[42px] w-full border border-gray-300 rounded px-3 bg-gray-50 text-gray-700 flex items-center">
                                {safeText(
                                  docSeleccionadoPendientes.turnados?.at(-1)?.areaDestino?.nombre ||
                                    docSeleccionadoPendientes.areaDestino?.nombre ||
                                    docSeleccionadoPendientes.areaDestino,
                                  "Sin información"
                                )}
                              </div>
                            </div>

                            <div>
                              <label className="block text-gray-500 mb-1">
                                Ejecutor :
                              </label>

                              <div className="h-[42px] w-full border border-gray-300 rounded px-3 bg-gray-50 text-gray-700 flex items-center">
                                {docSeleccionadoPendientes.turnados?.at(-1)?.dirigido?.nombre ||
                                  docSeleccionadoPendientes.ejecutor ||
                                  "Sin información"}
                              </div>
                            </div>

                          </div>

                          {/* FILA 2 */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                            <div>
                              <label className="block text-gray-500 mb-1">
                                Fecha de acuse :
                              </label>

                              <input
                                type="date"
                                value={formatDateForInput(docSeleccionadoPendientes.turnados?.at(-1)?.fechaAcuse || docSeleccionadoPendientes.fechaAcuse || docSeleccionadoPendientes.acuse) || ""}
                                disabled
                                className="h-[42px] w-full border border-gray-300 rounded px-3 bg-gray-50 text-gray-700"
                              />
                            </div>

                            {
                            docSeleccionadoPendientes?.turnados?.at(-1)?.compromiso ? (
                            <div>
                              <label className="block text-gray-500 mb-1">
                                Fecha de termino
                              </label>

                              <input
                                type="date"
                                value={docSeleccionadoPendientes?.turnados?.at(-1)?.compromiso ? formatDateForInput(docSeleccionadoPendientes?.turnados?.at(-1)?.compromiso) : "2023-07-10"}
                                disabled
                                className="h-[42px] w-full border border-gray-300 rounded px-3 bg-gray-50 text-gray-700"
                              />
                            </div>)
                            : null
                            }

                          </div>
                        </div>

                        {/* NOTAS DE ATENCIÓN */}
                        <div className="border-t">

                          {/* TÍTULO */}
                          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
                            <h2 className="text-sm font-semibold text-gray-600">
                              Notas de atención
                            </h2>
                          </div>

                          {/* CONTENIDO */}
                          <div className="p-4 space-y-4">

                            {/* TEXTAREA */}
                            <div>
                              <label className="block text-gray-500 mb-2 text-sm">
                                Notas
                              </label>

                              <textarea
                                value={docSeleccionadoPendientes.turnados?.at(-1)?.notas || docSeleccionadoPendientes.notas || ""}
                                onChange={(e) => setNotasAtencion(e.target.value)}
                                placeholder="Escriba aquí las notas relacionadas con la atención del turno..."
                                rows={5}
                                disabled
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-[#8B1538]/30 focus:border-[#8B1538]"
                              />

                            </div>

                            {/* SELECT + BOTÓN */}
                            <div className="flex flex-col md:flex-row gap-4 md:items-end">

                              {/* SELECT */}
                              <div className="w-full md:w-72">
                                <label className="block text-gray-500 mb-2 text-sm">
                                  Concluir turno
                                </label>

                                <select
                                  value={concluirTurno}
                                  onChange={(e) => setConcluirTurno(e.target.value)}
                                  className="w-full h-[42px] border border-gray-300 rounded-lg px-3 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1538]/30 focus:border-[#8B1538]"
                                >
                                  <option value="">
                                    Seleccionar opción
                                  </option>

                                  <option value="si">
                                    Sí, concluir turno
                                  </option>

                                  <option value="no">
                                    No concluir
                                  </option>
                                </select>
                              </div>

                              {/* BOTÓN */}
                              <button
                                className="h-[42px] px-6 bg-[#8B1538] hover:bg-[#74112F] text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm"
                              >
                                Guardar
                              </button>

                            </div>

                          </div>

                        </div>
                       {/* MENSAJES */}
                      <div className="border-t">

                        {/* TITULO */}
                        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
                          <h2 className="text-sm font-semibold text-gray-600">
                            Mensajes
                          </h2>
                        </div>

                        {/* TABLA */}
                        <div className="p-4 overflow-x-auto">

                        <div>
                          <button
                            onClick={abrirModalMensaje}
                            className="px-4 py-2 bg-[#8B1538] hover:bg-[#74112F] text-white rounded-lg text-sm font-medium transition"
                          >
                            Agregar mensaje
                          </button>
                        </div>

                          <table className="min-w-full border border-gray-200 text-xs mt-2">

                            <thead>
                              <tr className="bg-[#D8B2BC] text-white">
                                <th className="px-3 py-2 text-left border-r">
                                  Registrador del mensaje
                                </th>

                                <th className="px-3 py-2 text-left border-r">
                                  Documento anexo
                                </th>

                                <th className="px-3 py-2 text-left border-r">
                                  Número de documento
                                </th>

                                <th className="px-3 py-2 text-left">
                                  Mensaje
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {(docSeleccionadoPendientes?.respuestas || []).length > 0 ? (
                                docSeleccionadoPendientes.respuestas.map((respuesta, index) => (
                                  <tr key={index} className="border-b hover:bg-gray-50">
                                    <td className="px-3 py-3 text-gray-700 align-top">
                                      {respuesta.registrador.nombre}
                                    </td>
                                    <td className="px-3 py-3 align-top">
                                      {respuesta.ruta ? (
                                        <a
                                          href={`${import.meta.env.VITE_ARCHIVOS_PATH}${respuesta.ruta.replace(/^\.\./, '')}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="group flex items-center gap-2 px-3 py-2 rounded-lg border border-[#8B1538]/20 bg-[#8B1538]/5 hover:bg-[#8B1538] transition-all duration-200"
                                        >
                                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                            <Download size={16} className="text-[#8B1538] group-hover:text-[#8B1538]" />
                                          </div>

                                          <div className="flex flex-col items-start">
                                            <span className="text-[#8B1538] group-hover:text-white font-semibold text-xs">
                                              {respuesta.nombre || 'Archivo adjunto'}
                                            </span>

                                            <span className="text-[10px] text-gray-500 group-hover:text-pink-100">
                                              Descargar documento
                                            </span>
                                          </div>
                                        </a>
                                      ) : (
                                        <span className="text-gray-500 text-[11px]">Sin documento adjunto</span>
                                      )}
                                    </td>
                                    <td className="px-3 py-3 align-top">
                                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-100 text-red-700 text-[11px] font-medium">
                                        {respuesta.nombre || 'Respuesta'}
                                      </span>
                                    </td>
                                    <td className="px-3 py-3 text-gray-700 align-top">
                                      {respuesta.mensaje}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="4" className="px-3 py-4 text-center text-gray-500">
                                    No hay mensajes registrados.
                                  </td>
                                </tr>
                              )}
                            </tbody>

                          </table>

                        </div>
                      </div>  

                      <AnimatePresence>
                        {mostrarModalMensaje && (
                          <motion.div
                            className="fixed inset-0 z-[90] flex items-center justify-center p-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >

                            {/* BACKDROP */}
                            <motion.div
                              className="absolute inset-0 bg-black/40"
                              onClick={() => setMostrarModalMensaje(false)}
                            />

                            {/* MODAL */}
                            <motion.div
                              initial={{ scale: 0.95, y: 20, opacity: 0 }}
                              animate={{ scale: 1, y: 0, opacity: 1 }}
                              exit={{ scale: 0.95, y: 20, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden"
                            >

                              {/* HEADER */}
                              <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
                                <h2 className="text-base font-semibold text-gray-700">
                                  Agregar mensaje
                                </h2>

                                <button
                                  onClick={() => setMostrarModalMensaje(false)}
                                  className="text-gray-500 hover:text-red-600 text-lg"
                                >
                                  ✕
                                </button>
                              </div>

                              {/* BODY */}
                              <div className="p-6 space-y-5">

                                {/* MENSAJE */}
                                <div>
                                  <label className="block text-sm text-gray-600 mb-2">
                                    Mensaje:
                                  </label>

                                  <textarea
                                    value={modalMensajeTexto}
                                    onChange={(e) => setModalMensajeTexto(e.target.value)}
                                    rows={4}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#8B1538]/30 focus:border-[#8B1538]"
                                  />
                                </div>

                                {/* DOCUMENTO */}
                                <div>
                                  <label className="block text-sm text-gray-600 mb-2">
                                    Documento anexo :
                                  </label>

                                  <label className="inline-flex items-center gap-2 px-4 py-2 border rounded-md bg-gray-50 hover:bg-gray-100 cursor-pointer text-sm text-gray-700 transition">
                                    <Upload size={16} />

                                    Seleccionar Archivo

                                    <input
                                      type="file"
                                      className="hidden"
                                      onChange={(e) => setModalMensajeArchivo(e.target.files?.[0] || null)}
                                    />
                                  </label>
                                  {modalMensajeArchivo && (
                                    <p className="mt-2 text-sm text-gray-500">Archivo seleccionado: {modalMensajeArchivo.name}</p>
                                  )}
                                </div>

                                {/* NOMBRE DOC + FOLIO + BOTÓN */}
                                <div className="grid grid-cols-1 md:grid-cols-[1fr_100px_120px] gap-4 items-end">

                                  {/* NOMBRE */}
                                  <div>
                                    <label className="block text-sm text-gray-600 mb-2">
                                      Número de documento :
                                    </label>

                                    <textarea
                                      value={modalMensajeNombre}
                                      onChange={(e) => setModalMensajeNombre(e.target.value)}
                                      rows={2}
                                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#8B1538]/30 focus:border-[#8B1538]"
                                    />
                                  </div>

                                  {/* FOLIO */}
                                  <div>
                                    <input
                                      value={docSeleccionadoPendientes?.folio || docSeleccionado?.folio || ''}
                                      disabled
                                      className="w-full h-[42px] border border-gray-300 rounded-md px-3 bg-gray-100 text-sm text-gray-600"
                                    />
                                  </div>

                                  {/* BOTÓN */}
                                  <button
                                    onClick={handleGuardarMensajeModal}
                                    disabled={modalMensajeGuardando}
                                    className="h-[42px] bg-[#C1272D] hover:bg-[#a81f25] text-white rounded-md text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed"
                                  >
                                    {modalMensajeGuardando ? 'Guardando...' : 'Guardar'}
                                  </button>

                                </div>

                              </div>

                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      </div>
                    )}

                     {tabActiva === "respuestaValidar" && esValidador && (
                      <div className="border border-gray-300 rounded bg-white overflow-hidden text-xs space-y-4">

                        {/* HEADER */}
                      <div className="bg-gray-100 border-b px-4 py-2 text-sm font-semibold text-gray-600">
                        Validar respuesta
                      </div>

                      {/* CONTENIDO */}
                      <div className="p-4 space-y-5">

                        {/* FILA 1 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                          {/* ÁREA REMITENTE */}
                          <div>
                            <label className="block text-gray-500 mb-1">
                              Área remitente :
                            </label>

                            <div className="h-[42px] w-full border border-gray-300 rounded px-3 bg-gray-50 text-gray-700 flex items-center">
                              {docSeleccionadoPendientes.remitente?.area ||
                                docSeleccionadoPendientes.remitente?.dependencia ||
                                docSeleccionadoPendientes.areaRemitente ||
                                "No disponible"}
                            </div>
                          </div>

                          {/* REMITENTE */}
                          <div>
                            <label className="block text-gray-500 mb-1">
                              Remitente :
                            </label>

                            <div className="h-[42px] w-full border border-gray-300 rounded px-3 bg-gray-50 text-gray-700 flex items-center">
                              {safeText(
                                docSeleccionadoPendientes.remitente ||
                                  docSeleccionadoPendientes.remitenteInterno,
                                "No disponible"
                              )}
                            </div>
                          </div>

                          {/* INSTRUCCIÓN */}
                          <div>
                            <label className="block text-gray-500 mb-1">
                              Instrucción :
                            </label>

                            <div className="h-[42px] w-full border border-gray-300 rounded px-3 bg-gray-50 text-gray-700 flex items-center">
                              {safeText(
                                docSeleccionadoPendientes.instruccion?.descripcion ||
                                  docSeleccionadoPendientes.instruccion ||
                                  docSeleccionadoPendientes.turnados?.at(-1)?.instruccion?.descripcion ||
                                  docSeleccionadoPendientes.turnados?.at(-1)?.instruccion,
                                "No disponible"
                              )}
                            </div>
                          </div>

                        </div>

                        {/* FILA 2 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                          {/* ÁREA DESTINO */}
                          <div>
                            <label className="block text-gray-500 mb-1">
                              Área de destino :
                            </label>

                            <div className="h-[42px] w-full border border-gray-300 rounded px-3 bg-gray-50 text-gray-700 flex items-center">
                              {safeText(
                                docSeleccionadoPendientes.turnados?.at(-1)?.areaDestino?.nombre ||
                                  docSeleccionadoPendientes.areaDestino?.nombre ||
                                  docSeleccionadoPendientes.areaDestino ||
                                  docSeleccionadoPendientes.turnados?.at(-1)?.areaDestino,
                                "No disponible"
                              )}
                            </div>
                          </div>

                          {/* EJECUTOR */}
                          <div>
                            <label className="block text-gray-500 mb-1">
                              Ejecutor :
                            </label>

                            <div className="h-[42px] w-full border border-gray-300 rounded px-3 bg-gray-50 text-gray-700 flex items-center">
                              {docSeleccionadoPendientes.turnados?.at(-1)?.turna?.nombre ||
                                docSeleccionadoPendientes.turnados?.at(-1)?.turna?.name ||
                                docSeleccionadoPendientes.ejecutor ||
                                "No disponible"}
                            </div>
                          </div>

                        </div>

                        {/* FILA 3 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                          {/* FECHA ACUSE */}
                          <div>
                            <label className="block text-gray-500 mb-1">
                              Fecha acuse :
                            </label>

                            <input
                              type="date"
                              value={
                                formatDateForInput(docSeleccionadoPendientes.acuse) || ""
                              }
                              disabled
                              className="h-[42px] w-full border border-gray-300 rounded px-3 bg-gray-50 text-gray-700"
                            />
                          </div>

                          {/* FECHA COMPROMISO */}
                            {
                            docSeleccionadoPendientes?.turnados?.at(-1)?.compromiso ? (
                            <div>
                              <label className="block text-gray-500 mb-1">
                                Fecha de termino
                              </label>

                              <input
                                type="date"
                                value={docSeleccionadoPendientes?.turnados?.at(-1)?.compromiso ? formatDateForInput(docSeleccionadoPendientes?.turnados?.at(-1)?.compromiso) : "2023-07-10"}
                                disabled
                                className="h-[42px] w-full border border-gray-300 rounded px-3 bg-gray-50 text-gray-700"
                              />
                            </div>)
                            : null
                            }

                        </div>

                        {/* VALIDAR RESPUESTA */}
                        <div className="flex flex-col md:flex-row gap-4 md:items-end">

                          {/* SELECT */}
                          <div className="w-full md:w-72">
                            <label className="block text-gray-500 mb-2 text-sm">
                              Validar respuesta
                            </label>

                            <select
                              value={validacionRespuesta}
                              onChange={(e) => setValidacionRespuesta(e.target.value)}
                              className="w-full h-[42px] border border-gray-300 rounded-lg px-3 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1538]/30 focus:border-[#8B1538]"
                            >
                              <option value="">
                                Seleccionar opción
                              </option>

                              <option value="si">
                                Sí
                              </option>

                              <option value="no">
                                No
                              </option>
                            </select>
                          </div>

                          {/* BOTÓN */}
                          <button
                            onClick={guardarValidacion}
                            className="h-[42px] px-6 bg-[#8B1538] hover:bg-[#74112F] text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm"
                          >
                            Guardar
                          </button>

                        </div>

                      </div>

                      {/* MENSAJES */}
                      <div className="border-t">

                        {/* TITULO */}
                        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
                          <h2 className="text-sm font-semibold text-gray-600">
                            Mensajes
                          </h2>
                        </div>

                        {/* TABLA */}
                        <div className="p-4 overflow-x-auto">

                          {/* BOTÓN */}
                          <div className="mb-3">
                            <button
                              onClick={abrirModalMensaje}
                              className="px-4 py-2 bg-[#8B1538] hover:bg-[#74112F] text-white rounded-lg text-sm font-medium transition"
                            >
                              Agregar mensaje
                            </button>
                          </div>

                          <table className="min-w-full border border-gray-200 text-xs">

                            {/* HEADER */}
                            <thead>
                              <tr className="bg-[#D8B2BC] text-white">

                                <th className="px-3 py-2 text-center border-r w-[70px]">
                                  Eliminar
                                </th>

                                <th className="px-3 py-2 text-left border-r min-w-[220px]">
                                  Registrador del anexo y mensaje
                                </th>

                                <th className="px-3 py-2 text-left border-r min-w-[280px]">
                                  Mensaje
                                </th>

                                <th className="px-3 py-2 text-left border-r min-w-[220px]">
                                  Documento anexo
                                </th>

                                <th className="px-3 py-2 text-left min-w-[220px]">
                                  Número de documento
                                </th>

                              </tr>
                            </thead>

                            <tbody>
                              {(docSeleccionadoPendientes?.respuestas || []).length > 0 ? (
                                docSeleccionadoPendientes.respuestas.map((respuesta, index) => (
                                  <tr key={index} className="border-b hover:bg-gray-50">
                                {/* ELIMINAR */}
                                <td className="px-3 py-3 text-center align-top">
                                  <button
                                    className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-600 text-red-600 hover:text-white flex items-center justify-center transition"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </td>
                                    <td className="px-3 py-3 text-gray-700 align-top">
                                      {respuesta.registrador.nombre}
                                    </td>
                                    <td className="px-3 py-3 align-top">
                                      {respuesta.ruta ? (
                                        <a
                                          href={`${import.meta.env.VITE_ARCHIVOS_PATH}${respuesta.ruta.replace(/^\.\./, '')}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="group flex items-center gap-2 px-3 py-2 rounded-lg border border-[#8B1538]/20 bg-[#8B1538]/5 hover:bg-[#8B1538] transition-all duration-200"
                                        >
                                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                            <Download size={16} className="text-[#8B1538] group-hover:text-[#8B1538]" />
                                          </div>

                                          <div className="flex flex-col items-start">
                                            <span className="text-[#8B1538] group-hover:text-white font-semibold text-xs">
                                              {respuesta.nombre || 'Archivo adjunto'}
                                            </span>

                                            <span className="text-[10px] text-gray-500 group-hover:text-pink-100">
                                              Descargar documento
                                            </span>
                                          </div>
                                        </a>
                                      ) : (
                                        <span className="text-gray-500 text-[11px]">Sin documento adjunto</span>
                                      )}
                                    </td>
                                    <td className="px-3 py-3 align-top">
                                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-100 text-red-700 text-[11px] font-medium">
                                        {respuesta.nombre || 'Respuesta'}
                                      </span>
                                    </td>
                                    <td className="px-3 py-3 text-gray-700 align-top">
                                      {respuesta.mensaje}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="4" className="px-3 py-4 text-center text-gray-500">
                                    No hay mensajes registrados.
                                  </td>
                                </tr>
                              )}
                            </tbody>


                          </table>

                        </div>

                      </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
              
              {/* FOOTER ACCIÓN */}
              {esEjecutor && (
                <div className="border-t px-6 py-4 flex justify-end items-center bg-gray-50 shrink-0">

                  <button
                    onClick={moverASalidas}
                    className="group flex items-center gap-3 bg-[#8B1538] hover:bg-[#74112F] text-white px-5 py-2.5 rounded-lg transition-all duration-200 shadow-sm"
                  >
                    <span className="text-sm font-medium">
                      Continuar a salidas
                    </span>

                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                      <ArrowRight size={18} />
                    </div>
                  </button>

                </div>
              )}

              {/* FOOTER ACCIÓN VALIDADOR */}
              {esValidador && (
                <div className="border-t px-6 py-4 flex justify-end items-center bg-gray-50 shrink-0">

                  <button
                    onClick={validarRespuesta}
                    className="group flex items-center gap-3 bg-[#8B1538] hover:bg-[#74112F] text-white px-5 py-2.5 rounded-lg transition-all duration-200 shadow-sm"
                  >

                    <span className="text-sm font-medium">
                      Continuar
                    </span>

                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                      <ArrowRight size={18} />
                    </div>

                  </button>

                </div>
              )}
              
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
          {modalEditarAbierto && (
            <motion.div
              className="fixed inset-0 z-[70] flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="absolute inset-0 bg-black/40"
                onClick={() => setModalEditarAbierto(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />

              <motion.div
                className="relative bg-white w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex flex-col "
                initial={{ scale: 0.9, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 40 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                <div className="flex justify-between items-center bg-gray-400 px-4 py-2">
                  <span className="text-white text-sm">
                    Modificar registro: {documentoEditar?.folio || ""}
                  </span>
                  <button
                    onClick={() => setModalEditarAbierto(false)}
                    className="bg-[#8B1538] text-white p-2 rounded-full flex items-center justify-center"
                  >
                    <Minus size={16} />
                  </button>
                </div>

                <div className="flex border-b text-sm overflow-x-auto">
                  {[
                     {
                        id: "datosAsunto",
                        label: "Datos del registro",
                      },
                      {
                        id: "anexo",
                        label: "Anexos",
                      },
                      ...documentoEditar?.adicional?.tiene ? [{
                        id: "materialAdicional",
                        label: "Soporte adicional",
                      }] : [],
                      {
                        id: "verTurnos",
                        label: "Ver todos los turnos",
                      },
                      {
                        id: "copias",
                        label: "Copias de conocimiento",
                      },
                      {
                        id: "bitacora",
                        label: "Bitácora",
                      },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setTabActiva(tab.id)}
                      className={`px-4 py-2 whitespace-nowrap ${
                        tabActiva === tab.id
                          ? "border-b-2 border-[#8B1538] text-[#8B1538] font-semibold"
                          : "text-gray-600"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}

                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {tabActiva === "datosAsunto" && (
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-80">
                            <h2 className="text-sm font-semibold text-gray-600 mb-2">Ejercicio</h2>
                            <select name="ejercicio" value={formEditar.ejercicio} disabled onChange={handleChange} className="w-full border rounded px-2 py-1 bg-gray-100 cursor-not-allowed">
                              <option value="">Seleccionar</option>
                              <option value="2024">2024</option>
                              <option value="2025">2025</option>
                              <option value="2026">2026</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-sm font-semibold text-gray-600 mb-2">Datos generales</h2>
                          <div className="grid grid-cols-4 gap-4 items-end">
                            <div>
                              <label className="text-xs text-gray-500">No. de documento *</label>
                              <input name="noDocumento" value={formEditar.noDocumento} disabled className="w-full border rounded px-2 py-1 bg-gray-100 cursor-not-allowed" />
                            </div>

                            <div>
                              <label className="text-xs text-gray-500">Fecha de documento *</label>
                              <input type="date" name="fechaDocumento" value={formEditar.fechaDocumento} disabled className="w-full border rounded px-2 py-1 bg-gray-100 cursor-not-allowed" />
                            </div>

                            <div>
                              <label className="text-xs text-gray-500">Fecha de acuse *</label>
                              <input type="date" name="fechaAcuse" value={formEditar.fechaAcuse} disabled className="w-full border rounded px-2 py-1 bg-gray-100 cursor-not-allowed" />
                            </div>

                            <div>
                              <label className="text-xs text-gray-500">Fecha de registro *</label>
                              <input type="datetime-local" name="fechaRegistro" value={formEditar.fechaRegistro} disabled className="w-full border rounded px-2 py-1 bg-gray-100 cursor-not-allowed" />
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">Falta información:</span>
                              <Toggle checked={formEditar.faltaInformacion} onChange={handleToggleFaltaInformacion} />
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">Documento interno:</span>
                              <Toggle checked={formEditar.documentoInterno} onChange={(v) => setFormEditar((p) => ({ ...p, documentoInterno: v }))} />
                            </div>
                          </div>
                        </div>
                    

                        <div>
                          <h2 className="text-sm font-semibold text-gray-600 mt-2">Remitente</h2>
                          <div className="grid grid-cols-6 gap-4 items-end">
                            <div className="col-span-2">
                              <label className="text-xs text-gray-500">Tipo de remitente *</label>
                              <select name="tipoRemitente" value={formEditar.tipoRemitente} disabled className="w-full border rounded px-2 py-1 bg-gray-100 cursor-not-allowed">
                                <option value="">Seleccionar</option>
                                <option value="interno">Interno</option>
                                <option value="externo">Externo</option>
                              </select>
                            </div>

                            {formEditar.tipoRemitente === "interno" && (
                              <div className="col-span-2">
                                <label className="text-xs text-gray-500">Funcionario / Área *</label>
                                <select name="remitenteInterno" value={formEditar.remitenteInterno} onChange={handleChange} className={`w-full border rounded px-2 py-1 ${errores.remitenteInterno ? "border-red-500 bg-red-50" : ""}`}>
                                  <option value="">Seleccionar</option>
                                </select>
                              </div>
                            )}

                            {formEditar.tipoRemitente === "externo" && (
                              <div className="col-span-4">
                                <label className="text-xs text-gray-500">Selecciona remitente externo *</label>
                                <div className="flex items-center gap-3">
                                  <div ref={refRemitenteExt} className="flex-1 relative">
                                    <div className={`flex items-center border rounded px-2 ${errores.remitenteExterno ? "border-red-500 bg-red-50" : ""}`}>
                                      <Search size={16} className="text-gray-400" />
                                      <input
                                        className="w-full px-2 py-1 outline-none"
                                        placeholder="Buscar y seleccionar opción"
                                      />
                                    </div>

                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* DATOS ESPECÍFICOS */}
                        <div>
                          <h2 className="text-sm font-semibold text-gray-600 mt-2">
                            Datos específicos
                          </h2>

                          <div className="grid grid-cols-6 gap-4 items-end">

                            {/* Tipo documento con buscador */}
                            <div ref={refTipoDoc} className="col-span-2 relative">
                              <label className="text-xs text-gray-500">
                                Selecciona tipo de documento *
                              </label>
                              <div
                                className={`flex items-center border rounded px-2 ${
                                  errores.tipoDocumento ? "border-red-500 bg-red-50" : ""
                                }`}
                              >
                                <Search size={16} className="text-gray-400" />
                                <input
                                  value={busquedaTipoDoc}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    setBusquedaTipoDoc(value);
                                    setMostrarOpcionesTipoDoc(true);

                                    // 🔥 IMPORTANTE: limpiar selección real
                                    setFormEditar((prev) => ({
                                      ...prev,
                                      tipoDocumento: "",
                                    }));

                                    // validar si está vacío o no es válido
                                    setErrores((prev) => ({
                                      ...prev,
                                      tipoDocumento: !value.trim(),
                                    }));
                                  }}
                                  onFocus={() => setMostrarOpcionesTipoDoc(true)}
                                  className="w-full px-2 py-1 outline-none"
                                  placeholder="Buscar y seleccionar opción"

                                />
                              </div>

                              {mostrarOpcionesTipoDoc && (
                                <div className="absolute bg-white border w-full mt-1 max-h-40 overflow-y-auto z-10">
                                  {tiposFiltrados.map((t) => (
                                    <div
                                      key={t.value}
                                      onClick={() => {
                                        setFormEditar((prev) => ({
                                          ...prev,
                                          tipoDocumento: t.value,
                                        }));

                                        setBusquedaTipoDoc(t.label);
                                        setMostrarOpcionesTipoDoc(false);

                                        setErrores((prev) => ({
                                          ...prev,
                                          tipoDocumento: false,
                                        }));
                                      }}
                                      className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                                    >
                                      {t.label}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Toggle alta tipo */}
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                Alta tipo de documento:
                              </span>
                              <Toggle
                                checked={formEditar.altaTipoDocumento}
                                onChange={(v) => {
                                  setFormEditar({ ...formEditar, altaTipoDocumento: v });
                                  if (v) setMostrarModalTipoDocumento(true);
                                }}
                              />
                            </div>

                            {/* Relacionado */}
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-gray-500">Relacionado con:</span>
                              <Toggle
                                checked={formEditar.relacionadoCon}
                                onChange={(v) => {
                                  setFormEditar({ ...formEditar, relacionadoCon: v });

                                  if (v) {
                                    setMostrarModalRelacionado(true);
                                  } else {
                                    setMostrarModalRelacionado(false);

                                    // 👇 LIMPIAR ASUNTO
                                    setAsuntoSeleccionado(null);
                                    setBusquedaAsunto("");
                                  }
                                }}
                              />
                            </div>

                            {/* Asunto */}
                            <div className="col-span-2">
                              <label className="text-xs text-gray-500">Anexos</label>
                              <textarea
                                value={asuntoSeleccionado?.descripcion || ""}
                                disabled
                                className="w-full border rounded px-2 py-1 h-[34px] resize-none bg-gray-100 cursor-not-allowed"
                              />
                            </div>

                          </div>

                          <div className="grid grid-cols-4 gap-4 mt-4">

                            {/* Tema */}
                            <div>

                              <div ref={refTemaPrincipal} className="relative">
                                <label className="text-xs text-gray-500">
                                  Selecciona tema principal *
                                </label>

                                <div className={`flex items-center border rounded px-2 ${errores.temaPrincipal ? "border-red-500 bg-red-50" : ""
                                  }`}>
                                  <Search size={16} className="text-gray-400" />
                                  <input
                                    value={busquedaTemaPrincipal}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      setBusquedaTemaPrincipal(value);
                                      setMostrarOpcionesTemaPrincipal(true);

                                      setFormEditar((prev) => ({
                                        ...prev,
                                        temaPrincipal: "",
                                      }));

                                      setErrores((prev) => ({
                                        ...prev,
                                        temaPrincipal: !value.trim(),
                                      }));
                                    }}
                                    onFocus={() => setMostrarOpcionesTemaPrincipal(true)}
                                    className="w-full px-2 py-1 outline-none"
                                    placeholder="Buscar y seleccionar opción"
                                  />
                                </div>

                                {mostrarOpcionesTemaPrincipal && (
                                  <div className="absolute bg-white border w-full mt-1 max-h-40 overflow-y-auto z-10">
                                    {temasFiltradosPrincipal.length > 0 ? (
                                      temasFiltradosPrincipal.map((t) => (
                                        <div
                                          key={t.value}
                                          onClick={() => {
                                            setFormEditar({ ...formEditar, temaPrincipal: t.value });
                                            setBusquedaTemaPrincipal(t.label);
                                            setMostrarOpcionesTemaPrincipal(false);

                                            setErrores((prev) => ({
                                              ...prev,
                                              temaPrincipal: !t.value,
                                            }));
                                          }}
                                          className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                                        >
                                          {t.label}
                                        </div>
                                      ))
                                    ) : (
                                      <div className="px-2 py-1 text-gray-400">Sin resultados</div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div ref={refTemaSecundario} className="relative">
                              <label className="text-xs text-gray-500">
                                Tema secundario
                              </label>

                              <div className="flex items-center border rounded px-2">
                                <Search size={16} className="text-gray-400" />
                                <input
                                  value={busquedaTemaSecundario}
                                  onChange={(e) => {
                                    setBusquedaTemaSecundario(e.target.value);
                                    setMostrarOpcionesTemaSecundario(true);
                                  }}
                                  onFocus={() => setMostrarOpcionesTemaSecundario(true)}
                                  className="w-full px-2 py-1 outline-none"
                                  placeholder="Buscar y seleccionar opción"
                                />
                              </div>

                              {mostrarOpcionesTemaSecundario && (
                                <div className="absolute bg-white border w-full mt-1 max-h-40 overflow-y-auto z-10">
                                  {temasFiltradosSecundario.length > 0 ? (
                                    temasFiltradosSecundario.map((t) => (
                                      <div
                                        key={t.value}
                                        onClick={() => {
                                          setFormEditar({ ...formEditar, temaSecundario: t.value });
                                          setBusquedaTemaSecundario(t.label);
                                          setMostrarOpcionesTemaSecundario(false);
                                        }}
                                        className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                                      >
                                        {t.label}
                                      </div>
                                    ))
                                  ) : (
                                    <div className="px-2 py-1 text-gray-400">Sin resultados</div>
                                  )}
                                </div>
                              )}
                            </div>

                            <div ref={refMaterial} className="relative">
                              <label className="text-xs text-gray-500">
                                Selecciona material adicional
                              </label>

                              <div className="flex items-center border rounded px-2">
                                <Search size={16} className="text-gray-400" />
                                <input
                                  value={busquedaMaterial}
                                  onChange={(e) => {
                                    setBusquedaMaterial(e.target.value);
                                    setMostrarOpcionesMaterial(true);
                                  }}
                                  onFocus={() => setMostrarOpcionesMaterial(true)}
                                  className="w-full px-2 py-1 outline-none"
                                  placeholder="Buscar y seleccionar opción"
                                />
                              </div>

                              {mostrarOpcionesMaterial && (
                                <div className="absolute bg-white border w-full mt-1 max-h-40 overflow-y-auto z-10">
                                  {materialesFiltrados.length > 0 ? (
                                    materialesFiltrados.map((m) => (
                                      <div
                                        key={m.value}
                                        onClick={() => {
                                          setFormEditar({ ...formEditar, materialAdicional: m.value });
                                          setBusquedaMaterial(m.label);
                                          setMostrarOpcionesMaterial(false);
                                        }}
                                        className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                                      >
                                        {m.label}
                                      </div>
                                    ))
                                  ) : (
                                    <div className="px-2 py-1 text-gray-400">
                                      Sin resultados
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>


                            <div className="col-span-4">
                              <label className="text-xs text-gray-500">
                                Síntesis del asunto *
                              </label>
                              <textarea
                                name="sintesis"
                                value={formEditar.sintesis}
                                onChange={handleChange}
                                className={`w-full border rounded px-2 py-1 ${errores.sintesis ? "border-red-500 bg-red-50" : ""
                                  }`}
                              />
                            </div>

                            <div className="col-span-4">
                              <label className="text-xs text-gray-500">Observaciones</label>
                              <textarea className="w-full border rounded px-2 py-1" 
                              value={formEditar.observaciones}
                              onChange={handleChange}
                              />
                            </div>

                          </div>


                          {/* BOTÓN */}
                          <div className="flex justify-end">
                            <button
                              onClick={handleSave}
                              className="bg-[#79142A] text-white px-6 py-2 rounded"
                            >
                              Modificar
                            </button>
                          </div>

                        </div>

                      </div>

                    </div>

                  )}

                  {tabActiva === "anexo" && (
                      <div className="space-y-4">

                      <div className="flex items-center gap-2 mb-2">

                          
                          {/* 🔍 Buscador */}
                          <div className="flex-1 flex items-center border rounded px-2">
                            <Search size={16} className="text-gray-400" />
                           <input
                              value={busquedaSubirAnexo}
                              onChange={(e) => setBusquedaSubirAnexo(e.target.value)}
                              className="w-full px-2 py-2 outline-none text-sm"
                              placeholder="Buscar anexo..."
                            />

                          </div>

                        </div>

                        <h3 className="text-sm font-semibold text-gray-600 mb-2">
                        Sube archivos de anexos.
                      </h3>
                      
                       {/* Tabla de subir anexos */}                        
                        <div className="overflow-x-auto">
                          <table className="min-w-[900px] w-full text-xs border border-gray-200">

                            {/* 🔴 HEADER */}
                            <thead className="bg-[#8B1538] text-white">
                              <tr>
                                <th className="px-3 py-2 text-left">Eliminar</th>
                                <th className="px-3 py-2 text-left">Registrador</th>
                                <th className="px-3 py-2 text-left">Mensaje</th>
                                <th className="px-3 py-2 text-left">Archivo</th>
                                <th className="px-3 py-2 text-left">Número de documento</th>
                              </tr>
                            </thead>

                            {/* 🧾 BODY */}
                            <tbody>
                              {documentoAnexosFiltrados.length > 0 ? (
                                documentoAnexosFiltrados.map((anexo) => (
                                  <tr
                                    key={anexo._id || anexo.nombre}
                                    className="border-t hover:bg-gray-50"
                                  >
                                    {/* 🗑 ELIMINAR */}
                                    <td className="px-3 py-2">
                                      <button
                                        onClick={() => handleRemoveAnexo(anexo._id)}
                                        className="p-2 rounded hover:bg-red-100 text-gray-500 hover:text-red-600 transition"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </td>

                                    {/* 👤 REGISTRADOR */}
                                    <td className="px-3 py-2 text-gray-700">
                                      {anexo.registrador?.nombre ? anexo.registrador.nombre : "N/A"}
                                    </td>

                                    {/* 💬 MENSAJE */}
                                    <td className="px-3 py-2 text-gray-700">
                                      {anexo.mensaje || "Sin mensaje"}
                                    </td>

                                        {/* BOTÓN ARCHIVO */} 
                                        <td className="px-3 py-2"> 
                                          <button 
                                          title="Ver archivo"
                                          onClick={() => { 
                                            console.log("Ruta del anexo:", anexo.ruta); 
                                            openAnexo(anexo);
                                          }} 
                                          className="bg-[#8B1538] text-white px-3 py-1 rounded text-xs hover:opacity-90 flex items-center gap-2" > 
                                            <Eye size={14} /> 
                                          </button> 
                                        </td>


                                    {/* 📑 NOMBRE */}
                                    <td className="px-3 py-2 text-gray-700 truncate max-w-[300px]">
                                      {anexo.nombre || "Sin nombre"}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={5} className="text-center py-4 text-gray-400">
                                    Sin resultados
                                  </td>
                                </tr>
                              )}
                            </tbody>

                          </table>
                        </div>

                        <div className="flex items-center gap-2 mb-2">


                          {/* 🔍 Buscador */}
                          <div className="flex-1 flex items-center border rounded px-2">
                            <Search size={16} className="text-gray-400" />
                            <input
                              value={busquedaVerTurnos}
                              onChange={(e) => setBusquedaVerTurnos(e.target.value)}
                              className="w-full px-2 py-2 outline-none text-sm"
                              placeholder="Buscar documento relacionado..."
                            />
                          </div>

                        </div>

                        <h3 className="text-sm font-semibold text-gray-600 mb-2">
                        Documentos relacionados al registro.
                      </h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm border border-gray-200">
                            <thead className="bg-[#8B1538] text-white">
                              <tr>
                                <th className="px-4 py-2 text-left">Folio</th>
                                <th className="px-4 py-2 text-left">DocId</th>
                                <th className="px-4 py-2 text-left">Remitente</th>
                                <th className="px-4 py-2 text-left">Asunto</th>
                                <th className="px-4 py-2 text-left">Eliminar</th>
                              </tr>
                            </thead>

                            <tbody>
                              {relacionadosFiltrados.length > 0 ? (
                                relacionadosFiltrados.map((relacionado) => (
                                  <tr
                                    key={relacionado.value}
                                    className="border-t hover:bg-gray-50"
                                  >
                                    <td className="px-4 py-2 text-gray-700">{relacionado.folio || 'Sin folio'}</td>
                                    <td className="px-4 py-2 text-gray-700">{relacionado.docId || 'Sin docId'}</td>
                                    <td className="px-4 py-2 text-gray-700">{relacionado.remitente || 'N/A'}</td>
                                    <td className="px-4 py-2 text-gray-700">{relacionado.asunto || 'Sin asunto'}</td>
                                    <td className="px-4 py-2">
                                      <button
                                        onClick={() => handleRemoveRelacionado(relacionado.value)}
                                        className="text-red-500 hover:text-red-700 transition"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={5} className="text-center py-4 text-gray-400">
                                    Sin documentos relacionados
                                  </td>
                                </tr>
                              )}
                            </tbody>

                          </table>
                        </div>

                        {/* Paginación estilo pequeño */}
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <div className="flex gap-2">
                            <button className="px-2 py-1 border rounded disabled:opacity-40">
                              &lt;
                            </button>
                            <button className="px-2 py-1 border rounded bg-gray-100">
                              1
                            </button>
                            <button className="px-2 py-1 border rounded disabled:opacity-40">
                              &gt;
                            </button>
                          </div>
                        </div>

                      {/* MODAL SUBIR ANEXO */}
                      <AnimatePresence>
                        {mostrarModalSubirAnexo && (
                          <motion.div
                            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <motion.div
                              className="bg-white w-[500px] rounded-lg shadow-lg p-6"
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.8, opacity: 0 }}
                            >
                              {/* Header */}
                              <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">Agregar anexo</h2>

                                <button
                                  onClick={() => setMostrarModalSubirAnexo(false)}
                                  className="bg-[#79142A]  text-white hover:bg-[#79142A]/80 rounded-full p-1 transition"
                                >
                                  <Minus size={18} />
                                </button>
                              </div>

                              {/* Mensaje */}
                              <div className="mb-4">
                                <label className="block text-sm mb-1">Mensaje:</label>
                                <textarea
                                  value={mensaje}
                                  onChange={(e) => setMensaje(e.target.value)}
                                  className={`w-full border rounded p-2 ${
                                    erroresAnexos.mensaje ? "border-red-500 bg-red-50" : ""
                                  }`}
                                  rows="3"
                                />
                              </div>

                              {/* Documento */}
                              <div className="mb-4">
                                <label className="block text-sm mb-2 font-medium">
                                  Documento anexo:
                                </label>

                                {/* Input oculto */}
                                <input
                                  ref={inputRef}
                                  type="file"
                                  id="fileUpload"
                                  className="hidden"
                                  onChange={(e) => setArchivo(e.target.files[0])}
                                />

                                {/* Zona Drag & Drop */}
                                <label
                                  htmlFor="fileUpload"
                                  onDragOver={(e) => {
                                    e.preventDefault();
                                    setDragActivo(true);
                                  }}
                                  onDragLeave={() => setDragActivo(false)}
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    setDragActivo(false);
                                    const file = e.dataTransfer.files[0];
                                    if (file) setArchivo(file);
                                  }}
                                  className={`relative flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-6 cursor-pointer transition  ${
                                    erroresAnexos.archivo
                                      ? "border-red-500 bg-red-50"
                                      : dragActivo
                                      ? "border-[#8B1538] bg-red-50"
                                      : "border-gray-300 hover:border-[#8B1538] hover:bg-gray-50"
                                  }`}
                                >
                                  {/* Botón eliminar */}
                                  {archivo && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault(); // evita abrir el file picker
                                        eliminarArchivo();
                                      }}
                                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                    >
                                      <X size={14} />
                                    </button>
                                  )}

                                  <Upload size={28} className="text-[#8B1538]" />

                                  <p className="text-sm text-gray-600">
                                    {archivo ? archivo.name : "Haz clic o arrastra un archivo aquí"}
                                  </p>

                                  <span className="text-xs text-gray-400">
                                    PDF, DOC, JPG (máx. 5MB)
                                  </span>
                                </label>
                              </div>

                              {/* Número de documento */}
                              <div className="mb-4">
                                <label className="block text-sm mb-1">Número de documento:</label>
                                <input
                                  type="text"
                                  value={nombreDoc}
                                  onChange={(e) => setNombreDoc(e.target.value)}
                                  className={`w-full border rounded p-2 ${
                                    erroresAnexos.nombreDoc ? "border-red-500 bg-red-50" : ""
                                  }`}
                                />
                              </div>

                              {/* Botones */}
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setMostrarModalSubirAnexo(false)}
                                  className="px-4 py-2 bg-gray-300 rounded"
                                >
                                  Cancelar
                                </button>

                                <button
                                  onClick={handleUploadAnexo}
                                  className="px-4 py-2 bg-[#8B1538] text-white rounded"
                                >
                                  Guardar
                                </button>

                              </div>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <AnimatePresence>
                        {mostrarModalAnexos && (
                          <motion.div
                            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <motion.div
                              className="bg-white w-[600px] rounded-lg shadow-lg p-6"
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0.8 }}
                            >
                              {/* Header */}
                              <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Seleccionar anexos</h2>

                                <button
                                  onClick={() => setMostrarModalAnexos(false)}
                                  className="bg-[#8B1538] text-white rounded-full p-1"
                                >
                                   <Minus size={16} />
                                </button>
                              </div>

                              {/* Lista */}
                              <div className="max-h-[300px] overflow-y-auto border rounded">
                                {anexosDisponibles.map((anexo) => (
                                  <div
                                    key={anexo.id}
                                    className="flex items-center justify-between px-4 py-2 border-b hover:bg-gray-50"
                                  >
                                    <div>
                                      <p className="text-sm font-medium">{anexo.nombre}</p>
                                      <p className="text-xs text-gray-500">{anexo.folio}</p>
                                    </div>

                                    <button
                                      onClick={() => {
                                        // evitar duplicados
                                        const existe = anexosSeleccionados.some(
                                          (a) => a.id === anexo.id
                                        );

                                        if (!existe) {
                                          setAnexosSeleccionados([
                                            ...anexosSeleccionados,
                                            anexo,
                                          ]);
                                        }
                                      }}
                                      className="bg-[#8B1538] text-white px-3 py-1 rounded text-xs"
                                    >
                                      Añadir
                                    </button>
                                  </div>
                                ))}
                              </div>

                              {/* Footer */}
                              <div className="flex justify-end mt-4">
                                <button
                                  onClick={() => setMostrarModalAnexos(false)}
                                  className="bg-gray-300 px-4 py-2 rounded"
                                >
                                  Cerrar
                                </button>
                              </div>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>


                      </div>
                      
                    )}

                    {tabActiva === "materialAdicional" && (
                    <div className="space-y-4">

                      {/* 🔥 HEADER */}
                      <div className="flex items-center gap-2 mb-2">

                        {/* Botón añadir */}
                        <button
                          onClick={() => setMostrarModalMaterial(true)}
                          className="bg-[#8B1538] text-white px-4 py-2 rounded shadow hover:opacity-90"
                        >
                          Añadir material adicional
                        </button>

                        {/* 🔍 Buscador */}
                        <div className="flex-1 flex items-center border rounded px-2">
                          <Search size={16} className="text-gray-400" />
                          <input
                            value={busquedaMaterial}
                            onChange={(e) => setBusquedaMaterial(e.target.value)}
                            className="w-full px-2 py-2 outline-none text-sm"
                            placeholder="Buscar material..."
                          />
                        </div>

                      </div>

                      {/* 🧾 TABLA */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border border-gray-200">

                          <thead className="bg-[#8B1538] text-white">
                            <tr>
                              <th className="px-4 py-2 text-left">Eliminar</th>
                              <th className="px-4 py-2 text-left">Tipo de material</th>
                              <th className="px-4 py-2 text-left">Descripción</th>
                              <th className="px-4 py-2 text-left">Registrador</th>
                            </tr>
                          </thead>

                          <tbody>
                            {materialesAdicionalesFiltrados.length > 0 ? (
                              materialesAdicionalesFiltrados.map((material) => (
                                <tr key={material.id} className="border-t hover:bg-gray-50">

                                  {/* 🗑 ELIMINAR */}
                                  <td className="px-4 py-2">
                                    <button
                                      onClick={() => {
                                        setMateriales((prev) =>
                                          prev.filter((m) => m.id !== material.id)
                                        );
                                      }}
                                      className="p-2 rounded hover:bg-red-100 text-gray-500 hover:text-red-600 transition"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </td>

                                  <td className="px-4 py-2 text-gray-700">
                                    {material.tipo}
                                  </td>

                                  <td className="px-4 py-2 text-gray-700">
                                    {material.descripcion}
                                  </td>

                                  <td className="px-4 py-2 text-gray-700">
                                    {material.registrador}
                                  </td>

                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={4} className="text-center py-4 text-gray-400">
                                  Sin materiales adicionales
                                </td>
                              </tr>
                            )}
                          </tbody>

                        </table>
                      </div>

                      <AnimatePresence>
                        {mostrarModalMaterial && (
                          <motion.div
                            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <motion.div
                              className="bg-white w-[400px] rounded-lg shadow-lg p-6"
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.8, opacity: 0 }}
                            >
                              {/* Header */}
                              <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">
                                  Agregar material adicional
                                </h2>

                                <button
                                  onClick={() => setMostrarModalMaterial(false)}
                                  className="bg-[#8B1538] text-white rounded-full p-1"
                                >
                                  <Minus size={16} />
                                </button>
                              </div>

                              {/* Tipo */}
                              <div className="mb-3">
                                <label className="block text-sm mb-1">Tipo de material</label>
                                <input
                                  type="text"
                                  value={nuevoMaterial.tipo}
                                  onChange={(e) =>
                                    setNuevoMaterial({ ...nuevoMaterial, tipo: e.target.value })
                                  }
                                  className="w-full border rounded p-2"
                                  placeholder="Ej. USB, CD, Documento físico..."
                                />
                              </div>

                              {/* Descripción */}
                              <div className="mb-4">
                                <label className="block text-sm mb-1">Descripción</label>
                                <textarea
                                  value={nuevoMaterial.descripcion}
                                  onChange={(e) =>
                                    setNuevoMaterial({
                                      ...nuevoMaterial,
                                      descripcion: e.target.value,
                                    })
                                  }
                                  className="w-full border rounded p-2"
                                  rows="3"
                                />
                              </div>

                              {/* Botones */}
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setMostrarModalMaterial(false)}
                                  className="px-4 py-2 bg-gray-300 rounded"
                                >
                                  Cancelar
                                </button>

                                <button
                                  onClick={async () => {
                                    // Validación
                                    if (!nuevoMaterial.tipo || !nuevoMaterial.descripcion) {
                                      Swal.fire({
                                        toast: true,
                                        position: "top-end",
                                        icon: "warning",
                                        title: "Todos los campos son obligatorios",
                                        showConfirmButton: false,
                                        timer: 2500,
                                      });
                                      return;
                                    }

                                    // Confirmación
                                    const result = await Swal.fire({
                                      title: "¿Agregar material?",
                                      text: "Se añadirá el material adicional al registro.",
                                      icon: "question",
                                      showCancelButton: true,
                                      confirmButtonText: "Sí, agregar",
                                      cancelButtonText: "Cancelar",
                                      confirmButtonColor: "#8B1538",
                                      cancelButtonColor: "#6B7280",
                                    });

                                    if (result.isConfirmed) {
                                      const nuevo = {
                                        id: Date.now(),
                                        ...nuevoMaterial,
                                        registrador: "Usuario actual",
                                      };

                                      setMateriales((prev) => [...prev, nuevo]);

                                      // Éxito
                                      await Swal.fire({
                                        icon: "success",
                                        title: "Material agregado",
                                        text: "Se agregó correctamente.",
                                        confirmButtonColor: "#8B1538",
                                      });

                                      // limpiar y cerrar
                                      setNuevoMaterial({ tipo: "", descripcion: "" });
                                      setMostrarModalMaterial(false);
                                    }
                                  }}
                                  className="px-4 py-2 bg-[#8B1538] text-white rounded"
                                >
                                  Guardar
                                </button>

                              </div>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </div>
                  )}

                    
                  {tabActiva === "turnar" && (
                    <div className="space-y-4">
                      
                      {/* Botón agregar */}
                      <div className="flex justify-start">
                        <button
                          onClick={() => setMostrarModalCopias(true)}
                          className="bg-[#8B1538] text-white w-10 h-10 rounded-full text-xl flex items-center justify-center shadow hover:opacity-90"
                        >
                          +
                        </button>
                      </div>

                      {/* Tabla */}
                      <div className="overflow-x-auto">
                        <table className="min-w-[1100px] w-full text-xs border border-gray-200">
                          <thead className="bg-[#8B1538] text-white">
                            <tr>
                              <th className="px-3 py-2 text-left">Instrucción</th>
                              <th className="px-3 py-2 text-left">Funcionario que remite</th>
                              <th className="px-3 py-2 text-left">Área de destino</th>
                              <th className="px-3 py-2 text-left">Dirigido a</th>
                              <th className="px-3 py-2 text-left">Prioridad</th>
                              <th className="px-3 py-2 text-left">Fecha de termino</th>
                              <th className="px-3 py-2 text-left">Quién lo turna</th>
                            </tr>
                          </thead>

                          <tbody>
                            {/* Datos simulados */}
                            {[].length > 0 ? (
                              [].map((item, index) => (
                                <tr key={index} className="border-t hover:bg-gray-50">
                                  <td className="px-3 py-2">{item.instruccion}</td>
                                  <td className="px-3 py-2">{item.funcionario}</td>
                                  <td className="px-3 py-2">{item.areaDestino}</td>
                                  <td className="px-3 py-2">{item.dirigidoA}</td>
                                  <td className="px-3 py-2">{item.prioridad}</td>
                                  <td className="px-3 py-2">{item.fecha}</td>
                                  <td className="px-3 py-2">{item.quienTurna}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={7} className="text-center py-4 text-gray-400">
                                  Sin datos en la tabla.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                    </div>
                  )}
                  
                   {tabActiva === "verTurnos" && (
                      <div className="space-y-4">
                        <div className="overflow-x-auto">
                          <div className="flex items-center gap-2 mb-4">

                          {/* BOTÓN AÑADIR TURNO */}
                          <button
                            onClick={() => {
                              setDocumentoEditar(docSeleccionadoPendientes || docSeleccionado || documentoSeleccionado);
                              loadCatalogos();
                              setMostrarModalTurno(true);
                            }}
                            className="bg-[#8B1538] text-white px-4 py-2 rounded flex items-center gap-2 shadow hover:opacity-90"
                          >
                            Añadir turno
                          </button>

                          {/* 🔍 BUSCADOR */}
                          <div className="flex-1 flex items-center border rounded px-2">
                            <Search size={16} className="text-gray-400" />
                            <input
                              value={busquedaVerTurnos}
                              onChange={(e) => setBusquedaVerTurnos(e.target.value)}
                              className="w-full px-2 py-2 outline-none"
                              placeholder="Buscar turno..."
                            />
                          </div>

                        </div>
                          <table className="min-w-[1200px] w-full text-xs border border-gray-200">
                            <thead className="bg-[#8B1538] text-white">
                              <tr>
                                <th className="px-3 py-2 text-left">
                                  Instrucción
                                </th>
                                <th className="px-3 py-2 text-left">
                                  Funcionario que turna
                                </th>
                                <th className="px-3 py-2 text-left">
                                  Área de destino
                                </th>
                                <th className="px-3 py-2 text-left">
                                  Prioridad
                                </th>
                                <th className="px-3 py-2 text-left">
                                  Fecha de termino
                                </th>
                                <th className="px-3 py-2 text-left">
                                  Área que turna
                                </th>
                                <th className="px-3 py-2 text-left">
                                  Quién lo turna
                                </th>
                                <th className="px-3 py-2 text-left">
                                  Estatus
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {turnosVerFiltrados.length > 0 ? (
                                turnosVerFiltrados.map((turno, index) => (
                                  <tr
                                    key={index}
                                    className="border-t hover:bg-gray-50"
                                  >
                                    <td className="px-3 py-2 text-gray-700">
                                      {turno.instruccion?.descripcion || turno.instruccion?.label || turno.instruccion || "Sin instrucción"}
                                    </td>
                                    <td className="px-3 py-2 text-gray-700">
                                      {turno.dirigido?.nombre || turno.remitente?.label || turno.remitente || "-"}
                                    </td>
                                    <td className="px-3 py-2 text-gray-700">
                                      {turno.areaDestino?.nombre || turno.areaDestino?.label || turno.areaDestino || "Sin área"}
                                    </td>
                                    <td className="px-3 py-2 text-gray-700">{turno.prioridad || "-"}</td>
                                    <td className="px-3 py-2 text-gray-700">
                                      {turno.compromiso ? formatDateValue(turno.compromiso) : turno.fechaTurnado ? formatDateValue(turno.fechaTurnado) : "-"}
                                    </td>
                                    <td className="px-3 py-2 text-gray-700">
                                      {turno.dirigido?.area || "-"}
                                    </td>
                                    <td className="px-3 py-2 text-gray-700">
                                      {turno.turna?.nombre || turno.turna?.label || turno.turna || "-"}
                                    </td>
                                    <td className="px-3 py-2 font-medium">{turno.status || "Pendiente"}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan={8}
                                    className="text-center py-4 text-gray-400"
                                  >
                                    Sin datos en la tabla.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Paginación pequeña inferior */}
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <div className="flex gap-2">
                            <button className="px-2 py-1 border rounded disabled:opacity-40">
                              &lt;
                            </button>
                            <button className="px-2 py-1 border rounded bg-gray-100">
                              1
                            </button>
                            <button className="px-2 py-1 border rounded disabled:opacity-40">
                              &gt;
                            </button>
                          </div>
                        </div>

                        {mostrarModalTurno && (
                          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                            <div className="bg-white w-[900px] max-h-[90vh] overflow-y-auto rounded-lg shadow-lg p-6 relative">

                              {/* Cerrar */}
                              <button
                                onClick={() => setMostrarModalTurno(false)}
                                className="absolute top-3 right-3 bg-[#8B1538] text-white p-2 rounded-full shadow hover:opacity-90 transition"
                              >
                                <Minus size={16} />
                              </button>

                              <h2 className="text-lg font-semibold mb-4">Alta de instrucción</h2>

                              <div className="grid grid-cols-2 gap-4 text-sm">

                                {/* Instrucción */}
                                <div className="col-span-2">
                                  <label>Instrucción*</label>
                                  <select
                                    value={form.instruccion}
                                    onChange={(e) => setForm({ ...form, instruccion: e.target.value })}
                                    className={`w-full border rounded px-3 py-2 ${erroresTurno.instruccion ? "border-red-500" : "border-gray-300"}`}
                                  >
                                    <option value="">Seleccionar</option>
                                    {instrucciones.map((inst) => (
                                      <option key={inst.value} value={inst.value}>
                                        {inst.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Área destino */}
                                <div>
                                  <label>Área de destino*</label>
                                  <select
                                    value={form.areaDestino}
                                    onChange={(e) => setForm({ ...form, areaDestino: e.target.value })}
                                    className={`w-full border rounded px-3 py-2 ${erroresTurno.areaDestino ? "border-red-500" : "border-gray-300"}`}
                                  >
                                    <option value="">Seleccionar</option>
                                    {areas.map((area) => (
                                      <option key={area.value} value={area.value}>
                                        {area.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Dirigido a */}
                                <div className="col-span-2">
                                  <label>Dirigido a</label>
                                  <select
                                    value={form.dirigido}
                                    onChange={(e) => setForm({ ...form, dirigido: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                  >
                                    <option value="">Seleccionar</option>
                                    {usuarios.map((user) => ( form.areaDestino === user.areaId && (
                                      <option key={user.value} value={user.value}>
                                        {user.label}
                                      </option>
                                    )))}
                                  </select>
                                </div>

                                {/* Prioridad */}
                                <div>
                                  <label>Prioridad*</label>
                                  <select
                                    value={form.prioridad}
                                    onChange={(e) => setForm({ ...form, prioridad: e.target.value })}
                                    className={`w-full border rounded px-3 py-2 ${erroresTurno.prioridad ? "border-red-500" : "border-gray-300"}`}
                                  >
                                    <option value="">Seleccionar</option>
                                    <option value="Urgente">Con fecha de termino</option>
                                    <option value="Normal">Normal</option>
                                  </select>
                                </div>

                                {/* Fecha */}
                                {form.prioridad === "Urgente" && (
                                <div>
                                  <label>Fecha de termino*</label>
                                  <input
                                    type="date"
                                    value={form.fecha}
                                    onChange={(e) =>
                                      setForm({ ...form, fecha: e.target.value })
                                    }
                                    className={`w-full border rounded px-3 py-2 ${
                                      errores.fecha ? "border-red-500" : "border-gray-300"
                                    }`}
                                  />

                                </div>) || null}

                                {/* Notas */}
                                <div className="col-span-2">
                                  <label>Notas</label>
                                  <textarea
                                    value={form.notas}
                                    onChange={(e) => setForm({ ...form, notas: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                  />
                                </div>

                              </div>

                              {/* Botón guardar */}
                              <div className="flex justify-end mt-6">
                                <button
                                  onClick={handleGuardarAltaInstruccion}
                                  className="bg-[#8B1538] text-white px-6 py-2 rounded hover:opacity-90"
                                >
                                  Guardar
                                </button>

                              </div>

                            </div>
                          </div>
                        )}

                      </div>
                      
                    )}

                  {tabActiva === "copias" && (
                      <div className="space-y-4">
                        {/* Botón agregar */}
                        <div className="flex justify-start">
                          <button
                             className="bg-[#8B1538] text-white px-4 py-2 rounded flex items-center gap-2 shadow hover:opacity-90"
                          >
                            Añadir funcionario
                          </button>
                        </div>
                        {/* TABLA */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm border border-gray-200">
                            <thead className="bg-[#8B1538] text-white">
                              <tr>
                                <th className="px-4 py-2 text-left">Eliminar</th>
                                <th className="px-4 py-2 text-left">Funcionario</th>
                              </tr>
                            </thead>

                            <tbody>
                              {copiasDocumento.length > 0 ? (
                                copiasDocumento.map((copia, index) => (
                                  <tr
                                    key={copia._id || index}
                                    className="border-t hover:bg-gray-50"
                                  >
                                    <td className="px-4 py-2">
                                      <button
                                        onClick={() => {
                                          setCopiasDocumento((prev) => prev.filter((_, i) => i !== index));
                                        }}
                                        className="text-red-500 hover:text-red-700 transition"
                                        title="Eliminar"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </td>

                                    <td className="px-4 py-2 text-gray-700">
                                      {copia.funcionario?.nombre || copia.funcionario?.label || copia.funcionario || "Sin funcionario"}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={2} className="text-center py-4 text-gray-400">
                                    Sin copias registradas
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* PAGINACIÓN */}
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <div className="flex gap-2">
                            <button className="px-2 py-1 border rounded disabled:opacity-40">
                              &lt;
                            </button>

                            <button className="px-2 py-1 border rounded bg-[#8B1538] text-white">
                              1
                            </button>

                            <button className="px-2 py-1 border rounded disabled:opacity-40">
                              &gt;
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                  
                    {tabActiva === "bitacora" && (
                      <div className="w-full flex justify-center bg-[#2f2f2f] py-6">
                        <div className="w-full max-w-4xl">
                    
                          {/* Barra visor */}
                          <div className="bg-[#3a3a3a] text-white px-4 py-2 flex items-center justify-between rounded-t-lg no-print">
                    
                            <div className="flex items-center gap-3">
                              <button onClick={descargarBitacora}
                                  className="bg-[#8B1538] hover:bg-[#a61c45] px-3 py-1 rounded text-sm" >
                                 ⬇ Descargar
                              </button>
                              <button
                                onClick={handlePrint}
                                className="bg-[#8B1538] hover:bg-[#a61c45] px-3 py-1 rounded text-sm"
                              >
                                 🖨 Imprimir Bitácora
                              </button>
                            </div>
                    
                            <div className="flex items-center gap-3 text-sm">
                              <button className="px-2">◀</button>
                              <span>Página 1 de 2</span>
                              <button className="px-2">▶</button>
                            </div>
                    
                            <div className="flex items-center gap-2">
                              <button className="bg-[#8B1538] px-2 py-1 rounded text-sm">➖</button>
                              <button className="bg-[#8B1538] px-2 py-1 rounded text-sm">➕</button>
                            </div>
                          </div>
                    
                          {/* Hoja */}
                          <div ref={bitacoraRef} className="zona-impresion">
                            <div className="bg-white shadow-xl rounded-b-lg overflow-hidden">
                      
                              <div className="text-center py-6 border-b">
                                <h2 className="text-xl font-bold text-gray-800">
                                  Bitácora
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                  Folio: {documentoSeleccionado?.folio}
                                </p>
                              </div>
                      
                              <div className="p-6 space-y-4">
                      
                                {bitacoraDocumento.length ? (
                                  bitacoraDocumento.map((movimiento, index) => {
                                    const esPrincipal =
                                      movimiento.importancia === "Alta";
                      
                                    return (
                                      <div
                                        key={index}
                                        className={`rounded-xl px-4 py-3 text-sm flex justify-between items-start
                                        ${esPrincipal
                                          ? "bg-[#79142A] text-white"
                                          : "bg-[#CDB19C] text-gray-800"
                                        }`}
                                      >
                                        <div>
                                          <p className="font-semibold">
                                            {movimiento.user.nombre}
                                          </p>
                      
                                          <p className={`text-xs mt-1 ${esPrincipal ? "opacity-90" : ""}`}>
                                            {movimiento.descripcion}
                                          </p>
                                        </div>
                      
                                        <div className="text-right text-xs whitespace-nowrap">
                                          <p>Fecha: {formatDateValue(movimiento.fecha)}</p>
                                          <p>Hora: {// Obtener solo la hora en formato HH:mm
                                            new Date(movimiento.fecha).toLocaleTimeString([], {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })
                                          }</p>
                                        </div>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <div className="text-center text-gray-500 text-sm">
                                    No hay movimientos registrados.
                                  </div>
                                )}
                              </div>
                            </div>
 
                          </div>
                    
                        </div>
                      </div>
                    )}

                  </div>
              </motion.div>

            </motion.div>
          )}
      </AnimatePresence>

    </AnimatePresence>

    {/* Modal visor global */}
    <AnimatePresence>
      {mostrarVisor && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white w-[80%] h-[80%] rounded-lg shadow-lg p-4 relative"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
          >
            <button
              onClick={() => setMostrarVisor(false)}
              className="absolute top-2 right-2 bg-[#8B1538] hover:bg-[#74112F] text-white rounded-full p-1 transition"
            >
              <Minus size={18} />
            </button>

            <div className="w-full h-full flex items-center justify-center">
              {typeof archivoVista === "string" ? (
                archivoVista.endsWith(".pdf") ? (
                  <iframe
                    src={archivoVista}
                    className="w-full h-full rounded"
                  />
                ) : (
                  <img
                    src={archivoVista}
                    alt="preview"
                    className="max-h-full rounded"
                  />
                )
              ) : archivoVista?.type?.includes("image") ? (
                <img
                  src={URL.createObjectURL(archivoVista)}
                  alt="preview"
                  className="max-h-full rounded"
                />
              ) : archivoVista?.type === "application/pdf" ? (
                <iframe
                  src={URL.createObjectURL(archivoVista)}
                  className="w-full h-full rounded"
                />
              ) : (
                <p className="text-gray-500">
                  No se puede previsualizar este archivo
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    </div>
  );
}
