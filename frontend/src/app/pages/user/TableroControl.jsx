import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState, useEffect, useRef } from "react";

import { getDocuments, updateDocument } from "../../services/document.service";

const fichasGestion = [
  { name: "Sin instrucciones", value: 0, color: "#9CA3AF" },
  {
    name: "Con instrucciones no autorizadas",
    value: 0,
    color: "#F59E0B",
  },
  {
    name: "Con instrucción turnada",
    value: 0,
    color: "#0F766E",
  },
  { name: "Con gestión cerrada", value: 0, color: "#1D4ED8" },
  { name: "Eliminados", value: 0, color: "#991B1B" },
  {
    name: "Con información faltante",
    value: 0,
    color: "#3B82F6",
  },
];

const instruccionesEnviadas = [
  { name: "Cerrado", value: 0, color: "#1D4ED8" },
  { name: "Concluido", value: 0, color: "#0F766E" },
  {
    name: "Recibido, en ejecución",
    value: 0,
    color: "#3B82F6",
  },
  { name: "Validado", value: 0, color: "#8B1538" },
  {
    name: "Autorizados y turnados",
    value: 0,
    color: "#F59E0B",
  },
  { name: "Registrado", value: 0, color: "#111827" },
];

const instruccionesRecibidas = [
  { name: "Validado", value: 0, color: "#8B1538" },
  { name: "Concluido", value: 0, color: "#0F766E" },
  {
    name: "Recibido, en ejecución",
    value: 0,
    color: "#3B82F6",
  },
];

const copiasConocimiento = [
  { name: "Leído", value: 0, color: "#0F766E" },
  { name: "Por leer", value: 0, color: "#9CA3AF" },
];

const documentosInternos = 18;

/* ============================
   ANEXOS SIMULADOS
============================ */
const anexos = [
  {
    folio: "2025000001",
    registrador: "Víctor Manuel Enríquez Paniagua",
    nombre: "GUARDIA NACIONAL.pdf",
  },
  {
    folio: "2025000001",
    registrador: "María Verónica Leal Camarena",
    nombre: "Ficha de Gestión.pdf",
  },
  {
    folio: "2025000002",
    registrador: "Juan Pérez",
    nombre: "Solicitud.pdf",
  },
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
  const [documentos, setDocumentos] = useState([]);
  const [fichas, setFichasGestion] = useState(fichasGestion);
  const [Enviadas, setInstruccionesEnviadas] = useState(instruccionesEnviadas);
  const [Recibidas, setInstruccionesRecibidas] = useState(instruccionesRecibidas);
  const [Copias, setCopiasConocimiento] = useState(copiasConocimiento);

  useEffect(() => {
  const fetchDocuments = async () => {
    try {      
      const documentos = await getDocuments(localStorage.getItem("token"));
      const docs = await documentos.json();
      setDocumentos(docs);
      const contador = {
        "Sin instrucciones": 0,
        "Con instrucciones no autorizadas": 0,
        "Con instrucción turnada": 0,
        "Con gestión cerrada": 0,
        "Eliminados": 0,
        "Con información faltante": 0,
        "Cerrado": 0,
        "Concluido": 0,
        "Recibido, en ejecución": 0,
        "Validado": 0,
        "Autorizados y turnados": 0,
        "Registrado": 0,
        "Leído": 0,
        "Por leer": 0,
      }
      docs.map((doc) => {
        console.log("Procesando documento:", doc.turnados.length===0);
        if (doc.turnados.length === 0) {
          contador["Sin instrucciones"] += 1;
          contador["Registrado"] += 1;
        }else if(doc.status === "Autorizado y turnado" || doc.status === "Validado" || doc.status === "Concluido") {
          contador["Con instrucción turnada"] += 1;
          if(doc.respuestas.length === 0) {
            contador["Recibido, en ejecución"] += 1;
          }else if (doc.status === "Autorizado y turnado") {
              contador["Autorizados y turnados"] += 1;
          } else {
            if(doc.status === "Validado") {
              contador["Validado"] += 1;
            } else if(doc.status === "Concluido") {
              contador["Concluido"] += 1;
            }
          }
        }else if(doc.status === "Cerrado") {
          contador["Con gestión cerrada"] += 1;
          contador["Cerrado"] += 1;
        }else if(doc.eliminado) {
          contador["Eliminados"] += 1;
        }else if(doc.completa === false) {
          contador["Con información faltante"] += 1;
        }else{
          contador["Con instrucciones no autorizadas"] += 1;
        }

        doc.copias.map(copia => {
        if(copia.status === "Leído") {
          console.log("Documento con copia leído:", );
          contador["Leído"] += 1;
        }else if(copia.status === "Por leer") {
          contador["Por leer"] += 1;
        }
      });
      });

      const updatedFichasGestion = fichas.map((ficha) => ({
        ...ficha, 
        value: contador[ficha.name]
      })
      );

      const updatedInstruccionesEnviadas = Enviadas.map((item) => ({
        ...item,
        value: contador[item.name]
      }));

      const updatedInstruccionesRecibidas = Recibidas.map((item) => ({
        ...item,
        value: contador[item.name]
      }));

      const updatedCopiasConocimiento = Copias.map((item) => ({
        ...item,
        value: contador[item.name]
      }));

      setFichasGestion(updatedFichasGestion);
      setInstruccionesEnviadas(updatedInstruccionesEnviadas);
      setInstruccionesRecibidas(updatedInstruccionesRecibidas);
      setCopiasConocimiento(updatedCopiasConocimiento);
    } catch (error) {
      console.error("Error al obtener documentos:", error);
    }
  };

  fetchDocuments();
}, []);

  const documentosFiltrados = documentos.filter(
    (doc) => doc.turnados.length === 0 && ("Sin instrucciones" === estatusSeleccionado || estatusSeleccionado === "Registrado") ||
    (doc.status === estatusSeleccionado) || (doc.status === "Autorizado y turnado" && estatusSeleccionado === "Con instrucción turnada") ||
    (doc.respuestas.length === 0 && doc.turnados.length > 0 && estatusSeleccionado === "Recibido, en ejecución") ||
    (doc.status === "Cerrado" && estatusSeleccionado === "Con gestión cerrada") || 
    (doc.eliminado && estatusSeleccionado === "Eliminados") ||
    (doc.completa === false && estatusSeleccionado === "Con información faltante") ||
    (doc.copias.some(copia => copia.status === "Leído") && estatusSeleccionado === "Leído") ||
    (doc.copias.some(copia => copia.status === "Por leer") && estatusSeleccionado === "Por leer")
  );

  const tablaModalRef = useRef(null);
  const bitacoraRef = useRef(null);
    
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 6;

  const totalPaginas = Math.ceil(
    documentosFiltrados.length / registrosPorPagina,
  );

  const indexInicio = (paginaActual - 1) * registrosPorPagina;
  const indexFin = indexInicio + registrosPorPagina;

  const documentosPaginados = documentosFiltrados.slice(
    indexInicio,
    indexFin,
  );

  const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);

  const anexosRelacionados = anexos.filter(
    (a) => a.folio === documentoSeleccionado?.folio
  );

  const [tabActiva, setTabActiva] = useState("datosAsunto");

 const [menuContextual, setMenuContextual] = useState(null);

  useEffect(() => {
    const cerrarMenu = () => setMenuContextual(null);
    window.addEventListener("click", cerrarMenu);
    return () =>
      window.removeEventListener("click", cerrarMenu);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const descargarBitacora = () => {
    window.print();
  };
  

  const imprimirDoc = () => {
    window.print();
  };


  const exportarExcelModal = () => {
    const datos = documentosFiltrados;
  
    if (!datos.length) return;
  
    const encabezados = [
      "Folio",
      "No. Documento",
      "Fecha",
      "Síntesis",
      "Remitente Interno",
      "Remitente Externo",
      "Estatus",
      "Motivo"
    ];
  
    const filas = datos.map((doc) => [
      doc.folio,
      doc.numeroDocumento,
      doc.fecha,
      doc.sintesis,
      doc.remitenteInterno,
      doc.remitenteExterno,
      doc.estatus,
      doc.motivo
    ]);
  
    let contenidoCSV =
      encabezados.join(",") + "\n" +
      filas.map((fila) => fila.join(",")).join("\n");
  
    const blob = new Blob(["\uFEFF" + contenidoCSV], {
      type: "text/csv;charset=utf-8;"
    });
  
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Documentos_${estatusSeleccionado}.csv`;
    link.click();
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
      estatus: "Autorizados y turnados",
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
          title="Instrucciones y solicitudes enviadas"
          data={Enviadas}
          clickable
          onClickSegment={(estatus) => {
            setEstatusSeleccionado(estatus);
            setPaginaActual(1);
          }}
        />

        <DonutChart
          title="Instrucciones y solicitudes recibidas"
          data={Recibidas}
          clickable
          onClickSegment={(estatus) => {
            setEstatusSeleccionado(estatus);
            setPaginaActual(1);
          }}
        />

        <DonutChart
          title="Copias de conocimiento"
          data={Copias}
        />

        {/* Documentos internos */}
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col justify-center items-center text-center">
          <h3 className="text-base font-semibold text-gray-700 mb-4">
            Documentos internos
          </h3>
          <span className="text-5xl font-bold text-[#8B1538]">
            {documentosInternos}
          </span>
        </div>
      </div>

      {/* ============================
         MODAL DINÁMICO
      ============================ */}

      {estatusSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center print:block">
          {/* Fondo oscuro */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm no-print"
            onClick={() => setEstatusSeleccionado(null)}
          />

          {/* Ventana */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-11/12 max-w-5xl max-h-[80vh] overflow-y-auto p-6 print:shadow-none print:max-h-none print:w-full">
            <div className="flex justify-between items-center px-6 pb-4 border-b shrink-0">
              {" "}
              <h3 className="text-xl font-semibold text-[#8B1538]">
                Documentos en estatus: {estatusSeleccionado}
              </h3>
              <button
                onClick={() => setEstatusSeleccionado(null)}
                className="text-gray-500 hover:text-black text-xl"
              >
                ✕
              </button>
            </div>

            <div className="flex justify-start gap-3 mb-4 no-print">
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm shadow"
                  onClick={imprimirDoc}
                >
                Exportar PDF
              </button>

              <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm shadow"
                  onClick={exportarExcelModal}              
                >
                Exportar Excel
              </button>
            </div>

            <div ref={tablaModalRef} className="zona-tabla-modal overflow-x-auto print-area">
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

              <table className="w-full text-sm border border-gray-200 tabla-documentos">
                <thead className="bg-[#8B1538] text-white">
                  <tr>
                    <th className="px-3 py-2 text-left">
                      Folio
                    </th>
                    <th className="px-3 py-2 text-left">
                      No. de Documento
                    </th>
                    <th className="px-3 py-2 text-left">
                      Fecha del documento
                    </th>
                    <th className="px-3 py-2 text-left">
                      Síntesis del asunto
                    </th>
                    <th className="px-3 py-2 text-left">
                      Remitente
                    </th>
                    <th className="px-3 py-2 text-left">
                      Estatus
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {documentosFiltrados.length > 0 ? (
                    documentosFiltrados.map((doc, index) => (
                      <tr
                        key={index}
                        className="border-t hover:bg-gray-50 cursor-context-menu"
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setMenuContextual({
                            x: Math.min(
                              e.pageX,
                              window.innerWidth - 180,
                            ),
                            y: Math.min(
                              e.pageY,
                              window.innerHeight - 100,
                            ),
                            documento: doc,
                          });
                        }}
                      >
                        <td className="px-3 py-2">
                          {doc.folio}
                        </td>
                        <td className="px-3 py-2">
                          {doc.docId}
                        </td>
                        <td className="px-3 py-2">
                          {doc.fechaDoc
                            ? new Date(doc.fechaDoc).toLocaleDateString(
                                "es-MX",
                                {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit'
                                }
                              )
                            : ''}
                        </td>
                        <td className="px-3 py-2">
                          {doc.asunto}
                        </td>
                        <td className="px-3 py-2">
                          {doc.remitente.name || "N/A"}
                        </td>
                        <td className="px-3 py-2">
                          {doc.status}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="text-center py-4 text-gray-500"
                      >
                        No hay documentos en este estatus
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {menuContextual && (
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
              )}
              {/* PAGINACIÓN */}
              {totalPaginas > 1 && (
                <div className="flex justify-start items-center gap-2 mt-4 text-sm">
                  <button
                    disabled={paginaActual === 1}
                    onClick={() =>
                      setPaginaActual(paginaActual - 1)
                    }
                    className="px-2 py-1 border rounded disabled:opacity-40"
                  >
                    Anterior
                  </button>

                  {Array.from(
                    { length: totalPaginas },
                    (_, i) => (
                      <button
                        key={i}
                        onClick={() => setPaginaActual(i + 1)}
                        className={`px-3 py-1 rounded border ${
                          paginaActual === i + 1
                            ? "bg-[#8B1538] text-white"
                            : "bg-white"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ),
                  )}

                  <button
                    disabled={paginaActual === totalPaginas}
                    onClick={() =>
                      setPaginaActual(paginaActual + 1)
                    }
                    className="px-2 py-1 border rounded disabled:opacity-40"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>

            {documentoSeleccionado && (
              <div className="fixed inset-0 z-[60] flex items-start sm:items-center justify-center p-4 sm:p-6 overflow-y-auto">
                <div
                  className="absolute inset-0 bg-black/40"
                  onClick={() => setDocumentoSeleccionado(null)}
                />

                <div
                  className="
                  relative 
                  bg-white 
                  w-full 
                  max-w-6xl 
                  h-[90vh] sm:h-[85vh] 
                  rounded-2xl 
                  shadow-2xl 
                  flex 
                  flex-col 
                  pt-6
                "
                >
                  {/* Header */}
                  <div className="flex justify-between items-center px-6 pb-4 border-b shrink-0">
                    <h2 className="text-xl font-bold text-[#8B1538]">
                      Documento {documentoSeleccionado.folio}
                    </h2>

                    <button
                      onClick={() =>
                        setDocumentoSeleccionado(null)
                      }
                      className="text-gray-500 hover:text-black"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b mb-1 text-sm overflow-x-auto">
                    {[
                      {
                        id: "datosAsunto",
                        label: "Datos del registro",
                      },
                      {
                        id: "anexo",
                        label: "Anexos",
                      },
                      {
                        id: "materialAdicional",
                        label: "Material adicional",
                      },
                      {
                        id: "verTurnos",
                        label: "Ver todos los turnos",
                      },
                      {
                        id: "copias",
                        label: "Copias de conocimiento",
                      },
                      { id: "bitacora", label: "Bitácora" },
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

                  {/* CONTENIDO */}
                  <div className="flex-1 overflow-y-auto p-4">
                    {tabActiva === "datosAsunto" && (
                      <div className="space-y-6">
                        {/* DATOS GENERALES */}
                        <div>

                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-80">
                            <h2 className="text-sm font-semibold text-gray-600 mb-2">Ejercicio</h2>
                            <select name="ejercicio"className="w-full border rounded px-2 py-1 bg-gray-100 cursor-not-allowed">
                              <option value="">Seleccionar</option>
                              <option value="2024">2024</option>
                              <option value="2025">2025</option>
                              <option value="2026">2026</option>
                            </select>
                          </div>
                        </div>

                          <h3 className="text-sm font-semibold text-gray-800 mb-3">
                            Datos generales
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div>
                              <label className="block text-gray-500 mb-1">
                                No. de documento*
                              </label>
                              <input
                                value={
                                  documentoSeleccionado.folio
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
                                  documentoSeleccionado.fechaDocumento ||
                                  documentoSeleccionado.fecha
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
                                  documentoSeleccionado.fechaAcuse ||
                                  documentoSeleccionado.fecha
                                }
                                disabled
                                className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-gray-700"
                              />
                            </div>

                            <div>
                              <label className="block text-gray-500 mb-1">
                                Fecha registro*
                              </label>
                              <input
                                type="date"
                                value={
                                  documentoSeleccionado.fechaInformado ||
                                  documentoSeleccionado.fecha
                                }
                                disabled
                                className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-gray-700"
                              />
                            </div>
                          </div>
                        </div>

                        {/* REMITENTE */}
                        <div>
                          <h3 className="text-sm font-semibold text-gray-800 mb-3">
                            Remitente
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div>
                              <label className="block text-gray-500 mb-1">
                                Tipo de remitente*
                              </label>
                              <input
                                value={
                                  documentoSeleccionado.tipoRemitente ||
                                  "Interno"
                                }
                                disabled
                                className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-gray-700"
                              />
                            </div>

                            <div>
                              <label className="block text-gray-500 mb-1">
                                Remitente interno*
                              </label>
                              <input
                                value={
                                  documentoSeleccionado.remitenteInterno
                                }
                                disabled
                                className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-gray-700"
                              />
                            </div>

                          </div>
                        </div>

                        {/* DATOS ESPECÍFICOS */}
                        <div>
                          <h3 className="text-sm font-semibold text-gray-800 mb-3">
                            Datos específicos
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div>
                              <label className="block text-gray-500 mb-1">
                                Tipo de documento*
                              </label>
                              <input
                                value={
                                  documentoSeleccionado.tipoDocumento ||
                                  "Oficio"
                                }
                                disabled
                                className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-gray-700"
                              />
                            </div>

                            <div>
                              <label className="block text-gray-500 mb-1">
                                Alta de tipo de documento
                              </label>
                              <input
                                value={
                                  documentoSeleccionado.altaTipoDocumento
                                    ? "Sí"
                                    : "No"
                                }
                                disabled
                                className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-gray-700"
                              />
                            </div>

                            <div>
                              <label className="block text-gray-500 mb-1">
                                Anexos
                              </label>
                              <input
                                value={
                                  documentoSeleccionado.anexo ||
                                  "No"
                                
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
                                  documentoSeleccionado.asunto ||
                                  "Administrativo"
                                }
                                disabled
                                className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-gray-700"
                              />
                            </div>

                            <div>
                              <label className="block text-gray-500 mb-1">
                                Tema secundario
                              </label>
                              <input
                                value={
                                  documentoSeleccionado.temaSecundario ||
                                  ""
                                }
                                disabled
                                className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-gray-700"
                              />
                            </div>

                            <div>
                              <label className="block text-gray-500 mb-1">
                                Material adicional
                              </label>
                              <input
                                value={
                                  documentoSeleccionado.materialAdicional ? "Sí" : "No"
                                }
                                disabled
                                className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-gray-700"
                              />
                            </div>

                    
                            <div className="md:col-span-3">
                              <label className="block text-gray-500 mb-1">
                                Síntesis del asunto*
                              </label>
                              <textarea
                                value={
                                  documentoSeleccionado.sintesis
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
                                  documentoSeleccionado.observaciones ||
                                  ""
                                }
                                disabled
                                className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-gray-700"
                              />
                            </div>

                          </div>
                        </div>
                      </div>
                    )}
                   
                    {tabActiva === "anexo" && (
                      <div className="space-y-4">
                        {/* Tabla de anexos */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm border border-gray-200">
                            <thead className="bg-[#8B1538] text-white">
                              <tr>
                                <th className="px-4 py-2 text-left">
                                  Documento anexo
                                </th>
                                <th className="px-4 py-2 text-left">
                                  Registrador del anexo
                                </th>
                                <th className="px-4 py-2 text-left">
                                  Nombre del documento
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {/* Simulación de anexos */}
                              {[
                                {
                                  registrador:
                                    "Víctor Manuel Enríquez Paniagua",
                                  nombre:
                                    "GUARDIA NACIONAL.pdf",
                                },
                                {
                                  registrador:
                                    "María Verónica Leal Camarena",
                                  nombre:
                                    "Ficha de Gestión Instrucción Atender el tema y dar respuesta al interesado.pdf",
                                },
                                {
                                  registrador:
                                    "Víctor Manuel Enríquez Paniagua",
                                  nombre:
                                    "Ficha de Gestión Instrucción Distribuir los materiales.pdf",
                                },
                              ].map((anexo, index) => (
                                <tr
                                  key={index}
                                  className="border-t hover:bg-gray-50"
                                >
                                  <td className="px-4 py-2">
                                    <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded text-xs">
                                      Ver Archivo
                                    </button>
                                  </td>

                                  <td className="px-4 py-2 text-gray-700">
                                    {anexo.registrador}
                                  </td>

                                  <td className="px-4 py-2 text-gray-700">
                                    {anexo.nombre}
                                  </td>
                                </tr>
                              ))}
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
                              {/* Solo un material por registro */}
                              <tr className="border-t hover:bg-gray-50">
                                <td className="px-4 py-2 text-gray-700">
                                  {documentoSeleccionado?.materialAdicionalTipo || "CD"}
                                </td>

                                <td className="px-4 py-2 text-gray-700">
                                  {documentoSeleccionado?.materialAdicionalDescripcion || "Contiene información digital del asunto"}
                                </td>

                                <td className="px-4 py-2 text-gray-700">
                                  {documentoSeleccionado?.registradorMaterial || "Víctor Manuel Enríquez Paniagua"}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* Mensaje cuando no hay material */}
                        {!documentoSeleccionado?.materialAdicional && (
                          <div className="text-center text-gray-500 text-sm py-4">
                            Este documento no cuenta con material adicional.
                          </div>
                        )}
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
                                  Fecha compromiso
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
                                    <td className="px-3 py-2">{turno.instruccion}</td>
                                    <td className="px-3 py-2">{turno.funcionario}</td>
                                    <td className="px-3 py-2">{turno.areaDestino}</td>
                                    <td className="px-3 py-2">{turno.prioridad}</td>
                                    <td className="px-3 py-2">{turno.fecha}</td>
                                    <td className="px-3 py-2">{turno.areaTurna}</td>
                                    <td className="px-3 py-2">{turno.quienTurna}</td>
                                    <td className="px-3 py-2 font-medium">
                                      {turno.estatus}
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
                              {[
                                "Víctor Manuel Enríquez Paniagua",
                                "María Verónica Leal Camarena",
                                "Guillermo Bonilla Tenorio",
                                "Dirección de Administración",
                                "Unidad de Correspondencia",
                                "Órgano Interno de Control",
                              ].map((funcionario, index) => (
                                <tr
                                  key={index}
                                  className="border-t hover:bg-gray-50"
                                >
                                  <td className="px-4 py-2 text-gray-700">
                                    {funcionario}
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
                      
                                {bitacora.length ? (
                                  bitacora.map((movimiento, index) => {
                                    const esPrincipal =
                                      movimiento.tipo === "registro" ||
                                      movimiento.tipo === "turnado" ||
                                      movimiento.tipo === "autorizado";
                      
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
                                            {movimiento.usuario}
                                          </p>
                      
                                          <p className={`text-xs mt-1 ${esPrincipal ? "opacity-90" : ""}`}>
                                            {movimiento.descripcion}
                                          </p>
                                        </div>
                      
                                        <div className="text-right text-xs whitespace-nowrap">
                                          <p>{movimiento.fecha}</p>
                                          <p>{movimiento.hora}</p>
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
                </div>
              </div>
            )}

             {documentoEditar && (
              <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                <div
                  className="absolute inset-0 bg-black/40"
                  onClick={() => setDocumentoEditar(null)}
                />
            
                <div className="relative bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6">
                  
                  {/* Header */}
                  <div className="flex justify-between items-center border-b pb-4 mb-6">
                    <h2 className="text-xl font-bold text-[#8B1538]">
                      Modificación de registro
                    </h2>
            
                    <button
                      onClick={() => setDocumentoEditar(null)}
                      className="text-gray-500 hover:text-black"
                    >
                      ✕
                    </button>
                  </div>
            
                  {/* FORMULARIO EDITABLE */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            
                    <div>
                      <label className="block text-gray-500 mb-1">
                        Folio
                      </label>
                      <input
                        value={documentoEditar.folio}
                        disabled
                        className="w-full border border-gray-300 rounded px-2 py-2 bg-gray-50"
                      />
                    </div>
            
                    <div>
                      <label className="block text-gray-500 mb-1">
                        No. Documento
                      </label>
                      <input
                        value={documentoEditar.numeroDocumento}
                        onChange={(e) =>
                          setDocumentoEditar({
                            ...documentoEditar,
                            numeroDocumento: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded px-2 py-2"
                      />
                    </div>
            
                    <div className="md:col-span-2">
                      <label className="block text-gray-500 mb-1">
                        Síntesis
                      </label>
                      <textarea
                        value={documentoEditar.sintesis}
                        onChange={(e) =>
                          setDocumentoEditar({
                            ...documentoEditar,
                            sintesis: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full border border-gray-300 rounded px-2 py-2"
                      />
                    </div>
            
                    <div>
                      <label className="block text-gray-500 mb-1">
                        Estatus
                      </label>
                      <input
                        value={documentoEditar.estatus}
                        onChange={(e) =>
                          setDocumentoEditar({
                            ...documentoEditar,
                            estatus: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded px-2 py-2"
                      />
                    </div>
            
                    <div>
                      <label className="block text-gray-500 mb-1">
                        Motivo
                      </label>
                      <input
                        value={documentoEditar.motivo}
                        onChange={(e) =>
                          setDocumentoEditar({
                            ...documentoEditar,
                            motivo: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded px-2 py-2"
                      />
                    </div>
            
                  </div>
            
                  {/* Botón actualizar */}
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={() => {
                        setDocumentoEditar(null);
                      }}
                      className="bg-[#8B1538] text-white px-6 py-2 rounded-lg hover:opacity-90"
                    >
                      Actualizar
                    </button>
                  </div>
            
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}