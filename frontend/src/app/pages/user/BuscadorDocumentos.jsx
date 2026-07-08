import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Minus, Trash2, Plus, Upload, X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import Swal from "sweetalert2";
import { getDocuments, getDocumentById, updateDocument, uploadAnexo, removeAnexo, addRelacionado, removeRelacionado, addTurnado, addCopia, addAdicional, removeAdicional, deleteDocument } from "../../services/document.service.js";
import { getTipoDocument } from "../../services/tipoDocumento.service.js";
import { getTemaPrincipal, getAreas, getInstrucciones } from "../../services/catalogos.service.js";
import { getRemitentes } from "../../services/remitente.service.js";
import { getUsers, getCopias } from "../../services/user.service.js";

import jsPDF from "jspdf";
import logoGobierno from "../../assets/images/nayaritLogo.png";

import GothamRoundedBold from "../../../styles/fonts/GothamRounded-Bold.ttf";
import GothamRoundedBook from "../../../styles/fonts/GothamRounded-Book.ttf";
import MontserratBold from "../../../styles/fonts/Montserrat-Bold.ttf";
import MontserratRegular from "../../../styles/fonts/Montserrat-Regular.ttf";

import {
  Toggle,
  handleChangeForm,
  validarDocumentoForm,
  handleToggleFaltaInformacion as handleToggleFaltaInformacionHelper,
  showValidationError,
} from "../../utils/documentoFormHelpers.jsx";

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
  const [respuestasDocumento, setRespuestasDocumento] = useState([]);
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

        const remsRes = await getRemitentes();
        if (remsRes.ok) {
          const rems = await remsRes.json();
          setRemitentes(rems.filter(r => r.activo).map((r) => ({
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
          setInstrucciones(insts.filter(i => i.activo).map((i) => ({
            value: i._id,
            label: i.descripcion || i.nombre || "Instrucción",
          })));
        }

        if (token) {
          const usersRes = await getUsers(token);
          if (usersRes.ok) {
            const users = await usersRes.json();
            setUsuarios(users.map((u) => ({ value: u._id, label: `${u.name || u.nombre || ''}`.trim(), areaId: u.areaId }
            )));
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
        const user = JSON.parse(localStorage.getItem("user"));
        const copiasResponse = await getCopias(user.userId, token);
        const copias = copiasResponse.ok ? await copiasResponse.json() : [];
        const data = await response.json();
        const documentos = data.filter((doc) => (
          (doc.turnados || []).some((t) => t.dirigido?.area === user.area) || 
          (copias || []).some((c) => c.docId === doc.docId) || 
          (user.roles || []).some((r) => r.rol === "VALIDADOR" || r.rol === "REGISTRADOR")
        ));
        setDocumentos(documentos);
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
    tipoOtro: "",
    temaPrincipal: "",
    temaSecundario: "",
    sintesis: "",
    observaciones: "",
    otroFuncionario: false,
  });

  const [errores, setErrores] = useState({});

  const handleEliminar = () => {
    const doc = menuContextual.documento;
    if (!doc) return;
    setDocumentoEliminar(doc);
    setMotivoEliminacion("");
    setMenuContextual((m) => ({ ...m, visible: false }));
    setMostrarModalEliminar(true);
  };

  const handleConfirmarEliminar = async () => {
    if (!documentoEliminar) return;
    if (!motivoEliminacion.trim()) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Debe especificar el motivo de eliminación",
      });
      return;
    }

    const docId = documentoEliminar.docId || documentoEliminar._id;
    if (!docId) return;

    try {
      const response = await deleteDocument(docId, motivoEliminacion, token);
      if (response.ok) {
        setDocumentos((prev) => prev.filter((doc) => (doc.docId || doc._id) !== docId));
        setMostrarModalEliminar(false);
        setDocumentoEliminar(null);
        setMotivoEliminacion("");
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Documento eliminado correctamente",
          showConfirmButton: false,
          timer: 2000,
        });
      } else {
        const errorResponse = await response.json().catch(() => null);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: errorResponse?.error || "No se pudo eliminar el documento",
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo eliminar el documento",
      });
    }
  };

  const handleModificar = async () => {
    const doc = menuContextual.documento;
    if (!doc) return;

    const docId = doc.docId || doc._id;
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
      const selectedTipoLabel = fullDoc.tipo ? getReferenceLabel(fullDoc.tipo) : "otro";
      const selectedTemaLabel = getReferenceLabel(fullDoc.tema) || "";
      const selectedSecundarioLabel = getReferenceLabel(fullDoc.secundario) || "";
      const selectedTipoValue = fullDoc.tipo ? (fullDoc.tipo?._id || fullDoc.tipo || "") : "otro";
      const selectedTipoOtroValue = fullDoc.tipoOtro || "";
      const selectedTemaValue = fullDoc.tema?._id || fullDoc.tema || "";
      const selectedMaterialValue = fullDoc.adicional?._id || fullDoc.adicional || "";
      const remitenteLabel = getReferenceLabel(fullDoc.remitente) || "";
      const remitenteId = fullDoc.remitente?._id || fullDoc.remitente || "";
      const tipoRemitente = fullDoc.remitente?.tipo;
      setMaterialesAdicionales(fullDoc.adicional?.adicionales || []);
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
        tipoOtro: selectedTipoOtroValue,
        asunto: selectedTemaValue,
        sintesis: fullDoc.sintesis,
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
      setBusquedaMaterial("");
      setBusquedaRemitenteInt(remitenteLabel);
      setBusquedaRemitenteExt(remitenteLabel);
      setAsuntoSeleccionado({ descripcion: fullDoc.asunto || "" });
      setDocumentoAnexos(fullDoc.anexos || []);
      setTurnosDocumento(fullDoc.turnados || []);
      setCopiasDocumento(fullDoc.copias || []);
      setBitacoraDocumento(fullDoc.bitacora || []);
      setRespuestasDocumento(fullDoc.respuestas || []);
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

          const remitenteOriginal =
            documentoEditar?.remitente?._id ||
            documentoEditar?.remitente ||
            "";
          const remitenteSeleccionado =
            formEditar.tipoRemitente === "interno"
              ? formEditar.remitenteInterno
              : formEditar.tipoRemitente === "externo"
              ? formEditar.remitenteExterno
              : "";
          const remitenteFinal = remitenteSeleccionado || remitenteOriginal;

          const payload = {
            docId: formEditar.noDocumento,
            ejercicio: formEditar.ejercicio,
            fechaDoc: formEditar.fechaDocumento,
            acuse: formEditar.fechaAcuse,
            registro: formEditar.fechaRegistro,
            interno: formEditar.documentoInterno,
            faltaInformacion: formEditar.faltaInformacion,
            ...(remitenteFinal ? { remitente: remitenteFinal } : {}),
            tipo: formEditar.tipoDocumento !== "otro" ? formEditar.tipoDocumento : null,
            tipoOtro: formEditar.tipoDocumento === "otro" ? formEditar.tipoOtro : null,
            tema: formEditar.temaPrincipal,
            observaciones: formEditar.observaciones,
            asunto: formEditar.asunto,
            sintesis: formEditar.sintesis,
          }
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

  // refs + dropdown states usados en UI
  const refTipoDoc = useRef(null);
  const refRemitenteExt = useRef(null);
  const refRemitenteInt = useRef(null);
  const refMaterial = useRef(null);
  const refAsunto = useRef(null);
  const refTemaPrincipal = useRef(null);
  const refTemaSecundario = useRef(null);
  
  const [busquedaRemitenteExt, setBusquedaRemitenteExt] = useState("");
  const [mostrarOpcionesRemitenteExt, setMostrarOpcionesRemitenteExt] = useState(false);
  const [busquedaRemitenteInt, setBusquedaRemitenteInt] = useState("");
  const [mostrarOpcionesRemitenteInt, setMostrarOpcionesRemitenteInt] = useState(false);

  const remitentesInternos = remitentes.filter((r) => r.tipo === "interno");
  const remitentesExternos = remitentes.filter((r) => r.tipo === "externo");

  const [busquedaTipoDoc, setBusquedaTipoDoc] = useState("");
  const [mostrarOpcionesTipoDoc, setMostrarOpcionesTipoDoc] = useState(false);

  const tiposFiltrados = [
    ...tiposDocumento.filter((tipo) =>
      tipo.label.toLowerCase().includes(busquedaTipoDoc.toLowerCase())
    ),
    ...(busquedaTipoDoc.toLowerCase().includes("otro") || busquedaTipoDoc === ""
      ? [{ value: "otro", label: "Otro" }]
      : []),
  ];

  const [asuntoSeleccionado, setAsuntoSeleccionado] = useState(null);

  const [mostrarOpcionesAsunto, setMostrarOpcionesAsunto] = useState(false);

  const [mostrarModalRelacionado, setMostrarModalRelacionado] = useState(false);
  const [mostrarModalAltaAsunto, setMostrarModalAltaAsunto] = useState(false);
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [motivoEliminacion, setMotivoEliminacion] = useState("");
  const [documentoEliminar, setDocumentoEliminar] = useState(null);

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

  const [busquedaMaterial, setBusquedaMaterial] = useState("");
  const [mostrarOpcionesMaterial, setMostrarOpcionesMaterial] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (refTipoDoc.current && !refTipoDoc.current.contains(event.target)) {
        setMostrarOpcionesTipoDoc(false);
      }
      if (refRemitenteInt.current && !refRemitenteInt.current.contains(event.target)) {
        setMostrarOpcionesRemitenteInt(false);
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
  
  const bitacoraRef = useRef(null);

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
    if (form.prioridad === "Urgente") if (!form.fecha) nuevosErrores.fecha = true;

    setErroresTurno(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  };

  const user = JSON.parse(localStorage.getItem("user"));

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
        remitente: documentoEditar.remitente,
        areaDestino: form.areaDestino,
        dirigido: form.dirigido,
        prioridad: form.prioridad,
        compromiso: form.fecha,
        turna: user.id || user._id,
        notas: form.notas,
      };

      const response = await addTurnado(currentDocId, turnadoData, token);
      if (!response.ok) throw new Error("Error agregando el turno");

      const updatedDocumento = await response.json();
      setDocumentoEditar(updatedDocumento);
      setDocumentoSeleccionado(updatedDocumento);
      setTurnosDocumento(updatedDocumento.turnados);
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
      formData.append('docId', currentDocId);

      const response = await uploadAnexo(formData, token);
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
  const [mostrarVisorRespuesta, setMostrarVisorRespuesta] = useState(false);
  const [archivoRespuesta, setArchivoRespuesta] = useState(null);
    
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

  const [mostrarModalMaterial, setMostrarModalMaterial] = useState(false);

  const [nuevoMaterial, setNuevoMaterial] = useState({
    tipo: "",
    descripcion: "",
  });

  const formatDateForInput = (value) => {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? ""
      : date.toISOString().split("T")[0];
  };

  const safeText = (value, fallback = "") => {
    if (value === undefined || value === null || value === "") {
      return fallback;
    }
    if (typeof value === "object") {
      if (Array.isArray(value)) {
        return value
          .map((item) => safeText(item))
          .filter(Boolean)
          .join(", ");
      }
      return (
        value.descripcion ||
        value.tipo ||
        value.name ||
        value.nombre ||
        value.area ||
        value.dependencia ||
        value.cargo ||
        value.label ||
        JSON.stringify(value)
      );
    }
    return String(value);
  };
  
  const [mostrarVisorTurno, setMostrarVisorTurno] = useState(false);

  const obtenerTextoPlano = (valor, fallback = "-") => {
  if (!valor) return fallback;

  // Si ya es string o número
  if (typeof valor === "string" || typeof valor === "number") {
    return String(valor);
  }

  // Si es objeto
  if (typeof valor === "object") {
    return (
      valor.nombre ||
      valor.descripcion ||
      valor.label ||
      valor.value ||
      fallback
    );
  }

  return fallback;
};

  const generarDocumentoTurno = async (turno) => {
      
      // ===== OBTENER ID DEL DOCUMENTO =====

    const documentoId = documentoSeleccionado?._id || documentoSeleccionado?.docId;

    let documentoCompleto = {};

    // ===== CONSULTAR DOCUMENTO =====

    if (documentoId) {
      try {

        const token = localStorage.getItem("token");

        const response = await getDocumentById(documentoId, token);

        if (response.ok) {
          const data = await response.json();

          documentoCompleto = data.documento || data;

        }

      } catch (error) {
        console.error("Error obteniendo documento:", error);
      }
    }
    
    const doc = new jsPDF();

    // ===== PALETA OFICIAL =====
    const COLORS = {
      grisPrincipal: [96, 89, 93],      // #60595D
      beige1: [197, 176, 153],          // #C5B099
      beige2: [205, 177, 156],          // #CDB19C
      beige3: [218, 206, 192],          // #DACEC0
      vino: [121, 20, 42],              // #79142A
      blanco: [255, 255, 255],
      negro: [0, 0, 0],
      grisBorde: [180, 180, 180],
    };

    const fechaHoy = new Date().toLocaleDateString("es-MX", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;

    // ===== TIPOGRAFÍA =====
    // jsPDF no incluye Gotham Rounded ni Montserrat por defecto.
    // Aquí usamos helvetica simulando:
    // - bold = Gotham Rounded Bold
    // - normal = Montserrat Regular

    // ===== HEADER =====

    // Línea superior decorativa
    doc.setDrawColor(...COLORS.vino);
    doc.setLineWidth(2.5);
    doc.line(margin, 10, pageWidth - margin, 10);

    // Fondo decorativo header
    doc.setFillColor(...COLORS.beige3);
    doc.rect(margin, 12, contentWidth, 18, "F");

    // ===== LOGO INSTITUCIONAL =====

    // IMPORTANTE:
    // logoGobierno debe ser una imagen en base64 o importada

    doc.addImage(
      logoGobierno, // imagen
      "PNG",        // formato
      margin + 2,   // X
      12,           // Y
      85,           // ancho
      18            // alto
    );

    // ===== FECHA =====
    doc.setFillColor(...COLORS.vino);
    doc.roundedRect(130, 13, 25, 8, 2, 2, "F");

    doc.setTextColor(...COLORS.blanco);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("FECHA", 142.5, 19, { align: "center" });

    doc.setTextColor(...COLORS.grisPrincipal);
    doc.setFont("helvetica", "normal");
    doc.text(fechaHoy, 175, 19, { align: "center" });

    // ===== LÍNEA SEPARADORA =====
    doc.setDrawColor(...COLORS.beige2);
    doc.setLineWidth(0.7);
    doc.line(margin, 35, pageWidth - margin, 35);

    // ===== TABLA =====
    let y = 42;
    const col1 = margin;
    const col2 = 68;
    const col3 = 110;
    const col4 = 142;
    const rowHeight = 10;

    const dibujarFila = (label1, val1, label2, val2, yPos) => {
      // Fondo fila
      doc.setFillColor(...COLORS.beige3);
      doc.rect(col1, yPos - 6, contentWidth, rowHeight, "F");

      // Label 1
      doc.setFillColor(...COLORS.grisPrincipal);
      doc.rect(col1, yPos - 6, 50, rowHeight, "F");

      doc.setTextColor(...COLORS.blanco);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text(label1, col1 + 2, yPos);

      // Valor 1
      doc.setTextColor(...COLORS.negro);
      doc.setFont("helvetica", "normal");
      doc.text(obtenerTextoPlano(val1, "-"), col2, yPos);

      if (label2) {
        // Label 2
        doc.setFillColor(...COLORS.vino);
        doc.rect(col3, yPos - 6, 28, rowHeight, "F");

        doc.setTextColor(...COLORS.blanco);
        doc.setFont("helvetica", "bold");
        doc.text(label2, col3 + 2, yPos);

        // Valor 2
        doc.setTextColor(...COLORS.negro);
        doc.setFont("helvetica", "normal");
        doc.text(obtenerTextoPlano(val2, "-"), col4 + 3, yPos);
      }

      // Borde
      doc.setDrawColor(...COLORS.beige1);
      doc.rect(col1, yPos - 6, contentWidth, rowHeight);
    };

    const dibujarFilaSimple = (label, valor, yPos) => {
      // Fondo fila
      doc.setFillColor(...COLORS.beige3);
      doc.rect(col1, yPos - 6, contentWidth, rowHeight, "F");

      // Label
      doc.setFillColor(...COLORS.grisPrincipal);
      doc.rect(col1, yPos - 6, 50, rowHeight, "F");

      doc.setTextColor(...COLORS.blanco);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text(label, col1 + 2, yPos);

      // Valor
      doc.setTextColor(...COLORS.negro);
      doc.setFont("helvetica", "normal");
      doc.text(obtenerTextoPlano(valor, "-"), col2, yPos);

      // Borde
      doc.setDrawColor(...COLORS.beige1);
      doc.rect(col1, yPos - 6, contentWidth, rowHeight);
    };

    // ===== DATOS =====

    dibujarFilaSimple(
      "ÁREA DE ATENCIÓN",
        turno?.areaDestino?.nombre ||
        turno?.destinatario?.nombre ||
        "COORDINACIÓN DE ARCHIVO",
      y
    );
    y += rowHeight;

    dibujarFila(
      "TURNO NÚMERO",
      turno?.numero || "000000",
      "FOLIO",
      documentoCompleto?.folio ||
      documentoCompleto?.numeroFolio ||
      "N/A",
      y
    );
    y += rowHeight;

    dibujarFila(
      "FECHA DOCUMENTO",
      formatDateForInput(
        documentoCompleto?.fechaDocumento ||
        documentoCompleto?.fechaDoc
      ) || formatDateForInput(turno?.fecha) || fechaHoy,
      "DOCUMENTO",
      documentoCompleto?.documento ||
      documentoCompleto?.numeroDocumento ||
      documentoCompleto?.docId ||
      "N/A",
      y
    );
    y += rowHeight;

    // RECIBIDO EN
    doc.setFillColor(...COLORS.beige3);
    doc.rect(col1, y - 6, contentWidth, rowHeight, "F");

    doc.setDrawColor(...COLORS.beige1);
    doc.rect(col1, y - 6, contentWidth, rowHeight);

    doc.setFillColor(...COLORS.vino);
    doc.rect(col3, y - 6, 28, rowHeight, "F");

    doc.setTextColor(...COLORS.blanco);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("RECIBIDO EN", col3 + 2, y);

    doc.setTextColor(...COLORS.negro);
    doc.setFont("helvetica", "normal");
    doc.text(
      formatDateForInput(turno?.fechaAcuse) || formatDateForInput(turno?.fechaTurnado) || fechaHoy,
      col4 + 3,
      y
    );

    y += rowHeight;

    dibujarFilaSimple(
      "PROCEDENCIA",
      safeText(
        turno?.remitente?.area ||
        turno?.remitente?.name ||
        turno?.quienTurna?.nombre ||
        turno?.turna?.nombre,
        ""
      ),
      y
    );
    y += rowHeight;

    dibujarFilaSimple(
      "REFERENCIA",
      turno?.referencia ||
      turno?.instruccion?.descripcion ||
      turno?.instruccion ||
      "INFORMA",
      y
    );

    y += rowHeight;

  dibujarFila(
    "PRIORIDAD",
    turno?.prioridad || "-",
    "ESTATUS",
    turno?.status || turno?.estatus || "-",
    y
  );

  y += rowHeight;

  dibujarFila(
    "ÁREA TURNA",
    turno?.turna?.area ||
    turno?.areaTurna ||
    turno?.turna ||
    "-",
    "QUIÉN TURNA",
    turno?.quienTurna || turno?.turna,
    y
  );

  y += rowHeight;

  dibujarFilaSimple(
    "FECHA TÉRMINO",
    formatDateForInput(turno?.compromiso) ||
    formatDateForInput(turno?.fechaTurnado) ||
    "-",
    y
  );

    y += rowHeight + 8;

    // ===== ASUNTO =====

    doc.setFillColor(...COLORS.vino);
    doc.roundedRect(col1, y - 6, 32, 8, 2, 2, "F");

    doc.setTextColor(...COLORS.blanco);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("ASUNTO", col1 + 2, y);

    y += 10;

    const asuntoTexto =
      documentoCompleto?.asunto ||
      turno?.asunto ||
      turno?.descripcion ||
      turno?.comentario ||
      turno?.instruccion?.descripcion ||
      "Sin asunto especificado.";

    const asuntoLineas = doc.splitTextToSize(
      asuntoTexto,
      contentWidth - 10
    );

    const asuntoHeight = asuntoLineas.length * 5 + 10;

    doc.setFillColor(...COLORS.beige3);
    doc.rect(col1, y - 4, contentWidth, asuntoHeight, "F");

    doc.setDrawColor(...COLORS.beige1);
    doc.rect(col1, y - 4, contentWidth, asuntoHeight);

    doc.setTextColor(...COLORS.negro);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(asuntoLineas, col1 + 5, y + 4);

    y += asuntoHeight + 10;

    // ===== ACUERDO =====

    doc.setFillColor(...COLORS.grisPrincipal);
    doc.roundedRect(col1, y - 6, 35, 8, 2, 2, "F");
    doc.setTextColor(...COLORS.blanco);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("ACUERDO", col1 + 2, y);

    y += 10;

  const acuerdoTexto = `${turno.instruccion.descripcion}.\n${turno?.notas ? `Notas: ${turno.notas}` : ""}`;

    const acuerdoLineas = doc.splitTextToSize(
      acuerdoTexto,
      contentWidth - 10
    );

    const acuerdoHeight = acuerdoLineas.length * 5 + 20;

    doc.setFillColor(...COLORS.beige3);
    doc.rect(col1, y - 4, contentWidth, acuerdoHeight, "F");

    doc.setDrawColor(...COLORS.beige1);
    doc.rect(col1, y - 4, contentWidth, acuerdoHeight);

    doc.setTextColor(...COLORS.negro);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(acuerdoLineas, col1 + 5, y + 4);

    y += acuerdoHeight + 30;

    // ===== FIRMA =====

    doc.setTextColor(...COLORS.grisPrincipal);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);

  /*  doc.text(
      "GOBIERNO DEL ESTADO DE NAYARIT",
      margin + 40,
      y,
      { align: "center" }
    );
  */
    // Línea firma
    doc.setDrawColor(...COLORS.vino);
    doc.setLineWidth(1);
    doc.line(margin + 5, y + 15, margin + 75, y + 15);

    // Firmante
    const firmante =
    turno?.remitente?.name ||
    turno?.remitente?.nombre ||
    turno?.turna?.nombre ||
    "MTRA. NOMBRE DEL TITULAR";

    doc.setTextColor(...COLORS.vino);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);

    doc.text(
      firmante.toUpperCase(),
      margin + 40,
      y + 22,
      { align: "center" }
    );

    // Cargo
    doc.setTextColor(...COLORS.grisPrincipal);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    doc.text(
      "SECRETARÍA DE EDUCACIÓN",
      margin + 40,
      y + 28,
      { align: "center" }
    );

    // ===== SELLO =====

    doc.setTextColor(...COLORS.vino);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);


    doc.text(
      "RECIBE: ____________________________",
      pageWidth - 50,
      y + 25,
      { align: "center" }
    );

    // ===== PDF =====
    const formatearFechaNombre = (fecha) => {
      if (!fecha) return "SIN_FECHA";

      const d = new Date(fecha);

      return (
        String(d.getDate()).padStart(2, "0") +
        "-" +
        String(d.getMonth() + 1).padStart(2, "0") +
        "-" +
        d.getFullYear()
      );
    };

    const numeroTurno =
      turno?.numeroTurno || "SIN_NUMERO";

    const fechaTurno =
      formatearFechaNombre(
        turno?.fechaTurnado ||
        turno?.fechaAcuse ||
        turno?.fecha
      );

    const nombrePDF =
      `Turno_${numeroTurno}_${fechaTurno}.pdf`;

    doc.setProperties({
      title: nombrePDF,
    });

    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);

    // DESCARGA CON NOMBRE PERSONALIZADO
    doc.save(nombrePDF);

    return {
      url: pdfUrl,
      nombre: nombrePDF,
    };
      
  };

  
  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
  
    return new Date(fecha).toLocaleDateString("es-MX", {
      timeZone: "America/Mexico_City",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };
  
  const formatearHora = (fecha) => {
    if (!fecha) return "-";
  
    return new Date(fecha).toLocaleTimeString("es-MX", {
      timeZone: "America/Mexico_City",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };
  
    // const [docSeleccionado, setDocSeleccionado] = useState(null);
    const bitacora = documentoSeleccionado?.bitacora || [];
    
    const descargarBitacora = async () => {
        const pdf = await generarBitacoraPDF();
    
        const enlace = document.createElement("a");
        enlace.href = pdf.url;
        enlace.download = pdf.nombre;
        enlace.click();
    
        URL.revokeObjectURL(pdf.url);
    };
    
    const generarBitacoraPDF = async () => {
      const doc = new jsPDF("p", "mm", "letter");
  
    doc.addFont(GothamRoundedBook, "GothamRounded", "normal");
    doc.addFont(GothamRoundedBold, "GothamRounded", "bold");
  
    doc.addFont(MontserratRegular, "Montserrat", "normal");
    doc.addFont(MontserratBold, "Montserrat", "bold");
  
    const COLORS = {
      grisPrincipal: [96, 89, 93],
      grisSecundario: [155, 157, 154],
      blanco: [255, 255, 255],
      negro: [0, 0, 0],
    };
  
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
  
    const margin = 10;
    const contentWidth = pageWidth - margin * 2;
  
    const hoy = new Date();
  
    const fechaHoy = `${String(hoy.getDate()).padStart(2, "0")}/${String(
      hoy.getMonth() + 1
    ).padStart(2, "0")}/${hoy.getFullYear()}`;
  
    let y = 40;
  
    // HEADER
    const dibujarHeader = () => {
      doc.setFillColor(...COLORS.grisSecundario);
      doc.rect(margin, 12, contentWidth, 18, "F");
  
      doc.addImage(
        logoGobierno,
        "PNG",
        margin + 2,
        12,
        85,
        18
      );
  
      doc.setFillColor(...COLORS.grisPrincipal);
  
      doc.roundedRect(
        pageWidth - 60,
        17,
        25,
        8,
        2,
        2,
        "F"
      );
  
      doc.setFont("Montserrat", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.blanco);
  
      doc.text(
        "FECHA",
        pageWidth - 47,
        22,
        { align: "center" }
      );
  
      doc.setTextColor(...COLORS.grisPrincipal);
  
      doc.text(
        fechaHoy,
        pageWidth - 22,
        22,
        { align: "center" }
      );
    };
  
    dibujarHeader();
  
    // TITULO
    doc.setFont("GothamRounded", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...COLORS.grisPrincipal);
  
    doc.text(
      "REPORTE DE BITÁCORA",
      pageWidth / 2,
      y,
      { align: "center" }
    );
  
    // FOLIO DEL DOCUMENTO
    y += 7;
  
    doc.setFont("Montserrat", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.negro);
  
    doc.text(
      ` ${documentoSeleccionado?.folio || documentoSeleccionado?.folio || "-"}`,
      pageWidth / 2,
      y,
      { align: "center" }
    );
  
    y += 5;
  
    // TABLA
    const columnas = [
      "USUARIO",
      "DESCRIPCIÓN",
      "FECHA",
      "HORA",
    ];
  
    const anchos = [40, 90, 30, 25];
  
    let x = margin;
  
    columnas.forEach((titulo, i) => {
      doc.setFillColor(...COLORS.grisPrincipal);
  
      doc.rect(
        x,
        y,
        anchos[i],
        10,
        "F"
      );
  
      doc.setFont("Montserrat", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.blanco);
  
      doc.text(
        titulo,
        x + anchos[i] / 2,
        y + 6,
        {
          align: "center",
        }
      );
  
      x += anchos[i];
    });
  
    y += 10;
  
    // MOVIMIENTOS
    bitacora.forEach((mov, index) => {
      const valores = [
        mov.user?.nombre || "-",
        mov.descripcion || "-",
        formatearFecha(mov.fecha),
        formatearHora(mov.fecha),
      ];
  
      const lineas = valores.map((v, i) =>
        doc.splitTextToSize(
          String(v),
          anchos[i] - 4
        )
      );
  
      const maxLineas = Math.max(
        ...lineas.map((l) => l.length)
      );
  
      const altoFila = Math.max(
        10,
        maxLineas * 4 + 4
      );
  
      if (y + altoFila > pageHeight - 20) {
        doc.addPage();
  
        dibujarHeader();
  
        y = 40;
  
        let xx = margin;
  
        columnas.forEach((titulo, i) => {
          doc.setFillColor(
            ...COLORS.grisPrincipal
          );
  
          doc.rect(
            xx,
            y,
            anchos[i],
            10,
            "F"
          );
  
          doc.setTextColor(
            ...COLORS.blanco
          );
  
          doc.text(
            titulo,
            xx + anchos[i] / 2,
            y + 6,
            {
              align: "center",
            }
          );
  
          xx += anchos[i];
        });
  
        y += 10;
      }
  
      let xx = margin;
  
      lineas.forEach((texto, i) => {
        const fondo =
          index % 2 === 0
            ? [255, 255, 255]
            : [245, 245, 245];
  
        doc.setFillColor(...fondo);
  
        doc.rect(
          xx,
          y,
          anchos[i],
          altoFila,
          "F"
        );
  
        doc.setDrawColor(
          ...COLORS.grisSecundario
        );
  
        doc.rect(
          xx,
          y,
          anchos[i],
          altoFila
        );
  
        doc.setFont(
          "Montserrat",
          "normal"
        );
  
        doc.setFontSize(9);
  
        doc.setTextColor(
          ...COLORS.negro
        );
  
        doc.text(
          texto,
          xx + 2,
          y + 5
        );
  
        xx += anchos[i];
      });
  
      y += altoFila;
    });
  
    // FOOTER
    const footerY = pageHeight - 15;
  
    doc.setDrawColor(
      ...COLORS.grisPrincipal
    );
  
    doc.line(
      margin,
      footerY,
      pageWidth - margin,
      footerY
    );
  
    doc.setFont(
      "Montserrat",
      "normal"
    );
  
    doc.setFontSize(8);
  
    doc.setTextColor(
      ...COLORS.grisPrincipal
    );
  
    doc.text(
      "Sistema Automatizado de Gestión de Correspondencia",
      pageWidth / 2,
      footerY + 5,
      {
        align: "center",
      }
    );
  
    // doc.save(
    //   `Bitacora_${documentoSeleccionado?.folio || "SAGASE"}.pdf`
    // );
  
      const blob = doc.output("blob");
  
      return {
        blob,
        url: URL.createObjectURL(blob),
        nombre: `Bitacora_${documentoSeleccionado?.folio || "SAGASE"}.pdf`,
      };
    };
    
    const [pdfBitacora, setPdfBitacora] = useState(null);
    const [pdfGenerado, setPdfGenerado] = useState(false);
  
    useEffect(() => {
      if (tabActiva !== "bitacora") return;

      const cargar = async () => {
        const pdf = await generarBitacoraPDF();

        if (pdfBitacora) {
          URL.revokeObjectURL(pdfBitacora);
        }

        setPdfBitacora(pdf.url);
      };

      cargar();
    }, [
      tabActiva,
      documentoSeleccionado?._id,
      bitacora.length
    ]);


const [paginaAnexos, setPaginaAnexos] = useState(1);
const [paginaRelacionados, setPaginaRelacionados] = useState(1);

const registrosPorPagina = 3;

useEffect(() => {
  setPaginaAnexos(1);
}, [busquedaSubirAnexo]);

useEffect(() => {
  setPaginaRelacionados(1);
}, [busquedaVerTurnos]);

/* ===========================
   PAGINACIÓN ANEXOS
=========================== */

const totalPaginasAnexos = Math.ceil(
  documentoAnexosFiltrados.length / registrosPorPagina
);

const anexosPaginados = documentoAnexosFiltrados.slice(
  (paginaAnexos - 1) * registrosPorPagina,
  paginaAnexos * registrosPorPagina
);

/* ===========================
   PAGINACIÓN RELACIONADOS
=========================== */

const totalPaginasRelacionados = Math.ceil(
  relacionadosFiltrados.length / registrosPorPagina
);

const relacionadosPaginados = relacionadosFiltrados.slice(
  (paginaRelacionados - 1) * registrosPorPagina,
  paginaRelacionados * registrosPorPagina
);

const [paginaTurnos, setPaginaTurnos] = useState(1);
const registrosPorPaginaTurnos = 5;
useEffect(() => {
  setPaginaTurnos(1);
}, [busquedaVerTurnos]);
const totalPaginasTurnos = Math.ceil(
  turnosVerFiltrados.length / registrosPorPaginaTurnos
);

const turnosPaginados = turnosVerFiltrados.slice(
  (paginaTurnos - 1) * registrosPorPaginaTurnos,
  paginaTurnos * registrosPorPaginaTurnos
);

const [paginaCopias, setPaginaCopias] = useState(1);
const registrosPorPaginaCopias = 5;
const totalPaginasCopias = Math.ceil(
  copiasDocumento.length / registrosPorPaginaCopias
);

const copiasPaginadas = copiasDocumento.slice(
  (paginaCopias - 1) * registrosPorPaginaCopias,
  paginaCopias * registrosPorPaginaCopias
);
useEffect(() => {
  const total = Math.max(
    1,
    Math.ceil(copiasDocumento.length / registrosPorPaginaCopias)
  );

  if (paginaCopias > total) {
    setPaginaCopias(total);
  }
}, [copiasDocumento]);

const [paginaMateriales, setPaginaMateriales] = useState(1);
const registrosPorPaginaMateriales = 3;

const totalPaginasMateriales = Math.ceil(
  materialesAdicionales.length / registrosPorPaginaMateriales
);

const materialesPaginados = materialesAdicionales.slice(
  (paginaMateriales - 1) * registrosPorPaginaMateriales,
  paginaMateriales * registrosPorPaginaMateriales
);
useEffect(() => {
  const total = Math.max(
    1,
    Math.ceil(
      materialesAdicionales.length /
        registrosPorPaginaMateriales
    )
  );

  if (paginaMateriales > total) {
    setPaginaMateriales(total);
  }
}, [materialesAdicionales]);

  return (
    <main
      className="flex-1 p-4 bg-white overflow-y-auto overflow-x-hidden h-screen"
      onClick={() =>
        menuContextual.visible &&
        setMenuContextual((m) => ({ ...m, visible: false }))
      }
    >
      <h1 className="text-lg font-medium text-[#60595D] mb-0">Buscador de documentos</h1>
        <label className="mb-1 block text-sm font-medium text-gray-700">Busca registros por cualquiera de sus campos y modifica dando clic derecho.</label>

      <div className="relative flex-1">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          value={criterio}
          onChange={(e) => {
            setCriterio(e.target.value);
            setPaginaActual(1);
          }}
          placeholder="Buscar por folio, remitente, síntesis..."
          className="
            w-full
            pl-10
            pr-4
            py-2.5
            rounded-xl
            border
            border-gray-200
            bg-gray-50
            focus:bg-white
            focus:border-[#8B1538]
            focus:ring-4
            focus:ring-[#8B1538]/10
            transition
          "
        />
       
      </div>

      {/* CONTENEDOR TABLA + PAGINACIÓN RESPONSIVA */}
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden max-w-full mt-2">

      {/* SCROLL RESPONSIVO HORIZONTAL + VERTICAL */}
      <div className="overflow-x-auto overflow-y-auto max-h-[70vh]">
          <table className="min-w-[900px] w-full text-xs relative">
            <thead className="bg-[#79142A] text-white sticky top-0 z-10">
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
              ) : resultadosPaginados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-[#60595D]">
                    No se encontraron documentos.
                  </td>
                </tr>
              ) : (
                resultadosPaginados.map((doc) => (
                  <tr
                    key={doc.folio}
                    onContextMenu={(e) => handleRightClick(e, doc)}
                    className={`border-t cursor-context-menu transition hover:bg-[#79142A]/10`}
                  >
                    <td className="px-4 py-2 font-medium text-gray-700 whitespace-nowrap">
                      {doc.folio}
                    </td>

                    <td className="px-4 py-2 whitespace-nowrap">
                      {doc.docId}
                    </td>

                    <td className="px-4 py-2 whitespace-nowrap">
                      {formatDateValue(doc.fechaDoc)}
                    </td>

                    <td className="px-4 py-2 min-w-[300px]">
                      {doc.sintesis?.slice(0, 100) || "Sin asunto"}
                      {doc.sintesis?.length > 100 && "..."}
                    </td>

                    <td className="px-4 py-2 whitespace-nowrap">
                      {doc.remitente?.name || doc.remitente?.nombre || "N/A"}
                    </td>

                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className="px-2 py-1 rounded bg-gray-200 text-gray-700">
                        {doc.status || "Recibido"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN ABAJO */}
        <div className="border-t bg-white px-4 py-3 flex flex-wrap justify-center items-center gap-2">

          {/* ANTERIOR */}
          <button
            onClick={() =>
              setPaginaActual((prev) => Math.max(prev - 1, 1))
            }
            disabled={paginaActual === 1}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-[#79142A] hover:text-white hover:border-[#79142A] transition-all duration-200 disabled:opacity-30"
          >
            <ChevronLeft size={18} />
          </button>

          {/* NÚMEROS */}
          <div className="flex items-center gap-2 max-w-full">
            {Array.from(
              { length: Math.min(3, totalPaginas) },
              (_, i) => {
                let inicio = Math.max(1, paginaActual - 1);

                if (inicio + 2 > totalPaginas) {
                  inicio = Math.max(1, totalPaginas - 2);
                }

                const numeroPagina = inicio + i;

                return (
                  <button
                    key={numeroPagina}
                    onClick={() => setPaginaActual(numeroPagina)}
                    className={`w-10 h-10 rounded-xl font-medium shrink-0 transition-all duration-200 ${
                      paginaActual === numeroPagina
                        ? "bg-[#79142A] text-white shadow-md scale-105"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {numeroPagina}
                  </button>
                );
              }
            )}
          </div>

          {/* SIGUIENTE */}
          <button
            onClick={() =>
              setPaginaActual((prev) =>
                Math.min(prev + 1, totalPaginas)
              )
            }
            disabled={paginaActual === totalPaginas}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-[#79142A] hover:text-white hover:border-[#79142A] transition-all duration-200 disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>

        </div>
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
              {menuContextual.documento?.status !== "Validado" && (
                <button
                  className="block px-4 py-2 hover:bg-gray-100 w-full text-left text-red-600"
                  onClick={handleEliminar}
                >
                  Eliminar documento
                </button>
              )}
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
                {/* HEADER */}
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
                      // verificar si el documento tiene material adicional para mostrar la pestaña
                      ...documentoEditar?.adicional?.tiene ? ([
                        {
                          id: "materialAdicional",
                          label: "Material adicional",
                        }]
                      ) : [],
                      {
                        id: "verTurnos",
                        label: "Ver todos los turnos",
                      },
                      // Mostrar pestaña de respuestas solo si hay respuestas en el documento
                      ...(respuestasDocumento.length > 0 ? [{
                        id: "respuestas",
                        label: "Respuestas al documento",
                      }] : []),
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
                          : "text-gray-600  hover:text-[#8B1538]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}

                </div>

                <div className="flex-1 overflow-y-auto p-4">
                 <AnimatePresence mode="wait">  

                  {tabActiva === "datosAsunto" && (
                    <motion.div
                      key="datosAsunto"
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      transition={{ duration: 0.2 }}
                    >

                    <div className="space-y-6">

                      <div>
                        {/* EJERCICIO */}
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-80">
                            <h2 className="text-sm font-semibold text-gray-600 mb-2">Ejercicio</h2>
                            
                            <select 
                              name="ejercicio" 
                              value={formEditar.ejercicio} 
                              disabled 
                              onChange={handleChange} 
                              className="w-full rounded-lg border bg-gray-100 px-3 py-2 outline-none cursor-not-allowed">
                              <option value="">Seleccionar</option>
                              <option value="2024">2024</option>
                              <option value="2025">2025</option>
                              <option value="2026">2026</option>
                            </select>
                          </div>
                        </div>

                       {/* DATOS GENERALES */}
                        <div>
                          
                          <div className="flex items-center gap-3 mb-3">
                            <div className="h-px flex-1 bg-gray-300" />

                            <h2 className="text-sm font-semibold text-[#8B1538] uppercase tracking-wide">
                              Datos generales
                            </h2>

                            <div className="h-px flex-1 bg-gray-300" />
                          </div>

                          <div className="grid grid-cols-4 gap-4 items-end mb-5">
                            <div>
                              <label className="mb-1 block text-sm font-medium text-gray-700">No. de documento *</label>
                              <input name="noDocumento" value={formEditar.noDocumento} disabled className="w-full rounded-lg border bg-gray-100 px-3 py-2" />
                            </div>

                            <div>
                              <label className="mb-1 block text-sm font-medium text-gray-700">Fecha de documento *</label>
                              <input type="date" name="fechaDocumento" value={formEditar.fechaDocumento} disabled className="w-full rounded-lg border bg-gray-100 px-3 py-2" />
                            </div>

                            <div>
                              <label className="mb-1 block text-sm font-medium text-gray-700">Fecha de acuse *</label>
                              <input type="date" name="fechaAcuse" value={formEditar.fechaAcuse} disabled className="w-full rounded-lg border bg-gray-100 px-3 py-2" />
                            </div>

                            <div>
                              <label className="mb-1 block text-sm font-medium text-gray-700">Fecha de registro *</label>
                              <input type="datetime-local" name="fechaRegistro" value={formEditar.fechaRegistro} disabled className="w-full rounded-lg border bg-gray-100 px-3 py-2" />
                            </div>

                          </div>
                        </div>

                        {/* REMITENTE */}
                        <div>

                          <div className="flex items-center gap-3 mb-1">
                            <div className="h-px flex-1 bg-gray-300" />

                            <h2 className="text-sm font-semibold text-[#8B1538] uppercase tracking-wide">
                              Remitente
                            </h2>

                            <div className="h-px flex-1 bg-gray-300" />
                          </div>
                          
                          <div className="grid grid-cols-6 gap-4 items-end">
                            <div className="col-span-2">
                              <label className="mb-1 block text-sm font-medium text-gray-700">Tipo de remitente *</label>
                              <input
                                value={
                                  formEditar?.tipoRemitente === "interno"
                                    ? "Interno"
                                    : formEditar?.tipoRemitente === "externo"
                                    ? "Externo"
                                    : safeText(formEditar?.tipoRemitente, "Interno")
                                }
                                disabled
                                className="w-full rounded-lg border bg-gray-100 px-3 py-2 bg-gray-50 text-gray-700"
                              />
                            </div>

                            <div className="col-span-4">
                              <label className="mb-1 block text-sm font-medium text-gray-700">Remitente</label>
                              <input
                                value={
                                  formEditar.tipoRemitente === "interno"
                                    ? (remitentesInternos.find(r => r.value === formEditar.remitenteInterno)?.label ||
                                       documentoEditar?.remitente?.name ||
                                       documentoEditar?.remitente?.nombre ||
                                       getReferenceLabel(documentoEditar?.remitente) ||
                                       busquedaRemitenteInt ||
                                       "")
                                    : formEditar.tipoRemitente === "externo"
                                    ? (remitentesExternos.find(r => r.value === formEditar.remitenteExterno)?.label ||
                                       documentoEditar?.remitente?.name ||
                                       documentoEditar?.remitente?.nombre ||
                                       getReferenceLabel(documentoEditar?.remitente) ||
                                       busquedaRemitenteExt ||
                                       "")
                                    : documentoEditar?.remitente?.name ||
                                      documentoEditar?.remitente?.nombre ||
                                      getReferenceLabel(documentoEditar?.remitente) ||
                                      safeText(documentoEditar?.remitente, "")
                                }
                                disabled
                                className="w-full rounded-lg border bg-gray-100 px-3 py-2 bg-gray-50 text-gray-700"
                              />
                            </div>
                          </div>
                        </div>

                        {/* DATOS ESPECÍFICOS */}
                        <div>
                          <div className="flex items-center gap-3 mb-1 mt-3">
                            <div className="h-px flex-1 bg-gray-300" />

                            <h2 className="text-sm font-semibold text-[#8B1538] uppercase tracking-wide">
                              Datos específicos
                            </h2>

                            <div className="h-px flex-1 bg-gray-300" />
                          </div>

                          <div className="grid grid-cols-4 gap-4 items-end">

                            {/* Tipo documento con buscador */}
                            <div ref={refTipoDoc} className="col-span-2 relative">
                              <label className="mb-1 block text-sm font-medium text-gray-700">
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

                                    // IMPORTANTE: limpiar selección real
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

                            {/* Campo "Otro" tipo de documento - solo visible cuando se selecciona "otro" */}
                            {formEditar.tipoDocumento === "otro" && (
                              <div className="col-span-2">
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                  Especificar tipo de documento *
                                </label>
                                <input
                                  type="text"
                                  name="tipoOtro"
                                  value={formEditar.tipoOtro}
                                  onChange={handleChange}
                                  className="w-full border rounded px-2 py-1"
                                  placeholder="Ingrese el tipo de documento"
                                />
                              </div>
                            )}

                            <div className="col-span-2">

                              <div ref={refTemaPrincipal} className="col-span-2 relative">
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                  Selecciona Asunto
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
                          </div>

                          <div className="grid grid-cols-2 gap-4 mt-4">

                            <div className="col-span-4">
                              <label className="mb-1 block text-sm font-medium text-gray-700">
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
                              <label className="mb-0 block text-sm font-medium text-gray-700">Observaciones</label>
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

                    </motion.div>
                  )}

                  {tabActiva === "anexo" && (

                    <motion.div
                      key="anexo"
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="space-y-4">
                      
                      <div className="flex items-center gap-3 mb-3">
                          <div className="h-px flex-1 bg-gray-300" />

                          <h2 className="text-sm font-semibold text-[#8B1538] uppercase tracking-wide">
                              Anexos
                          </h2>

                          <div className="h-px flex-1 bg-gray-300" />
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <div className="relative group inline-flex">
                          {/* Botón */}
                          <button
                            onClick={() => setMostrarModalSubirAnexo(true)}
                            title="Agregar anexo"
                            className="w-11 h-11 rounded-xl bg-[#8B1538] text-white flex items-center justify-center shadow-lg hover:scale-110 transition"
                          >
                            <Plus
                              size={22}
                              className="group-hover:rotate-90 transition-transform duration-300"
                            />
                          </button>
                         </div>

                          {/* Buscador */}
                          <div className="relative flex-1">
                            <Search
                              size={18}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                           <input
                              value={busquedaSubirAnexo}
                              onChange={(e) => setBusquedaSubirAnexo(e.target.value)}
                              className="
                                w-full
                                pl-10
                                pr-4
                                py-2.5
                                rounded-xl
                                border
                                border-gray-200
                                bg-gray-50
                                focus:bg-white
                                focus:border-[#8B1538]
                                focus:ring-4
                                focus:ring-[#8B1538]/10
                                transition
                              "
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

                            {/* HEADER */}
                            <thead className="bg-[#8B1538] text-white">
                              <tr>
                                <th className="px-3 py-2 text-left">Eliminar</th>
                                <th className="px-3 py-2 text-left">Registrador</th>
                                <th className="px-3 py-2 text-left">Mensaje</th>
                                <th className="px-3 py-2 text-left">Archivo</th>
                                <th className="px-3 py-2 text-left">Número de documento</th>
                              </tr>
                            </thead>

                            {/* BODY */}
                            <tbody>
                              {anexosPaginados.length > 0 ? (
                                anexosPaginados.map((anexo) => (
                                  <tr
                                    key={anexo._id || anexo.nombre}
                                    className="border-t hover:bg-gray-50"
                                  >
                                    {/* ELIMINAR */}
                                    <td className="px-3 py-2">
                                      <button
                                        onClick={() => handleRemoveAnexo(anexo._id)}
                                        className="p-2 rounded hover:bg-red-100 text-gray-500 hover:text-red-600 transition"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </td>

                                    {/* REGISTRADOR */}
                                    <td className="px-3 py-2 text-gray-700">
                                      {anexo.registrador?.nombre ? anexo.registrador.nombre : "N/A"}
                                    </td>

                                    {/* MENSAJE */}
                                    <td className="px-3 py-2 text-gray-700">
                                      {anexo.mensaje || "Sin mensaje"}
                                    </td>

                                    {/* BOTÓN ARCHIVO */}
                                    <td className="px-3 py-2">
                                      <button
                                        onClick={() => {
                                          setArchivoVista(`${import.meta.env.VITE_ARCHIVOS_PATH}${anexo.ruta}`);
                                          setMostrarVisor(true);
                                        }}
                                        className="bg-[#8B1538] text-white px-3 py-1 rounded text-xs hover:opacity-90"
                                      >
                                        Ver Archivo
                                      </button>
                                    </td>


                                    {/* NOMBRE */}
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

                          {documentoAnexosFiltrados.length > 3 && totalPaginasAnexos > 1 && (
                            <div className="border-t border-gray-100 px-3 py-3 bg-white">
                              <div className="flex items-center justify-center gap-2">

                                <button
                                  onClick={() =>
                                    setPaginaAnexos((prev) => Math.max(prev - 1, 1))
                                  }
                                  disabled={paginaAnexos === 1}
                                  className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm hover:bg-[#79142A] hover:text-white transition disabled:opacity-30"
                                >
                                  <ChevronLeft size={16}/>
                                </button>

                                <div className="flex items-center gap-2">
                                  {(() => {

                                    const maxVisible = 3;

                                    let inicio = Math.max(1, paginaAnexos - 1);
                                    let fin = inicio + maxVisible - 1;

                                    if (fin > totalPaginasAnexos) {
                                      fin = totalPaginasAnexos;
                                      inicio = Math.max(1, fin - maxVisible + 1);
                                    }

                                    return Array.from(
                                      { length: fin - inicio + 1 },
                                      (_, i) => {

                                        const numeroPagina = inicio + i;

                                        return (
                                          <button
                                            key={numeroPagina}
                                            onClick={() => setPaginaAnexos(numeroPagina)}
                                            className={`w-8 h-8 rounded-xl text-xs transition ${
                                              paginaAnexos === numeroPagina
                                                ? "bg-[#79142A] text-white"
                                                : "bg-gray-50 hover:bg-gray-100"
                                            }`}
                                          >
                                            {numeroPagina}
                                          </button>
                                        );
                                      }
                                    );

                                  })()}
                                </div>

                                <button
                                  onClick={() =>
                                    setPaginaAnexos((prev) =>
                                      Math.min(prev + 1, totalPaginasAnexos)
                                    )
                                  }
                                  disabled={paginaAnexos === totalPaginasAnexos}
                                  className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm hover:bg-[#79142A] hover:text-white transition disabled:opacity-30"
                                >
                                  <ChevronRight size={16}/>
                                </button>

                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-px flex-1 bg-gray-300" />

                            <h2 className="text-sm font-semibold text-[#8B1538] uppercase tracking-wide">
                                Documentos relacionados
                            </h2>

                            <div className="h-px flex-1 bg-gray-300" />
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <div className="relative group inline-flex">
                            {/* Botón */}
                            <button
                              onClick={() => {
                                setDocumentosSeleccionados([]);
                                setMostrarModalRelacionado(true);
                              }}
                              title="Agregar documento relacionado"
                              className="w-11 h-11 rounded-xl bg-[#8B1538] text-white flex items-center justify-center shadow-lg hover:scale-110 transition"
                            >
                              <Plus
                                size={22}
                                className="group-hover:rotate-90 transition-transform duration-300"
                              />
                            </button>
                          </div>

                          {/* Buscador */}
                          <div className="relative flex-1">
                            <Search
                              size={18}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                              value={busquedaVerTurnos}
                              onChange={(e) => setBusquedaVerTurnos(e.target.value)}
                              className="
                                w-full
                                pl-10
                                pr-4
                                py-2.5
                                rounded-xl
                                border
                                border-gray-200
                                bg-gray-50
                                focus:bg-white
                                focus:border-[#8B1538]
                                focus:ring-4
                                focus:ring-[#8B1538]/10
                                transition
                              "
                              placeholder="Buscar documento relacionado..."
                            />
                          </div>

                        </div>

                        <h3 className="text-sm font-semibold text-gray-600 mb-2">
                          Documentos relacionados al registro.
                        </h3>

                        {/* Tabla de anexos */}
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
                              {relacionadosPaginados.length > 0 ? (
                                relacionadosPaginados.map((relacionado) => (
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
                          {relacionadosFiltrados.length > 3 &&
                            totalPaginasRelacionados > 1 && (
                              <div className="border-t border-gray-100 px-3 py-3 bg-white">
                                <div className="flex items-center justify-center gap-2">

                                  <button
                                    onClick={() =>
                                      setPaginaRelacionados((prev) =>
                                        Math.max(prev - 1, 1)
                                      )
                                    }
                                    disabled={paginaRelacionados === 1}
                                    className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm hover:bg-[#79142A] hover:text-white transition disabled:opacity-30"
                                  >
                                    <ChevronLeft size={16}/>
                                  </button>

                                  <div className="flex items-center gap-2">

                                    {(() => {

                                      const maxVisible = 3;

                                      let inicio = Math.max(
                                        1,
                                        paginaRelacionados - 1
                                      );

                                      let fin = inicio + maxVisible - 1;

                                      if (fin > totalPaginasRelacionados) {

                                        fin = totalPaginasRelacionados;

                                        inicio = Math.max(
                                          1,
                                          fin - maxVisible + 1
                                        );

                                      }

                                      return Array.from(
                                        { length: fin - inicio + 1 },
                                        (_, i) => {

                                          const numeroPagina = inicio + i;

                                          return (
                                            <button
                                              key={numeroPagina}
                                              onClick={() =>
                                                setPaginaRelacionados(numeroPagina)
                                              }
                                              className={`w-8 h-8 rounded-xl text-xs transition ${
                                                paginaRelacionados === numeroPagina
                                                  ? "bg-[#79142A] text-white"
                                                  : "bg-gray-50 hover:bg-gray-100"
                                              }`}
                                            >
                                              {numeroPagina}
                                            </button>
                                          );

                                        }
                                      );

                                    })()}

                                  </div>

                                  <button
                                    onClick={() =>
                                      setPaginaRelacionados((prev) =>
                                        Math.min(
                                          prev + 1,
                                          totalPaginasRelacionados
                                        )
                                      )
                                    }
                                    disabled={
                                      paginaRelacionados === totalPaginasRelacionados
                                    }
                                    className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm hover:bg-[#79142A] hover:text-white transition disabled:opacity-30"
                                  >
                                    <ChevronRight size={16}/>
                                  </button>

                                </div>
                              </div>
                            )}
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
                                    PDF, DOC, JPG
                                  </span>
                                </label>
                              </div>

                              {/* Nombre */}
                              <div className="mb-4">
                                <label className="block text-sm mb-1">Número de documento:</label>
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
                                      <p className="mb-1 block text-sm font-medium text-gray-700">{anexo.folio}</p>
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
                                className="bg-[#79142A]  text-white hover:bg-[#79142A]/80 rounded-full p-1 transition"
                              >
                                
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
                      
                     </motion.div>   
                  )}

                  {tabActiva === "materialAdicional" && (
                    <motion.div
                      key="materialAdicional"
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      transition={{ duration: 0.2 }}
                    >

                    <div className="space-y-4">

                      {/* HEADER */}
                      <div className="flex justify-start">

                        {/* Botón añadir */}
                        <button
                          onClick={() => setMostrarModalMaterial(true)}
                          title="Agregar material adicional"
                          className="w-11 h-11 rounded-xl bg-[#8B1538] text-white flex items-center justify-center shadow-lg hover:scale-110 transition"
                        >
                          <Plus
                            size={22}
                            className="group-hover:rotate-90 transition-transform duration-300"
                          />
                        </button>
                      </div>

                      {/* TABLA */}
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
                            {materialesAdicionales.length > 0 ? (
                              materialesPaginados.map((material) => (
                                <tr key={material._id} className="border-t hover:bg-gray-50">

                                  {/* ELIMINAR */}
                                  <td className="px-4 py-2">
                                    <button
                                      onClick={async () => {
                                        const result = await Swal.fire({
                                          title: "¿Eliminar material?",
                                          text: `Se eliminará "${material.tipo}" del registro.`,
                                          icon: "question",
                                          showCancelButton: true,
                                          confirmButtonText: "Sí, eliminar",
                                          cancelButtonText: "Cancelar",
                                          confirmButtonColor: "#8B1538",
                                          cancelButtonColor: "#6B7280",
                                        });

                                        if (result.isConfirmed) {
                                          try {
                                            const response = await removeAdicional(
                                              documentoEditar.docId,
                                              material._id,
                                              token
                                            );

                                            if (response.ok) {
                                              const docActualizado = await response.json();
                                              setMaterialesAdicionales(docActualizado.adicional?.adicionales || []);
                                              setDocumentoEditar(docActualizado);

                                              Swal.fire({
                                                icon: "success",
                                                title: "Material eliminado",
                                                text: "Se eliminó correctamente.",
                                                confirmButtonColor: "#8B1538",
                                              });
                                            } else {
                                              throw new Error("Error al eliminar material");
                                            }
                                          } catch (error) {
                                            console.error("Error:", error);
                                            Swal.fire({
                                              icon: "error",
                                              title: "Error",
                                              text: "No se pudo eliminar el material. Intenta de nuevo.",
                                              confirmButtonColor: "#8B1538",
                                            });
                                          }
                                        }
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
                                    {material.registrador?.nombre || material.registrador || "-"}
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

                        {materialesAdicionales.length > registrosPorPaginaMateriales &&
                          totalPaginasMateriales > 1 && (
                            <div className="border-t border-gray-100 px-3 py-3 bg-white">
                              <div className="flex items-center justify-center gap-2">

                                {/* ANTERIOR */}
                                <button
                                  onClick={() =>
                                    setPaginaMateriales((prev) =>
                                      Math.max(prev - 1, 1)
                                    )
                                  }
                                  disabled={paginaMateriales === 1}
                                  className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm hover:bg-[#79142A] hover:text-white hover:border-[#79142A] transition-all duration-200 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-400"
                                >
                                  <ChevronLeft size={16} />
                                </button>

                                {/* NÚMEROS */}
                                <div className="flex items-center gap-2">
                                  {(() => {

                                    const maxVisible = 3;

                                    let inicio = Math.max(
                                      1,
                                      paginaMateriales - 1
                                    );

                                    let fin = inicio + maxVisible - 1;

                                    if (fin > totalPaginasMateriales) {
                                      fin = totalPaginasMateriales;
                                      inicio = Math.max(
                                        1,
                                        fin - maxVisible + 1
                                      );
                                    }

                                    return Array.from(
                                      { length: fin - inicio + 1 },
                                      (_, i) => {

                                        const numeroPagina = inicio + i;

                                        return (
                                          <button
                                            key={numeroPagina}
                                            onClick={() =>
                                              setPaginaMateriales(numeroPagina)
                                            }
                                            className={`w-8 h-8 rounded-xl text-xs font-medium transition-all duration-200 ${
                                              paginaMateriales === numeroPagina
                                                ? "bg-[#79142A] text-white shadow-md scale-105"
                                                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                                            }`}
                                          >
                                            {numeroPagina}
                                          </button>
                                        );

                                      }
                                    );

                                  })()}
                                </div>

                                {/* SIGUIENTE */}
                                <button
                                  onClick={() =>
                                    setPaginaMateriales((prev) =>
                                      Math.min(
                                        prev + 1,
                                        totalPaginasMateriales
                                      )
                                    )
                                  }
                                  disabled={
                                    paginaMateriales === totalPaginasMateriales
                                  }
                                  className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm hover:bg-[#79142A] hover:text-white hover:border-[#79142A] transition-all duration-200 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-400"
                                >
                                  <ChevronRight size={16} />
                                </button>

                              </div>
                            </div>
                        )}
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
                                      try {
                                        // Llamar al API para agregar el material
                                        const response = await addAdicional(
                                          documentoEditar.docId,
                                          nuevoMaterial,
                                          token
                                        );

                                        if (response.ok) {
                                          const docActualizado = await response.json();
                                          // Actualizar el estado con los materiales del backend
                                          setMaterialesAdicionales(docActualizado.adicional?.adicionales || []);
                                          setDocumentoEditar(docActualizado);

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
                                        } else {
                                          throw new Error("Error al agregar material");
                                        }
                                      } catch (error) {
                                        console.error("Error:", error);
                                        Swal.fire({
                                          icon: "error",
                                          title: "Error",
                                          text: "No se pudo agregar el material. Intenta de nuevo.",
                                          confirmButtonColor: "#8B1538",
                                        });
                                      }
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
                  
                    </motion.div>
                  )}
                    
                  {tabActiva === "turnar" && (
                    <motion.div
                      key="turnar"
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      transition={{ duration: 0.2 }}
                    >
                    <div className="space-y-4">
                      
                      {/* Botón agregar */}
                      <div className="flex justify-start">
                        <button
                          onClick={() => setMostrarModalCopias(true)}
                          title="Agregar turno"
                          className="w-11 h-11 rounded-xl bg-[#8B1538] text-white flex items-center justify-center shadow-lg hover:scale-110 transition"
                        >
                          <Plus
                            size={22}
                            className="group-hover:rotate-90 transition-transform duration-300"
                          />
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
                  
                    </motion.div>
                  )}
                  
                  {tabActiva === "verTurnos" && (
                    <motion.div
                      key="verTurnos"
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="space-y-4">
                        <div className="overflow-x-auto">
                          <div className="flex items-center gap-2 mb-4">

                          <div className="relative group inline-flex">
                            {/* BOTÓN AÑADIR TURNO */}
                            <button
                              onClick={() => setMostrarModalTurno(true)}
                              title="Agregar turno"
                              className="w-11 h-11 rounded-xl bg-[#8B1538] text-white flex items-center justify-center shadow-lg hover:scale-110 transition"
                            >
                              <Plus
                                size={22}
                                className="group-hover:rotate-90 transition-transform duration-300"
                              />
                            </button>
                          </div>

                          {/* BUSCADOR */}
                          <div className="relative flex-1">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                            <input
                              value={busquedaVerTurnos}
                              onChange={(e) => setBusquedaVerTurnos(e.target.value)}
                              className="
                                w-full
                                pl-10
                                pr-4
                                py-2.5
                                rounded-xl
                                border
                                border-gray-200
                                bg-gray-50
                                focus:bg-white
                                focus:border-[#8B1538]
                                focus:ring-4
                                focus:ring-[#8B1538]/10
                                transition
                              "
                              placeholder="Buscar turno..."
                            />
                          </div>

                        </div>
                          <table className="min-w-[1200px] w-full text-xs border border-gray-200">
                            <thead className="bg-[#8B1538] text-white">
                              <tr>
                                <th className="px-3 py-2 text-left">Turno</th>
                                <th className="px-3 py-2 text-left">
                                  Instrucción
                                </th>
                                <th className="px-3 py-2 text-left">
                                  Dirigido a
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
                              {turnosPaginados.length > 0 ? (
                                turnosPaginados.map((turno, index) => (
                                  <tr
                                    key={index}
                                    className="border-t hover:bg-gray-50"
                                  >
                                    <td className="px-3 py-2">
                                      <div className="flex items-center justify-center">

                                        {/* VER TURNO */}
                                        <button
                                          title="Descargar turno"
                                          onClick={async () => {
                                            const pdfData = await generarDocumentoTurno(turno);

                                            setArchivoVista(pdfData);
                                            setMostrarVisorTurno(true);
                                          }}
                                          className="bg-[#8B1538] hover:bg-[#74112F] text-white p-2 rounded transition"
                                        >
                                          <Download size={14} />
                                        </button>

                                      </div>
                                    </td>
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

                        {/* PAGINACIÓN */}
                        {turnosVerFiltrados.length > registrosPorPaginaTurnos &&
                          totalPaginasTurnos > 1 && (
                            <div className="border-t border-gray-100 px-3 py-3 bg-white">
                              <div className="flex items-center justify-center gap-2">

                                {/* ANTERIOR */}
                                <button
                                  onClick={() =>
                                    setPaginaTurnos((prev) => Math.max(prev - 1, 1))
                                  }
                                  disabled={paginaTurnos === 1}
                                  className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm hover:bg-[#79142A] hover:text-white hover:border-[#79142A] transition-all duration-200 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-400"
                                >
                                  <ChevronLeft size={16} />
                                </button>

                                {/* NÚMEROS */}
                                <div className="flex items-center gap-2">
                                  {(() => {

                                    const maxVisible = 3;

                                    let inicio = Math.max(1, paginaTurnos - 1);
                                    let fin = inicio + maxVisible - 1;

                                    if (fin > totalPaginasTurnos) {
                                      fin = totalPaginasTurnos;
                                      inicio = Math.max(1, fin - maxVisible + 1);
                                    }

                                    return Array.from(
                                      { length: fin - inicio + 1 },
                                      (_, i) => {

                                        const numeroPagina = inicio + i;

                                        return (
                                          <button
                                            key={numeroPagina}
                                            onClick={() => setPaginaTurnos(numeroPagina)}
                                            className={`w-8 h-8 rounded-xl text-xs font-medium transition-all duration-200 ${
                                              paginaTurnos === numeroPagina
                                                ? "bg-[#79142A] text-white shadow-md scale-105"
                                                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                                            }`}
                                          >
                                            {numeroPagina}
                                          </button>
                                        );

                                      }
                                    );

                                  })()}
                                </div>

                                {/* SIGUIENTE */}
                                <button
                                  onClick={() =>
                                    setPaginaTurnos((prev) =>
                                      Math.min(prev + 1, totalPaginasTurnos)
                                    )
                                  }
                                  disabled={paginaTurnos === totalPaginasTurnos}
                                  className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm hover:bg-[#79142A] hover:text-white hover:border-[#79142A] transition-all duration-200 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-400"
                                >
                                  <ChevronRight size={16} />
                                </button>

                              </div>
                            </div>
                        )}
                      <AnimatePresence>
                        {mostrarModalTurno && (
                          <motion.div
                            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <motion.div
                              className="bg-white w-[900px] max-h-[90vh] overflow-y-auto rounded-lg shadow-lg p-6 relative"
                              initial={{ opacity: 0, scale: 0.9, y: 20 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, y: 20 }}
                              transition={{
                                duration: 0.25,
                                ease: "easeOut",
                              }}
                            >

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
                                    {usuarios.map((user) => ( form.areaDestino === user.areaId && (
                                      <option key={user.value} value={user.value}>
                                        {user.label}
                                      </option>
                                    )))}
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
                                    <option value="Urgente">Con fecha de termino</option>
                                    <option value="Normal">Normal</option>
                                  </select>
                                </div>

                                {/* Fecha */}
                                {form.prioridad === "Urgente" && (
                                <div>
                                  <label>Fecha de termino*</label>
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

                                </div>) || null}

                                {/* Notas */}
                                <div className="col-span-2">
                                  <label>Notas</label>
                                  <textarea
                                    value={form.notas}
                                    onChange={(e) => setForm({ ...form, notas: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                  />
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

                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      </div>
              
                        <AnimatePresence>
                          {mostrarVisorTurno && archivoVista && (
                            <motion.div
                              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              <motion.div
                                className="bg-white w-[80%] h-[80%] rounded-lg shadow-lg p-4 relative overflow-hidden"
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.8 }}
                              >

                                <div className="bg-[#8B1538] text-white flex justify-between items-center p-3">
                                  <span>Documento de turno</span>

                                  {/* CERRAR */}
                                  <button
                                    onClick={() => setMostrarVisorTurno(false)}
                                    className="absolute top-2 right-2 z-50 bg-[#8B1538] hover:bg-[#74112F] text-white rounded-full p-1 transition"
                                  >
                                    <Minus size={18} />
                                  </button>
                                </div>

                                {/* VISTA */}
                                <iframe
                                  title="Vista previa turno"
                                  src={archivoVista.url}
                                  className="w-full h-[calc(100%-56px)]"
                                />

                              </motion.div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                    </motion.div>
                  
                  )}

                  {tabActiva === "copias" && (
                    <motion.div
                      key="copias"
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="space-y-4">
                        {/* Botón agregar */}
                         <div className="relative group inline-flex">
                          <button
                            onClick={() => {
                              setMostrarModalCopias(true);
                              setBusquedaFuncionario("");
                              setSelectedCopiaUsuario(null);
                            }}
                            title="Agregar funcionario"
                            className="w-11 h-11 rounded-xl bg-[#8B1538] text-white flex items-center justify-center shadow-lg hover:scale-110 transition"
                          >
                            <Plus
                              size={22}
                              className="group-hover:rotate-90 transition-transform duration-300"
                            />
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
                              {copiasPaginadas.length > 0 ? (
                                copiasPaginadas.map((copia, index) => (
                                  <tr
                                    key={copia._id || index}
                                    className="border-t hover:bg-gray-50"
                                  >
                                    <td className="px-4 py-2">
                                      <button
                                        onClick={() => {
                                          const indiceReal =
                                            (paginaCopias - 1) * registrosPorPaginaCopias + index;

                                          setCopiasDocumento((prev) =>
                                            prev.filter((_, i) => i !== indiceReal)
                                          );
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
                        {copiasDocumento.length > registrosPorPaginaCopias &&
                          totalPaginasCopias > 1 && (
                            <div className="border-t border-gray-100 px-3 py-3 bg-white">
                              <div className="flex items-center justify-center gap-2">

                                {/* ANTERIOR */}
                                <button
                                  onClick={() =>
                                    setPaginaCopias((prev) => Math.max(prev - 1, 1))
                                  }
                                  disabled={paginaCopias === 1}
                                  className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm hover:bg-[#79142A] hover:text-white hover:border-[#79142A] transition-all duration-200 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-400"
                                >
                                  <ChevronLeft size={16} />
                                </button>

                                {/* NÚMEROS */}
                                <div className="flex items-center gap-2">
                                  {(() => {

                                    const maxVisible = 3;

                                    let inicio = Math.max(1, paginaCopias - 1);
                                    let fin = inicio + maxVisible - 1;

                                    if (fin > totalPaginasCopias) {
                                      fin = totalPaginasCopias;
                                      inicio = Math.max(1, fin - maxVisible + 1);
                                    }

                                    return Array.from(
                                      { length: fin - inicio + 1 },
                                      (_, i) => {

                                        const numeroPagina = inicio + i;

                                        return (
                                          <button
                                            key={numeroPagina}
                                            onClick={() => setPaginaCopias(numeroPagina)}
                                            className={`w-8 h-8 rounded-xl text-xs font-medium transition-all duration-200 ${
                                              paginaCopias === numeroPagina
                                                ? "bg-[#79142A] text-white shadow-md scale-105"
                                                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                                            }`}
                                          >
                                            {numeroPagina}
                                          </button>
                                        );

                                      }
                                    );

                                  })()}
                                </div>

                                {/* SIGUIENTE */}
                                <button
                                  onClick={() =>
                                    setPaginaCopias((prev) =>
                                      Math.min(prev + 1, totalPaginasCopias)
                                    )
                                  }
                                  disabled={paginaCopias === totalPaginasCopias}
                                  className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm hover:bg-[#79142A] hover:text-white hover:border-[#79142A] transition-all duration-200 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-400"
                                >
                                  <ChevronRight size={16} />
                                </button>

                              </div>
                            </div>
                        )}
                      </div>

                    </motion.div>
                  )}

                  {tabActiva === "bitacora" && (
                      <motion.div className="w-full flex justify-center bg-[#2f2f2f] py-6">
                        <div className="w-full max-w-4xl">
                    
                          {/* Barra visor */}
                          <div className="flex justify-between items-center bg-white border border-gray-200 rounded-lg px-4 py-3 mb-4 shadow-sm">

                            <div className="flex flex-col">
                              <span className="mb-1 block text-sm font-medium text-gray-700 uppercase tracking-wide">
                                Vista previa
                              </span>

                              <span className="text-sm font-semibold text-gray-700">
                                {`Bitacora_${documentoSeleccionado?.folio || "SAGASE"}.pdf`}
                              </span>
                            </div>

                            <button
                              onClick={descargarBitacora}
                              className="
                                flex items-center gap-2
                                bg-[#E8EEF8]
                                hover:bg-[#D8E4F5]
                                text-[#2D4A73]
                                border border-[#C9D8EE]
                                px-4 py-2
                                rounded-lg
                                text-sm
                                font-semibold
                                transition-all
                                duration-200
                              "
                            >
                              Descargar PDF
                            </button>

                          </div>
                                                
                          {/* Hoja (estilo idéntico al PDF de Exportar PDF) */}
                          <div className="flex justify-center mt-4">
                            <iframe
                              title="Vista previa bitácora"
                              src={pdfBitacora}
                              style={{
                                width: "850px",
                                height: "1100px",
                                border: "none",
                                background: "#fff",
                                boxShadow: "0 10px 25px rgba(0,0,0,.15)",
                              }}
                            />
                          </div>
                    
                        </div>
                  
                    </motion.div>
                  )}

                  {tabActiva === "respuestas" && (
                    <motion.div
                      key="respuestas"
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="space-y-4">
                        <div className="bg-gray-100 border-b px-4 py-2 text-sm font-semibold text-gray-600">
                          Respuestas al documento
                        </div>
                        <div className="overflow-x-auto">
                          <table className="min-w-full border border-gray-200 text-xs">
                            <thead>
                              <tr className="bg-[#D8B2BC] text-white">
                                <th className="px-3 py-2 text-left border-r">
                                  Registrador del mensaje
                                </th>
                                <th className="px-3 py-2 text-left border-r">
                                  Documento anexo
                                </th>
                                <th className="px-3 py-2 text-left border-r">
                                  Número de documento
                                </th>
                                <th className="px-3 py-2 text-left">
                                  Mensaje
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {respuestasDocumento.length > 0 ? (
                                respuestasDocumento.map((respuesta, index) => (
                                  <tr key={index} className="border-b hover:bg-gray-50">
                                    <td className="px-3 py-3 text-gray-700 align-top">
                                      {respuesta.registrador?.nombre || 'Usuario'}
                                    </td>
                    <td className="px-3 py-3 align-top">
                                      {respuesta.ruta ? (
                                        <button
                                          onClick={() => {
                                            setArchivoRespuesta(`${import.meta.env.VITE_ARCHIVOS_PATH}${respuesta.ruta}`);
                                            setMostrarVisorRespuesta(true);
                                          }}
                                          className="bg-[#8B1538] text-white px-3 py-1 rounded text-xs hover:opacity-90"
                                        >
                                          Ver Archivo
                                        </button>
                                      ) : (
                                        <span className="text-gray-500 text-[11px]">Sin documento adjunto</span>
                                      )}
                                    </td>
                                    <td className="px-3 py-3 align-top">
                                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-100 text-red-700 text-[11px] font-medium">
                                        {respuesta.nombre || 'Respuesta'}
                                      </span>
                                    </td>
                                    <td className="px-3 py-3 text-gray-700 align-top">
                                      {respuesta.mensaje}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="4" className="px-3 py-4 text-center text-gray-500">
                                    No hay respuestas registradas.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Modal ver archivo respuesta */}
                  <AnimatePresence>
                    {mostrarVisorRespuesta && (
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
                            onClick={() => setMostrarVisorRespuesta(false)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                          >
                            ✕
                          </button>

                          {/* Contenido */}
                          <div className="w-full h-full flex items-center justify-center">
                            {typeof archivoRespuesta === "string" ? (
                              archivoRespuesta.endsWith(".pdf") ? (
                                <iframe
                                  src={archivoRespuesta}
                                  className="w-full h-full rounded"
                                />
                              ) : (
                                <img
                                  src={archivoRespuesta}
                                  alt="preview"
                                  className="max-h-full rounded"
                                />
                              )
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

                  </AnimatePresence>
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
                  <label className="mb-1 block text-sm font-medium text-gray-700">
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
                  <label className="mb-1 block text-sm font-medium text-gray-700">Seleccionados:</label>
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
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    No. de asunto:
                  </label>
                  <input
                    disabled
                    placeholder="Autogenerado"
                    className="w-full border rounded px-2 py-1 bg-gray-100"
                  />
                </div>

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

        {/* MODAL ELIMINAR DOCUMENTO */}
        <AnimatePresence>
          {mostrarModalEliminar && (
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
                className="bg-white w-[500px] rounded shadow-lg overflow-hidden"
              >
                {/* HEADER */}
                <div className="flex justify-between items-center bg-[#8B1538] px-4 py-2">
                  <span className="text-white text-sm font-semibold">
                    Eliminar documento
                  </span>
                  <button
                    onClick={() => {
                      setMostrarModalEliminar(false);
                      setDocumentoEliminar(null);
                      setMotivoEliminacion("");
                    }}
                    className="bg-white text-[#8B1538] p-1 rounded-full flex items-center justify-center"
                  >
                    <Minus size={16} />
                  </button>
                </div>

                {/* BODY */}
                <div className="p-6">
                  <div className="mb-4">
                    <p className="text-sm text-gray-700 mb-2">
                      ¿Está seguro de eliminar el documento <strong>{documentoEliminar?.folio || documentoEliminar?.docId}</strong>?
                    </p>
                    <p className="text-xs text-red-500 mb-4">
                      Esta acción eliminará el documento y todos sus archivos anexos y respuestas asociadas de forma permanente.
                    </p>
                    <label className="text-xs text-gray-500 font-medium block mb-1">
                      Motivo de eliminación *
                    </label>
                    <textarea
                      value={motivoEliminacion}
                      onChange={(e) => setMotivoEliminacion(e.target.value)}
                      className="w-full border rounded px-3 py-2 text-sm"
                      rows="3"
                      placeholder="Especifique el motivo de la eliminación..."
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setMostrarModalEliminar(false);
                        setDocumentoEliminar(null);
                        setMotivoEliminacion("");
                      }}
                      className="px-4 py-2 bg-gray-300 rounded text-sm"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleConfirmarEliminar}
                      className="px-4 py-2 bg-[#8B1538] text-white rounded text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
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
                    <label className="mb-1 block text-sm font-medium text-gray-700">Funcionario:</label>

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