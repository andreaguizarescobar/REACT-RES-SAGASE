import { Minus } from 'lucide-react';
import { useState } from 'react';

export function ReporteAsuntos() {

  const [form, setForm] = useState({
    origen: '',
    unidadAdministrativa: '',
    fechaInicio: '',
    fechaFin: '',
    registrados: false,
    autorizadosTurnados: false,
    recibidosEjecucion: false,
    atencionConcluida: false,
    atencionValidada: false,
    cerrados: false
  });

  const datosReporte = [
    {
      folio: "26-2022",
      numeroDocumento: "OFI-01/2022",
      origenTurno: "Dirección Desarrollo Archivístico",
      areaTurnada: "Dirección Jurídica",
      asunto: "Solicitud de baja de expedientes",
      fechaCompromiso: "2022-07-22",
      instruccion: "Atender conforme proceda",
      estatus: "Cerrado"
    },
    {
      folio: "34-2022",
      numeroDocumento: "OFI-06/2022",
      origenTurno: "Dirección General",
      areaTurnada: "Dirección Administración",
      asunto: "Actualización de inventario",
      fechaCompromiso: "2022-08-01",
      instruccion: "Revisar y validar",
      estatus: "Autorizados y turnados"
    }
  ];

  const [resultados, setResultados] = useState(datosReporte);
  const [mostrarReporte, setMostrarReporte] = useState(false);

  const handleToggle = (name) => {
    setForm((prev) => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const handleOrigenToggle = (value) => {
    setForm((prev) => ({
      ...prev,
      origen: prev.origen === value ? '' : value
    }));
  };

  const Toggle = ({ label, checked, onChange, className = '' }) => (
    <div className={`flex items-center justify-between gap-4 w-full ${className}`}>
      <span className="flex-1 text-xs sm:text-sm">
        {label}
      </span>

      <button
        type="button"
        onClick={onChange}
        className={`relative flex-shrink-0 w-10 h-5 rounded-full transition-colors ${
          checked ? 'bg-[#8B1538]' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute top-[2px] left-[2px] h-4 w-4 bg-white rounded-full transition-transform ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </div>
  );

  const exportarExcel = () => {
    const encabezados = [
      "Folio",
      "Número de documento",
      "Origen del turno",
      "Área turnada",
      "Asunto",
      "Fecha compromiso",
      "Instrucción",
      "Estatus"
    ];

    const filas = resultados.map((item) =>
      [
        item.folio,
        item.numeroDocumento,
        item.origenTurno,
        item.areaTurnada,
        item.asunto,
        item.fechaCompromiso,
        item.instruccion,
        item.estatus
      ].join(",")
    );

    const csvContenido =
      encabezados.join(",") + "\n" + filas.join("\n");

    const blob = new Blob([csvContenido], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "reporte_asuntos.csv";
    link.click();
  };

  const exportarPDF = () => {
    window.print();
  };

  return (
    <div className="flex-1 w-full p-6 bg-gray-100 overflow-y-auto">

      {/* Header */}
      <div className="bg-gray-300 rounded-t-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3">
        <h1 className="text-sm font-semibold text-gray-800">
          Reporte de Asuntos
        </h1>
        <button className="w-6 h-6 flex items-center justify-center rounded-full bg-[#8B1538] text-white">
          <Minus size={14} />
        </button>
      </div>

      {/* Contenedor */}
      <div className="w-full bg-white p-4 sm:p-6 md:p-8 rounded-b-md shadow-sm space-y-10 text-xs">

        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Origen del turno
          </h2>

          <div className="space-y-8">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 max-w-md">
              <Toggle
                label="Recibido"
                checked={form.origen === 'recibido'}
                onChange={() => handleOrigenToggle('recibido')}
              />

              <Toggle
                label="Enviado"
                checked={form.origen === 'enviado'}
                onChange={() => handleOrigenToggle('enviado')}
              />
            </div>

            {form.origen === 'enviado' && (
              <div className="space-y-4 max-w-3xl">

                <p className="text-xs text-gray-700">
                  Se muestran todos los asuntos ENVIADOS DESDE su área,
                  si desea filtrar los asuntos que envió a un área específica
                  indíquelo en el campo siguiente:
                </p>

                <div>
                  <label className="block mb-1">
                    Unidad Administrativa:
                  </label>

                  <select
                    value={form.unidadAdministrativa}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        unidadAdministrativa: e.target.value
                      })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                  >
                    <option value="">Seleccione una unidad</option>
                    <option value="direccion_general">Dirección General</option>
                    <option value="finanzas">Finanzas</option>
                    <option value="administracion">Administración</option>
                    <option value="juridico">Jurídico</option>
                  </select>
                </div>

              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 max-w-2xl">
              <input
                type="date"
                value={form.fechaInicio}
                onChange={(e) =>
                  setForm({ ...form, fechaInicio: e.target.value })
                }
                className="w-full border border-gray-300 rounded px-2 py-1"
              />

              <input
                type="date"
                value={form.fechaFin}
                onChange={(e) =>
                  setForm({ ...form, fechaFin: e.target.value })
                }
                className="w-full border border-gray-300 rounded px-2 py-1"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
              <Toggle label="Registrados" checked={form.registrados} onChange={() => handleToggle('registrados')} />
              <Toggle label="Autorizados y turnados" checked={form.autorizadosTurnados} onChange={() => handleToggle('autorizadosTurnados')} />
              <Toggle label="Recibidos en ejecución" checked={form.recibidosEjecucion} onChange={() => handleToggle('recibidosEjecucion')} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
              <Toggle label="Con atención concluida" checked={form.atencionConcluida} onChange={() => handleToggle('atencionConcluida')} />
              <Toggle label="Con atención validada" checked={form.atencionValidada} onChange={() => handleToggle('atencionValidada')} />
              <Toggle label="Cerrados" checked={form.cerrados} onChange={() => handleToggle('cerrados')} />
            </div>

          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center pt-6">
          <button
            onClick={() => {
              setResultados(datosReporte);
              setMostrarReporte(true);
            }}
            className="w-full sm:w-auto bg-[#8B1538] text-white px-12 py-2 rounded hover:opacity-90 transition"
          >
            Generar
          </button>

          {mostrarReporte && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

              <div className="w-[95%] max-w-6xl bg-white rounded shadow-xl overflow-hidden">

                <div className="bg-gray-600 text-white flex items-center justify-between px-4 py-2 text-xs">
                  <div className="flex gap-2">
                    <button onClick={exportarPDF} className="bg-red-600 px-2 py-1 rounded">PDF</button>
                    <button onClick={exportarExcel} className="bg-green-600 px-2 py-1 rounded">Excel</button>
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
                        Sistema Automatizado de Gestión y Archivo de la Secretaría de Salud SAGASE
                      </h2>
                      <p>Reporte de Asuntos</p>
                      <p>Dirección de Desarrollo Archivístico Nacional</p>
                      <p className="font-semibold">
                        Del NO ESPECIFICADO al NO ESPECIFICADO
                      </p>
                    </div>

                    <div className="text-[11px] mb-4 space-y-1">
                      <p><strong>Origen del Turno:</strong> {form.origen ? form.origen.toUpperCase() : "NO ESPECIFICADO"}</p>

                      <p>
                        <strong>Estatus:</strong>{" "}
                        {[
                          form.registrados && "Registrados",
                          form.autorizadosTurnados && "Autorizados y turnados",
                          form.recibidosEjecucion && "Recibidos en ejecución",
                          form.atencionConcluida && "Con atención concluida",
                          form.atencionValidada && "Con atención validada",
                          form.cerrados && "Cerrados"
                        ].filter(Boolean).join(", ") || "NO ESPECIFICADO"}
                      </p>
                    </div>

                    <table className="w-full text-[11px] border border-[#8B1538]">
                      <thead className="bg-[#8B1538] text-white">
                        <tr>
                          <th className="px-2 py-2 border">FOLIO</th>
                          <th className="px-2 py-2 border">N° DE DOCUMENTO</th>
                          <th className="px-2 py-2 border">ORIGEN DE TURNO</th>
                          <th className="px-2 py-2 border">TURNADO A</th>
                          <th className="px-2 py-2 border">ASUNTO</th>
                          <th className="px-2 py-2 border">FECHA COMPROMISO</th>
                          <th className="px-2 py-2 border">INSTRUCCIÓN</th>
                          <th className="px-2 py-2 border">ESTATUS</th>
                        </tr>
                      </thead>

                      <tbody>
                        {resultados.map((item, index) => (
                          <tr key={index}>
                            <td className="px-2 py-2 border">{item.folio}</td>
                            <td className="px-2 py-2 border">{item.numeroDocumento}</td>
                            <td className="px-2 py-2 border">{item.origenTurno}</td>
                            <td className="px-2 py-2 border">{item.areaTurnada}</td>
                            <td className="px-2 py-2 border">{item.asunto}</td>
                            <td className="px-2 py-2 border">{item.fechaCompromiso}</td>
                            <td className="px-2 py-2 border">{item.instruccion}</td>
                            <td className="px-2 py-2 border">{item.estatus}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
