import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { getCorrespondencias } from "../../services/correspondencia.service";

export function TableroControlSalidaCorrespondencia() {
  const [correspondencias, setCorrespondencias] = useState([]);
  const [estatusSeleccionado, setEstatusSeleccionado] = useState(null);
  const [menuContextual, setMenuContextual] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    cargarCorrespondencias();
  }, []);

  const cargarCorrespondencias = async () => {
    setCargando(true);
    try {
      const response = await getCorrespondencias();
      if (!response.ok) {
        throw new Error("Error al cargar correspondencia");
      }
      const datos = await response.json();
      setCorrespondencias(datos || []);
    } catch (error) {
      console.error(error);
      setCorrespondencias([]);
    } finally {
      setCargando(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "N/A";
    const dateObj = new Date(fecha);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${day}/${month}/${year}`;
  };

  const totalRegistrado = correspondencias.filter(
    (r) => (r.status || "").toLowerCase() === "registrado"
  ).length;

  const totalEntregado = correspondencias.filter(
    (r) => (r.status || "").toLowerCase() === "entregado"
  ).length;

  const data = [
    { name: "Registrado", value: totalRegistrado, key: "registrado" },
    { name: "Entregado", value: totalEntregado, key: "entregado" },
  ];

  const COLORS = ["#d4c29a", "#b89d5d"];

  const registrosFiltrados = estatusSeleccionado
    ? correspondencias.filter(
        (r) => (r.status || "").toLowerCase() === estatusSeleccionado
      )
    : [];

  const handleContextMenu = (e, registro) => {
    e.preventDefault();

    setMenuContextual({
      x: e.pageX,
      y: e.pageY,
      registro,
    });
  };

  const cerrarMenu = () => {
    setMenuContextual(null);
  };

  return (
    <div
      className="w-full bg-gray-100 p-4 md:p-8 overflow-y-auto"
      onClick={cerrarMenu}
    >
      
      <div className="w-full bg-white rounded-lg shadow-lg">

        {/* Header */}
        <div className="bg-gray-200 px-6 py-3">
          <h2 className="text-lg font-semibold text-gray-700">
            Tablero de Control - Salida de Correspondencia
          </h2>
        </div>

        {/* Contenido principal */}
        <div className="w-full p-6">

          {/* Gráfica */}
          <div className="w-full flex flex-col items-center">

            <h3 className="text-xl font-semibold text-gray-600 mb-6">
              Documentos
            </h3>

            <div className="w-full h-[350px]">

              <ResponsiveContainer width="100%" height="100%">

                <PieChart>

                  <Pie
                    data={data}
                    dataKey="value"
                    innerRadius="55%"
                    outerRadius="80%"
                    onClick={(data) =>
                      setEstatusSeleccionado(data.payload.key)
                    }
                  >

                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index]}
                        style={{ cursor: "pointer" }}
                      />
                    ))}

                  </Pie>

                  <Tooltip />

                </PieChart>

              </ResponsiveContainer>

            </div>

            {/* Leyenda */}

            <div className="flex flex-wrap justify-center gap-8 mt-6 text-sm">

              <div className="flex items-center gap-2">

                <span
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: COLORS[0] }}
                />

                Registrado ({totalRegistrado})

              </div>

              <div className="flex items-center gap-2">

                <span
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: COLORS[1] }}
                />

                Entregado ({totalEntregado})

              </div>

            </div>

          </div>
        </div>
      </div>

      {/* TABLA */}

      {estatusSeleccionado && (

        <div className="w-full mt-8 bg-white rounded-lg shadow-lg p-6">

          <h4 className="font-semibold mb-4 text-gray-700 text-lg">
            Registros en estatus: {estatusSeleccionado}
          </h4>

          <div className="w-full overflow-x-auto">

            <table className="min-w-full text-sm border-collapse">

              <thead style={{ backgroundColor: "#7a1f2b" }}>

                <tr className="text-white">

                  <th className="p-3 text-left">Folio</th>

                  <th className="p-3 text-left">Asunto</th>

                  <th className="p-3 text-left">Destinatario</th>

                  <th className="p-3 text-left">Fecha</th>

                </tr>

              </thead>

              <tbody>

                {registrosFiltrados.map((registro) => (

                  <tr
                    key={registro.folio}
                    onContextMenu={(e) =>
                      handleContextMenu(e, registro)
                    }
                    className="border-b hover:bg-gray-100 cursor-context-menu"
                  >

                    <td className="p-3">{registro.folio}</td>

                    <td className="p-3">{registro.asunto}</td>

                    <td className="p-3">{registro.destinatario?.name || "N/A"}</td>

                    <td className="p-3">{formatearFecha(registro.fecha)}</td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      )}

      {/* MENÚ CONTEXTUAL */}

      {menuContextual && (

        <div
          className="absolute bg-white border shadow-md rounded text-sm z-50"
          style={{
            top: menuContextual.y,
            left: menuContextual.x,
          }}
        >

          <button
            className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
            onClick={() => {

              alert(`Folio: ${menuContextual.registro?.folio}
Asunto: ${menuContextual.registro?.asunto}
Destinatario: ${menuContextual.registro?.destinatario}
Fecha: ${menuContextual.registro?.fecha}
Estatus: ${menuContextual.registro?.estatus}
Acuse: ${
                menuContextual.registro?.acuse ?? "Pendiente"
              }`);

              cerrarMenu();

            }}
          >

            Consulta registro

          </button>

        </div>

      )}

    </div>
  );
}