import { useState, useEffect } from "react";
import { getDocuments } from "../../services/document.service.js";

export default function BuscadorDocumentos() {
  const [criterio, setCriterio] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const filasPorPagina = 10;

  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuContextual, setMenuContextual] = useState(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        const response = await getDocuments(token);

        if (!response.ok) {
          setError("No se pudieron cargar los documentos.");
          console.error("Error cargando documentos:", response.status, response.statusText);
          return;
        }

        const data = await response.json();
        setDocumentos(Array.isArray(data) ? data : []);
      } catch (fetchError) {
        setError("Error de red al cargar los documentos.");
        console.error("Error cargando documentos:", fetchError);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const resultadosFiltrados = documentos.filter((doc) =>
    Object.values(doc)
      .join(" ")
      .toLowerCase()
      .includes(criterio.toLowerCase())
  );

const totalPaginas = Math.ceil(resultadosFiltrados.length / filasPorPagina);

  const indiceInicial = (paginaActual - 1) * filasPorPagina;
  const indiceFinal = indiceInicial + filasPorPagina;

  const resultadosPaginados = resultadosFiltrados.slice(indiceInicial, indiceFinal);
  console.log("Documentos cargados:", documentos);
  const handleRightClick = (e, documento) => {
    e.preventDefault();
    setMenuContextual({
      x: e.clientX,
      y: e.clientY,
      documento,
    });
  };

  const cerrarMenu = () => setMenuContextual(null);

  const [modalVerAbierto, setModalVerAbierto] = useState(false);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);
  const [tabActiva, setTabActiva] = useState("datosAsunto");

  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [documentoEditando, setDocumentoEditando] = useState(null);

  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [motivoEliminacion, setMotivoEliminacion] = useState("");
  const [confirmarEliminacion, setConfirmarEliminacion] = useState(false);
  const [mensajeNoPermitido, setMensajeNoPermitido] = useState("");

  const guardarCambios = () => {
    if (!documentoEditando) return;

    const nuevosDocumentos = documentos.map((doc) =>
      doc.docId === documentoEditando.docId ? documentoEditando : doc
    );

    setDocumentos(nuevosDocumentos);
    setModalEditarAbierto(false);
  };

  // Simple render so the page shows in MainContent
  return (
    <main className="flex-1 p-4 bg-white">
      <h1 className="text-lg font-medium text-[#60595D]-800 mb-4">Buscador de documentos</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={criterio}
          onChange={(e) => setCriterio(e.target.value)}
          placeholder="Buscar por folio, remitente, síntesis..."
          className="flex-1 px-3 py-2 border rounded"
        />
      </div>

      <div className="overflow-x-auto bg-white border rounded-lg shadow-sm">
        <table className="min-w-full text-xs">
          
          {/* HEADER */}
          <thead className="bg-[#79142A] text-white">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Folio</th>
              <th className="px-4 py-3 text-left font-medium">Número</th>
              <th className="px-4 py-3 text-left font-medium">Fecha</th>
              <th className="px-4 py-3 text-left font-medium">Síntesis</th>
              <th className="px-4 py-3 text-left font-medium">Remitente</th>
              <th className="px-4 py-3 text-left font-medium">Estatus</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  Cargando documentos...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-red-500">
                  {error}
                </td>
              </tr>
            ) : resultadosPaginados.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-[#60595D]">
                  Sin resultados
                </td>
              </tr>
            ) : (
              resultadosPaginados.map((doc, index) => (
                <tr
                  key={doc.docId || doc._id}
                  onContextMenu={(e) => handleRightClick(e, doc)}
                  className={`border-t cursor-context-menu transition ${
                    index % 2 === 0 ? "bg-white" : "bg-[#60595D]-50"
                  } hover:bg-gray-100`}
                >
                  <td className="px-4 py-2 font-medium text-gray-700">
                    {doc.folio}
                  </td>
                  <td className="px-4 py-2">{doc.docId}</td>
                  <td className="px-4 py-2">
                    {doc.fechaDoc ? new Date(doc.fechaDoc).toLocaleDateString() : ''}
                  </td>
                  <td className="px-4 py-2">{doc.asunto}</td>
                  <td className="px-4 py-2">
                    {doc.remitente?.name || doc.remitente || 'N/A'}
                  </td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-1 rounded bg-gray-200 text-gray-700">
                      {doc.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-2 mt-3">
          <button
            onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
            disabled={paginaActual === 1}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            &lt;
          </button>
          <span className="text-sm">{paginaActual} / {totalPaginas}</span>
          <button
            onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
            disabled={paginaActual === totalPaginas}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            &gt;
          </button>
        </div>
      )}
    </main>
  );

}