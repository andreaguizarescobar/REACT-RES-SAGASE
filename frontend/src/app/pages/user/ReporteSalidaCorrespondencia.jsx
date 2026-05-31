import { Minus, Printer, FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import { getCorrespondencias } from "../../services/correspondencia.service";

export function ReporteSalidaCorrespondencia() {
  const [form, setForm] = useState({
    fechaInicio: "",
    fechaFin: "",
  });
  const [datosCorrespondencia, setDatosCorrespondencia] = useState([]);
  const [mostrarReporte, setMostrarReporte] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleConsultar = async () => {
    if (!form.fechaInicio || !form.fechaFin) return;

    setCargando(true);

    try {
      const response = await getCorrespondencias({
        fechaInicio: form.fechaInicio,
        fechaFin: form.fechaFin,
      });

      if (!response.ok) {
        throw new Error("Error al consultar correspondencias");
      }

      const datos = await response.json();
      setDatosCorrespondencia(datos);
      setMostrarReporte(true);
    } catch (error) {
      console.error(error);
      setDatosCorrespondencia([]);
      setMostrarReporte(true);
    } finally {
      setCargando(false);
    }
  };

  const exportarExcel = () => {
    const encabezados = [
      "Folio",
      "Fecha",
      "Folio SAGA",
      "Destinatario",
      "Asunto",
      "Soporte",
      "Importancia",
      "Estatus",
    ];

    const filas = datosCorrespondencia.map((item) => {
      const fecha = item.fecha ? item.fecha.split("T")[0] : "";
      const folioSAGA = item.doc?.docId || "Sin datos";
      const destinatario = item.destinatario?.name || "Sin datos";
      return [
        item.folio || "",
        fecha,
        folioSAGA,
        destinatario,
        item.asunto || "",
        item.soporte || "",
        item.importancia || "",
        item.status || "",
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(",");
    });

    const csvContenido = encabezados.join(",") + "\n" + filas.join("\n");
    const blob = new Blob([csvContenido], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "reporte_salida_correspondencia.csv";
    link.click();
  };

  const exportarPDF = () => {
    window.print();
  };

  return (
    <div className="flex-1 p-6 bg-gray-100 overflow-y-auto">
      <div className="bg-gray-300 rounded-t-md flex items-center justify-between px-4 py-2">
        <h1 className="text-sm font-semibold text-gray-800">
          Reporte Salida de Correspondencia
        </h1>
        <button className="w-6 h-6 flex items-center justify-center rounded-full bg-[#8B1538] text-white">
          <Minus size={14} />
        </button>
      </div>

      <div className="bg-white p-6 rounded-b-md shadow-sm space-y-8 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div>
            <label className="block mb-1">Fecha de inicio:</label>
            <input
              type="date"
              value={form.fechaInicio}
              onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
              className="w-full border rounded px-2 py-1"
            />
          </div>

          <div>
            <label className="block mb-1">Fecha fin:</label>
            <input
              type="date"
              value={form.fechaFin}
              onChange={(e) => setForm({ ...form, fechaFin: e.target.value })}
              className="w-full border rounded px-2 py-1"
            />
          </div>

          <div className="flex justify-center md:justify-start">
            <button
              onClick={handleConsultar}
              className="bg-[#79142A] text-white px-10 py-1 rounded hover:opacity-90"
            >
              Consultar
            </button>
          </div>
        </div>

        {mostrarReporte && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-6xl bg-white rounded shadow-xl overflow-hidden">
              <div className="bg-gray-600 text-white flex items-center justify-between px-4 py-2 text-xs">
                <div className="flex gap-2">
                  <button
                    onClick={exportarPDF}
                    className="bg-red-600 px-2 py-1 rounded"
                  >
                    PDF
                  </button>
                  <button
                    onClick={exportarExcel}
                    className="bg-green-600 px-2 py-1 rounded"
                  >
                    Excel
                  </button>
                </div>
                <div className="font-semibold">Página 1 de 1</div>
                <button
                  onClick={() => setMostrarReporte(false)}
                  className="bg-[#8B1538] w-6 h-6 rounded-full flex items-center justify-center"
                >
                  ×
                </button>
              </div>

              <div className="p-8 bg-gray-100 overflow-y-auto max-h-[80vh]">
                <div className="bg-white p-8 shadow">
                  <div className="text-center space-y-1 mb-6 text-xs">
                    <h2 className="font-semibold">
                      Sistema Automatizado de Gestión y Archivo de la Secretaría de Educación SAGASE
                    </h2>
                    <p>Reporte de Salida de Correspondencia</p>
                    <p>Dirección de Tecnologías de la Información y Comunicaciones</p>
                    <p className="font-semibold">
                      Del {form.fechaInicio || "NO ESPECIFICADO"} al {form.fechaFin || "NO ESPECIFICADO"}
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px] border border-[#8B1538]">
                      <thead className="bg-[#8B1538] text-white">
                        <tr>
                          <th className="px-2 py-2 border">FOLIO</th>
                          <th className="px-2 py-2 border">FECHA</th>
                          <th className="px-2 py-2 border">FOLIO SAGA</th>
                          <th className="px-2 py-2 border">DESTINATARIO</th>
                          <th className="px-2 py-2 border">ASUNTO</th>
                          <th className="px-2 py-2 border">SOPORTE</th>
                          <th className="px-2 py-2 border">IMPORTANCIA</th>
                          <th className="px-2 py-2 border">ESTATUS</th>
                        </tr>
                      </thead>

                      <tbody>
                        {cargando ? (
                          <tr>
                            <td colSpan={8} className="text-center py-8 text-gray-500">
                              Cargando correspondencias...
                            </td>
                          </tr>
                        ) : datosCorrespondencia.length > 0 ? (
                          datosCorrespondencia.map((item, index) => (
                            <tr key={item._id || index} className="border-t">
                              <td className="px-2 py-2 border">{item.folio || "-"}</td>
                              <td className="px-2 py-2 border">
                                {item.fecha ? item.fecha.split("T")[0] : "-"}
                              </td>
                              <td className="px-2 py-2 border">{item.doc?.docId || "Sin datos"}</td>
                              <td className="px-2 py-2 border">{item.destinatario?.name || "Sin datos"}</td>
                              <td className="px-2 py-2 border">{item.asunto || "-"}</td>
                              <td className="px-2 py-2 border">{item.soporte || "-"}</td>
                              <td className="px-2 py-2 border">{item.importancia || "-"}</td>
                              <td className="px-2 py-2 border">{item.status || "-"}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={8} className="text-center py-8 text-gray-400">
                              No se encontraron correspondencias para ese rango de fechas.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
