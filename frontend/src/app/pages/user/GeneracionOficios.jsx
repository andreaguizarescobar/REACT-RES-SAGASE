import { AnimatePresence, motion } from "framer-motion";
import { Minus, Search, Loader2, Bold, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import jsPDF from "jspdf";
import { getFondos } from "../../services/fondo.service";
import { getRemitentes } from "../../services/remitente.service";
import { fetchAPI } from "../../services/api";
import Swal from "sweetalert2";

import GothamRoundedBold from "../../../styles/fonts/GothamRounded-Bold.ttf";
import GothamRoundedBook from "../../../styles/fonts/GothamRounded-Book.ttf";
import MontserratBold from "../../../styles/fonts/Montserrat-Bold.ttf";
import MontserratRegular from "../../../styles/fonts/Montserrat-Regular.ttf";

const loadImageAsBase64 = async (imagePath) => {
  if (!imagePath) return null;
  try {
    const url = `${import.meta.env.VITE_ARCHIVOS_PATH}${imagePath}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn("No se pudo cargar la imagen:", imagePath, error);
    return null;
  }
};

const formatDateToSpanish = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  return `Tepic, Nayarit ${date.getDate()} de ${meses[date.getMonth()]} de ${date.getFullYear()}`;
};

const parseBold = (text) => {
  const parts = [];
  let lastIdx = 0, m;
  const regex = /\*\*(.*?)\*\*/g;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > lastIdx) parts.push({ text: text.substring(lastIdx, m.index), bold: false });
    parts.push({ text: m[1], bold: true });
    lastIdx = m.index + m[0].length;
  }
  if (lastIdx < text.length) parts.push({ text: text.substring(lastIdx), bold: false });
  if (parts.length === 0) parts.push({ text, bold: false });
  return parts;
};

const plainText = (parts) => parts.map(p => p.text).join('');
const buildCharMap = (parts, plain) => {
  const map = [];
  let pi = 0, ci = 0;
  for (let i = 0; i < plain.length; i++) {
    while (ci >= parts[pi].text.length) { ci = 0; pi++; }
    map.push(parts[pi].bold);
    ci++;
  }
  return map;
};

const renderLine = (doc, line, charMap, lineStart, x, y, justify, lineWidth) => {
  if (!justify || line.length === 0) {
    let xx = x;
    let i = lineStart;
    while (i < lineStart + line.length) {
      const bold = charMap[i];
      let j = i;
      while (j < lineStart + line.length && j < charMap.length && charMap[j] === bold) j++;
      const segment = line.substring(i - lineStart, j - lineStart);
      doc.setFont("GothamRounded", bold ? "bold" : "normal");
      doc.text(segment, xx, y);
      xx += doc.getTextWidth(segment);
      i = j;
    }
    return;
  }
  // Justified: split line into words
  const words = line.split(' ');
  if (words.length <= 1) {
    doc.setFont("GothamRounded", "normal");
    doc.text(line, x, y);
    return;
  }
  
  // Measure each word width with bold
  const wordWidths = [];
  let posInLine = 0;
  words.forEach((word) => {
    const wordStartInPlain = lineStart + posInLine;
    let width = 0;
    let i = wordStartInPlain;
    const wordEnd = wordStartInPlain + word.length;
    while (i < wordEnd) {
      const bold = charMap[i];
      let j = i;
      while (j < wordEnd && j < charMap.length && charMap[j] === bold) j++;
      const segment = line.substring(i - lineStart, j - lineStart);
      doc.setFont("Montserrat", bold ? "bold" : "normal");
      width += doc.getTextWidth(segment);
      i = j;
    }
    wordWidths.push(width);
    posInLine += word.length + 1;
  });
  
  const totalWidth = wordWidths.reduce((sum, w) => sum + w, 0);
  const gap = (lineWidth - totalWidth) / (words.length - 1);
  
  let xx = x;
  let charIdx = lineStart;
  words.forEach((word, idx) => {
    const wordEnd = charIdx + word.length;
    let i = charIdx;
    while (i < wordEnd) {
      const bold = charMap[i];
      let j = i;
      while (j < wordEnd && j < charMap.length && charMap[j] === bold) j++;
      const segment = line.substring(i - lineStart, j - lineStart);
      doc.setFont("Montserrat", bold ? "bold" : "normal");
      doc.text(segment, xx, y);
      xx += doc.getTextWidth(segment);
      i = j;
    }
    if (idx < words.length - 1) {
      xx += gap;
    }
    charIdx += word.length + 1;
  });
};

const drawBackground = (doc, fondo, pw, ph) => { if (!fondo) return; try { doc.addImage(fondo, "JPEG", 0, 0, pw, ph); } catch (e) { console.warn(e); } };
const drawHeader = (doc, encabezado) => { if (!encabezado) return; try { doc.addImage(encabezado, "JPEG", 8, 8, 70, 25); } catch (e) { console.warn(e); } };
const drawFooter = (doc, pie, pw, ph) => { if (!pie) return; try { doc.addImage(pie, "JPEG", 0, ph - 18, pw, 18); } catch (e) { console.warn(e); } };

const drawOfficeData = (doc, data) => {
  const pw = doc.internal.pageSize.getWidth();
  let y = 38;
  doc.setFont("Montserrat", "normal"); doc.setFontSize(11);
  doc.text(`Oficio No. ${data.numero}`, pw - 25, y, { align: "right" });
  y += 7;
  doc.setFont("GothamRounded", "bold"); doc.setFontSize(11);
  const asuntoFull = `Asunto: ${data.asunto}`;
  const maxW = 130;
  let asuntoLine = asuntoFull;
  if (doc.getTextWidth(asuntoLine) > maxW) {
    while (doc.getTextWidth(asuntoLine + "...") > maxW && asuntoLine.length > 0) asuntoLine = asuntoLine.slice(0, -1);
    asuntoLine += "...";
  }
  doc.text(asuntoLine, pw - 25, y, { align: "right" });
  y += 7;
  doc.setFont("GothamRounded", "bold");
  doc.text(data.fecha, pw - 25, y, { align: "right" });
};

const drawDestinatario = (doc, data) => {
  let y = 62;
  doc.setFont("GothamRounded", "bold"); doc.setFontSize(12); doc.text(data.nombre, 25, y);
  y += 7; doc.setFont("Montserrat", "normal"); doc.setFontSize(11); doc.text(data.area, 25, y);
  y += 7; doc.setFont("GothamRounded", "bold"); doc.text("P R E S E N T E.", 25, y);
};

const newPage = (doc, imagenes) => {
  doc.addPage();
  const pw = doc.internal.pageSize.getWidth(), ph = doc.internal.pageSize.getHeight();
  drawBackground(doc, imagenes.fondo, pw, ph); drawHeader(doc, imagenes.encabezado); drawFooter(doc, imagenes.pie, pw, ph);
  return 35;
};

const drawBody = (doc, data, imagenes) => {
  let y = 105;
  const ph = doc.internal.pageSize.getHeight();
  doc.setFont("Montserrat", "normal");
  doc.setFontSize(11);
  const paragraphs = data.contenido.split(/\n/);
  paragraphs.forEach((paragraph) => {
    if (!paragraph.trim()) { y += 5.5; return; }
    if (y > ph - 30) y = newPage(doc, imagenes);
    const parts = parseBold(paragraph);
    const plain = plainText(parts);
    const charMap = buildCharMap(parts, plain);
    const lines = doc.splitTextToSize(plain, 160);
    let lineStart = 0;
    lines.forEach((line, idx) => {
      if (y > ph - 30) y = newPage(doc, imagenes);
      const isLast = idx === lines.length - 1;
      renderLine(
        doc,
        line,
        charMap,
        lineStart,
        25,
        y,
        !isLast,
        160
      );
   
      lineStart += line.length;
      y += 5.5;
    });
  });
  return y + 8;
};

const drawFirma = (doc, data, y, imagenes) => {
  const pw = doc.internal.pageSize.getWidth(), ph = doc.internal.pageSize.getHeight();
  if (y > ph - 80) y = newPage(doc, imagenes);
  y += 10; doc.setFont("GothamRounded", "bold"); doc.setFontSize(12);
  doc.text("A T E N T A M E N T E", pw / 2, y, { align: "center" });
  y += 15;
  if (data.firma) { try { doc.addImage(data.firma, "PNG", pw / 2 - 20, y - 10, 40, 18); } catch (e) { console.warn(e); } }
  y += 18; doc.setFont("GothamRounded", "bold"); doc.setFontSize(11);
  doc.text(data.nombreFirma, pw / 2, y, { align: "center" });
  y += 6; doc.setFont("Montserrat", "normal"); doc.text(data.areaFirma, pw / 2, y, { align: "center" });
  return y;
};

const drawCCP = (doc, texto) => {
  const ph = doc.internal.pageSize.getHeight();
  doc.setFontSize(9); doc.setFont("Montserrat", "normal"); doc.text(texto || "C.c.p. Archivo.", 25, ph - 28);
};

const addPageNumbers = (doc) => {
  const total = doc.getNumberOfPages(), pw = doc.internal.pageSize.getWidth(), ph = doc.internal.pageSize.getHeight();
  for (let i = 1; i <= total; i++) { doc.setPage(i); doc.setFont("Montserrat", "normal"); doc.setFontSize(9); doc.text(`${i}/${total}`, pw - 25, ph - 5); }
};

const normalizarAreaParaNumero = (area) => {
  const texto = String(area || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]+/g, " ")
    .trim()
    .toUpperCase();

  if (!texto) return "OFICIO";

  const partes = texto.split(/\s+/).filter(Boolean);
  if (!partes.length) return "OFICIO";

  const prefijo = partes.length === 1 ? partes[0] : partes.slice(0, 3).join("");
  return prefijo.slice(0, 8) || "OFICIO";
};

export function GeneracionOficios() {
  const [tipo, setTipo] = useState("");
  const [fecha, setFecha] = useState("");
  const [numeroOficio, setNumeroOficio] = useState("");
  const [numeroOficioPreview, setNumeroOficioPreview] = useState("");
  const [remitente, setRemitente] = useState(null);
  const [busquedaRemitente, setBusquedaRemitente] = useState("");
  const [mostrarOpcionesRemitente, setMostrarOpcionesRemitente] = useState(false);
  const [destinatario, setDestinatario] = useState(null);
  const [busquedaDestinatario, setBusquedaDestinatario] = useState("");
  const [mostrarOpcionesDestinatario, setMostrarOpcionesDestinatario] = useState(false);
  const [asunto, setAsunto] = useState("");
  const [contenido, setContenido] = useState("");
  const [mostrarOficio, setMostrarOficio] = useState(false);
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [fondos, setFondos] = useState([]);
  const [fondoId, setFondoId] = useState("");
  const [remitentes, setRemitentes] = useState([]);
  const refRemitente = useRef(null);
  const refDestinatario = useRef(null);
  const textareaRef = useRef(null);
  const [nombrePDF, setNombrePDF] = useState("");

  const tipos = [{ value: "oficio", label: "Oficio" }, { value: "circular", label: "Circular" }];

  const generarNumeroOficio = useCallback(async (previewOnly = false) => {
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const prefijoFallback = normalizarAreaParaNumero(userData?.area || "OFICIO");

    if (!token) {
      const fallback = `${prefijoFallback}/001/${new Date().getFullYear()}`;
      if (previewOnly) {
        setNumeroOficioPreview(fallback);
      } else {
        setNumeroOficio(fallback);
      }
      return fallback;
    }

    try {
      const response = await fetchAPI("/contador/generar-numero-oficio", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ preview: previewOnly }),
      });

      if (!response.ok) throw new Error("No se pudo generar el número");
      const data = await response.json();
      const numero = data.numero || "";
      if (previewOnly) {
        setNumeroOficioPreview(numero);
      } else {
        setNumeroOficio(numero);
      }
      return numero;
    } catch (error) {
      console.error("Error al generar número de oficio:", error);
      const fallback = `${prefijoFallback}/001/${new Date().getFullYear()}`;
      if (previewOnly) {
        setNumeroOficioPreview(fallback);
      } else {
        setNumeroOficio(fallback);
      }
      return fallback;
    }
  }, []);

  const getRemitenteLabel = (rem) => {
    if (!rem) return "";
    const area = rem.area || rem.dependencia || "";
    return area ? `${rem.name} - ${area}` : rem.name;
  };

  useEffect(() => {
    const fetchFondos = async () => {
      try {
        const response = await getFondos(localStorage.getItem("token"));
        if (response.ok) setFondos((await response.json()).filter((f) => f.activo !== false));
      } catch (error) { console.error("Error al cargar fondos:", error); }
    };
    fetchFondos();
  }, []);

  useEffect(() => {
    const fetchRemitentes = async () => {
      try {
        const response = await getRemitentes();
        if (response.ok) setRemitentes((await response.json()).filter((r) => r.activo !== false));
      } catch (error) { console.error("Error al cargar remitentes:", error); }
    };
    fetchRemitentes();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (refRemitente.current && !refRemitente.current.contains(event.target)) setMostrarOpcionesRemitente(false);
      if (refDestinatario.current && !refDestinatario.current.contains(event.target)) setMostrarOpcionesDestinatario(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!tipo) {
      setNumeroOficio("");
      setNumeroOficioPreview("");
      return;
    }

    setFecha(new Date().toISOString());
    generarNumeroOficio(true);
  }, [tipo, generarNumeroOficio]);

  // Generar PDF y mostrar modal
  const handleGuardar = async () => {

    const camposFaltantes = [];

    if (!tipo) camposFaltantes.push("Tipo de oficio");
    if (!fondoId) camposFaltantes.push("Plantilla");
    if (!remitente) camposFaltantes.push("Remitente");
    if (!destinatario) camposFaltantes.push("Destinatario");
    if (!asunto?.trim()) camposFaltantes.push("Asunto");
    if (!contenido?.trim()) camposFaltantes.push("Contenido");

    if (camposFaltantes.length) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "warning",
        title: `Faltan ${camposFaltantes.length} campos obligatorios`,
        html: `
          <ul style="text-align:left;margin-top:8px">
            ${camposFaltantes.map(c => `<li>${c}</li>`).join("")}
          </ul>
        `,
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
        target: document.body,
      });

      return;
    }

    setGenerandoPDF(true);
    setMostrarOficio(true);
    try {
      const numeroParaDocumento = await generarNumeroOficio(false);
      const fondo = fondos.find((f) => f._id === fondoId || f.id === fondoId);
      const [encImg, pieImg, fonImg] = await Promise.all([
        loadImageAsBase64(fondo?.encabezado),
        loadImageAsBase64(fondo?.pie),
        loadImageAsBase64(fondo?.fondo),
      ]);
      const areaR = remitente?.area || remitente?.dependencia || "";
      const areaD = destinatario?.area || destinatario?.dependencia || "";
      const data = {
        numero: numeroParaDocumento, asunto: asunto || "SIN ASUNTO", fecha: formatDateToSpanish(fecha),
        nombre: (destinatario ? destinatario.name : "DESTINATARIO").toUpperCase(),
        area: areaD,
        contenido: contenido || "Contenido del oficio...",
        nombreFirma: remitente ? remitente.name : "Nombre del remitente",
        areaFirma: areaR,
        firma: null, ccp: "C.c.p. Archivo.",
      };
      const resultado = await generarOficioPDF(data, {
        fondo: fonImg,
        encabezado: encImg,
        pie: pieImg,
      });

      setPdfBlobUrl(resultado.url);
      setNombrePDF(resultado.nombre);

    } catch (error) {
      console.error("Error al generar PDF:", error);
    } finally {
      setGenerandoPDF(false);
    }
  };

  const campoInvalido = (valor) => {
    if (valor === null || valor === undefined) return true;
    if (typeof valor === "string") return !valor.trim();
    return false;
  };

  // Genera el PDF usando las funciones externas
  const generarOficioPDF = async (data, imagenes) => {
    const doc = new jsPDF("p", "mm", "a4");

    // =========================
    // =========================
    // FUENTES PERSONALIZADAS
    // =========================

    // Gotham
    doc.addFont(GothamRoundedBook, "GothamRounded", "normal");
    doc.addFont(GothamRoundedBold, "GothamRounded", "bold");

    // Montserrat
    doc.addFont(MontserratRegular, "Montserrat", "normal");
    doc.addFont(MontserratBold, "Montserrat", "bold");

    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();

    imagenes && drawBackground(doc, imagenes.fondo, pw, ph);
    imagenes && drawHeader(doc, imagenes.encabezado);
    imagenes && drawFooter(doc, imagenes.pie, pw, ph);

    drawOfficeData(doc, data);
    drawDestinatario(doc, data);

    let y = drawBody(doc, data, imagenes);

    drawFirma(doc, data, y, imagenes);
    drawCCP(doc, data.ccp);
    addPageNumbers(doc);

    // NOMBRE DEL ARCHIVO
    // =========================

    const numeroLimpio = (data.numero || "SIN_NUMERO")
      .replace(/[\\/:*?"<>|]/g, "-");

    const asuntoLimpio = (data.asunto || "SIN_ASUNTO")
      .trim()
      .replace(/[\\/:*?"<>|]/g, "-")
      .replace(/\s+/g, "_")
      .substring(0, 40); // evita nombres demasiado largos

    const nombrePDF = `Oficio_${numeroLimpio}_${asuntoLimpio}.pdf`;

    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);

    // Descargar automáticamente
    doc.save(nombrePDF);

    return {
      doc,
      url: pdfUrl,
      nombre: nombrePDF,
    };
  };

  const remitentesFiltrados = remitentes.filter((r) => getRemitenteLabel(r).toLowerCase().includes(busquedaRemitente.toLowerCase()));
  const destinatariosFiltrados = remitentes.filter((r) => getRemitenteLabel(r).toLowerCase().includes(busquedaDestinatario.toLowerCase()));

  const insertBold = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = contenido.substring(start, end);
    const before = contenido.substring(0, start);
    const after = contenido.substring(end);
    setContenido(selected ? `${before}**${selected}**${after}` : `${before}****${after}`);
    setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start + 2, end + 2); }, 0);
  };

  return (
    <div className="flex-1 w-full p-3 sm:p-4 md:p-6 bg-gray-100 overflow-y-auto">
      <div className="bg-gray-300 rounded-t-md flex items-center justify-between px-4 py-2">
        <h1 className="text-sm font-semibold text-gray-800">Generacion de Oficios</h1>
        <button className="w-6 h-6 flex items-center justify-center rounded-full bg-[#8B1538] text-white"><Minus size={14} /></button>
      </div>
      <div className="bg-white p-6 rounded-b-md shadow-sm text-xs space-y-">

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-300" />

          <h2 className="text-sm font-semibold text-[#8B1538] uppercase tracking-wide">
            Datos del Oficio
          </h2>

          <div className="h-px flex-1 bg-gray-300" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 text-xs">

          <div className="col-span-1 md:col-span-1">
            <label className="block mb-2 text-sm font-medium text-gray-700">Seleccione tipo de oficio</label>
            
          <div className="relative">
            <select value={tipo} onChange={(e) => setTipo(e.target.value)}
              className="
                w-full
                rounded-xl
                border
                border-gray-300
                px-4
                py-1.5
                pr-10
                text-sm
                text-gray-700
                appearance-none
                outline-none
                transition
                focus:border-[#8B1538]
                focus:ring-2
                focus:ring-[#8B1538]/20
              ">
              <option value="">Selecciona opcion</option>
              {tipos.map((item) => (<option key={item.value} value={item.value}>{item.label}</option>))}
            </select>
            
            <ChevronDown
              size={18}
              className="
                absolute
                right-3
                top-1/2
                -translate-y-1/2
                text-gray-500
                pointer-events-none
              "
            />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {tipo && (
               <motion.div
                className="col-span-full"
                initial={{
                  opacity: 0,
                  y: 15,
                  height: 0,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  height: "auto",
                }}
                exit={{
                  opacity: 0,
                  y: -10,
                  height: 0,
                }}
                transition={{
                  duration: 0.35,
                  ease: "easeOut",
                }}
                style={{ overflow: "hidden" }}
              >

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="col-span-12 lg:col-span-3">
                    <label className="block mb-2 text-sm font-medium text-gray-700">Fecha</label>
                    <input type="text" value={formatDateToSpanish(fecha)} disabled className="w-full border border-gray-300 bg-gray-100 w-full
                      rounded-lg
                      border
                      border-gray-200
                      bg-gray-50
                      px-2
                      py-1
                      text-gray-600" />
                  </div>

                  <div className="col-span-12 lg:col-span-2">
                    <label className="block mb-2 text-sm font-medium text-gray-700">Num. Oficio</label>
                    <input type="text" value={numeroOficioPreview || numeroOficio} disabled className="w-full border border-gray-300 bg-gray-100 w-full
                      rounded-lg
                      border
                      border-gray-200
                      bg-gray-50
                      px-2
                      py-1
                      text-gray-600" />
                  </div>

                  <div className="col-span-12 lg:col-span-7">
                    <label className="block mb-2 text-sm font-medium text-gray-700">Fondo / Plantilla</label>
                    
                    <div className="relative">
                    <select value={fondoId} onChange={(e) => setFondoId(e.target.value)}
                      className={`
                        w-full
                        rounded-xl
                        border
                        px-2
                        py-1.5
                        text-sm
                        text-gray-700
                        transition
                        outline-none
                        focus:border-[#8B1538]
                        focus:ring-2
                        focus:ring-[#8B1538]/20
                        appearance-none
                        ${campoInvalido(fondoId)
                            ? "border border-red-300"
                            : "border border-gray-300"}
                          focus:border-[#8B1538]
                          focus:ring-2
                          focus:ring-[#8B1538]/20
                        `}
                      >
                      <option value="">Sin plantilla</option>
                      {fondos.map((f) => (<option key={f._id || f.id} value={f._id || f.id}>{f.nombre}{f.abreviatura ? " (" + f.abreviatura + ")" : ""}</option>))}
                    </select>

                    <ChevronDown
                        size={18}
                        className="
                          absolute
                          right-3
                          top-1/2
                          -translate-y-1/2
                          text-gray-500
                          pointer-events-none
                        "
                      />
                    </div>
                  </div>

                  <div className="col-span-12 lg:col-span-4" ref={refRemitente}>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Remitente (Quien firma)</label>
                    <div className="relative">
                      <div className={`
                        flex items-center
                        rounded-lg
                        border
                        border-gray-300
                        px-2
                        py-1
                        bg-white
                        focus-within:border-[#8B1538]
                        focus-within:ring-2
                        focus-within:ring-[#8B1538]/20
                        transition
                        ${campoInvalido(busquedaRemitente)
                            ? "border border-red-300"
                            : "border border-gray-300"}
                          focus:border-[#8B1538]
                          focus:ring-2
                          focus:ring-[#8B1538]/20
                        `}>
                        <Search size={14} className="text-gray-400" />
                        <input type="text" value={busquedaRemitente}
                        onChange={(e) => {
                            setBusquedaRemitente(e.target.value);
                            setRemitente(null); // limpiar selección
                            setMostrarOpcionesRemitente(true);
                          }}
                          onFocus={() => setMostrarOpcionesRemitente(true)}
                          placeholder="Buscar remitente..." className="w-full border-0 rounded px-2 py-1 h-8 focus:outline-none focus:ring-0" />
                      </div>
                      {mostrarOpcionesRemitente && (
                        <div className="absolute bg-white border w-full mt-1 max-h-40 overflow-y-auto z-10 shadow-md">
                          {remitentesFiltrados.length > 0 ? remitentesFiltrados.map((r) => (
                            <div key={r._id} onClick={() => { setRemitente(r); setBusquedaRemitente(getRemitenteLabel(r)); setMostrarOpcionesRemitente(false); }}
                              className="px-2 py-1 hover:bg-gray-100 cursor-pointer">{getRemitenteLabel(r)}</div>
                          )) : <div className="px-2 py-1 text-gray-400">Sin resultados</div>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-span-12 lg:col-span-8" ref={refDestinatario}>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Destinatario (Para quien va dirigido)</label>
                    <div className="relative">
                      <div className={`
                        flex items-center
                        rounded-lg
                        border
                        border-gray-300
                        px-2
                        py-1
                        bg-white
                        focus-within:border-[#8B1538]
                        focus-within:ring-2
                        focus-within:ring-[#8B1538]/20
                        transition
                        ${campoInvalido(busquedaDestinatario)
                            ? "border border-red-300"
                            : "border border-gray-300"}
                          focus:border-[#8B1538]
                          focus:ring-2
                          focus:ring-[#8B1538]/20
                        `}>
                        <Search size={14} className="text-gray-400" />
                        <input type="text" value={busquedaDestinatario}
                          onChange={(e) => {
                            setBusquedaDestinatario(e.target.value);
                            setDestinatario(null); // limpiar selección
                            setMostrarOpcionesDestinatario(true);
                          }}
                          onFocus={() => setMostrarOpcionesDestinatario(true)}
                          placeholder="Buscar destinatario..." className="w-full border-0 rounded px-2 py-1 h-8 focus:outline-none focus:ring-0" />
                      </div>
                      {mostrarOpcionesDestinatario && (
                        <div className="absolute bg-white border w-full mt-1 max-h-40 overflow-y-auto z-10 shadow-md">
                          {destinatariosFiltrados.length > 0 ? destinatariosFiltrados.map((r) => (
                            <div key={r._id} onClick={() => { setDestinatario(r); setBusquedaDestinatario(getRemitenteLabel(r)); setMostrarOpcionesDestinatario(false); }}
                              className="px-2 py-1 hover:bg-gray-100 cursor-pointer">{getRemitenteLabel(r)}</div>
                          )) : <div className="px-2 py-1 text-gray-400">Sin resultados</div>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-span-12 flex flex-col gap-6">
                      <div className="
                          rounded-xl
                          border
                          border-gray-200
                          bg-gray-50
                          p-4
                      ">
                        <label className="block mb-2 text-sm font-medium text-gray-700">Asunto</label>
                        <input type="text" value={asunto} onChange={(e) => setAsunto(e.target.value)}
                          className={`w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8B1538] ${campoInvalido(asunto)
                              ? "border border-red-300"
                              : "border border-gray-300"}
                            focus:ring-2 focus:ring-[#8B1538]
                          `}
                          placeholder="Asunto del oficio" />
            
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-px flex-1 bg-gray-300" />

                      <h2 className="text-sm font-semibold text-[#8B1538] uppercase tracking-wide">
                        Contenido del Oficio
                      </h2>

                      <div className="h-px flex-1 bg-gray-300" />
                    </div>

                    <label className="block mb-2 text-sm font-medium text-gray-700">Informacion</label>
                    <div className="flex items-center gap-1 mb-1">
                      <button   onClick={insertBold}
                          title="Negritas"
                          className="
                          flex items-center
                          gap-2
                          px-3
                          py-2
                          rounded-lg
                          border
                          border-gray-300
                          hover:bg-gray-100
                          transition
                        "><Bold size={14} /></button>
                      <span className="text-xs text-gray-400">Selecciona texto y haz clic en <strong>B</strong> para negritas. Usa **texto** en el texto.</span>
                    </div>
                    <textarea ref={textareaRef} value={contenido} onChange={(e) => setContenido(e.target.value)} rows={8}
                      className={`
                        w-full
                        min-h-[20px]
                        rounded-xl
                        border
                        border-gray-300
                        px-4
                        py-3
                        resize-none
                        transition
                        focus:border-[#8B1538]
                        focus:ring-2
                        focus:ring-[#8B1538]/20
                        outline-none
                        ${campoInvalido(contenido)
                            ? "border border-red-300"
                            : "border border-gray-300"}
                          focus:border-[#8B1538]
                          focus:ring-2
                          focus:ring-[#8B1538]/20
                        `}
                      placeholder="Escribe aqui el contenido. Usa **texto** entre asteriscos para ponerlo en negritas." />
                  </div>

                  </div>

                  <div className="col-span-full flex justify-center sm:justify-end">
                    <button onClick={handleGuardar} disabled={generandoPDF}
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
                        disabled:opacity-50
                        disabled:hover:scale-100
                        flex items-center gap-2
                        ">
                      {generandoPDF ? <><Loader2 size={14} className="animate-spin" />Generando...</> : "Guardar"}
                    </button>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {mostrarOficio && pdfBlobUrl && (
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
                    <span
                      className="text-white text-base font-medium truncate"
                      title={nombrePDF}
                    >
                      {nombrePDF.replace(".pdf", "")}
                    </span>

                    <button
                      onClick={() => {
                        setMostrarOficio(false);
                        URL.revokeObjectURL(pdfBlobUrl);
                      }}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-[#8B1538]"
                    >
                      <Minus size={16} />
                    </button>
                  </div>
                  <div className="flex-1 bg-gray-700 flex justify-center p-2 min-h-[80vh]">
                    <iframe src={pdfBlobUrl} className="w-full h-[85vh] rounded" title="Vista previa del oficio" />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}