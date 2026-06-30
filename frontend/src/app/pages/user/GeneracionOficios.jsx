import { motion, AnimatePresence } from "framer-motion";
import { Minus, Search, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import { getFondos } from "../../services/fondo.service";

const API_BASE = "http://localhost:3333";

/**
 * Convierte una ruta de imagen del servidor a data URL base64 para jsPDF
 */
const loadImageAsBase64 = async (imagePath) => {
  if (!imagePath) return null;
  try {
    const filename = imagePath.split("/").pop();
    const url = `${API_BASE}/uploads/fondo/${filename}`;
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

export function GeneracionOficios() {
  const [tipo, setTipo] = useState("");
  const [fechaHora, setFechaHora] = useState("");
  const [area, setArea] = useState("");
  const [numeroOficio, setNumeroOficio] = useState("");
  const [destinatario, setDestinatario] = useState("");
  const [asunto, setAsunto] = useState("");
  const [contenido, setContenido] = useState("");
  const [mostrarOficio, setMostrarOficio] = useState(false);
  const [generandoPDF, setGenerandoPDF] = useState(false);

  // Estados para los fondos/plantillas
  const [fondos, setFondos] = useState([]);
  const [fondoId, setFondoId] = useState("");

  const tipos = [
    { value: "oficio", label: "Oficio" },
    { value: "circular", label: "Circular" },
  ];

  const areas = [
    {
      value: "direccion_tic",
      label: "Dirección de Tecnologías de la Información y Comunicaciones",
    },
    { value: "recursos_humanos", label: "Recursos Humanos" },
    { value: "finanzas", label: "Finanzas" },
  ];

  // Obtener label del área seleccionada
  const getAreaLabel = (val) => {
    const areaObj = areas.find((a) => a.value === val);
    return areaObj ? areaObj.label : val || "Area no especificada";
  };

  // Cargar lista de fondos al montar el componente
  useEffect(() => {
    const fetchFondos = async () => {
      try {
        const response = await getFondos();
        if (response.ok) {
          const data = await response.json();
          const activos = data.filter((f) => f.activo !== false);
          setFondos(activos);
        }
      } catch (error) {
        console.error("Error al cargar fondos:", error);
      }
    };
    fetchFondos();
  }, []);

  // Generar fecha y hora automatica
  useEffect(() => {
    if (tipo) {
      const now = new Date();
      setFechaHora(now.toLocaleString());
      const consecutivo = Math.floor(Math.random() * 1000);
      setNumeroOficio("DG/DTIC/" + consecutivo + "/2026");
    }
  }, [tipo]);

  const handleGuardar = () => {
    setMostrarOficio(true);
  };

  const generarPDF = async () => {
    setGenerandoPDF(true);
    try {
      const fondoSeleccionado = fondos.find(
        (f) => f._id === fondoId || f.id === fondoId
      );
      const [encabezadoImg, pieImg, fondoImg] = await Promise.all([
        loadImageAsBase64(fondoSeleccionado?.encabezado),
        loadImageAsBase64(fondoSeleccionado?.pie),
        loadImageAsBase64(fondoSeleccionado?.fondo),
      ]);
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;
      if (fondoImg) {
        try { doc.addImage(fondoImg, "JPEG", 0, 0, pageWidth, pageHeight); } catch (e) { console.warn("fondo:", e); }
      }
      if (encabezadoImg) {
        try { doc.addImage(encabezadoImg, "JPEG", 0, 0, pageWidth, 30); y = margin + 30 + 5; } catch (e) { console.warn("encabezado:", e); }
      }
      const vino = [139, 21, 56];
      const gris = [80, 80, 80];
      const negro = [0, 0, 0];
      if (!encabezadoImg) {
        doc.setDrawColor(...vino); doc.setLineWidth(1.5); doc.line(margin, y, pageWidth - margin, y); y += 6;
        doc.setTextColor(...vino); doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.text("Gobierno de Mexico", margin, y); y += 10;
      }
      doc.setTextColor(...gris); doc.setFont("helvetica", "normal"); doc.setFontSize(10);
      doc.text(getAreaLabel(area), pageWidth - margin, y, { align: "right" }); y += 6;
      doc.text(fechaHora, pageWidth - margin, y, { align: "right" }); y += 6;
      doc.setFont("helvetica", "bold"); doc.text(numeroOficio, pageWidth - margin, y, { align: "right" }); y += 12;
      doc.setDrawColor(...vino); doc.setLineWidth(0.5); doc.line(margin, y, pageWidth - margin, y); y += 10;
      doc.setTextColor(...negro); doc.setFont("helvetica", "bold"); doc.setFontSize(11);
      doc.text((destinatario || "DESTINATARIO").toUpperCase(), margin, y); y += 7;
      doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.text("PRESENTE", margin, y); y += 12;
      doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.text("Asunto:", margin, y);
      doc.setFont("helvetica", "normal"); const asW = doc.getTextWidth("Asunto: "); doc.text(asunto || "SIN ASUNTO", margin + asW, y); y += 10;
      doc.setFont("helvetica", "normal"); doc.setFontSize(10);
      const contTexto = contenido || "Contenido del oficio...";
      const lines = doc.splitTextToSize(contTexto, contentWidth);
      const lineH = 5; const maxY = pageHeight - margin - 35;
      const addPageIfNeeded = () => {
        doc.addPage(); y = margin + 10;
        if (fondoImg) { try { doc.addImage(fondoImg, "JPEG", 0, 0, pageWidth, pageHeight); } catch (e) {} }
        if (encabezadoImg) { try { doc.addImage(encabezadoImg, "JPEG", 0, 0, pageWidth, 30); y = margin + 30 + 10; } catch (e) {} }
      };
      if (y + lines.length * lineH > maxY) addPageIfNeeded();
      lines.forEach((line) => { if (y > maxY) addPageIfNeeded(); doc.text(line, margin, y); y += lineH; });
      y = Math.max(y + 15, pageHeight - margin - 55);
      doc.setDrawColor(...vino); doc.setLineWidth(0.5); doc.line(margin, y, margin + 50, y); y += 10;
      doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.text("ATENTAMENTE", margin, y); y += 8;
      doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.text(getAreaLabel(area), margin, y);
      if (pieImg) { try { doc.addImage(pieImg, "JPEG", 0, pageHeight - 15, pageWidth, 15); } catch (e) { console.warn("pie:", e); } }
      doc.save("Oficio_" + numeroOficio.replace(/[/\\]/g, "_") + ".pdf");
    } catch (error) { console.error("Error al generar PDF:", error); }
    finally { setGenerandoPDF(false); }
  };

  return (
    <div className="flex-1 w-full p-6 bg-gray-100 overflow-y-auto">
      <div className="bg-gray-300 rounded-t-md flex items-center justify-between px-4 py-2">
        <h1 className="text-sm font-semibold text-gray-800">Generacion de Oficios</h1>
        <button className="w-6 h-6 flex items-center justify-center rounded-full bg-[#8B1538] text-white">
          <Minus size={14} />
        </button>
      </div>
      <div className="w-full bg-white p-4 sm:p-6 md:p-10 rounded-b-md shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-6 text-xs">
          <div className="col-span-2">
            <label className="block mb-1">Tipo de oficio:</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1 h-8 focus:outline-none focus:ring-2 focus:ring-[#8B1538]">
              <option value="">Selecciona opcion</option>
              {tipos.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </div>
          {tipo && (
            <>
              <div className="col-span-2">
                <label className="block mb-1">Fecha y hora:</label>
                <input type="text" value={fechaHora} disabled className="w-full border border-gray-300 bg-gray-100 rounded px-2 py-1 h-8" />
              </div>
              <div className="col-span-2">
                <label className="block mb-1">Area:</label>
                <select value={area} onChange={(e) => setArea(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1 h-8 focus:outline-none focus:ring-2 focus:ring-[#8B1538]">
                  <option value="">Selecciona area</option>
                  {areas.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block mb-1">Num. Oficio:</label>
                <input type="text" value={numeroOficio} disabled className="w-full border border-gray-300 bg-gray-100 rounded px-2 py-1 h-8" />
              </div>
              <div className="col-span-2">
                <label className="block mb-1">Fondo / Plantilla:</label>
                <select value={fondoId} onChange={(e) => setFondoId(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1 h-8 focus:outline-none focus:ring-2 focus:ring-[#8B1538]">
                  <option value="">Sin plantilla</option>
                  {fondos.map((f) => (
                    <option key={f._id || f.id} value={f._id || f.id}>
                      {f.nombre}{f.abreviatura ? " (" + f.abreviatura + ")" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-4">
                <label className="block mb-1">Asunto:</label>
                <textarea value={asunto} onChange={(e) => setAsunto(e.target.value)} rows={3}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8B1538]" />
              </div>
              <div className="col-span-4">
                <label className="block mb-1">Para:</label>
                <div className="relative">
                  <input type="text" value={destinatario} onChange={(e) => setDestinatario(e.target.value)}
                    placeholder="Buscar y seleccionar opcion"
                    className="w-full border border-gray-300 rounded px-8 py-1 h-8 focus:outline-none focus:ring-2 focus:ring-[#8B1538]" />
                  <Search size={14} className="absolute left-2 top-2 text-gray-400" />
                </div>
              </div>
              <div className="col-span-4">
                <label className="block mb-1">Informacion:</label>
                <textarea value={contenido} onChange={(e) => setContenido(e.target.value)} rows={6}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8B1538]" />
              </div>
              <div className="col-span-full flex justify-center sm:justify-end">
                <button onClick={handleGuardar}
                  className="bg-[#8B1538] text-white px-10 py-2 rounded hover:opacity-90 transition">Guardar</button>
              </div>
            </>
          )}
          <AnimatePresence>
            {mostrarOficio && (
              <motion.div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.div initial={{ scale: 0.9, y: 40, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 40, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="w-full max-w-4xl bg-white rounded shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="bg-gray-700 text-white flex items-center justify-between px-4 py-2 text-xs">
                    <div className="flex gap-2">
                      <button onClick={generarPDF} disabled={generandoPDF}
                        className="bg-red-600 px-2 py-1 rounded disabled:opacity-50 flex items-center gap-1">
                        {generandoPDF ? <><Loader2 size={12} className="animate-spin" />Generando...</> : "PDF"}
                      </button>
                      <button onClick={() => window.print()} className="bg-gray-400 px-2 py-1 rounded">Imprimir</button>
                    </div>
                    <div className="font-semibold">Pagina 1 de 1</div>
                    <button onClick={() => setMostrarOficio(false)}
                      className="bg-[#8B1538] w-6 h-6 rounded-full flex items-center justify-center">x</button>
                  </div>
                  <div className="bg-gray-800 flex justify-center p-4 overflow-y-auto">
                    <div className="bg-white w-full max-w-[650px] min-h-[750px] p-10 text-xs shadow">
                      <div className="mb-6">
                        <p className="font-semibold">Gobierno de Mexico</p>
                        <p className="text-right">{getAreaLabel(area)}</p>
                        <p className="text-right">{fechaHora}</p>
                        <p className="text-right font-semibold">{numeroOficio}</p>
                      </div>
                      <div className="mb-6">
                        <p className="font-semibold uppercase">{destinatario || "DESTINATARIO"}</p>
                        <p>PRESENTE</p>
                      </div>
                      <div className="mb-4">
                        <p><strong>Asunto:</strong> {asunto || "SIN ASUNTO"}</p>
                      </div>
                      <div className="mb-10 text-justify whitespace-pre-line">
                        {contenido || "Contenido del oficio..."}
                      </div>
                      <div className="mt-16">
                        <p>ATENTAMENTE</p><br /><br />
                        <p className="font-semibold">{getAreaLabel(area)}</p>
                      </div>
                    </div>
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