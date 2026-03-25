import { Minus, Printer, FileSpreadsheet, Download } from "lucide-react";
import { useState } from "react";

export function ReporteSalidaCorrespondencia() {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [resultados, setResultados] = useState([]);

  // Simulación de área del usuario logueado
  const areaUsuario = "Dirección General";

  const dataMock = [
    {
      folio: "1-2023",
      tipoDocumento: "Oficio",
      numeroDocumento: "DG-001",
      estatus: "Enviado",
      remitente: "Dirección General",
      asunto: "Solicitud de información",
      instruccion: "Dar seguimiento",
      fecha: "2023-03-06",
      area: "Dirección General",
    },
    {
      folio: "2-2023",
      tipoDocumento: "Informe",
      numeroDocumento: "DG-002",
      estatus: "Entregado",
      remitente: "Dirección General",
      asunto: "Reporte mensual",
      instruccion: "Archivar",
      fecha: "2023-03-20",
      area: "Dirección General",
    },
    {
      folio: "3-2023",
      tipoDocumento: "Oficio",
      numeroDocumento: "ADM-001",
      estatus: "Enviado",
      remitente: "Administración",
      asunto: "Solicitud interna",
      instruccion: "Revisar",
      fecha: "2023-03-15",
      area: "Administración",
    },
  ];

  const handleConsultar = () => {
    if (!fechaInicio || !fechaFin) return;

    const filtrado = dataMock.filter(
      (item) =>
        item.area === areaUsuario &&
        item.fecha >= fechaInicio &&
        item.fecha <= fechaFin
    );

    setResultados(filtrado);
  };

  const exportToExcel = () => {
    const headers =
      "Folio,Tipo Documento,Número Documento,Estatus,Remitente,Asunto,Instrucción\n";

    const rows = resultados
      .map(
        (r) =>
          `${r.folio},${r.tipoDocumento},${r.numeroDocumento},${r.estatus},"${r.remitente}","${r.asunto}","${r.instruccion}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "reporte_salida_correspondencia.csv";
    link.click();
  };

  const imprimir = () => {
    window.print();
  };

  const descargar = () => {
    exportToExcel();
  };

  return (
    <div className="flex-1 p-6 bg-gray-100 overflow-y-auto">
      {/* Header */}
      <div className="bg-gray-300 rounded-t-md flex items-center justify-between px-4 py-2">
        <h1 className="text-sm font-semibold text-gray-800">
          Reporte Salida de Correspondencia
        </h1>
        <button className="w-6 h-6 flex items-center justify-center rounded-full bg-[#8B1538] text-white">
          <Minus size={14} />
        </button>
      </div>

      <div className="bg-white p-6 rounded-b-md shadow-sm space-y-8 text-xs">
        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div>
            <label className="block mb-1">Fecha de inicio:</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>

          <div>
            <label className="block mb-1">Fecha fin:</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>

          <div className="flex justify-center md:justify-start">
            <button
              onClick={handleConsultar}
              className="bg-red-600 text-white px-10 py-2 rounded hover:opacity-90"
            >
              Consultar
            </button>
          </div>
        </div>

        {/* Resultados */}
        {resultados.length > 0 && (
          <>
            {/* Acciones */}
            <div className="flex gap-4">
              <button
                onClick={imprimir}
                className="flex items-center gap-2 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
              >
                <Printer size={16} /> Imprimir
              </button>

              <button
                onClick={descargar}
                className="flex items-center gap-2 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
              >
                <Download size={16} /> Descargar
              </button>

              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
              >
                <FileSpreadsheet size={16} /> Exportar Excel
              </button>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto border rounded">
              <table className="min-w-full text-xs">
                <thead className="bg-[#8B1538] text-white">
                  <tr>
                    <th className="px-3 py-2 text-left">Folio</th>
                    <th className="px-3 py-2 text-left">Tipo Documento</th>
                    <th className="px-3 py-2 text-left">Número Documento</th>
                    <th className="px-3 py-2 text-left">Estatus</th>
                    <th className="px-3 py-2 text-left">Remitente</th>
                    <th className="px-3 py-2 text-left">Asunto</th>
                    <th className="px-3 py-2 text-left">Instrucción</th>
                  </tr>
                </thead>

                <tbody>
                  {resultados.map((r, i) => (
                    <tr key={i} className="border-t hover:bg-gray-100">
                      <td className="px-3 py-2">{r.folio}</td>
                      <td className="px-3 py-2">{r.tipoDocumento}</td>
                      <td className="px-3 py-2">{r.numeroDocumento}</td>
                      <td className="px-3 py-2">{r.estatus}</td>
                      <td className="px-3 py-2">{r.remitente}</td>
                      <td className="px-3 py-2">{r.asunto}</td>
                      <td className="px-3 py-2">{r.instruccion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
