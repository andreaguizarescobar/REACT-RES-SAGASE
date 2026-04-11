import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Minus, Trash2, Plus } from "lucide-react";
import Swal from "sweetalert2";
import { getDocuments, getDocumentById, updateDocument } from "../../services/document.service.js";
import { getTipoDocument } from "../../services/tipoDocumento.service.js";
import { getTemaPrincipal, getAdicional } from "../../services/catalogos.service.js";
import { getRemitentes } from "../../services/remitente.service.js";

export default function BuscadorDocumentos() {
  const [criterio, setCriterio] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const filasPorPagina = 10;

  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuContextual, setMenuContextual] = useState({
    visible: false,
    x: 0,
    y: 0,
    documento: null,
  });

  const [tabActiva, setTabActiva] = useState("datosAsunto");
  const [documentoEditar, setDocumentoEditar] = useState(null);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [folioGenerado, setFolioGenerado] = useState("");
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [temasPrincipales, setTemasPrincipales] = useState([]);
  const [materialesAdicionales, setMaterialesAdicionales] = useState([]);
  const [remitentes, setRemitentes] = useState([]);

  useEffect(() => {
    const loadCatalogos = async () => {
      try {
        const tiposRes = await getTipoDocument();
        if (tiposRes.ok) {
          const tipos = await tiposRes.json();
          setTiposDocumento(tipos.map((t) => ({ value: t._id, label: t.tipo })));
        }

        const temasRes = await getTemaPrincipal();
        if (temasRes.ok) {
          const temas = await temasRes.json();
          setTemasPrincipales(temas.map((t) => ({ value: t._id, label: t.descripcion })));
        }

        const adicsRes = await getAdicional();
        if (adicsRes.ok) {
          const adics = await adicsRes.json();
          setMaterialesAdicionales(adics.map((a) => ({ value: a._id, label: a.descripcion })));
        }

        const remsRes = await getRemitentes();
        if (remsRes.ok) {
          const rems = await remsRes.json();
          setRemitentes(rems.map((r) => ({
            value: r._id,
            label: `${r.name || r.nombre} - ${r.cargo || ""} - ${r.area || r.dependencia || ""}`.trim(),
            tipo: (r.tipo || "").toString().trim().toLowerCase(),
            name: r.name || r.nombre || "",
          })));
        }
      } catch (error) {
        console.error("Error cargando catálogos de documentos:", error);
      }
    };

    loadCatalogos();
  }, []);

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

  const totalPaginas = Math.max(1, Math.ceil(resultadosFiltrados.length / filasPorPagina));
  const indiceInicial = (paginaActual - 1) * filasPorPagina;
  const indiceFinal = indiceInicial + filasPorPagina;

  const resultadosPaginados = resultadosFiltrados.slice(indiceInicial, indiceInicial + filasPorPagina);

  const formatDateValue = (value, withTime = false) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return withTime ? date.toISOString().slice(0, 16) : date.toISOString().slice(0, 10);
  };

  const getReferenceLabel = (value) => {
    if (!value) return "";
    if (typeof value === "object") {
      return (
        value.label ||
        value.value ||
        value.name ||
        value.nombre ||
        value.tipo ||
        value.descripcion ||
        ""
      );
    }
    return value;
  };

  const handleRightClick = (e, documento) => {
    e.preventDefault();
    setMenuContextual({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      documento,
    });
  };

  // form editar (inicializado para evitar undefined)
  const [formEditar, setFormEditar] = useState({
    ejercicio: "",
    noDocumento: "",
    fechaDocumento: "",
    fechaAcuse: "",
    fechaRegistro: "",
    tipoRemitente: "",
    remitenteInterno: "",
    remitenteExterno: "",
    tipoDocumento: "",
    temaPrincipal: "",
    temaSecundario: "",
    sintesis: "",
    documentoInterno: false,
    faltaInformacion: false,
    otroFuncionario: false,
    altaTipoDocumento: false,
    relacionadoCon: false,
    materialAdicional: "",
  });

  const [errores, setErrores] = useState({});

  const handleModificar = async () => {
    const doc = menuContextual.documento;
    if (!doc) return;

    const docId = doc.docId || doc.numeroDocumento || doc._id;
    if (!docId) return;

    try {
      const response = await getDocumentById(docId);
      if (!response.ok) {
        console.error("Error obteniendo documento por ID:", response.status, response.statusText);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo obtener el documento completo.",
        });
        return;
      }

      const fullDoc = await response.json();
      const selectedTipoLabel = getReferenceLabel(fullDoc.tipo) || "";
      const selectedTemaLabel = getReferenceLabel(fullDoc.tema) || "";
      const selectedSecundarioLabel = getReferenceLabel(fullDoc.secundario) || "";
      const selectedMaterialLabel = getReferenceLabel(fullDoc.adicional) || "";
      const selectedTipoValue = fullDoc.tipo?._id || fullDoc.tipo || "";
      const selectedTemaValue = fullDoc.tema?._id || fullDoc.tema || "";
      const selectedSecundarioValue = fullDoc.secundario?._id || fullDoc.secundario || "";
      const selectedMaterialValue = fullDoc.adicional?._id || fullDoc.adicional || "";
      const remitenteLabel = getReferenceLabel(fullDoc.remitente) || "";
      const remitenteId = fullDoc.remitente?._id || fullDoc.remitente || "";
      const tipoRemitente = fullDoc.interno ? "interno" : "externo";

      setDocumentoEditar(fullDoc);
      setFormEditar({
        ejercicio: fullDoc.ejercicio || new Date().getFullYear().toString(),
        noDocumento: fullDoc.docId || fullDoc.numeroDocumento || "",
        fechaDocumento: formatDateValue(fullDoc.fechaDoc),
        fechaAcuse: formatDateValue(fullDoc.acuse),
        fechaRegistro: formatDateValue(fullDoc.registro, true),
        tipoRemitente,
        remitenteInterno: tipoRemitente === "interno" ? remitenteId : "",
        remitenteExterno: tipoRemitente === "externo" ? remitenteId : "",
        tipoDocumento: selectedTipoValue,
        temaPrincipal: selectedTemaValue,
        temaSecundario: selectedSecundarioValue,
        sintesis: fullDoc.observaciones || fullDoc.sintesis || "",
        documentoInterno: !!fullDoc.interno,
        faltaInformacion: !!fullDoc.faltaInformacion,
        otroFuncionario: !!fullDoc.otroFuncionario,
        altaTipoDocumento: false,
        relacionadoCon: !!fullDoc.relacionadoCon,
        materialAdicional: selectedMaterialValue,
      });

      setBusquedaTipoDoc(selectedTipoLabel);
      setBusquedaTemaPrincipal(selectedTemaLabel);
      setBusquedaTemaSecundario(selectedSecundarioLabel);
      setBusquedaMaterial(selectedMaterialLabel);
      setBusquedaRemitenteExt(remitenteLabel);
      setAsuntoSeleccionado({ descripcion: fullDoc.asunto || "" });

      setModalEditarAbierto(true);
      setMenuContextual((m) => ({ ...m, visible: false }));
    } catch (fetchError) {
      console.error("Error obteniendo documento por ID:", fetchError);
      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo recuperar el documento completo.",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormEditar((prev) => ({ ...prev, [name]: value }));
    setErrores((prev) => ({ ...prev, [name]: !value.trim() }));
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    if (!formEditar.tipoDocumento) nuevosErrores.tipoDocumento = true;
    if (!formEditar.temaPrincipal) nuevosErrores.temaPrincipal = true;
    if (!formEditar.sintesis) nuevosErrores.sintesis = true;
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSave = () => {
    if (!validarFormulario()) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Faltan campos obligatorios",
        showConfirmButton: false,
        timer: 2500,
      });
      return;
    }

    Swal.fire({
      title: "Confirmación",
      text: "¿Seguro que desea continuar?, su información está correcta?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "OK",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#8B1538",
      cancelButtonColor: "#6B7280",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const currentDocId = documentoEditar?.docId || documentoEditar?.numeroDocumento || documentoEditar?._id;
          if (!currentDocId) {
            throw new Error("Documento no válido para actualizar");
          }

          const payload = {
            docId: formEditar.noDocumento,
            ejercicio: formEditar.ejercicio,
            fechaDoc: formEditar.fechaDocumento,
            acuse: formEditar.fechaAcuse,
            registro: formEditar.fechaRegistro,
            interno: formEditar.documentoInterno,
            faltaInformacion: formEditar.faltaInformacion,
            remitente:
              formEditar.tipoRemitente === "interno"
                ? formEditar.remitenteInterno
                : formEditar.remitenteExterno,
            tipo: formEditar.tipoDocumento,
            tema: formEditar.temaPrincipal,
            secundario: formEditar.temaSecundario,
            adicional: formEditar.materialAdicional,
            observaciones: formEditar.sintesis,
            asunto: asuntoSeleccionado?.descripcion || formEditar.sintesis,
          };

          const response = await updateDocument(currentDocId, payload);
          if (response.ok) {
            const updatedDocumento = await response.json();
            setDocumentos((prev) =>
              prev.map((doc) =>
                doc.docId === currentDocId || doc.numeroDocumento === currentDocId
                  ? { ...doc, ...updatedDocumento }
                  : doc
              )
            );
            setModalEditarAbierto(false);
            Swal.fire({
              toast: true,
              position: "top-end",
              icon: "success",
              title: "Documento actualizado correctamente",
              showConfirmButton: false,
              timer: 2000,
            });
          } else {
            const errorResponse = await response.json().catch(() => null);
            Swal.fire({
              icon: "error",
              title: "Error",
              text: errorResponse?.error || "No se pudo actualizar el documento",
            });
          }
        } catch (error) {
          console.error(error);
          Swal.fire({
            icon: "error",
            title: "Error de conexión",
            text: "No se pudo actualizar el documento",
          });
        }
      }
    });
  };

  const Toggle = ({ checked, onChange }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${checked ? "bg-[#79142A]" : "bg-gray-300"}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-5" : "translate-x-1"}`} />
    </button>
  );

  const handleToggleFaltaInformacion = (value) => {
    setFormEditar((prev) => ({ ...prev, faltaInformacion: value }));
    if (value) {
      const anioActual = new Date().getFullYear();
      const numeroAleatorio = Math.floor(Math.random() * 900) + 100;
      setFolioGenerado(`Folio ${numeroAleatorio}-${anioActual}`);
    } else {
      setFolioGenerado("");
    }
  };

  // refs + dropdown states usados en UI
  const refTipoDoc = useRef(null);
  const refRemitenteExt = useRef(null);
  const refMaterial = useRef(null);
  const refAsunto = useRef(null);
  const refTemaPrincipal = useRef(null);
  const refTemaSecundario = useRef(null);
  
  const [busquedaRemitenteExt, setBusquedaRemitenteExt] = useState("");
  const [mostrarOpcionesRemitenteExt, setMostrarOpcionesRemitenteExt] = useState(false);

  const remitentesInternos = remitentes.filter((r) => r.tipo === "interno");
  const remitentesExternos = remitentes.filter((r) => r.tipo === "externo");
  const remitentesFiltrados = remitentesExternos.filter((r) =>
    r.label.toLowerCase().includes(busquedaRemitenteExt.toLowerCase())
  );

  const usuariosInstitucion = [
    { id: 1, nombre: "Juan Pérez - Dirección General" },
    { id: 2, nombre: "María López - Jurídico" },
    { id: 3, nombre: "Carlos Ramírez - Administración" },
  ];

  const [busquedaTipoDoc, setBusquedaTipoDoc] = useState("");
  const [mostrarOpcionesTipoDoc, setMostrarOpcionesTipoDoc] = useState(false);

  const tiposFiltrados = tiposDocumento.filter((tipo) =>
    tipo.label.toLowerCase().includes(busquedaTipoDoc.toLowerCase())
  );

  const [asuntos] = useState([]);
  const [asuntoSeleccionado, setAsuntoSeleccionado] = useState(null);

  const [busquedaAsunto, setBusquedaAsunto] = useState("");
  const [mostrarOpcionesAsunto, setMostrarOpcionesAsunto] = useState(false);

  const [mostrarModalRelacionado, setMostrarModalRelacionado] = useState(false);
  const [mostrarModalAltaAsunto, setMostrarModalAltaAsunto] = useState(false);

  const [documentosSeleccionados, setDocumentosSeleccionados] = useState([]);
  const [busquedaDocumentoRelacionado, setBusquedaDocumentoRelacionado] = useState("");
  const [mostrarOpcionesDocumento, setMostrarOpcionesDocumento] = useState(false);

  const [busquedaTemaPrincipal, setBusquedaTemaPrincipal] = useState("");
  const [mostrarOpcionesTemaPrincipal, setMostrarOpcionesTemaPrincipal] = useState(false);
  const [busquedaTemaSecundario, setBusquedaTemaSecundario] = useState("");
  const [mostrarOpcionesTemaSecundario, setMostrarOpcionesTemaSecundario] = useState(false);

  const temasFiltradosPrincipal = temasPrincipales.filter((t) =>
    t.label.toLowerCase().includes(busquedaTemaPrincipal.toLowerCase())
  );
  const temasFiltradosSecundario = temasPrincipales.filter((t) =>
    t.label.toLowerCase().includes(busquedaTemaSecundario.toLowerCase())
  );

  const [busquedaMaterial, setBusquedaMaterial] = useState("");
  const [mostrarOpcionesMaterial, setMostrarOpcionesMaterial] = useState(false);
  const materialesFiltrados = materialesAdicionales.filter((m) =>
    m.label.toLowerCase().includes(busquedaMaterial.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (refTipoDoc.current && !refTipoDoc.current.contains(event.target)) {
        setMostrarOpcionesTipoDoc(false);
      }
      if (refRemitenteExt.current && !refRemitenteExt.current.contains(event.target)) {
        setMostrarOpcionesRemitenteExt(false);
      }
      if (refMaterial.current && !refMaterial.current.contains(event.target)) {
        setMostrarOpcionesMaterial(false);
      }
      if (refAsunto.current && !refAsunto.current.contains(event.target)) {
        setMostrarOpcionesAsunto(false);
      }
      if (refTemaPrincipal.current && !refTemaPrincipal.current.contains(event.target)) {
        setMostrarOpcionesTemaPrincipal(false);
      }
      if (refTemaSecundario.current && !refTemaSecundario.current.contains(event.target)) {
        setMostrarOpcionesTemaSecundario(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

    const handlePrint = () => {
    window.print();
  };

  const descargarBitacora = () => {
    window.print();
  };
  
  const bitacoraRef = useRef(null);

  const bitacora = [
    {
      usuario: "Víctor Manuel Enríquez Paniagua",
      descripcion: "Registró el asunto",
      fecha: "11/10/2022",
      hora: "21:45:30",
      tipo: "registro",
    },
    {
      usuario: "Víctor Manuel Enríquez Paniagua",
      descripcion: "Adjuntó el documento: GUARDIA NACIONAL.pdf",
      fecha: "11/10/2022",
      hora: "21:47:11",
      tipo: "adjunto",
    },
    {
      usuario: "Víctor Manuel Enríquez Paniagua",
      descripcion:
        "Generó la instrucción: Atender el tema y dar respuesta al interesado. Prioridad: Trámite Extra-urgente.",
      fecha: "11/10/2022",
      hora: "21:48:54",
      tipo: "instruccion",
    },
    {
      usuario: "Víctor Manuel Enríquez Paniagua",
      descripcion:
        "Autorizado y turnado a Dirección de Desarrollo Archivístico Nacional",
      fecha: "11/10/2022",
      hora: "21:48:56",
      tipo: "autorizado",
    },
  ];

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

  const [copias, setCopias] = useState([
    "Víctor Manuel Enríquez Paniagua",
    "María Verónica Leal Camarena",
    "Guillermo Bonilla Tenorio",
    "Dirección de Administración",
  ]);

  const eliminarCopia = (index) => {
    setCopias((prev) => prev.filter((_, i) => i !== index));
  };

  const [mostrarModalCopias, setMostrarModalCopias] = useState(false);
  const [busquedaFuncionario, setBusquedaFuncionario] = useState("");
  const [mostrarOpcionesFuncionario, setMostrarOpcionesFuncionario] = useState(false);

  const funcionarios = [
    "Víctor Manuel Enríquez Paniagua",
    "María Verónica Leal Camarena",
    "Guillermo Bonilla Tenorio",
    "Dirección de Administración",
    "Unidad de Correspondencia",
    "Órgano Interno de Control",
  ];

  const funcionariosFiltrados = funcionarios.filter(f =>
    f.toLowerCase().includes(busquedaFuncionario.toLowerCase()) &&
    !copias.some(c => c.toLowerCase() === f.toLowerCase())
  );

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

  const [mostrarModalTurno, setMostrarModalTurno] = useState(false);

  const [form, setForm] = useState({
    instruccion: "",
    areaDestino: "",
    prioridad: "",
    fecha: "",
    autorizar: false,
  });

  const validarFormularioAltaInstruccion = () => {
    let nuevosErrores = {};

    if (!form.instruccion) nuevosErrores.instruccion = true;
    if (!form.areaDestino) nuevosErrores.areaDestino = true;
    if (!form.prioridad) nuevosErrores.prioridad = true;
    if (!form.fecha) nuevosErrores.fecha = true;

    setErrores(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  };

  const handleGuardarAltaInstruccion = () => {
    if (!validarFormularioAltaInstruccion()) {
       Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Faltan campos obligatorios",
        showConfirmButton: false,
        timer: 2500,
      });
      return;
    }

    Swal.fire({
      icon: "success",
      title: "Guardado",
      text: "Turno guardado correctamente",
      confirmButtonColor: "#8B1538",
    });

    setMostrarModalTurno(false);
  };

  const [mostrarModalAnexo, setMostrarModalAnexo] = useState(false);

  const anexos = [
    {
      folio: "12345",
      nombre: "GUARDIA NACIONAL.pdf",
    },
    {
      folio: "67890",
      nombre: "Ficha de Gestión Instrucción Atender el tema y dar respuesta al interesado.pdf",
    },
    {
      folio: "54321",
      nombre: "Ficha de Gestión Instrucción Distribuir los materiales.pdf",
    },
    {
      folio: "67890",
      nombre: "Ficha de Gestión Instrucción Atender el tema y dar respuesta al interesado.pdf",
    },
  ];

  const anexosFiltrados = anexos.filter((anexo) =>
    Object.values(anexo).some((valor) =>
      valor.toLowerCase().includes(busquedaVerTurnos.toLowerCase())
    )
  );

  return (
    <main
      className="flex-1 p-4 bg-white"
      onClick={() =>
        menuContextual.visible &&
        setMenuContextual((m) => ({ ...m, visible: false }))
      }
    >
      <h1 className="text-lg font-medium text-[#60595D] mb-4">Buscador de documentos</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={criterio}
          onChange={(e) => {
            setCriterio(e.target.value);
            setPaginaActual(1);
          }}
          placeholder="Buscar por folio, remitente, síntesis..."
          className="flex-1 px-3 py-2 border rounded"
        />
        <button
          onClick={() => {
            setCriterio("");
            setPaginaActual(1);
          }}
          className="px-3 py-2 border rounded"
        >
          Limpiar
        </button>
      </div>

      <div className="overflow-x-auto bg-white border rounded-lg shadow-sm">
        <table className="min-w-full text-xs">
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

        <AnimatePresence>
          {menuContextual.visible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed bg-white border shadow-md rounded text-xs z-50"
              style={{
                top: menuContextual.y,
                left: menuContextual.x,
              }}
            >
              <button
                className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                onClick={handleModificar}
              >
                Modificar registro
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {modalEditarAbierto && (
            <motion.div
              className="fixed inset-0 z-[70] flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="absolute inset-0 bg-black/40"
                onClick={() => setModalEditarAbierto(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />

              <motion.div
                className="relative bg-white w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex flex-col "
                initial={{ scale: 0.9, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 40 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                <div className="flex justify-between items-center bg-gray-400 px-4 py-2">
                  <span className="text-white text-sm">
                    Modificar registro: {documentoEditar?.folio || ""}
                  </span>
                  <button
                    onClick={() => setModalEditarAbierto(false)}
                    className="bg-[#8B1538] text-white p-2 rounded-full flex items-center justify-center"
                  >
                    <Minus size={16} />
                  </button>
                </div>

                <div className="flex border-b text-sm overflow-x-auto">
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
                      {
                        id: "bitacora",
                        label: "Bitácora",
                      },
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

                <div className="flex-1 overflow-y-auto p-4">
                  {tabActiva === "datosAsunto" && (
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-80">
                            <h2 className="text-sm font-semibold text-gray-600 mb-2">Ejercicio</h2>
                            <select name="ejercicio" value={formEditar.ejercicio} disabled onChange={handleChange} className="w-full border rounded px-2 py-1 bg-gray-100 cursor-not-allowed">
                              <option value="">Seleccionar</option>
                              <option value="2024">2024</option>
                              <option value="2025">2025</option>
                              <option value="2026">2026</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-sm font-semibold text-gray-600 mb-2">Datos generales</h2>
                          <div className="grid grid-cols-4 gap-4 items-end">
                            <div>
                              <label className="text-xs text-gray-500">No. de documento *</label>
                              <input name="noDocumento" value={formEditar.noDocumento} disabled className="w-full border rounded px-2 py-1 bg-gray-100 cursor-not-allowed" />
                            </div>

                            <div>
                              <label className="text-xs text-gray-500">Fecha de documento *</label>
                              <input type="date" name="fechaDocumento" value={formEditar.fechaDocumento} disabled className="w-full border rounded px-2 py-1 bg-gray-100 cursor-not-allowed" />
                            </div>

                            <div>
                              <label className="text-xs text-gray-500">Fecha de acuse *</label>
                              <input type="date" name="fechaAcuse" value={formEditar.fechaAcuse} disabled className="w-full border rounded px-2 py-1 bg-gray-100 cursor-not-allowed" />
                            </div>

                            <div>
                              <label className="text-xs text-gray-500">Fecha de registro *</label>
                              <input type="datetime-local" name="fechaRegistro" value={formEditar.fechaRegistro} disabled className="w-full border rounded px-2 py-1 bg-gray-100 cursor-not-allowed" />
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">Falta información:</span>
                              <Toggle checked={formEditar.faltaInformacion} onChange={handleToggleFaltaInformacion} />
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">Documento interno:</span>
                              <Toggle checked={formEditar.documentoInterno} onChange={(v) => setFormEditar((p) => ({ ...p, documentoInterno: v }))} />
                            </div>
                          </div>
                        </div>
                    

                        <div>
                          <h2 className="text-sm font-semibold text-gray-600 mt-2">Remitente</h2>
                          <div className="grid grid-cols-6 gap-4 items-end">
                            <div className="col-span-2">
                              <label className="text-xs text-gray-500">Tipo de remitente *</label>
                              <select name="tipoRemitente" value={formEditar.tipoRemitente} disabled className="w-full border rounded px-2 py-1 bg-gray-100 cursor-not-allowed">
                                <option value="">Seleccionar</option>
                                <option value="interno">Interno</option>
                                <option value="externo">Externo</option>
                              </select>
                            </div>

                            {formEditar.tipoRemitente === "interno" && (
                              <div className="col-span-2">
                                <label className="text-xs text-gray-500">Funcionario / Área *</label>
                                <select name="remitenteInterno" value={formEditar.remitenteInterno} onChange={handleChange} className={`w-full border rounded px-2 py-1 ${errores.remitenteInterno ? "border-red-500 bg-red-50" : ""}`}>
                                  <option value="">Seleccionar</option>
                                  {(remitentesInternos.length > 0 ? remitentesInternos : usuariosInstitucion.map((u) => ({ value: u.nombre, label: u.nombre }))).map((r) => (
                                    <option key={r.value || r.id} value={r.value || r.nombre}>{r.label || r.nombre}</option>
                                  ))}
                                </select>
                              </div>
                            )}

                            {formEditar.tipoRemitente === "externo" && (
                              <div className="col-span-4">
                                <label className="text-xs text-gray-500">Selecciona remitente externo *</label>
                                <div className="flex items-center gap-3">
                                  <div ref={refRemitenteExt} className="flex-1 relative">
                                    <div className={`flex items-center border rounded px-2 ${errores.remitenteExterno ? "border-red-500 bg-red-50" : ""}`}>
                                      <Search size={16} className="text-gray-400" />
                                      <input
                                        value={busquedaRemitenteExt}
                                        onChange={(e) => {
                                          setBusquedaRemitenteExt(e.target.value);
                                          setMostrarOpcionesRemitenteExt(true);
                                        }}
                                        onFocus={() => setMostrarOpcionesRemitenteExt(true)}
                                        className="w-full px-2 py-1 outline-none"
                                        placeholder="Buscar y seleccionar opción"
                                      />
                                    </div>

                                    {mostrarOpcionesRemitenteExt && (
                                      <div className="absolute bg-white border w-full mt-1 max-h-40 overflow-y-auto z-10">
                                        {remitentesFiltrados.length > 0 ? (
                                          remitentesFiltrados.map((r) => (
                                            <div
                                              key={r.value}
                                              onClick={() => {
                                                setFormEditar((p) => ({ ...p, remitenteExterno: r.value }));
                                                setBusquedaRemitenteExt(r.label);
                                                setMostrarOpcionesRemitenteExt(false);
                                              }}
                                              className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                                            >
                                              {r.label}
                                            </div>
                                          ))
                                        ) : (
                                          <div className="px-2 py-1 text-gray-400">Sin resultados</div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* DATOS ESPECÍFICOS */}
                        <div>
                          <h2 className="text-sm font-semibold text-gray-600 mt-2">
                            Datos específicos
                          </h2>

                          <div className="grid grid-cols-6 gap-4 items-end">

                            {/* Tipo documento con buscador */}
                            <div ref={refTipoDoc} className="col-span-2 relative">
                              <label className="text-xs text-gray-500">
                                Selecciona tipo de documento *
                              </label>
                              <div
                                className={`flex items-center border rounded px-2 ${
                                  errores.tipoDocumento ? "border-red-500 bg-red-50" : ""
                                }`}
                              >
                                <Search size={16} className="text-gray-400" />
                                <input
                                  value={busquedaTipoDoc}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    setBusquedaTipoDoc(value);
                                    setMostrarOpcionesTipoDoc(true);

                                    // 🔥 IMPORTANTE: limpiar selección real
                                    setFormEditar((prev) => ({
                                      ...prev,
                                      tipoDocumento: "",
                                    }));

                                    // validar si está vacío o no es válido
                                    setErrores((prev) => ({
                                      ...prev,
                                      tipoDocumento: !value.trim(),
                                    }));
                                  }}
                                  onFocus={() => setMostrarOpcionesTipoDoc(true)}
                                  className="w-full px-2 py-1 outline-none"
                                  placeholder="Buscar y seleccionar opción"

                                />
                              </div>

                              {mostrarOpcionesTipoDoc && (
                                <div className="absolute bg-white border w-full mt-1 max-h-40 overflow-y-auto z-10">
                                  {tiposFiltrados.map((t) => (
                                    <div
                                      key={t.value}
                                      onClick={() => {
                                        setFormEditar((prev) => ({
                                          ...prev,
                                          tipoDocumento: t.value,
                                        }));

                                        setBusquedaTipoDoc(t.label);
                                        setMostrarOpcionesTipoDoc(false);

                                        setErrores((prev) => ({
                                          ...prev,
                                          tipoDocumento: false,
                                        }));
                                      }}
                                      className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                                    >
                                      {t.label}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Toggle alta tipo */}
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                Alta tipo de documento:
                              </span>
                              <Toggle
                                checked={formEditar.altaTipoDocumento}
                                onChange={(v) => {
                                  setFormEditar({ ...formEditar, altaTipoDocumento: v });
                                  if (v) setMostrarModalTipoDocumento(true);
                                }}
                              />
                            </div>

                            {/* Relacionado */}
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-gray-500">Relacionado con:</span>
                              <Toggle
                                checked={formEditar.relacionadoCon}
                                onChange={(v) => {
                                  setFormEditar({ ...formEditar, relacionadoCon: v });

                                  if (v) {
                                    setMostrarModalRelacionado(true);
                                  } else {
                                    setMostrarModalRelacionado(false);

                                    // 👇 LIMPIAR ASUNTO
                                    setAsuntoSeleccionado(null);
                                    setBusquedaAsunto("");
                                  }
                                }}
                              />
                            </div>

                            {/* Asunto */}
                            <div className="col-span-2">
                              <label className="text-xs text-gray-500">Anexos</label>
                              <textarea
                                value={asuntoSeleccionado?.descripcion || ""}
                                disabled
                                className="w-full border rounded px-2 py-1 h-[34px] resize-none bg-gray-100 cursor-not-allowed"
                              />
                            </div>

                          </div>

                          <div className="grid grid-cols-4 gap-4 mt-4">

                            {/* Tema */}
                            <div>

                              <div ref={refTemaPrincipal} className="relative">
                                <label className="text-xs text-gray-500">
                                  Selecciona tema principal *
                                </label>

                                <div className={`flex items-center border rounded px-2 ${errores.temaPrincipal ? "border-red-500 bg-red-50" : ""
                                  }`}>
                                  <Search size={16} className="text-gray-400" />
                                  <input
                                    value={busquedaTemaPrincipal}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      setBusquedaTemaPrincipal(value);
                                      setMostrarOpcionesTemaPrincipal(true);

                                      setFormEditar((prev) => ({
                                        ...prev,
                                        temaPrincipal: "",
                                      }));

                                      setErrores((prev) => ({
                                        ...prev,
                                        temaPrincipal: !value.trim(),
                                      }));
                                    }}
                                    onFocus={() => setMostrarOpcionesTemaPrincipal(true)}
                                    className="w-full px-2 py-1 outline-none"
                                    placeholder="Buscar y seleccionar opción"
                                  />
                                </div>

                                {mostrarOpcionesTemaPrincipal && (
                                  <div className="absolute bg-white border w-full mt-1 max-h-40 overflow-y-auto z-10">
                                    {temasFiltradosPrincipal.length > 0 ? (
                                      temasFiltradosPrincipal.map((t) => (
                                        <div
                                          key={t.value}
                                          onClick={() => {
                                            setFormEditar({ ...formEditar, temaPrincipal: t.value });
                                            setBusquedaTemaPrincipal(t.label);
                                            setMostrarOpcionesTemaPrincipal(false);

                                            setErrores((prev) => ({
                                              ...prev,
                                              temaPrincipal: !t.value,
                                            }));
                                          }}
                                          className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                                        >
                                          {t.label}
                                        </div>
                                      ))
                                    ) : (
                                      <div className="px-2 py-1 text-gray-400">Sin resultados</div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div ref={refTemaSecundario} className="relative">
                              <label className="text-xs text-gray-500">
                                Tema secundario
                              </label>

                              <div className="flex items-center border rounded px-2">
                                <Search size={16} className="text-gray-400" />
                                <input
                                  value={busquedaTemaSecundario}
                                  onChange={(e) => {
                                    setBusquedaTemaSecundario(e.target.value);
                                    setMostrarOpcionesTemaSecundario(true);
                                  }}
                                  onFocus={() => setMostrarOpcionesTemaSecundario(true)}
                                  className="w-full px-2 py-1 outline-none"
                                  placeholder="Buscar y seleccionar opción"
                                />
                              </div>

                              {mostrarOpcionesTemaSecundario && (
                                <div className="absolute bg-white border w-full mt-1 max-h-40 overflow-y-auto z-10">
                                  {temasFiltradosSecundario.length > 0 ? (
                                    temasFiltradosSecundario.map((t) => (
                                      <div
                                        key={t.value}
                                        onClick={() => {
                                          setFormEditar({ ...formEditar, temaSecundario: t.value });
                                          setBusquedaTemaSecundario(t.label);
                                          setMostrarOpcionesTemaSecundario(false);
                                        }}
                                        className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                                      >
                                        {t.label}
                                      </div>
                                    ))
                                  ) : (
                                    <div className="px-2 py-1 text-gray-400">Sin resultados</div>
                                  )}
                                </div>
                              )}
                            </div>

                            <div ref={refMaterial} className="relative">
                              <label className="text-xs text-gray-500">
                                Selecciona material adicional
                              </label>

                              <div className="flex items-center border rounded px-2">
                                <Search size={16} className="text-gray-400" />
                                <input
                                  value={busquedaMaterial}
                                  onChange={(e) => {
                                    setBusquedaMaterial(e.target.value);
                                    setMostrarOpcionesMaterial(true);
                                  }}
                                  onFocus={() => setMostrarOpcionesMaterial(true)}
                                  className="w-full px-2 py-1 outline-none"
                                  placeholder="Buscar y seleccionar opción"
                                />
                              </div>

                              {mostrarOpcionesMaterial && (
                                <div className="absolute bg-white border w-full mt-1 max-h-40 overflow-y-auto z-10">
                                  {materialesFiltrados.length > 0 ? (
                                    materialesFiltrados.map((m) => (
                                      <div
                                        key={m.value}
                                        onClick={() => {
                                          setFormEditar({ ...formEditar, materialAdicional: m.value });
                                          setBusquedaMaterial(m.label);
                                          setMostrarOpcionesMaterial(false);
                                        }}
                                        className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                                      >
                                        {m.label}
                                      </div>
                                    ))
                                  ) : (
                                    <div className="px-2 py-1 text-gray-400">
                                      Sin resultados
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>


                            <div className="col-span-4">
                              <label className="text-xs text-gray-500">
                                Síntesis del asunto *
                              </label>
                              <textarea
                                name="sintesis"
                                value={formEditar.sintesis}
                                onChange={handleChange}
                                className={`w-full border rounded px-2 py-1 ${errores.sintesis ? "border-red-500 bg-red-50" : ""
                                  }`}
                              />
                            </div>

                            <div className="col-span-4">
                              <label className="text-xs text-gray-500">Observaciones</label>
                              <textarea className="w-full border rounded px-2 py-1" />
                            </div>

                          </div>


                          {/* BOTÓN */}
                          <div className="flex justify-end">
                            <button
                              onClick={handleSave}
                              className="bg-[#79142A] text-white px-6 py-2 rounded"
                            >
                              Modificar
                            </button>
                          </div>

                        </div>

                      </div>

                    </div>

                  )}

                  {tabActiva === "anexo" && (
                      <div className="space-y-4">

                        <div className="flex items-center w-full max-w-xl rounded overflow-hidden shadow">

                          {/* 🔴 Botón */}
                          <button
                            onClick={() => setMostrarModalTurno(true)}
                            className="bg-[#8B1538] text-white px-4 py-2 flex items-center gap-2 hover:opacity-90"
                          >
                            Añadir turno
                          </button>

                          {/* 🔍 Buscador */}
                          <div className="flex items-center flex-1 border border-l-0 px-2 bg-white">
                            <Search size={16} className="text-gray-400" />
                            <input
                              value={busquedaVerTurnos}
                              onChange={(e) => setBusquedaVerTurnos(e.target.value)}
                              className="w-full px-2 py-2 outline-none text-sm"
                              placeholder="Buscar turno..."
                            />
                          </div>

                        </div>


                        {/* Tabla de anexos */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm border border-gray-200">
                            <thead className="bg-[#8B1538] text-white">
                              <tr>
                                <th className="px-4 py-2 text-left">
                                  Documento anexo
                                </th>
                                <th className="px-4 py-2 text-left">
                                  Folio del anexo
                                </th>
                                <th className="px-4 py-2 text-left">
                                  Nombre del documento
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {anexosFiltrados.length > 0 ? (
                                anexosFiltrados.map((anexo, index) => (
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
                                      {anexo.folio}
                                    </td>

                                    <td className="px-4 py-2 text-gray-700">
                                      {anexo.nombre}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={3} className="text-center py-4 text-gray-400">
                                    Sin resultados
                                  </td>
                                </tr>
                              )}
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
                    
                  {tabActiva === "turnar" && (
                    <div className="space-y-4">
                      
                      {/* Botón agregar */}
                      <div className="flex justify-start">
                        <button
                          onClick={() => setMostrarModalCopias(true)}
                          className="bg-[#8B1538] text-white w-10 h-10 rounded-full text-xl flex items-center justify-center shadow hover:opacity-90"
                        >
                          +
                        </button>
                      </div>

                      {/* Tabla */}
                      <div className="overflow-x-auto">
                        <table className="min-w-[1100px] w-full text-xs border border-gray-200">
                          <thead className="bg-[#8B1538] text-white">
                            <tr>
                              <th className="px-3 py-2 text-left">Instrucción</th>
                              <th className="px-3 py-2 text-left">Funcionario que remite</th>
                              <th className="px-3 py-2 text-left">Área de destino</th>
                              <th className="px-3 py-2 text-left">Dirigido a</th>
                              <th className="px-3 py-2 text-left">Prioridad</th>
                              <th className="px-3 py-2 text-left">Fecha compromiso</th>
                              <th className="px-3 py-2 text-left">Quién lo turna</th>
                            </tr>
                          </thead>

                          <tbody>
                            {/* Datos simulados */}
                            {[].length > 0 ? (
                              [].map((item, index) => (
                                <tr key={index} className="border-t hover:bg-gray-50">
                                  <td className="px-3 py-2">{item.instruccion}</td>
                                  <td className="px-3 py-2">{item.funcionario}</td>
                                  <td className="px-3 py-2">{item.areaDestino}</td>
                                  <td className="px-3 py-2">{item.dirigidoA}</td>
                                  <td className="px-3 py-2">{item.prioridad}</td>
                                  <td className="px-3 py-2">{item.fecha}</td>
                                  <td className="px-3 py-2">{item.quienTurna}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={7} className="text-center py-4 text-gray-400">
                                  Sin datos en la tabla.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                    </div>
                  )}
                  
                   {tabActiva === "verTurnos" && (
                      <div className="space-y-4">
                        <div className="overflow-x-auto">
                          <div className="flex items-center gap-2 mb-4">

                          {/* BOTÓN AÑADIR TURNO */}
                          <button
                            onClick={() => setMostrarModalTurno(true)}
                            className="bg-[#8B1538] text-white px-4 py-2 rounded flex items-center gap-2 shadow hover:opacity-90"
                          >
                            Añadir turno
                          </button>

                          {/* 🔍 BUSCADOR */}
                          <div className="flex-1 flex items-center border rounded px-2">
                            <Search size={16} className="text-gray-400" />
                            <input
                              value={busquedaVerTurnos}
                              onChange={(e) => setBusquedaVerTurnos(e.target.value)}
                              className="w-full px-2 py-2 outline-none"
                              placeholder="Buscar turno..."
                            />
                          </div>

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

                        {mostrarModalTurno && (
                          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                            <div className="bg-white w-[900px] max-h-[90vh] overflow-y-auto rounded-lg shadow-lg p-6 relative">

                              {/* Cerrar */}
                              <button
                                onClick={() => setMostrarModalTurno(false)}
                                className="absolute top-3 right-3 bg-[#8B1538] text-white p-2 rounded-full shadow hover:opacity-90 transition"
                              >
                                <Minus size={16} />
                              </button>

                              <h2 className="text-lg font-semibold mb-4">Alta de instrucción</h2>

                              <div className="grid grid-cols-2 gap-4 text-sm">

                                {/* Instrucción */}
                                <div className="col-span-2">
                                  <label>Instrucción*</label>
                                  <input
                                    value={form.instruccion}
                                    onChange={(e) =>
                                      setForm({ ...form, instruccion: e.target.value })
                                    }
                                    className={`w-full border rounded px-3 py-2 ${
                                      errores.instruccion ? "border-red-500" : "border-gray-300"
                                    }`}
                                    placeholder="Buscar y seleccionar opción"
                                  />

                                </div>

                                {/* Funcionario */}
                                <div>
                                  <label>Funcionario que remite</label>
                                  <input className="w-full border rounded px-3 py-2" />
                                </div>

                                {/* Área destino */}
                                <div>
                                  <label>Área de destino*</label>
                                  <select
                                    value={form.areaDestino}
                                    onChange={(e) =>
                                      setForm({ ...form, areaDestino: e.target.value })
                                    }
                                    className={`w-full border rounded px-3 py-2 ${
                                      errores.areaDestino ? "border-red-500" : "border-gray-300"
                                    }`}
                                  >
                                    <option value="">Seleccionar</option>
                                  </select>

                                </div>

                                {/* Dirigido a */}
                                <div className="col-span-2">
                                  <label>Dirigido a</label>
                                  <input className="w-full border rounded px-3 py-2" placeholder="Buscar y seleccionar opción" />
                                </div>

                                {/* Prioridad */}
                                <div>
                                  <label>Prioridad*</label>
                                  <select
                                    value={form.prioridad}
                                    onChange={(e) =>
                                      setForm({ ...form, prioridad: e.target.value })
                                    }
                                    className={`w-full border rounded px-3 py-2 ${
                                      errores.prioridad ? "border-red-500" : "border-gray-300"
                                    }`}
                                  >
                                    <option value="">Seleccionar</option>
                                  </select>

                                </div>

                                {/* Fecha */}
                                <div>
                                  <label>Fecha compromiso*</label>
                                  <input
                                    type="date"
                                    value={form.fecha}
                                    onChange={(e) =>
                                      setForm({ ...form, fecha: e.target.value })
                                    }
                                    className={`w-full border rounded px-3 py-2 ${
                                      errores.fecha ? "border-red-500" : "border-gray-300"
                                    }`}
                                  />

                                </div>

                                {/* Quién lo turna */}
                                <div>
                                  <label>Quién lo turna</label>
                                  <input className="w-full border rounded px-3 py-2" />
                                </div>

                                {/* Notas */}
                                <div className="col-span-2">
                                  <label>Notas</label>
                                  <textarea className="w-full border rounded px-3 py-2"></textarea>
                                </div>

                                {/* Autorizar */}
                                <div className="col-span-2 flex items-center gap-3">
                                  <label>Autorizar:</label>

                                  <button
                                    type="button"
                                    onClick={() => setForm({ ...form, autorizar: !form.autorizar })}
                                    className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
                                      form.autorizar ? "bg-[#8B1538]" : "bg-gray-300"
                                    }`}
                                  >
                                    <div
                                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                                        form.autorizar ? "translate-x-6" : "translate-x-0"
                                      }`}
                                    />
                                  </button>
                                </div>

                              </div>

                              {/* Botón guardar */}
                              <div className="flex justify-end mt-6">
                                <button
                                  onClick={handleGuardarAltaInstruccion}
                                  className="bg-[#8B1538] text-white px-6 py-2 rounded hover:opacity-90"
                                >
                                  Guardar
                                </button>

                              </div>

                            </div>
                          </div>
                        )}

                      </div>
                      
                    )}

                  {tabActiva === "copias" && (
                      <div className="space-y-4">
                        {/* Botón agregar */}
                        <div className="flex justify-start">
                          <button
                            onClick={() => setMostrarModalCopias(true)}
                             className="bg-[#8B1538] text-white px-4 py-2 rounded flex items-center gap-2 shadow hover:opacity-90"
                          >
                            Añadir funcionario
                          </button>
                        </div>
                        {/* TABLA */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm border border-gray-200">
                            <thead className="bg-[#8B1538] text-white">
                              <tr>
                                <th className="px-4 py-2 text-left">Eliminar</th>
                                <th className="px-4 py-2 text-left">Funcionario</th>
                              </tr>
                            </thead>

                            <tbody>
                              {copias.map((funcionario, index) => (
                                <tr
                                  key={index}
                                  className="border-t hover:bg-gray-50"
                                >
                                  {/* 🔥 Columna eliminar */}
                                  <td className="px-4 py-2">
                                    <button
                                      onClick={() => eliminarCopia(index)}
                                      className="text-red-500 hover:text-red-700 transition"
                                      title="Eliminar"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </td>

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
              </motion.div>

            </motion.div>
          )}

        </AnimatePresence>

      <AnimatePresence>
        {mostrarModalRelacionado && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white w-[900px] rounded shadow-lg overflow-hidden"
            >
              
              {/* HEADER */}
              <div className="flex justify-between items-center bg-gray-400 px-4 py-2">
                <span className="text-white text-sm">Documentos relacionados</span>

                <button
                  onClick={() => {
                    setMostrarModalRelacionado(false);
                    setForm({ ...form, relacionadoCon: false });
                  }}
                  className="bg-[#8B1538] text-white p-2 rounded-full"
                >
                  <Minus size={16} />
                </button>
              </div>

              {/* BODY */}
              <div className="p-6 space-y-4">

                {/* Buscador */}
                <div className="relative">
                  <label className="text-xs text-gray-500">
                    Buscar documento:
                  </label>

                  <div className="flex items-center border rounded px-2">
                    <Search size={16} className="text-gray-400" />
                    <input
                      value={busquedaDocumentoRelacionado}
                      onChange={(e) => {
                        setBusquedaDocumentoRelacionado(e.target.value);
                        setMostrarOpcionesDocumento(true);
                      }}
                      onFocus={() => setMostrarOpcionesDocumento(true)}
                      className="w-full px-2 py-1 outline-none"
                      placeholder="Buscar por folio"
                    />
                  </div>

                  {/* DROPDOWN */}
                  {mostrarOpcionesDocumento && (
                    <div className="absolute bg-white border w-full mt-1 max-h-40 overflow-y-auto z-10">
                      {documentosFiltrados.length > 0 ? (
                        documentosFiltrados.map((d) => (
                          <div
                            key={d.value}
                            onClick={() => {
                              if (!documentosSeleccionados.includes(d.value)) {
                                setDocumentosSeleccionados([...documentosSeleccionados, d.value]);

                                //  AQUÍ asigna lo que quieres mostrar en Anexos
                                setAsuntoSeleccionado({
                                  descripcion: d.label // o aquí puedes usar otra propiedad si tienes más info
                                });
                              }
                              setBusquedaDocumentoRelacionado("");
                              setMostrarOpcionesDocumento(false);
                            }}
                            className="px-2 py-1 hover:bg-gray-100 cursor-pointer text-sm"
                          >
                            {d.label}
                          </div>
                        ))
                      ) : (
                        <div className="px-2 py-1 text-gray-400">
                          Sin resultados
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Lista seleccionados */}
                <div>
                  <label className="text-xs text-gray-500">Seleccionados:</label>
                  <div className="border rounded p-2 max-h-32 overflow-y-auto">
                    {documentosSeleccionados.length > 0 ? (
                      documentosSeleccionados.map((id) => {
                        const doc = documentos.find(d => d.value === id);
                        return (
                          <div key={id} className="flex justify-between items-center py-1">
                            <span className="text-sm">{doc ? doc.label : id}</span>
                            <button
                              onClick={() => setDocumentosSeleccionados(documentosSeleccionados.filter(sel => sel !== id))}
                              className="text-red-500 text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-gray-400 text-sm">Ninguno seleccionado</div>
                    )}
                  </div>
                </div>

              </div>

              {/* FOOTER */}
              <div className="flex justify-end p-4">
                <button
                  onClick={() => {
                    setForm({ ...form, relacionados: documentosSeleccionados });
                    setMostrarModalRelacionado(false);
                  }}
                  className="bg-[#8B1538] text-white px-6 py-2 rounded"
                >
                  Guardar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

        {/* MODAL ALTA ASUNTO */}
      <AnimatePresence>
        {mostrarModalAltaAsunto && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white w-[800px] rounded shadow-lg overflow-hidden"
            >

              {/* HEADER */}
              <div className="flex justify-between items-center bg-gray-400 px-4 py-2">
                <span className="text-white text-sm">
                  Registro de Asunto
                </span>

                <button
                  onClick={() => setMostrarModalAltaAsunto(false)}
                  className="bg-[#8B1538] text-white p-2 rounded-full"
                >
                  <Minus size={16} />
                </button>
              </div>

              {/* BODY */}
              <div className="p-6 grid grid-cols-2 gap-4">

                {/* No. asunto */}
                <div>
                  <label className="text-xs text-gray-500">
                    No. de asunto:
                  </label>
                  <input
                    disabled
                    placeholder="Autogenerado"
                    className="w-full border rounded px-2 py-1 bg-gray-100"
                  />
                </div>

                {/* CLASE ASUNTO (CON BUSCADOR 🔥) */}
                <div className="relative">
                  <label className="text-xs text-gray-500">
                    Clase asunto *
                  </label>

                  <div className="flex items-center border rounded px-2">
                    <Search size={16} className="text-gray-400" />
                    <input
                      value={busquedaClaveAsunto}
                      onChange={(e) => {
                        setBusquedaClaveAsunto(e.target.value);
                        setMostrarOpcionesClave(true);
                      }}
                      onFocus={() => setMostrarOpcionesClave(true)}
                      className="w-full px-2 py-1 outline-none"
                    />
                  </div>

                  {mostrarOpcionesClave && (
                    <div className="absolute bg-white border w-full mt-1 max-h-40 overflow-y-auto z-10">
                      {clavesFiltradas.map((c) => (
                        <div
                          key={c.value}
                          onClick={() => {
                            setNuevoAsunto({
                              ...nuevoAsunto,
                              clave: c.value,
                            });
                            setBusquedaClaveAsunto(c.label);
                            setMostrarOpcionesClave(false);
                          }}
                          className="px-2 py-1 hover:bg-gray-100 cursor-pointer text-sm"
                        >
                          {c.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* DESCRIPCIÓN */}
                <div className="col-span-2">
                  <label className="text-xs text-gray-500">
                    Descripción del asunto *
                  </label>
                  <input
                    value={nuevoAsunto.descripcion}
                    onChange={(e) =>
                      setNuevoAsunto({
                        ...nuevoAsunto,
                        descripcion: e.target.value,
                      })
                    }
                    className="w-full border rounded px-2 py-1"
                  />
                </div>

              </div>

              {/* FOOTER */}
              <div className="flex justify-end p-4 gap-2">
                <button
                  onClick={() => setMostrarModalAltaAsunto(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancelar
                </button>

                <button
                  onClick={() => {
                    if (!nuevoAsunto.descripcion || !nuevoAsunto.clave) {
                      Swal.fire({
                        icon: "error",
                        title: "Campos obligatorios",
                        text: "Completa la información",
                      });
                      return;
                    }

                    const nuevo = {
                      numero: `AS-${Date.now().toString().slice(-5)}`,
                      ...nuevoAsunto,
                      fecha: new Date().toLocaleDateString(),
                    };

                    setAsuntos([...asuntos, nuevo]);

                    // seleccionar automáticamente
                    setAsuntoSeleccionado(nuevo);
                    setBusquedaAsunto(nuevo.descripcion);

                    setNuevoAsunto({
                      numero: "",
                      clave: "",
                      descripcion: "",
                    });

                    setBusquedaClaveAsunto("");
                    setMostrarModalAltaAsunto(false);

                    Swal.fire({
                      toast: true,
                      position: "top-end",
                      icon: "success",
                      title: "Asunto agregado",
                      showConfirmButton: false,
                      timer: 2000,
                    });
                  }}
                  className="bg-[#8B1538] text-white px-6 py-2 rounded"
                >
                  Guardar
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

        <AnimatePresence>
          {mostrarModalCopias && (
            <motion.div
              className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white w-[600px] rounded shadow-lg overflow-visible"
              >
                {/* HEADER */}
                <div className="flex justify-between items-center bg-gray-400 px-4 py-2">
                  <span className="text-white text-sm">
                    Destinatario de la copia
                  </span>

                  <button
                    onClick={() => setMostrarModalCopias(false)}
                    className="bg-[#8B1538] text-white p-2 rounded-full flex items-center justify-center"
                  >
                    <Minus size={16} />
                  </button>
                </div>

                {/* BODY */}
                <div className="p-6 space-y-4">
                  <div className="relative">
                    <label className="text-xs text-gray-500">Funcionario:</label>

                    <div className="flex items-center border rounded px-2">
                      <Search size={16} className="text-gray-400" />
                      <input
                        value={busquedaFuncionario}
                        onChange={(e) => {
                          setBusquedaFuncionario(e.target.value);
                          setMostrarOpcionesFuncionario(true);
                        }}
                        onFocus={() => setMostrarOpcionesFuncionario(true)}
                        className="w-full px-2 py-2 outline-none"
                        placeholder="Buscar y seleccionar opción"
                      />
                    </div>

                    {/* Dropdown */}
                    {mostrarOpcionesFuncionario && (
                      <div className="absolute bg-white border w-full mt-1 max-h-40 overflow-y-auto z-10">
                        {funcionariosFiltrados.length > 0 ? (
                          funcionariosFiltrados.map((f, i) => (
                            <div
                              key={i}
                              onClick={() => {
                                setBusquedaFuncionario(f);
                                setMostrarOpcionesFuncionario(false);
                              }}
                              className="px-2 py-2 hover:bg-gray-100 cursor-pointer"
                            >
                              {f}
                            </div>
                          ))
                        ) : (
                          <div className="px-2 py-2 text-gray-400">
                            Sin resultados
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* FOOTER */}
                <div className="flex justify-end p-4">
                  <button
                    onClick={() => {
                      if (!busquedaFuncionario.trim()) return;

                      setCopias((prev) => [...prev, busquedaFuncionario]);

                      setBusquedaFuncionario("");
                      setMostrarModalCopias(false);
                    }}
                    className="bg-[#C53030] text-white px-6 py-2 rounded"
                  >
                    Guardar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </main>
  );

}