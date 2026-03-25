import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useState, useEffect, useRef } from "react";

/* ============================
   DATOS GRÁFICAS
============================ */

const fichasGestion = [
  { name: "Sin instrucciones", value: 1, color: "#9CA3AF" },
  {
    name: "Con instrucciones no autorizadas",
    value: 1,
    color: "#F59E0B",
  },
  {
    name: "Con instrucción turnada",
    value: 11,
    color: "#0F766E",
  },
  { name: "Con gestión cerrada", value: 3, color: "#1D4ED8" },
  { name: "Eliminados", value: 1, color: "#991B1B" },
  {
    name: "Con información faltante",
    value: 1,
    color: "#3B82F6",
  },
];

const instruccionesEnviadas = [
  { name: "Cerrado", value: 2, color: "#1D4ED8" },
  { name: "Concluido", value: 1, color: "#0F766E" },
  {
    name: "Recibido, en ejecución",
    value: 1,
    color: "#3B82F6",
  },
  { name: "Validado", value: 6, color: "#8B1538" },
  {
    name: "Autorizados y turnados",
    value: 3,
    color: "#F59E0B",
  },
  { name: "Registrado", value: 1, color: "#111827" },
];

const instruccionesRecibidas = [
  { name: "Validado", value: 4, color: "#8B1538" },
  { name: "Concluido", value: 3, color: "#0F766E" },
  {
    name: "Recibido, en ejecución",
    value: 2,
    color: "#3B82F6",
  },
];

const copiasConocimiento = [
  { name: "Leído", value: 5, color: "#0F766E" },
  { name: "Por leer", value: 2, color: "#9CA3AF" },
];

const documentosInternos = 18;

/* ============================
   DOCUMENTOS SIMULADOS
============================ */

const documentos = [
  {
    folio: "2025000001",
    numeroDocumento: "OFI-001",
    fecha: "2025-02-01",
    sintesis: "Agradecimiento",
    remitenteInterno: "Dirección Administrativa",
    remitenteExterno: "Secretaría General",
    estatus: "Con instrucción turnada",
    motivo: "Turnado a área técnica",
  },
  {
    folio: "2025000002",
    numeroDocumento: "OFI-002",
    fecha: "2025-02-02",
    sintesis: "Solicitud de información",
    remitenteInterno: "Recursos Humanos",
    remitenteExterno: "Dependencia Estatal",
    estatus: "Sin instrucciones",
    motivo: "Pendiente de asignación",
  },
  {
    folio: "2025000003",
    numeroDocumento: "OFI-003",
    fecha: "2025-02-03",
    sintesis: "Reporte mensual",
    remitenteInterno: "Finanzas",
    remitenteExterno: "Órgano Interno",
    estatus: "Con gestión cerrada",
    motivo: "Gestión finalizada",
  },
];

/* ============================
   COMPONENTE DONUT
============================ */

function DonutChart({ title, data, clickable, onClickSegment }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h3 className="text-base font-semibold text-gray-700 mb-4">
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

      {/* LEYENDA */}
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

  const [estatusSeleccionado, setEstatusSeleccionado] =
    useState(null);

  const [paginaActual, setPaginaActual] = useState(1);

  const [menuContextual, setMenuContextual] = useState(null);

  const [documentoSeleccionado, setDocumentoSeleccionado] =
    useState(null);

  const tablaModalRef = useRef(null);

  const registrosPorPagina = 6;

  const documentosFiltrados = documentos.filter(
    (doc) => doc.estatus === estatusSeleccionado
  );

  const totalPaginas = Math.ceil(
    documentosFiltrados.length / registrosPorPagina
  );

  const indexInicio = (paginaActual - 1) * registrosPorPagina;

  const indexFin = indexInicio + registrosPorPagina;

  const documentosPaginados = documentosFiltrados.slice(
    indexInicio,
    indexFin
  );

  useEffect(() => {
    const cerrarMenu = () => setMenuContextual(null);
    window.addEventListener("click", cerrarMenu);
    return () =>
      window.removeEventListener("click", cerrarMenu);
  }, []);

  const exportarExcelModal = () => {

    const encabezados = [
      "Folio",
      "Documento",
      "Fecha",
      "Síntesis",
      "Remitente interno",
      "Remitente externo",
      "Estatus",
      "Motivo",
    ];

    const filas = documentosFiltrados.map((doc) => [
      doc.folio,
      doc.numeroDocumento,
      doc.fecha,
      doc.sintesis,
      doc.remitenteInterno,
      doc.remitenteExterno,
      doc.estatus,
      doc.motivo,
    ]);

    let contenidoCSV =
      encabezados.join(",") +
      "\n" +
      filas.map((fila) => fila.join(",")).join("\n");

    const blob = new Blob(["\uFEFF" + contenidoCSV], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    link.download = `Documentos_${estatusSeleccionado}.csv`;

    link.click();
  };

  return (
    <div className="flex-1 p-6 bg-gray-100 overflow-y-auto">

      <h1 className="text-3xl font-bold text-[#8B1538] mb-6">
        Tablero de Control
      </h1>

      {/* GRID DE GRÁFICAS */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        <DonutChart
          title="Fichas de Gestión"
          data={fichasGestion}
          clickable
          onClickSegment={(estatus) => {
            setEstatusSeleccionado(estatus);
            setPaginaActual(1);
          }}
        />

        <DonutChart
          title="Instrucciones enviadas"
          data={instruccionesEnviadas}
        />

        <DonutChart
          title="Instrucciones recibidas"
          data={instruccionesRecibidas}
        />

        <DonutChart
          title="Copias de conocimiento"
          data={copiasConocimiento}
        />

        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col justify-center items-center text-center">
          <h3 className="text-base font-semibold text-gray-700 mb-4">
            Documentos internos
          </h3>

          <span className="text-5xl font-bold text-[#8B1538]">
            {documentosInternos}
          </span>
        </div>
      </div>

      {/* MODAL */}

      {estatusSeleccionado && (
        <div className="fixed inset-0 flex items-center justify-center z-50">

          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setEstatusSeleccionado(null)}
          />

          <div className="relative bg-white w-11/12 max-w-5xl p-6 rounded-2xl shadow-2xl">

            <div className="flex justify-between mb-4">

              <h3 className="text-xl font-semibold text-[#8B1538]">
                Documentos: {estatusSeleccionado}
              </h3>

              <button
                onClick={() => setEstatusSeleccionado(null)}
              >
                ✕
              </button>

            </div>

            <button
              onClick={exportarExcelModal}
              className="bg-green-600 text-white px-4 py-2 rounded mb-4"
            >
              Exportar Excel
            </button>

            <div
              ref={tablaModalRef}
              className="overflow-x-auto"
            >

              <table className="w-full text-sm border">

                <thead className="bg-[#8B1538] text-white">

                  <tr>
                    <th className="px-3 py-2 text-left">
                      Folio
                    </th>

                    <th className="px-3 py-2 text-left">
                      Documento
                    </th>

                    <th className="px-3 py-2 text-left">
                      Fecha
                    </th>

                    <th className="px-3 py-2 text-left">
                      Síntesis
                    </th>

                    <th className="px-3 py-2 text-left">
                      Remitente interno
                    </th>

                    <th className="px-3 py-2 text-left">
                      Remitente externo
                    </th>

                    <th className="px-3 py-2 text-left">
                      Estatus
                    </th>

                    <th className="px-3 py-2 text-left">
                      Motivo
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {documentosPaginados.map((doc, index) => (
                    <tr
                      key={index}
                      className="border-t hover:bg-gray-50"
                      onContextMenu={(e) => {
                        e.preventDefault(); // evita menú nativo

                        setDocumentoSeleccionado(doc);

                        setMenuContextual({
                          x: e.clientX,
                          y: e.clientY,
                        });
                      }}
                    >
                      <td className="px-3 py-2">
                        {doc.folio}
                      </td>

                      <td className="px-3 py-2">
                        {doc.numeroDocumento}
                      </td>

                      <td className="px-3 py-2">
                        {doc.fecha}
                      </td>

                      <td className="px-3 py-2">
                        {doc.sintesis}
                      </td>

                      <td className="px-3 py-2">
                        {doc.remitenteInterno}
                      </td>

                      <td className="px-3 py-2">
                        {doc.remitenteExterno}
                      </td>

                      <td className="px-3 py-2">
                        {doc.estatus}
                      </td>

                      <td className="px-3 py-2">
                        {doc.motivo}
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

          </div>

        </div>
      )}

      {menuContextual && (
        <div
          className="fixed bg-white shadow-lg rounded-lg border z-50 w-48"
          style={{
            top: menuContextual.y,
            left: menuContextual.x,
          }}
        >
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            onClick={() => {
              alert(`Ver Documento de ${documentoSeleccionado.folio}`);
              setMenuContextual(null);
            }}
          >
            Ver Documento
          </button>

          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            onClick={() => {
              alert(`Editar ${documentoSeleccionado.folio}`);
              setMenuContextual(null);
            }}
          >
            Editar
          </button>

          <button
            className="block w-full text-left px-4 py-2 hover:bg-red-100 text-red-600"
            onClick={() => {
              alert(`Eliminar ${documentoSeleccionado.folio}`);
              setMenuContextual(null);
            }}
          >
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
}