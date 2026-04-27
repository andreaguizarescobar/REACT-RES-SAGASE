import { Minus } from "lucide-react";
import { useState, useEffect } from "react";
import { reporteAcuerdos } from "../../services/document.service";


export function ReporteAcuerdos() {

  const [form, setForm] = useState({
    fechaInicio: "",
    fechaFin: ""
  });

  const [mostrarReporte, setMostrarReporte] = useState(false);

  const [datosAcuerdos, setDatosAcuerdos] = useState([]);

  const exportarExcel = () => {
    const encabezados = [
      "Folio",
      "Tipo documento",
      "N° documento",
      "Estatus",
      "Procedencia remitente",
      "Asunto",
      "Instrucción",
      "Fecha de acuse"
    ];


    const filas = datosAcuerdos.map((item) =>
      [
        item.folio,
        item.tipoDocumento,
        item.docId,
        item.status,
        item.remitente,
        item.asunto,
        item.turnados.instruccion,
        item.turnados.fechaTurnado
      ].join(",")
    );

    const csvContenido =
      encabezados.join(",") + "\n" + filas.join("\n");

    const blob = new Blob([csvContenido], {
      type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "reporte_acuerdos.csv";
    link.click();
  };

  const exportarPDF = () => {
    window.print();
  };

  const handleSubmit = async () => {
    const response = await reporteAcuerdos({fechaInicio: form.fechaInicio,fechaFin: form.fechaFin} ,localStorage.getItem("token"));
    setDatosAcuerdos(await response.json())
    setMostrarReporte(true);
  };

  return (
    <div className="flex-1 w-full p-6 bg-gray-100 overflow-y-auto">

      {/* Header */}
      <div className="bg-gray-300 rounded-t-md flex items-center justify-between px-4 py-3">
        <h1 className="text-sm font-semibold text-gray-800">
          Reporte de Acuerdos
        </h1>

        <button className="w-6 h-6 flex items-center justify-center rounded-full bg-[#8B1538] text-white">
          <Minus size={14} />
        </button>
      </div>

      {/* Contenedor */}
      <div className="w-full bg-white p-10 rounded-b-md shadow-sm">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-3xl mx-auto">
          
          <div>
            <label className="block text-sm mb-2">
              Fecha inicial de turnado:
            </label>

            <input
              type="date"
              value={form.fechaInicio}
              onChange={(e) =>
                setForm({ ...form, fechaInicio: e.target.value })
              }
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">
              Fecha final de turnado:
            </label>

            <input
              type="date"
              value={form.fechaFin}
              onChange={(e) =>
                setForm({ ...form, fechaFin: e.target.value })
              }
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

        </div>

        <div className="flex justify-center mt-10">
          <button
            onClick={handleSubmit}
            className="bg-[#8B1538] text-white px-16 py-2 rounded hover:opacity-90 transition"
          >
            Guardar
          </button>
        </div>

      </div>

      {/* MODAL REPORTE */}
      {mostrarReporte && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="w-[95%] max-w-6xl bg-white rounded shadow-xl overflow-hidden">

            {/* Barra superior */}
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

              <div className="font-semibold">
                Página 1 de 1
              </div>

              <button
                onClick={() => setMostrarReporte(false)}
                className="bg-[#8B1538] w-6 h-6 rounded-full flex items-center justify-center"
              >
                ×
              </button>

            </div>

            {/* Contenido */}
            <div className="p-8 bg-gray-100 overflow-y-auto max-h-[80vh]">

              <div className="bg-white p-8 shadow">

                {/* Encabezado */}
                <div className="text-center space-y-1 mb-6 text-xs">
                  <h2 className="font-semibold">
                    Sistema Automatizado de Gestión y Archivo de la Secretaría de Educación SAGASE
                  </h2>

                  <p>Reporte de Acuerdos</p>

                  <p>
                    Dirección de Tecnologías de la Información y Comunicaciones
                  </p>

                  <p className="font-semibold">
                    Del {form.fechaInicio || "NO ESPECIFICADO"} al{" "}
                    {form.fechaFin || "NO ESPECIFICADO"}
                  </p>
                </div>

                {/* Tabla */}
                <div className="overflow-x-auto">

                  <table className="w-full text-[11px] border border-[#8B1538]">

                    <thead className="bg-[#8B1538] text-white">
                      <tr>
                        <th className="px-2 py-2 border">FOLIO</th>
                        <th className="px-2 py-2 border">TIPO DE DOCUMENTO</th>
                        <th className="px-2 py-2 border">N° DE DOCUMENTO</th>
                        <th className="px-2 py-2 border">ESTATUS</th>
                        <th className="px-2 py-2 border">PROCEDENCIA REMITENTE</th>
                        <th className="px-2 py-2 border">ASUNTO</th>
                        <th className="px-2 py-2 border">INSTRUCCIÓN</th>
                        <th className="px-2 py-2 border">FECHA DE ACUSE</th>
                      </tr>
                    </thead>

                    <tbody>

                      {datosAcuerdos.length > 0 ? (datosAcuerdos.map((item, index) => (
                        item.turnados.map(turno => (
                        <tr key={index} className="border-t">

                          <td className="px-2 py-2 border">
                            {item.folio}
                          </td>

                          <td className="px-2 py-2 border">
                            {item.tipo.tipo}
                          </td>

                          <td className="px-2 py-2 border">
                            {item.docId}
                          </td>

                          <td className="px-2 py-2 border">
                            {item.status}
                          </td>

                          <td className="px-2 py-2 border">
                            {item.remitente.name}
                          </td>

                          <td className="px-2 py-2 border">
                            {item.asunto}
                          </td>

                          <td className="px-2 py-2 border">
                            {turno.instruccion.descripcion}
                          </td>

                          <td className="px-2 py-2 border">
                            {turno.fechaTurnado.split("T")[0]}
                          </td>

                        </tr>
                      ))))) : (
                        <tr>
                          <td colSpan={8} className="text-center py-4 text-gray-400">
                            Sin copias registradas
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
  );
}
