import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Minus, Trash2, Plus, Upload, X } from "lucide-react";
import Swal from "sweetalert2";
import { getDocuments, getDocumentById, updateDocument, uploadAnexo, removeAnexo, addRelacionado, removeRelacionado, addTurnado, addCopia } from "../../services/document.service.js";
import { getTipoDocument } from "../../services/tipoDocumento.service.js";
import { getTemaPrincipal, getAdicional, getAreas, getInstrucciones } from "../../services/catalogos.service.js";
import { getRemitentes } from "../../services/remitente.service.js";
import { getUsers } from "../../services/user.service.js";
import {
  Toggle,
  handleChangeForm,
  validarDocumentoForm,
  handleToggleFaltaInformacion as handleToggleFaltaInformacionHelper,
  showValidationError,
} from "../../utils/documentoFormHelpers.jsx";

const BaseURL = "http://localhost:3333/";

export default function BuscadorDocumentos() {
  const [criterio, setCriterio] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const filasPorPagina = 10;

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
  const [documentoAnexos, setDocumentoAnexos] = useState([]);
  const [relacionadosDocumento, setRelacionadosDocumento] = useState([]);
  const [bitacoraDocumento, setBitacoraDocumento] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [temasPrincipales, setTemasPrincipales] = useState([]);
  const [materialesAdicionales, setMaterialesAdicionales] = useState([]);
  const [areas, setAreas] = useState([]);
  const [instrucciones, setInstrucciones] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [remitentes, setRemitentes] = useState([]);
  const [turnosDocumento, setTurnosDocumento] = useState([]);
  const [copiasDocumento, setCopiasDocumento] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

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

        const areasRes = await getAreas();
        if (areasRes.ok) {
          const areasData = await areasRes.json();
          setAreas(areasData.map((a) => ({
            value: a._id,
            label: a.nombre || a.descripcion || "Área desconocida",
          })));
        }

        const instruccionRes = await getInstrucciones();
        if (instruccionRes.ok) {
          const insts = await instruccionRes.json();
          setInstrucciones(insts.map((i) => ({
            value: i._id,
            label: i.descripcion || i.nombre || "Instrucción",
          })));
        }

        if (token) {
          const usersRes = await getUsers(token);
          if (usersRes.ok) {
            const users = await usersRes.json();
            setUsuarios(users.map((u) => ({
              value: u._id,
              label: `${u.name || u.nombre || ""}`.trim(),
            })));
          }
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
    observaciones: "",
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
      const response = await getDocumentById(docId, token);
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
        sintesis: fullDoc.asunto,
        observaciones: fullDoc.observaciones || "",
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
      setDocumentoAnexos(fullDoc.anexos || []);
      setTurnosDocumento(fullDoc.turnados || []);
      setCopiasDocumento(fullDoc.copias || []);
      setBitacoraDocumento(fullDoc.bitacora || []);
      setRelacionadosDocumento(
        (fullDoc.relacionados || [])
          .map((rel) => {
            if (!rel || !rel.item) return null;
            const related = rel.item;
            return {
              relationId: rel._id,
              value: related._id || related.value,
              folio: related.folio || related.label || "",
              docId: related.docId || "",
              remitente: related.remitente ? (related.remitente.name || related.remitente) : "",
              asunto: related.asunto || related.observaciones || "",
            };
          })
          .filter(Boolean)
      );
      setDocumentosSeleccionados(
        (fullDoc.relacionados || []).map((rel) =>
          rel?.item?._id || rel?.item || rel
        )
      );
      setDocumentoSeleccionado(fullDoc);

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
    handleChangeForm(e, setFormEditar, setErrores, { validateOnChange: true });
  };

  const validarFormulario = () =>
    validarDocumentoForm(formEditar, setErrores, {
      required: ["tipoDocumento", "temaPrincipal", "sintesis"],
    });

  const handleSave = () => {
    if (!validarFormulario()) {
      showValidationError();
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
            observaciones: formEditar.observaciones,
            asunto: formEditar.sintesis,
          };

          const response = await updateDocument(currentDocId, payload, token);
          if (response.ok) {
            const updatedDocumento = await response.json();
            setDocumentos((prev) =>
              prev.map((doc) =>
                doc.docId === currentDocId || doc.numeroDocumento === currentDocId
                  ? { ...doc, ...updatedDocumento, remitente: updatedDocumento.remitente || doc.remitente }
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

  const handleToggleFaltaInformacion = (value) =>
    handleToggleFaltaInformacionHelper(value, setFormEditar, setFolioGenerado);

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

const documentosFiltrados = documentos.filter((d) =>
    d.folio.toLowerCase().includes(busquedaDocumentoRelacionado.toLowerCase()) ||
    d.docId.toLowerCase().includes(busquedaDocumentoRelacionado.toLowerCase()) ||
    (d.asunto && d.asunto.toLowerCase().includes(busquedaDocumentoRelacionado.toLowerCase()))
  );

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
  const [selectedCopiaUsuario, setSelectedCopiaUsuario] = useState(null);



  const funcionariosFiltrados = usuarios
    .filter((u) =>
      u.label.toLowerCase().includes(busquedaFuncionario.toLowerCase()) &&
      !copiasDocumento.some((copia) => (copia.funcionario?.nombre || copia.funcionario?.label || copia.funcionario || "").toLowerCase() === u.label.toLowerCase())
    );

    const [busquedaVerTurnos, setBusquedaVerTurnos] = useState("");

  const turnosVerFiltrados = (turnosDocumento || []).filter((item) =>
    [
      item.instruccion?.descripcion || item.instruccion?.label || item.instruccion,
      item.remitente?.nombre || item.remitente?.label || item.remitente,
      item.areaDestino?.nombre || item.areaDestino?.label || item.areaDestino,
      item.dirigido?.nombre || item.dirigido?.label || item.dirigido,
      item.prioridad,
      item.compromiso ? formatDateValue(item.compromiso) : item.fechaTurnado ? formatDateValue(item.fechaTurnado) : "",
      item.turna?.nombre || item.turna?.label || item.turna,
      item.status,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(busquedaVerTurnos.toLowerCase())
  );

  const [mostrarModalTurno, setMostrarModalTurno] = useState(false);

  const [form, setForm] = useState({
    instruccion: "",
    remitente: "",
    areaDestino: "",
    dirigido: "",
    prioridad: "",
    fecha: "",
    turna: "",
    notas: "",
    autorizar: false,
  });
  const [erroresTurno, setErroresTurno] = useState({});

  const validarFormularioAltaInstruccion = () => {
    let nuevosErrores = {};

    if (!form.instruccion) nuevosErrores.instruccion = true;
    if (!form.areaDestino) nuevosErrores.areaDestino = true;
    if (!form.prioridad) nuevosErrores.prioridad = true;
    if (!form.fecha) nuevosErrores.fecha = true;

    setErroresTurno(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  };

  const handleGuardarAltaInstruccion = async () => {
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

    const currentDocId = documentoEditar?.docId || documentoEditar?._id;
    if (!currentDocId) {
      Swal.fire({
        icon: "error",
        title: "Documento no seleccionado",
        text: "Abre un documento antes de guardar el turno.",
      });
      return;
    }

    try {
      const turnadoData = {
        instruccion: form.instruccion,
        remitente: form.remitente,
        areaDestino: form.areaDestino,
        dirigido: form.dirigido,
        prioridad: form.prioridad,
        compromiso: form.fecha,
        turna: form.turna,
        notas: form.notas,
        status: form.autorizar ? "Autorizado" : "Pendiente",
      };

      const response = await addTurnado(currentDocId, turnadoData, token);
      if (!response.ok) throw new Error("Error agregando el turno");

      const updatedDocumento = await response.json();
      setDocumentoEditar(updatedDocumento);
      setDocumentoSeleccionado(updatedDocumento);
      setTurnosDocumento(updatedDocumento.turnados || []);
      setMostrarModalTurno(false);
      setForm({
        instruccion: "",
        remitente: "",
        areaDestino: "",
        dirigido: "",
        prioridad: "",
        fecha: "",
        turna: "",
        notas: "",
        autorizar: false,
      });
      setErroresTurno({});

      Swal.fire({
        icon: "success",
        title: "Turno guardado",
        text: "El turno se agregó correctamente.",
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error al guardar el turno",
        text: "No se pudo guardar el turno.",
      });
    }
  };

  const handleGuardarCopia = async () => {
    if (!selectedCopiaUsuario) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Selecciona un funcionario",
        showConfirmButton: false,
        timer: 2500,
      });
      return;
    }

    const currentDocId = documentoEditar?.docId || documentoEditar?._id;
    if (!currentDocId) {
      Swal.fire({
        icon: "error",
        title: "Documento no seleccionado",
        text: "Abre un documento antes de guardar la copia.",
      });
      return;
    }

    try {
      const copiaData = {
        funcionario: selectedCopiaUsuario.value,
      };

      const response = await addCopia(currentDocId, copiaData, token);
      if (!response.ok) throw new Error("Error agregando la copia");

      const updatedDocumento = await response.json();
      setDocumentoEditar(updatedDocumento);
      setDocumentoSeleccionado(updatedDocumento);
      setCopiasDocumento(updatedDocumento.copias || []);
      setMostrarModalCopias(false);
      setBusquedaFuncionario("");
      setSelectedCopiaUsuario(null);

      Swal.fire({
        icon: "success",
        title: "Copia guardada",
        text: "La copia se agregó correctamente.",
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error al guardar la copia",
        text: "No se pudo guardar la copia.",
      });
    }
  };

  const [mostrarModalAnexo, setMostrarModalAnexo] = useState(false);
  const [busquedaSubirAnexo, setBusquedaSubirAnexo] = useState("");
  const [mostrarModalSubirAnexo, setMostrarModalSubirAnexo] = useState(false);
  const [archivo, setArchivo] = useState(null);

  const documentoAnexosFiltrados = documentoAnexos.filter((anexo) =>
    [anexo.mensaje, anexo.nombre, anexo.ruta]
      .join(" ")
      .toLowerCase()
      .includes(busquedaSubirAnexo.toLowerCase())


  );

  const relacionadosFiltrados = relacionadosDocumento.filter((doc) =>
    [doc.folio, doc.docId, doc.remitente, doc.asunto]
      .join(" ")
      .toLowerCase()
      .includes(busquedaVerTurnos.toLowerCase())
  );
  const [dragActivo, setDragActivo] = useState(false);

  const inputRef = useRef(null);

  const eliminarArchivo = () => {
    setArchivo(null);
    if (inputRef.current) {
      inputRef.current.value = ""; // reset input file
    }
  };

  const [mensaje, setMensaje] = useState("");
  const [nombreDoc, setNombreDoc] = useState("");
  const [erroresAnexos, setErroresAnexos] = useState({});

  const validarAgregarAnexo = () => {
    let nuevosErrores = {};

    if (!mensaje.trim()) {
      nuevosErrores.mensaje = true;
    }

    if (!archivo) {
      nuevosErrores.archivo = true;
    }

    if (!nombreDoc.trim()) {
      nuevosErrores.nombreDoc = true;
    }

    setErroresAnexos(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  };

  const normalizeRelacionadoItem = (rel) => {
    if (!rel) return null;
    return {
      relationId: rel._id || rel.relationId || null,
      value: rel.item?._id || rel._id || rel.value || rel,
      folio: rel.item?.folio || rel.folio || rel.label || "",
      docId: rel.item?.docId || rel.docId || "",
      remitente: rel.item?.remitente ? (rel.item.remitente.name || rel.item.remitente) : (rel.remitente ? (rel.remitente.name || rel.remitente) : ""),
      asunto: rel.item?.asunto || rel.asunto || rel.observaciones || "",
    };
  };

  const handleUploadAnexo = async () => {
    if (!validarAgregarAnexo()) return;
    const currentDocId = documentoEditar?.docId || documentoEditar?._id;
    if (!currentDocId) {
      Swal.fire({
        icon: "error",
        title: "Documento no seleccionado",
        text: "Abre un documento antes de subir anexos.",
      });
      return;
    }

    try {
      const formData = new FormData();
      const user = JSON.parse(localStorage.getItem("user"));
      formData.append('registrador', user._id || "Desconocido");
      formData.append('archivo', archivo);
      formData.append('mensaje', mensaje);
      formData.append('nombre', nombreDoc);

      console.log("Subiendo anexo con datos:", currentDocId);
      const response = await uploadAnexo(currentDocId, formData, token);
      if (!response.ok) throw new Error('Error subiendo el anexo');

      const updatedDocumento = await response.json();
      setDocumentoAnexos(updatedDocumento.anexos || []);
      setDocumentoEditar(updatedDocumento);
      setDocumentoSeleccionado(updatedDocumento);
      setMensaje("");
      setNombreDoc("");
      setArchivo(null);
      setErroresAnexos({});
      setMostrarModalSubirAnexo(false);

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Anexo subido correctamente',
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error al subir el anexo',
        text: 'No se pudo guardar el archivo en el servidor.',
      });
    }
  };

  const handleRemoveAnexo = async (anexoId) => {
    const currentDocId = documentoEditar?.docId || documentoEditar?._id;
    if (!currentDocId) return;

    try {
      const response = await removeAnexo(currentDocId, { anexoId }, token);
      if (!response.ok) throw new Error('Error eliminando anexo');

      const updatedDocumento = await response.json();
      setDocumentoAnexos(updatedDocumento.anexos || []);
      setDocumentoEditar(updatedDocumento);
      setDocumentoSeleccionado(updatedDocumento);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error al eliminar el anexo',
        text: 'No se pudo eliminar el archivo.',
      });
    }
  };

  const handleSaveRelacionados = async () => {
    const currentDocId = documentoEditar?.docId || documentoEditar?._id;
    if (!currentDocId) return;

    try {
      let updatedDocumento = documentoEditar;
      const newIds = documentosSeleccionados.filter(
        (id) => !relacionadosDocumento.some((doc) => doc.value === id)
      );
      for (const id of newIds) {
        const doc = documentos.find(d => d.docId === id.docId);
        const folio = doc ? doc.folio : id;
        Swal.fire({
          title: 'Guardando documento relacionado',
          text: `Guardando folio: ${folio}`,
          allowOutsideClick: false,
          showConfirmButton: false,
          timer: 1500,
        });
        const response = await addRelacionado(currentDocId, { relacionado: { item: id, modelo: "Documento" } }, token);
        if (!response.ok) throw new Error('Error agregando documento relacionado');
        updatedDocumento = await response.json();
      }

      setRelacionadosDocumento(
        (updatedDocumento.relacionados || [])
          .map(normalizeRelacionadoItem)
          .filter(Boolean)
      );
      setDocumentosSeleccionados(
        (updatedDocumento.relacionados || []).map((rel) =>
          typeof rel === 'object' ? (rel._id || rel.value) : rel
        )
      );
      setDocumentoEditar(updatedDocumento);
      setDocumentoSeleccionado(updatedDocumento);
      setMostrarModalRelacionado(false);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error al agregar documento relacionado',
        text: 'No se pudo guardar la relación.',
      });
    }
  };

  const handleRemoveRelacionado = async (relatedId) => {
    const currentDocId = documentoEditar?.docId || documentoEditar?._id;
    if (!currentDocId) return;

    try {
      const response = await removeRelacionado(currentDocId, { relacionadoId: relatedId }, token);
      if (!response.ok) throw new Error('Error eliminando documento relacionado');

      const updatedDocumento = await response.json();
      setRelacionadosDocumento(
        (updatedDocumento.relacionados || [])
          .map(normalizeRelacionadoItem)
          .filter(Boolean)
      );
      setDocumentosSeleccionados(
        (updatedDocumento.relacionados || []).map((rel) =>
          typeof rel === 'object' ? (rel._id || rel.value) : rel
        )
      );
      setDocumentoEditar(updatedDocumento);
      setDocumentoSeleccionado(updatedDocumento);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error al eliminar documento relacionado',
        text: 'No se pudo remover la relación.',
      });
    }
  };

  const [mostrarVisor, setMostrarVisor] = useState(false);
  const [archivoVista, setArchivoVista] = useState(null);
    
  const [mostrarModalAnexos, setMostrarModalAnexos] = useState(false);
  const [anexosDisponibles, setAnexosDisponibles] = useState([
    {
      id: 1,
      folio: "ANX-001",
      nombre: "Contrato.pdf",
      archivo: null,
    },
    {
      id: 2,
      folio: "ANX-002",
      nombre: "Identificación.jpg",
      archivo: null,
    },
  ]);

  const [anexosSeleccionados, setAnexosSeleccionados] = useState([]);


  const [materiales, setMateriales] = useState([
    {
      id: 1,
      tipo: "CD",
      descripcion: "Contiene información digital del asunto",
      registrador: "Víctor Manuel Enríquez Paniagua",
    },
  ]);

  const [busquedaMaterialAdicional, setBusquedaMaterialAdicional] = useState("");

  const materialesAdicionalesFiltrados = materiales.filter((m) =>
    m.tipo.toLowerCase().includes(busquedaMaterialAdicional.toLowerCase()) ||
    m.descripcion.toLowerCase().includes(busquedaMaterialAdicional.toLowerCase()) ||
    m.registrador.toLowerCase().includes(busquedaMaterialAdicional.toLowerCase())
  );

  const [mostrarModalMaterial, setMostrarModalMaterial] = useState(false);

  const [nuevoMaterial, setNuevoMaterial] = useState({
    tipo: "",
    descripcion: "",
  });

  return (
    <main
      className="flex-1 p-4 bg-white"
      onClick={() =>
        menuContextual.visible &&
        setMenuContextual((m) => ({ ...m, visible: false }))
      }
    >
      <h1 className="text-lg font-medium text-[#60595D] mb-0">Buscador de documentos</h1>
        <label className="text-xs text-gray-500">Busca registros por cualquiera de sus campos y modifica dando clic derecho.</label>

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
                <td colSpan="6" className="text-center py-6 text-[#60595D]">
                  Cargando documentos...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-red-500">
                  {error}
                </td>
              </tr>
            ) : resultadosPaginados.length == 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-[#60595D]">
                  No se encontraron documentos.
                </td>
              </tr>
            ) : (
              resultadosPaginados.map((doc, index) => (
                <tr
                  key={doc.folio}
                  onContextMenu={(e) => handleRightClick(e, doc)}
                  className={`border-t cursor-context-menu transition ${index % 2 === 0 ? "bg-white" : "bg-white"} hover:bg-[#79142A]/10`}
                >
                  <td className="px-4 py-2 font-medium text-gray-700">{doc.folio}</td>
                  <td className="px-4 py-2">{doc.docId}</td>
                  <td className="px-4 py-2">{formatDateValue(doc.fechaDoc)}</td>
                  <td className="px-4 py-2">{doc.asunto || "Sin asunto"}</td>
                  <td className="px-4 py-2">{doc.remitente.name}</td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-1 rounded bg-gray-200 text-gray-700">{doc.status || "Recibido"}</span>
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
                              <textarea className="w-full border rounded px-2 py-1" 
                              value={formEditar.observaciones}
                              onChange={handleChange}
                              />
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

                      <div className="flex items-center gap-2 mb-2">

                          {/* Botón */}
                          <button
                            onClick={() => setMostrarModalSubirAnexo(true)}
                            className="bg-[#8B1538] text-white px-4 py-2 rounded flex items-center gap-2 shadow hover:opacity-90"
                          >
                            Subir anexo
                          </button>

                          {/* 🔍 Buscador */}
                          <div className="flex-1 flex items-center border rounded px-2">
                            <Search size={16} className="text-gray-400" />
                           <input
                              value={busquedaSubirAnexo}
                              onChange={(e) => setBusquedaSubirAnexo(e.target.value)}
                              className="w-full px-2 py-2 outline-none text-sm"
                              placeholder="Buscar anexo..."
                            />

                          </div>

                        </div>

                        <h3 className="text-sm font-semibold text-gray-600 mb-2">
                        Sube archivos de anexos.
                      </h3>
                      
                       {/* Tabla de subir anexos */}                        
                        <div className="overflow-x-auto">
                          <table className="min-w-[900px] w-full text-xs border border-gray-200">

                            {/* 🔴 HEADER */}
                            <thead className="bg-[#8B1538] text-white">
                              <tr>
                                <th className="px-3 py-2 text-left">Eliminar</th>
                                <th className="px-3 py-2 text-left">Registrador</th>
                                <th className="px-3 py-2 text-left">Mensaje</th>
                                <th className="px-3 py-2 text-left">Archivo</th>
                                <th className="px-3 py-2 text-left">Nombre del documento</th>
                              </tr>
                            </thead>

                            {/* 🧾 BODY */}
                            <tbody>
                              {documentoAnexosFiltrados.length > 0 ? (
                                documentoAnexosFiltrados.map((anexo) => (
                                  <tr
                                    key={anexo._id || anexo.nombre}
                                    className="border-t hover:bg-gray-50"
                                  >
                                    {/* 🗑 ELIMINAR */}
                                    <td className="px-3 py-2">
                                      <button
                                        onClick={() => handleRemoveAnexo(anexo._id)}
                                        className="p-2 rounded hover:bg-red-100 text-gray-500 hover:text-red-600 transition"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </td>

                                    {/* 👤 REGISTRADOR */}
                                    <td className="px-3 py-2 text-gray-700">
                                      {anexo.registrador?.nombre ? anexo.registrador.nombre : "N/A"}
                                    </td>

                                    {/* 💬 MENSAJE */}
                                    <td className="px-3 py-2 text-gray-700">
                                      {anexo.mensaje || "Sin mensaje"}
                                    </td>

                                    {/* 📄 BOTÓN ARCHIVO */}
                                    <td className="px-3 py-2">
                                      <button
                                        onClick={() => {
                                          setArchivoVista(`${BaseURL}${anexo.ruta}`);
                                          setMostrarVisor(true);
                                        }}
                                        className="bg-[#8B1538] text-white px-3 py-1 rounded text-xs hover:opacity-90"
                                      >
                                        Ver Archivo
                                      </button>
                                    </td>


                                    {/* 📑 NOMBRE */}
                                    <td className="px-3 py-2 text-gray-700 truncate max-w-[300px]">
                                      {anexo.nombre || "Sin nombre"}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={5} className="text-center py-4 text-gray-400">
                                    Sin resultados
                                  </td>
                                </tr>
                              )}
                            </tbody>

                          </table>
                        </div>

                        <div className="flex items-center gap-2 mb-2">

                          {/* Botón */}
                          <button
                            onClick={() => {
                              setDocumentosSeleccionados([]);
                              setMostrarModalRelacionado(true);
                            }}
                            className="bg-[#8B1538] text-white px-4 py-2 rounded flex items-center gap-2 shadow hover:opacity-90"
                          >
                            Añadir documento relacionado
                          </button>

                          {/* 🔍 Buscador */}
                          <div className="flex-1 flex items-center border rounded px-2">
                            <Search size={16} className="text-gray-400" />
                            <input
                              value={busquedaVerTurnos}
                              onChange={(e) => setBusquedaVerTurnos(e.target.value)}
                              className="w-full px-2 py-2 outline-none text-sm"
                              placeholder="Buscar documento relacionado..."
                            />
                          </div>

                        </div>

                        <h3 className="text-sm font-semibold text-gray-600 mb-2">
                        Documentos relacionados al registro.
                      </h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm border border-gray-200">
                            <thead className="bg-[#8B1538] text-white">
                              <tr>
                                <th className="px-4 py-2 text-left">Folio</th>
                                <th className="px-4 py-2 text-left">DocId</th>
                                <th className="px-4 py-2 text-left">Remitente</th>
                                <th className="px-4 py-2 text-left">Asunto</th>
                                <th className="px-4 py-2 text-left">Eliminar</th>
                              </tr>
                            </thead>

                            <tbody>
                              {relacionadosFiltrados.length > 0 ? (
                                relacionadosFiltrados.map((relacionado) => (
                                  <tr
                                    key={relacionado.value}
                                    className="border-t hover:bg-gray-50"
                                  >
                                    <td className="px-4 py-2 text-gray-700">{relacionado.folio || 'Sin folio'}</td>
                                    <td className="px-4 py-2 text-gray-700">{relacionado.docId || 'Sin docId'}</td>
                                    <td className="px-4 py-2 text-gray-700">{relacionado.remitente || 'N/A'}</td>
                                    <td className="px-4 py-2 text-gray-700">{relacionado.asunto || 'Sin asunto'}</td>
                                    <td className="px-4 py-2">
                                      <button
                                        onClick={() => handleRemoveRelacionado(relacionado.value)}
                                        className="text-red-500 hover:text-red-700 transition"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={5} className="text-center py-4 text-gray-400">
                                    Sin documentos relacionados
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

                      {/* MODAL SUBIR ANEXO */}
                      <AnimatePresence>
                        {mostrarModalSubirAnexo && (
                          <motion.div
                            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <motion.div
                              className="bg-white w-[500px] rounded-lg shadow-lg p-6"
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.8, opacity: 0 }}
                            >
                              {/* Header */}
                              <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">Agregar anexo</h2>

                                <button
                                  onClick={() => setMostrarModalSubirAnexo(false)}
                                  className="bg-[#79142A]  text-white hover:bg-[#79142A]/80 rounded-full p-1 transition"
                                >
                                  <Minus size={18} />
                                </button>
                              </div>

                              {/* Mensaje */}
                              <div className="mb-4">
                                <label className="block text-sm mb-1">Mensaje:</label>
                                <textarea
                                  value={mensaje}
                                  onChange={(e) => setMensaje(e.target.value)}
                                  className={`w-full border rounded p-2 ${
                                    erroresAnexos.mensaje ? "border-red-500 bg-red-50" : ""
                                  }`}
                                  rows="3"
                                />
                              </div>

                              {/* Documento */}
                              <div className="mb-4">
                                <label className="block text-sm mb-2 font-medium">
                                  Documento anexo:
                                </label>

                                {/* Input oculto */}
                                <input
                                  ref={inputRef}
                                  type="file"
                                  id="fileUpload"
                                  className="hidden"
                                  onChange={(e) => setArchivo(e.target.files[0])}
                                />

                                {/* Zona Drag & Drop */}
                                <label
                                  htmlFor="fileUpload"
                                  onDragOver={(e) => {
                                    e.preventDefault();
                                    setDragActivo(true);
                                  }}
                                  onDragLeave={() => setDragActivo(false)}
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    setDragActivo(false);
                                    const file = e.dataTransfer.files[0];
                                    if (file) setArchivo(file);
                                  }}
                                  className={`relative flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-6 cursor-pointer transition  ${
                                    erroresAnexos.archivo
                                      ? "border-red-500 bg-red-50"
                                      : dragActivo
                                      ? "border-[#8B1538] bg-red-50"
                                      : "border-gray-300 hover:border-[#8B1538] hover:bg-gray-50"
                                  }`}
                                >
                                  {/* Botón eliminar */}
                                  {archivo && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault(); // evita abrir el file picker
                                        eliminarArchivo();
                                      }}
                                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                    >
                                      <X size={14} />
                                    </button>
                                  )}

                                  <Upload size={28} className="text-[#8B1538]" />

                                  <p className="text-sm text-gray-600">
                                    {archivo ? archivo.name : "Haz clic o arrastra un archivo aquí"}
                                  </p>

                                  <span className="text-xs text-gray-400">
                                    PDF, DOC, JPG (máx. 5MB)
                                  </span>
                                </label>
                              </div>

                              {/* Nombre */}
                              <div className="mb-4">
                                <label className="block text-sm mb-1">Nombre del documento:</label>
                                <input
                                  type="text"
                                  value={nombreDoc}
                                  onChange={(e) => setNombreDoc(e.target.value)}
                                  className={`w-full border rounded p-2 ${
                                    erroresAnexos.nombreDoc ? "border-red-500 bg-red-50" : ""
                                  }`}
                                />
                              </div>

                              {/* Botones */}
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setMostrarModalSubirAnexo(false)}
                                  className="px-4 py-2 bg-gray-300 rounded"
                                >
                                  Cancelar
                                </button>

                                <button
                                  onClick={handleUploadAnexo}
                                  className="px-4 py-2 bg-[#8B1538] text-white rounded"
                                >
                                  Guardar
                                </button>

                              </div>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <AnimatePresence>
                        {mostrarModalAnexos && (
                          <motion.div
                            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <motion.div
                              className="bg-white w-[600px] rounded-lg shadow-lg p-6"
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0.8 }}
                            >
                              {/* Header */}
                              <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Seleccionar anexos</h2>

                                <button
                                  onClick={() => setMostrarModalAnexos(false)}
                                  className="bg-[#8B1538] text-white rounded-full p-1"
                                >
                                   <Minus size={16} />
                                </button>
                              </div>

                              {/* Lista */}
                              <div className="max-h-[300px] overflow-y-auto border rounded">
                                {anexosDisponibles.map((anexo) => (
                                  <div
                                    key={anexo.id}
                                    className="flex items-center justify-between px-4 py-2 border-b hover:bg-gray-50"
                                  >
                                    <div>
                                      <p className="text-sm font-medium">{anexo.nombre}</p>
                                      <p className="text-xs text-gray-500">{anexo.folio}</p>
                                    </div>

                                    <button
                                      onClick={() => {
                                        // evitar duplicados
                                        const existe = anexosSeleccionados.some(
                                          (a) => a.id === anexo.id
                                        );

                                        if (!existe) {
                                          setAnexosSeleccionados([
                                            ...anexosSeleccionados,
                                            anexo,
                                          ]);
                                        }
                                      }}
                                      className="bg-[#8B1538] text-white px-3 py-1 rounded text-xs"
                                    >
                                      Añadir
                                    </button>
                                  </div>
                                ))}
                              </div>

                              {/* Footer */}
                              <div className="flex justify-end mt-4">
                                <button
                                  onClick={() => setMostrarModalAnexos(false)}
                                  className="bg-gray-300 px-4 py-2 rounded"
                                >
                                  Cerrar
                                </button>
                              </div>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                        {/* Modal ver archivo */}
                      <AnimatePresence>
                        {mostrarVisor && (
                          <motion.div
                            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <motion.div
                              className="bg-white w-[80%] h-[80%] rounded-lg shadow-lg p-4 relative"
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0.8 }}
                            >
                              {/* Botón cerrar */}
                              <button
                                onClick={() => setMostrarVisor(false)}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                              >
                                ✕
                              </button>

                              {/* Contenido */}
                            <div className="w-full h-full flex items-center justify-center">
                              {typeof archivoVista === "string" ? (
                                archivoVista.endsWith(".pdf") ? (
                                  <iframe
                                    src={archivoVista}
                                    className="w-full h-full rounded"
                                  />
                                ) : (
                                  <img
                                    src={archivoVista}
                                    alt="preview"
                                    className="max-h-full rounded"
                                  />
                                )
                              ) : archivoVista?.type?.includes("image") ? (
                                <img
                                  src={URL.createObjectURL(archivoVista)}
                                  alt="preview"
                                  className="max-h-full rounded"
                                />
                              ) : archivoVista?.type === "application/pdf" ? (
                                <iframe
                                  src={URL.createObjectURL(archivoVista)}
                                  className="w-full h-full rounded"
                                />
                              ) : (
                                <p className="text-gray-500">
                                  No se puede previsualizar este archivo
                                </p>
                              )}
                            </div>

                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      </div>
                      
                    )}

                    {tabActiva === "materialAdicional" && (
                    <div className="space-y-4">

                      {/* 🔥 HEADER */}
                      <div className="flex items-center gap-2 mb-2">

                        {/* Botón añadir */}
                        <button
                          onClick={() => setMostrarModalMaterial(true)}
                          className="bg-[#8B1538] text-white px-4 py-2 rounded shadow hover:opacity-90"
                        >
                          Añadir material adicional
                        </button>

                        {/* 🔍 Buscador */}
                        <div className="flex-1 flex items-center border rounded px-2">
                          <Search size={16} className="text-gray-400" />
                          <input
                            value={busquedaMaterial}
                            onChange={(e) => setBusquedaMaterial(e.target.value)}
                            className="w-full px-2 py-2 outline-none text-sm"
                            placeholder="Buscar material..."
                          />
                        </div>

                      </div>

                      {/* 🧾 TABLA */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border border-gray-200">

                          <thead className="bg-[#8B1538] text-white">
                            <tr>
                              <th className="px-4 py-2 text-left">Eliminar</th>
                              <th className="px-4 py-2 text-left">Tipo de material</th>
                              <th className="px-4 py-2 text-left">Descripción</th>
                              <th className="px-4 py-2 text-left">Registrador</th>
                            </tr>
                          </thead>

                          <tbody>
                            {materialesAdicionalesFiltrados.length > 0 ? (
                              materialesAdicionalesFiltrados.map((material) => (
                                <tr key={material.id} className="border-t hover:bg-gray-50">

                                  {/* 🗑 ELIMINAR */}
                                  <td className="px-4 py-2">
                                    <button
                                      onClick={() => {
                                        setMateriales((prev) =>
                                          prev.filter((m) => m.id !== material.id)
                                        );
                                      }}
                                      className="p-2 rounded hover:bg-red-100 text-gray-500 hover:text-red-600 transition"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </td>

                                  <td className="px-4 py-2 text-gray-700">
                                    {material.tipo}
                                  </td>

                                  <td className="px-4 py-2 text-gray-700">
                                    {material.descripcion}
                                  </td>

                                  <td className="px-4 py-2 text-gray-700">
                                    {material.registrador}
                                  </td>

                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={4} className="text-center py-4 text-gray-400">
                                  Sin materiales adicionales
                                </td>
                              </tr>
                            )}
                          </tbody>

                        </table>
                      </div>

                      <AnimatePresence>
                        {mostrarModalMaterial && (
                          <motion.div
                            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <motion.div
                              className="bg-white w-[400px] rounded-lg shadow-lg p-6"
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.8, opacity: 0 }}
                            >
                              {/* Header */}
                              <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">
                                  Agregar material adicional
                                </h2>

                                <button
                                  onClick={() => setMostrarModalMaterial(false)}
                                  className="bg-[#8B1538] text-white rounded-full p-1"
                                >
                                  <Minus size={16} />
                                </button>
                              </div>

                              {/* Tipo */}
                              <div className="mb-3">
                                <label className="block text-sm mb-1">Tipo de material</label>
                                <input
                                  type="text"
                                  value={nuevoMaterial.tipo}
                                  onChange={(e) =>
                                    setNuevoMaterial({ ...nuevoMaterial, tipo: e.target.value })
                                  }
                                  className="w-full border rounded p-2"
                                  placeholder="Ej. USB, CD, Documento físico..."
                                />
                              </div>

                              {/* Descripción */}
                              <div className="mb-4">
                                <label className="block text-sm mb-1">Descripción</label>
                                <textarea
                                  value={nuevoMaterial.descripcion}
                                  onChange={(e) =>
                                    setNuevoMaterial({
                                      ...nuevoMaterial,
                                      descripcion: e.target.value,
                                    })
                                  }
                                  className="w-full border rounded p-2"
                                  rows="3"
                                />
                              </div>

                              {/* Botones */}
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setMostrarModalMaterial(false)}
                                  className="px-4 py-2 bg-gray-300 rounded"
                                >
                                  Cancelar
                                </button>

                                <button
                                  onClick={async () => {
                                    // Validación
                                    if (!nuevoMaterial.tipo || !nuevoMaterial.descripcion) {
                                      Swal.fire({
                                        toast: true,
                                        position: "top-end",
                                        icon: "warning",
                                        title: "Todos los campos son obligatorios",
                                        showConfirmButton: false,
                                        timer: 2500,
                                      });
                                      return;
                                    }

                                    // Confirmación
                                    const result = await Swal.fire({
                                      title: "¿Agregar material?",
                                      text: "Se añadirá el material adicional al registro.",
                                      icon: "question",
                                      showCancelButton: true,
                                      confirmButtonText: "Sí, agregar",
                                      cancelButtonText: "Cancelar",
                                      confirmButtonColor: "#8B1538",
                                      cancelButtonColor: "#6B7280",
                                    });

                                    if (result.isConfirmed) {
                                      const nuevo = {
                                        id: Date.now(),
                                        ...nuevoMaterial,
                                        registrador: "Usuario actual",
                                      };

                                      setMateriales((prev) => [...prev, nuevo]);

                                      // Éxito
                                      await Swal.fire({
                                        icon: "success",
                                        title: "Material agregado",
                                        text: "Se agregó correctamente.",
                                        confirmButtonColor: "#8B1538",
                                      });

                                      // limpiar y cerrar
                                      setNuevoMaterial({ tipo: "", descripcion: "" });
                                      setMostrarModalMaterial(false);
                                    }
                                  }}
                                  className="px-4 py-2 bg-[#8B1538] text-white rounded"
                                >
                                  Guardar
                                </button>

                              </div>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>

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
                                    <td className="px-3 py-2 text-gray-700">
                                      {turno.instruccion?.descripcion || turno.instruccion?.label || turno.instruccion || "Sin instrucción"}
                                    </td>
                                    <td className="px-3 py-2 text-gray-700">
                                      {turno.dirigido?.nombre || turno.remitente?.label || turno.remitente || "-"}
                                    </td>
                                    <td className="px-3 py-2 text-gray-700">
                                      {turno.areaDestino?.nombre || turno.areaDestino?.label || turno.areaDestino || "Sin área"}
                                    </td>
                                    <td className="px-3 py-2 text-gray-700">{turno.prioridad || "-"}</td>
                                    <td className="px-3 py-2 text-gray-700">
                                      {turno.compromiso ? formatDateValue(turno.compromiso) : turno.fechaTurnado ? formatDateValue(turno.fechaTurnado) : "-"}
                                    </td>
                                    <td className="px-3 py-2 text-gray-700">
                                      {turno.dirigido?.area || "-"}
                                    </td>
                                    <td className="px-3 py-2 text-gray-700">
                                      {turno.turna?.nombre || turno.turna?.label || turno.turna || "-"}
                                    </td>
                                    <td className="px-3 py-2 font-medium">{turno.status || "Pendiente"}</td>
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
                                  <select
                                    value={form.instruccion}
                                    onChange={(e) => setForm({ ...form, instruccion: e.target.value })}
                                    className={`w-full border rounded px-3 py-2 ${erroresTurno.instruccion ? "border-red-500" : "border-gray-300"}`}
                                  >
                                    <option value="">Seleccionar</option>
                                    {instrucciones.map((inst) => (
                                      <option key={inst.value} value={inst.value}>
                                        {inst.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Funcionario */}
                                <div>
                                  <label>Funcionario que remite</label>
                                  <select
                                    value={form.remitente}
                                    onChange={(e) => setForm({ ...form, remitente: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                  >
                                    <option value="">Seleccionar</option>
                                    {remitentes.map((item) => (
                                      <option key={item.value} value={item.value}>
                                        {item.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Área destino */}
                                <div>
                                  <label>Área de destino*</label>
                                  <select
                                    value={form.areaDestino}
                                    onChange={(e) => setForm({ ...form, areaDestino: e.target.value })}
                                    className={`w-full border rounded px-3 py-2 ${erroresTurno.areaDestino ? "border-red-500" : "border-gray-300"}`}
                                  >
                                    <option value="">Seleccionar</option>
                                    {areas.map((area) => (
                                      <option key={area.value} value={area.value}>
                                        {area.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Dirigido a */}
                                <div className="col-span-2">
                                  <label>Dirigido a</label>
                                  <select
                                    value={form.dirigido}
                                    onChange={(e) => setForm({ ...form, dirigido: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                  >
                                    <option value="">Seleccionar</option>
                                    {usuarios.map((user) => (
                                      <option key={user.value} value={user.value}>
                                        {user.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Prioridad */}
                                <div>
                                  <label>Prioridad*</label>
                                  <select
                                    value={form.prioridad}
                                    onChange={(e) => setForm({ ...form, prioridad: e.target.value })}
                                    className={`w-full border rounded px-3 py-2 ${erroresTurno.prioridad ? "border-red-500" : "border-gray-300"}`}
                                  >
                                    <option value="">Seleccionar</option>
                                    <option value="Trámite Extra-urgente">Trámite Extra-urgente</option>
                                    <option value="Urgente">Urgente</option>
                                    <option value="Normal">Normal</option>
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
                                  <select
                                    value={form.turna}
                                    onChange={(e) => setForm({ ...form, turna: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                  >
                                    <option value="">Seleccionar</option>
                                    {usuarios.map((user) => (
                                      <option key={user.value} value={user.value}>
                                        {user.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Notas */}
                                <div className="col-span-2">
                                  <label>Notas</label>
                                  <textarea
                                    value={form.notas}
                                    onChange={(e) => setForm({ ...form, notas: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                  />
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
                            onClick={() => {
                              setMostrarModalCopias(true);
                              setBusquedaFuncionario("");
                              setSelectedCopiaUsuario(null);
                            }}
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
                              {copiasDocumento.length > 0 ? (
                                copiasDocumento.map((copia, index) => (
                                  <tr
                                    key={copia._id || index}
                                    className="border-t hover:bg-gray-50"
                                  >
                                    <td className="px-4 py-2">
                                      <button
                                        onClick={() => {
                                          setCopiasDocumento((prev) => prev.filter((_, i) => i !== index));
                                        }}
                                        className="text-red-500 hover:text-red-700 transition"
                                        title="Eliminar"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </td>

                                    <td className="px-4 py-2 text-gray-700">
                                      {copia.funcionario?.nombre || copia.funcionario?.label || copia.funcionario || "Sin funcionario"}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={2} className="text-center py-4 text-gray-400">
                                    Sin copias registradas
                                  </td>
                                </tr>
                              )}
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
                      
                                {bitacoraDocumento.length ? (
                                  bitacoraDocumento.map((movimiento, index) => {
                                    const esPrincipal =
                                      movimiento.importancia === "Alta";
                      
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
                                            {movimiento.user.nombre}
                                          </p>
                      
                                          <p className={`text-xs mt-1 ${esPrincipal ? "opacity-90" : ""}`}>
                                            {movimiento.descripcion}
                                          </p>
                                        </div>
                      
                                        <div className="text-right text-xs whitespace-nowrap">
                                          <p>Fecha: {formatDateValue(movimiento.fecha)}</p>
                                          <p>Hora: {// Obtener solo la hora en formato HH:mm
                                            new Date(movimiento.fecha).toLocaleTimeString([], {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })
                                          }</p>
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
                            key={d.docId}
                            onClick={() => {
                              if (!documentosSeleccionados.includes(d)) {
                                setDocumentosSeleccionados([...documentosSeleccionados, d]);

                                //  AQUÍ asigna lo que quieres mostrar en Anexos
                                setAsuntoSeleccionado({
                                  descripcion: d.docId // o aquí puedes usar otra propiedad si tienes más info
                                });
                              }
                              setBusquedaDocumentoRelacionado("");
                              setMostrarOpcionesDocumento(false);
                            }}
                            className="px-2 py-1 hover:bg-gray-100 cursor-pointer text-sm"
                          >
                            {d.folio } - {d.asunto || "Sin asunto"}
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
                        const doc = documentos.find(d => d.docId === id.docId);
                        return (
                          <div key={id.docId} className="flex justify-between items-center py-1">
                            <span className="text-sm">{doc ? doc.folio : id.docId}</span>
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
                  onClick={handleSaveRelacionados}
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
                          funcionariosFiltrados.map((e) => (
                            <div
                              key={e.value}
                              onClick={() => {
                                setBusquedaFuncionario(e.label);
                                setSelectedCopiaUsuario(e);
                                setMostrarOpcionesFuncionario(false);
                              }}
                              className="px-2 py-2 hover:bg-gray-100 cursor-pointer"
                            >
                              {e.label}
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
                    onClick={handleGuardarCopia}
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