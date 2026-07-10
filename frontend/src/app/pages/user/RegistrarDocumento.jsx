import { Minus, Search, Trash2, Upload, X, Plus } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import { getTipoDocument } from "../../services/tipoDocumento.service";
import { getTemaPrincipal } from "../../services/catalogos.service";
import { getRemitentes, createRemitente } from "../../services/remitente.service";
import { getDocuments, createDocument, uploadAnexo, removeAnexo, addRelacionado, removeRelacionado, addTurnado, addCopia, addAdicional, removeAdicional } from "../../services/document.service";
import { getAreas, getInstrucciones } from "../../services/catalogos.service.js";
import { getUsers } from "../../services/user.service.js";
import {
  Toggle,
  handleChangeForm,
  validarDocumentoForm,
  showValidationError,
} from "../../utils/documentoFormHelpers.jsx";

import jsPDF from "jspdf";
import logoGobierno from "../../assets/images/nayaritLogo.png";

import GothamRoundedBold from "../../../styles/fonts/GothamRounded-Bold.ttf";
import GothamRoundedBook from "../../../styles/fonts/GothamRounded-Book.ttf";
import MontserratBold from "../../../styles/fonts/Montserrat-Bold.ttf";
import MontserratRegular from "../../../styles/fonts/Montserrat-Regular.ttf";

export function RegistrarDocumento() {

  const [errores, setErrores] = useState({});

  const [form, setForm] = useState({
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
    sintesis: "",
    faltaInformacion: false,
    electronica: false,
    documentoInterno: false,
    altaTipoDocumento: false,
    relacionadoCon: false,
    relacionados: [],
    otroFuncionario: false,
    materialAdicional: false,
  });

  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [temasPrincipales, setTemasPrincipales] = useState([]);
  const [remitentes, setRemitentes] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [documentosSeleccionados, setDocumentosSeleccionados] = useState([]);
  const [busquedaDocumentoRelacionado, setBusquedaDocumentoRelacionado] = useState("");
  const [mostrarOpcionesDocumento, setMostrarOpcionesDocumento] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const [tabActiva, setTabActiva] = useState("datosAsunto");
  const [documentoEditar, setDocumentoEditar] = useState(null);
  const [folioGenerado, setFolioGenerado] = useState("");
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);
  const [documentoAnexos, setDocumentoAnexos] = useState([]);
  const [relacionadosDocumento, setRelacionadosDocumento] = useState([]);
  const [bitacoraDocumento, setBitacoraDocumento] = useState([]);
  const [areas, setAreas] = useState([]);
  const [instrucciones, setInstrucciones] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [turnosDocumento, setTurnosDocumento] = useState([]);
  const [copiasDocumento, setCopiasDocumento] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const documentosFiltrados = documentos
  .filter(d =>
    d.folio.toLowerCase().includes(busquedaDocumentoRelacionado.toLowerCase())
  )
  .filter(d =>
    !documentosSeleccionados.some(sel => sel.docId === d.docId)
  );

  const formatDateValue = (value, withTime = false) => {
    if (!value) return "";
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    if (withTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    return date.toLocaleDateString('es-ES', options);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const tiposRes = await getTipoDocument();
        if (tiposRes.ok) {
          const tipos = await tiposRes.json();
          setTiposDocumento(tipos.filter(t => t.activo).sort((a, b) => a.tipo.localeCompare(b.tipo)).map(t => ({ value: t._id, label: t.tipo })));
        }
        const temasRes = await getTemaPrincipal();
        if (temasRes.ok) {
          const temas = await temasRes.json();
          setTemasPrincipales(temas.filter(t => t.activo).sort((a, b) => a.descripcion.localeCompare(b.descripcion)).map(t => ({ value: t._id, label: t.descripcion })));
        }
        const remsRes = await getRemitentes();
        if (remsRes.ok) {
          const rems = await remsRes.json();
          setRemitentes(rems.filter(r => r.activo).map((r) => {
            const tipoNormalizado = (r.tipo || "").toString().trim().toLowerCase();
            return {
              value: r._id,
              label: `${r.name} - ${r.cargo} - ${r.area}`,
              tipo: tipoNormalizado === "interno" ? "interno" : "externo",
              name: r.name,
              cargo: r.cargo,
              area: r.area,
            };
          }));
        }
        const docsRes = await getDocuments(token);
        if (docsRes.ok) {
          const docs = await docsRes.json();
          setDocumentos(Array.isArray(docs) ? docs : []);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const loadAdditionalCatalogos = async () => {
      try {
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
            setUsuarios(users.map((u) => ({
              value: u._id,
              label: `${u.name || u.nombre || ""}`.trim(),areaId: u.areaId
            })));
          }
        }
      } catch (error) {
        console.error("Error cargando catálogos adicionales:", error);
      }
    };

    loadAdditionalCatalogos();
  }, [token]);

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
  }, [token]);

  const validarFormulario = () =>
    validarDocumentoForm(form, setErrores, {
      required: [
        "ejercicio",
        "noDocumento",
        "fechaDocumento",
        "fechaAcuse",
        "fechaRegistro",
        "tipoRemitente",
        "tipoDocumento",
        "temaPrincipal",
        // "materialAdicional",
        "sintesis",
      ],
      conditional: [
        (currentForm, currentErrores) => {
          if (
            currentForm.tipoRemitente === "interno" &&
            !currentForm.remitenteInterno
          ) {
            currentErrores.remitenteInterno = true;
          }

          if (
            currentForm.tipoRemitente === "externo" &&
            !currentForm.remitenteExterno
          ) {
            currentErrores.remitenteExterno = true;
          }

          // NUEVO: validar archivo
          if (!archivo) {
            currentErrores.archivo = true;
          }
        },
      ],
  });

  const usuariosInstitucion = [
    { id: 1, nombre: "Juan Pérez - Dirección General" },
    { id: 2, nombre: "María López - Jurídico" },
    { id: 3, nombre: "Carlos Ramírez - Administración" },
  ];

  const [busquedaTipoDoc, setBusquedaTipoDoc] = useState("");
  const [mostrarOpcionesTipoDoc, setMostrarOpcionesTipoDoc] = useState(false);

  const tiposFiltrados = [
    ...tiposDocumento.filter((tipo) =>
      tipo.label.toLowerCase().includes(busquedaTipoDoc.toLowerCase())
    ),
    ...("otro".toLowerCase().includes(busquedaTipoDoc.toLowerCase()) || busquedaTipoDoc === ""
      ? [{ value: "otro", label: "Otro" }]
      : []),
  ];

  const [mostrarModalRemitente, setMostrarModalRemitente] = useState(false);

  const [nuevoRemitente, setNuevoRemitente] = useState({
    nombreCompleto: "",
    cargo: "",
    dependencia: "",
  });

  const handleChange = (e) => {
    const { name } = e.target;

    handleChangeForm(e, setForm, setErrores, { clearOnChange: true });

    if (name === "tipoRemitente") {
      setForm((prev) => ({
        ...prev,
        remitenteInterno: "",
        remitenteExterno: "",
      }));
      setBusquedaRemitenteExt("");
    }
  };

  const [mostrarModalRelacionado, setMostrarModalRelacionado] = useState(false);
  const [mostrarModalAltaAsunto, setMostrarModalAltaAsunto] = useState(false);

  const [asuntos, setAsuntos] = useState([]);
  const [asuntoSeleccionado, setAsuntoSeleccionado] = useState(null);

  const [nuevoAsunto, setNuevoAsunto] = useState({
    numero: "",
    clave: "",
    descripcion: "",
  });

  const [busquedaAsunto, setBusquedaAsunto] = useState("");

  const [busquedaClaveAsunto, setBusquedaClaveAsunto] = useState("");
  const [mostrarOpcionesClave, setMostrarOpcionesClave] = useState(false);

  const clavesAsunto = [
    { value: "compromiso_gobierno", label: "Compromiso de Gobierno" },
    { value: "proyecto", label: "Proyecto" },
    { value: "programa_gobierno", label: "Programa de Gobierno" },
    { value: "accion_gobierno", label: "Acción de Gobierno" },
    { value: "asunto_general", label: "Asunto General" },
  ];

  const clavesFiltradas = clavesAsunto.filter((c) =>
    c.label.toLowerCase().includes(busquedaClaveAsunto.toLowerCase())
  );

  const handleSave = () => {

    if (!validarFormulario()) {
      showValidationError();
      return;
    }

    // MODAL DE CONFIRMACIÓN
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
          const data = {
            docId: form.noDocumento,
            ejercicio: form.ejercicio,
            fechaDoc: form.fechaDocumento,
            acuse: form.fechaAcuse,
            registro: form.fechaRegistro,
            remitente: form.tipoRemitente === "interno" ? form.remitenteInterno : form.remitenteExterno,
            tipo: form.tipoDocumento !== "otro" ? form.tipoDocumento : undefined,
            tipoOtro: form.tipoDocumento === "otro" ? form.tipoOtro : undefined,
            tema: form.temaPrincipal,
            asunto: busquedaTemaPrincipal || form.temaPrincipal.descripcion || "",
            sintesis: form.sintesis,
            electronica: form.electronica,
            observaciones: form.observaciones,
            relacionados: form.relacionados,
            materialAdicional: form.materialAdicional,
            adicional: form.materialAdicional && nuevosMaterialesCreacion.length > 0
              ? {
                  tiene: true,
                  adicionales: nuevosMaterialesCreacion.map((m) => ({
                    tipo: m.tipo,
                    descripcion: m.descripcion,
                  })),
                }
              : undefined,
          };

          const dataForm = new FormData();
          dataForm.append("data", JSON.stringify({data}));
          if (archivo) {
            dataForm.append("archivo", archivo);
          }
          const response = await createDocument(dataForm, token);
          if (response.ok) {
            const data = await response.json();
            const dataGuardado = {
              ...data,
              noDocumento: form.noDocumento,
              fechaDocumento: form.fechaDocumento,
              fechaAcuse: form.fechaAcuse,
              fechaRegistro: form.fechaRegistro,

              tipoRemitente: form.tipoRemitente,
              remitenteInterno: form.remitenteInterno,
              remitenteExterno: form.remitenteExterno,

              tipoDocumento: form.tipoDocumento,
              tipoOtro: form.tipoOtro,
              temaPrincipal: form.temaPrincipal,
              materialAdicional: form.materialAdicional,

              asunto: form.temaPrincipal.descripcion,
              sintesis: form.sintesis,
              observaciones: form.observaciones,

              electronica: form.electronica,
              documentoInterno: form.documentoInterno,
              altaTipoDocumento: form.altaTipoDocumento,
              relacionadoCon: form.relacionadoCon,
            };
            setDocumentoAnexos(data.anexos);
            setBitacoraDocumento(data.bitacora);
            setRelacionadosDocumento(data.relacionados);
            // guardar para el modal
            setDocumentoEditar(dataGuardado);
            setFormEditar(dataGuardado);
            setNuevosMaterialesCreacion([]);
            setMaterialesAdicionales(nuevosMaterialesCreacion);

            Swal.fire({
              toast: true,
              position: "top-end",
              icon: "success",
              title: "Documento guardado correctamente",
              showConfirmButton: false,
              timer: 2000,
          }).then(() => {
              setMostrarModalRegistro(true);
          });
          } else {
            Swal.fire({
              icon: "error",
              title: "No. de documento existente",
              text: "No se pudo guardar el documento",
            });
          }
        } catch (error) {
          console.error(error);
          Swal.fire({
            icon: "error",
            title: "Error de conexión",
            text: "No se pudo guardar el documento",
          });
        }
      }
    });
  };

  const bitacoraRef = useRef(null);

  const [mostrarModalCopias, setMostrarModalCopias] = useState(false);
  const [mostrarOpcionesFuncionario, setMostrarOpcionesFuncionario] = useState(false);

    const [busquedaFuncionario, setBusquedaFuncionario] = useState("");

  const funcionariosFiltrados = usuarios
    .filter((u) =>
      u.label.toLowerCase().includes(busquedaFuncionario.toLowerCase()) &&
      !copiasDocumento.some((copia) => (copia.funcionario?.nombre || copia.funcionario?.label || copia.funcionario || "").toLowerCase() === u.label.toLowerCase())
    );

  const [selectedCopiaUsuario, setSelectedCopiaUsuario] = useState(null);

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

  const [formTurno, setFormTurno] = useState({
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

    if (!formTurno.instruccion) nuevosErrores.instruccion = true;
    if (!formTurno.areaDestino) nuevosErrores.areaDestino = true;
    if (!formTurno.prioridad) nuevosErrores.prioridad = true;
    if (formTurno.prioridad === "Urgente") if (!formTurno.fecha) nuevosErrores.fecha = true;

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
        instruccion: formTurno.instruccion,
        remitente: documentoEditar.remitente,
        areaDestino: formTurno.areaDestino,
        dirigido: formTurno.dirigido,
        prioridad: formTurno.prioridad,
        compromiso: formTurno.fecha,
        turna: user.id || user._id,
        notas: formTurno.notas,
      };

      const response = await addTurnado(currentDocId, turnadoData, token);
      if (!response.ok) throw new Error("Error agregando el turno");

      const updatedDocumento = await response.json();
      setDocumentoEditar(updatedDocumento);
      setDocumentoSeleccionado(updatedDocumento);
      await setTurnosDocumento(updatedDocumento.turnados);
      setMostrarModalTurno(false);
      setFormTurno({
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

    setMostrarModalRelacionado(false);
    
    // Toast de carga en la esquina superior derecha
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "info",
      title: "Guardando documentos relacionados...",
      timer: 2000,
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    }); 
    
    const currentDocId = documentoEditar?.docId || documentoEditar?._id;
    if (!currentDocId) return;

    try {
      let updatedDocumento = documentoEditar;
      const newIds = documentosSeleccionados.filter(
        (docSel) =>
          !relacionadosDocumento.some((rel) => {
            const relId =
              rel?.value?.docId ||
              rel?.value?._id ||
              rel?.docId ||
              rel?._id;

            return relId === docSel.docId;
          })
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
  const [anexosDisponibles, setAnexosDisponibles] = useState([]);

  const [anexosSeleccionados, setAnexosSeleccionados] = useState([]);

  const [busquedaRemitenteInt, setBusquedaRemitenteInt] = useState("");
  const [mostrarOpcionesRemitenteInt, setMostrarOpcionesRemitenteInt] = useState(false);

  const [busquedaRemitenteExt, setBusquedaRemitenteExt] = useState("");
  const [mostrarOpcionesRemitenteExt, setMostrarOpcionesRemitenteExt] = useState(false);

  const remitentesInternos = remitentes.filter(
    (r) => (r.tipo || "").toLowerCase() === "interno"
  );
  const remitentesExternos = remitentes.filter(
    (r) => (r.tipo || "").toLowerCase() === "externo"
  );

  const remitentesIntFiltrados = remitentesInternos.filter((r) =>
    r.label.toLowerCase().includes(busquedaRemitenteInt.toLowerCase())
  );

  const remitentesFiltrados = remitentesExternos.filter((r) =>
    r.label.toLowerCase().includes(busquedaRemitenteExt.toLowerCase())
  );

  const [busquedaTemaPrincipal, setBusquedaTemaPrincipal] = useState("");
  const [mostrarOpcionesTemaPrincipal, setMostrarOpcionesTemaPrincipal] = useState(false);

  const temasFiltradosPrincipal = temasPrincipales.filter((tema) =>
    tema.label.toLowerCase().includes(busquedaTemaPrincipal.toLowerCase())
  );

const refTipoDoc = useRef(null);
const refRemitenteInt = useRef(null);
const refRemitenteExt = useRef(null);
const refTemaPrincipal = useRef(null);
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

    if (refTemaPrincipal.current && !refTemaPrincipal.current.contains(event.target)) {
      setMostrarOpcionesTemaPrincipal(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

useEffect(() => {
  const now = new Date();

  const pad = (n) => n.toString().padStart(2, "0");

  const formatted = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

  setForm((prev) => ({
    ...prev,
    fechaRegistro: formatted,
  }));
}, []);

const [mostrarModalRegistro, setMostrarModalRegistro] = useState(false);

const obtenerLabel = (lista, id) => {
  if (!Array.isArray(lista)) return "";

  return lista.find(item => item._id === id)?.nombre || "";
};
    
      useEffect(() => {
        const handleClickOutside = (event) => {
          if (refTipoDoc.current && !refTipoDoc.current.contains(event.target)) {
            setMostrarOpcionesTipoDoc(false);
          }
          if (refRemitenteExt.current && !refRemitenteExt.current.contains(event.target)) {
            setMostrarOpcionesRemitenteExt(false);
          }
          if (refTemaPrincipal.current && !refTemaPrincipal.current.contains(event.target)) {
            setMostrarOpcionesTemaPrincipal(false);
          }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
      }, []);

  const [materialesAdicionales, setMaterialesAdicionales] = useState([]);

  const [mostrarModalMaterial, setMostrarModalMaterial] = useState(false);

  const [nuevoMaterial, setNuevoMaterial] = useState({
    tipo: "",
    descripcion: "",
  });

  // 📦 Materiales adicionales para el formulario de creación (antes de guardar el documento)
  const [nuevosMaterialesCreacion, setNuevosMaterialesCreacion] = useState([]);
  const [formMaterialCreacion, setFormMaterialCreacion] = useState({
    tipo: "",
    descripcion: "",
  });

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

  const [docSeleccionado, setDocSeleccionado] = useState(null);
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

    if (pdfGenerado) return;

    const cargar = async () => {
        const pdf = await generarBitacoraPDF();
        setPdfBitacora(pdf.url);
        setPdfGenerado(true);
    };

    cargar();
}, [tabActiva]);

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
      materialAdicional: false,
    });
  
    useEffect(() => {
    setPdfGenerado(false);
    setPdfBitacora(null);
}, [documentoSeleccionado]);

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
    <div className="flex-1 p-6 bg-gray-100 overflow-y-auto">
      <div className="max-w-6xl mx-auto bg-white rounded shadow">

        {/* HEADER */}
        <div className="bg-gray-300 rounded-t-md flex items-center justify-between px-4 py-2">
          <h1 className="text-sm font-semibold text-gray-800">Registro de documento</h1>
          <button className="w-6 h-6 flex items-center justify-center rounded-full bg-[#8B1538] text-white">
            <Minus size={16} />
          </button>
        </div>

        {/* MENSAJE FALTA INFORMACIÓN */}
        <AnimatePresence>
          {form.faltaInformacion && (
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.3 }}
              className="px-6 pt-4"
            >
              <div className="border border-blue-400 bg-gray-100 rounded overflow-hidden">

                {/* FOLIO */}
                <div className="flex items-center justify-between bg-gray-400 px-3 py-2 text-white text-sm">
                  {folioGenerado}

                  <button
                    onClick={() => {
                      setForm({ ...form, faltaInformacion: false });
                      setFolioGenerado("");
                    }}
                    className="bg-[#8B1538] w-6 h-6 flex items-center justify-center rounded-full"
                  >
                    <Minus size={14} />
                  </button>
                </div>

                {/* MENSAJE */}
                <div className="bg-gray-200 text-center text-sm py-2">
                  No se registran instrucciones, folio con información incompleta
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-6 space-y-6">

          {/* EJERCICIO */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-80">
              <h1 className="text-sm font-semibold text-gray-600 mb-2">Ejercicio</h1>
              <select
                name="ejercicio"
                value={form.ejercicio}
                onChange={handleChange}
                className={`w-full
                  rounded-lg
                  border
                  px-3
                  py-2
                  transition
                  focus:border-[#8B1538]
                  focus:ring-2
                  focus:ring-[#8B1538]/20
                  outline-none ${
                  errores.ejercicio ? "border-red-500 bg-red-50" : ""
                }`}
              >
                <option value="">Seleccionar tipo de ejercicio</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>
        </div>  

          {/* DATOS ESPECÍFICOS */}
          <div>
            <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1 bg-gray-300" />

                <h2 className="text-sm font-semibold text-[#8B1538] uppercase tracking-wide">
                    Datos específicos
                </h2>

                <div className="h-px flex-1 bg-gray-300" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Tipo documento con buscador */}
                <div ref={refTipoDoc} className="relative">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Selecciona tipo de documento <span className="text-red-600"> *</span>
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
                        setBusquedaTipoDoc(e.target.value);

                        if (errores.tipoDocumento) {
                          setErrores({ ...errores, tipoDocumento: false });
                        }
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
                            setForm({ ...form, tipoDocumento: t.value, tipoOtro: t.value === "otro" ? form.tipoOtro : "" });
                            setBusquedaTipoDoc(t.label);
                            setMostrarOpcionesTipoDoc(false);

                          }}
                          className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                        >
                          {t.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tipo de documento "Otro" - campo adicional */}
                {form.tipoDocumento === "otro" && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Especifique el tipo de documento <span className="text-red-600"> *</span>
                    </label>
                    <input
                      name="tipoOtro"
                      value={form.tipoOtro}
                      onChange={handleChange}
                      className={`w-full
                        rounded-lg
                        border
                        px-3
                        py-2
                        transition
                        focus:border-[#8B1538]
                        focus:ring-2
                        focus:ring-[#8B1538]/20
                        outline-none`}
                      placeholder="Escriba el tipo de documento"
                    />
                  </div>
                )}

                {/* Relacionado */}
                <div className="flex flex-col">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Relacionado con</label>

                    <div className="h-[38px] flex items-center">
                    <Toggle
                      checked={form.relacionadoCon}
                      onChange={(v) => {
                        setForm({ ...form, relacionadoCon: v });

                        if (v) {
                          setMostrarModalRelacionado(true);
                        } else {
                          setMostrarModalRelacionado(false);

                          // Limpiar asunto
                          setAsuntoSeleccionado(null);
                          setBusquedaAsunto("");

                          // Limpiar documentos relacionados
                          setDocumentosSeleccionados([]);
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Asunto */}
                <div ref={refTemaPrincipal} className="relative">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Selecciona asunto <span className="text-red-600"> *</span>
                  </label>

                  <div className={`flex items-center border rounded px-2 ${
                    errores.temaPrincipal ? "border-red-500 bg-red-50" : ""
                  }`}>
                    <Search size={16} className="text-gray-400" />
                    <input
                      value={busquedaTemaPrincipal}
                      onChange={(e) => {
                        setBusquedaTemaPrincipal(e.target.value);
                        setMostrarOpcionesTemaPrincipal(true);
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
                              setForm({ ...form, temaPrincipal: t.value });
                              setBusquedaTemaPrincipal(t.label);
                              setMostrarOpcionesTemaPrincipal(false);
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

                {/* Anexos */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Anexos</label>
                  <textarea
                      value={
                        documentosSeleccionados
                          .map(doc => `${doc.folio} - ${doc.docId}`)
                          .join("\n")
                      }
                    disabled
                    className="w-full
                     rounded-lg
                      border
                      bg-gray-50
                      px-3
                      py-3
                      text-sm
                      leading-7
                      min-h-[90px]
                      max-h-36
                      resize-none
                      overflow-y-auto
                      cursor-default"
                  />
                </div>

              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">

              </div>

          </div>

          {/* DATOS GENERALES */}
          <div>
            <div className="flex items-center gap-3 mb-2">
                <div className="h-px flex-1 bg-gray-300" />

                <h2 className="text-sm font-semibold text-[#8B1538] uppercase tracking-wide">
                    Datos generales
                </h2>

                <div className="h-px flex-1 bg-gray-300" />
            </div>
            
            <div className="grid grid-cols-3 gap-4 items-end">

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">No. de documento <span className="text-red-600"> *</span></label>
                <input
                  name="noDocumento"
                  value={form.noDocumento}
                  onChange={handleChange}
                  className={`w-full
                    rounded-lg
                    border
                    px-3
                    py-2
                    transition
                    focus:border-[#8B1538]
                    focus:ring-2
                    focus:ring-[#8B1538]/20
                    outline-none ${
                    errores.noDocumento ? "border-red-500 bg-red-50" : ""
                  }`}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Fecha de documento <span className="text-red-600"> *</span></label>
                <input
                  type="date"
                  name="fechaDocumento"
                  value={form.fechaDocumento}
                  onChange={handleChange}
                   className={`w-full
                      rounded-lg
                      border
                      px-3
                      py-2
                      transition
                      focus:border-[#8B1538]
                      focus:ring-2
                      focus:ring-[#8B1538]/20
                      outline-none ${
                    errores.fechaDocumento ? "border-red-500 bg-red-50" : ""
                  }`}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Fecha de recibido <span className="text-red-600"> *</span></label>
                <input
                  type="date"
                  name="fechaAcuse"
                  value={form.fechaAcuse}
                  onChange={handleChange}
                  className={`w-full
                    rounded-lg
                    border
                    px-3
                    py-2
                    transition
                    focus:border-[#8B1538]
                    focus:ring-2
                    focus:ring-[#8B1538]/20
                    outline-none ${
                    errores.fechaAcuse ? "border-red-500 bg-red-50" : ""
                  }`}
                />
              </div>

              <div className="hidden">
                <label className="mb-1 block text-sm font-medium text-gray-700">Fecha de registro <span className="text-red-600"> *</span></label>
                <input
                  type="datetime-local"
                  name="fechaRegistro"
                  value={form.fechaRegistro}
                  readOnly
                  className="w-full
                    rounded-lg
                    border
                    px-3
                    py-2
                    transition
                    focus:border-[#8B1538]
                    focus:ring-2
                    focus:ring-[#8B1538]/20
                    outline-none bg-gray-100"
                />
              </div>

            </div>
          </div>

          {/* REMITENTE */}
          <div>
            <div className="flex items-center gap-3 mb-2">
                <div className="h-px flex-1 bg-gray-300" />

                <h2 className="text-sm font-semibold text-[#8B1538] uppercase tracking-wide">
                    Remitente
                </h2>

                <div className="h-px flex-1 bg-gray-300" />
            </div>

            <div className="grid grid-cols-6 gap-4 items-end">

             {/* Tipo de remitente */}
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Tipo de remitente <span className="text-red-600"> *</span></label>
                <select
                  name="tipoRemitente"
                  value={form.tipoRemitente}
                  onChange={handleChange}
                    className={`w-full
                      rounded-lg
                      border
                      px-3
                      py-2
                      transition
                      focus:border-[#8B1538]
                      focus:ring-2
                      focus:ring-[#8B1538]/20
                      outline-none ${
                      errores.tipoRemitente ? "border-red-500 bg-red-50" : ""
                    }`}
                >
                  <option value="">Seleccionar</option>
                  <option value="interno">Interno</option>
                  <option value="externo">Externo</option>
                </select>
              </div>

              {/* ===== CAMPOS DINÁMICOS ===== */}
              <AnimatePresence mode="wait">
                {form.tipoRemitente === "interno" && (
                  <motion.div
                    key="interno"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="col-span-4"
                  >
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Funcionario / Área <span className="text-red-600"> *</span>
                    </label>
                    <div ref={refRemitenteInt} className="relative">
                      <div className={`flex items-center border rounded px-2 ${
                        errores.remitenteInterno ? "border-red-500 bg-red-50" : ""
                      }`}>
                        <Search size={16} className="text-gray-400" />
                        <input
                          value={busquedaRemitenteInt}
                          onChange={(e) => {
                            setBusquedaRemitenteInt(e.target.value);
                            setMostrarOpcionesRemitenteInt(true);
                            if (errores.remitenteInterno) {
                              setErrores({ ...errores, remitenteInterno: false });
                            }
                          }}
                          onFocus={() => setMostrarOpcionesRemitenteInt(true)}
                          className="w-full px-2 py-1 outline-none"
                          placeholder="Buscar y seleccionar opción"
                        />
                      </div>

                      {mostrarOpcionesRemitenteInt && (
                        <div className="absolute bg-white border w-full mt-1 max-h-40 overflow-y-auto z-10">
                          {remitentesIntFiltrados.length > 0 ? (
                            remitentesIntFiltrados.map((r) => (
                              <div
                                key={r.value}
                                onClick={() => {
                                  setForm({ ...form, remitenteInterno: r.value });
                                  setBusquedaRemitenteInt(r.label);
                                  setMostrarOpcionesRemitenteInt(false);
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
                  </motion.div>
                )}

                {form.tipoRemitente === "externo" && (
                  <motion.div
                    key="externo"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="col-span-3"
                  >
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Selecciona remitente externo <span className="text-red-600"> *</span>
                    </label>

                    {/* CONTENEDOR BUSCADOR + TOGGLE */}
                    <div className="flex items-center gap-3">

                      {/* BUSCADOR */}
                      <div ref={refRemitenteExt} className="flex-1 relative">
                        <div className={`flex items-center border rounded px-2 ${
                            errores.remitenteExterno ? "border-red-500 bg-red-50" : ""
                          }`}>
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

                        {/* DROPDOWN */}
                        {mostrarOpcionesRemitenteExt && (
                          <div className="absolute bg-white border w-full mt-1 max-h-40 overflow-y-auto z-10">
                            {remitentesFiltrados.length > 0 ? (
                              remitentesFiltrados.map((r) => (
                                <div
                                  key={r.value}
                                  onClick={() => {
                                    setForm({ ...form, remitenteExterno: r.value });
                                    setBusquedaRemitenteExt(r.label);
                                    setMostrarOpcionesRemitenteExt(false);
                                  }}
                                  className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                                >
                                  {r.label}
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

                      {/* TOGGLE */}
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <span className="mb-1 block text-sm font-medium text-gray-700">
                          Otro funcionario o ciudadano
                        </span>
                        <Toggle
                          checked={form.otroFuncionario}
                          onChange={(v) => {
                            setForm({ ...form, otroFuncionario: v });
                            if (v) setMostrarModalRemitente(true);
                          }}
                        />
                      </div>

                    </div>
                  </motion.div>
                )}

              </AnimatePresence>

            </div>
          </div>

          {/* DATOS ESPECÍFICOS */}
          <div>
            <div className="flex items-center gap-3 mb-2">
                <div className="h-px flex-1 bg-gray-300" />

                <h2 className="text-sm font-semibold text-[#8B1538] uppercase tracking-wide">
                    Información complementaria
                </h2>

                <div className="h-px flex-1 bg-gray-300" />
            </div>

            <div className="grid grid-cols-1 gap-4 items-end">
       
              <div className="col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Síntesis del asunto <span className="text-red-600"> *</span>
                </label>
                <textarea
                  name="sintesis"
                  value={form.sintesis}
                  onChange={handleChange}
                  className={`w-full
                    rounded-lg
                    border
                    px-3
                    py-2
                    transition
                    focus:border-[#8B1538]
                    focus:ring-2
                    focus:ring-[#8B1538]/20
                    outline-none ${
                    errores.sintesis ? "border-red-500 bg-red-50" : ""
                  }`}
                />
              </div>

              <div className="flex items-start gap-10 col-span-1">
                <div className="flex items-center gap-2 pt-0">
                  <label className="mb-1 block text-sm font-medium text-gray-700 flex items-center justify-between">
                    <span>Material adicional</span>
                  </label>
                  <Toggle
                    checked={form.materialAdicional}
                    onChange={(value) => {
                      setForm({ ...form, materialAdicional: value });
                      if (!value) {
                        // Si se desactiva, limpiar la lista
                        setNuevosMaterialesCreacion([]);
                        setFormMaterialCreacion({ tipo: "", descripcion: "" });
                      }
                    }}
                  />
                </div>
                {form.materialAdicional && (
                  <div className="flex-1 space-y-3 border pl-6 py-3">
                    {/* Formulario para agregar material */}
                    <div className="flex gap-3 items-end mb-3 pr-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Nombre del material: </label>
                        <input
                          type="text"
                          value={formMaterialCreacion.tipo}
                          onChange={(e) =>
                            setFormMaterialCreacion({ ...formMaterialCreacion, tipo: e.target.value })
                          }
                          className="w-48 border rounded px-2 py-1 text-sm"
                          placeholder="Ej. USB, CD, Documento..."
                        />
                      </div>
                      <div className="flex-1">
                        <label className="mb-1 block text-sm font-medium text-gray-700">Descripción</label>
                        <input
                          type="text"
                          value={formMaterialCreacion.descripcion}
                          onChange={(e) =>
                            setFormMaterialCreacion({ ...formMaterialCreacion, descripcion: e.target.value })
                          }
                          className="w-full
                            rounded-lg
                            border
                            px-3
                            py-2
                            transition
                            focus:border-[#8B1538]
                            focus:ring-2
                            focus:ring-[#8B1538]/20
                            outline-none text-sm"
                          placeholder="Breve descripción del material"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (!formMaterialCreacion.tipo.trim() || !formMaterialCreacion.descripcion.trim()) {
                            Swal.fire({
                              toast: true,
                              position: "top-end",
                              icon: "warning",
                              title: "Ambos campos son obligatorios",
                              showConfirmButton: false,
                              timer: 2000,
                            });
                            return;
                          }
                          setNuevosMaterialesCreacion([
                            ...nuevosMaterialesCreacion,
                            { ...formMaterialCreacion },
                          ]);
                          setFormMaterialCreacion({ tipo: "", descripcion: "" });
                        }}
                        className="bg-[#8B1538] text-white px-4 py-2 rounded text-sm whitespace-nowrap"
                      >
                        Agregar
                      </button>
                    </div>

                    {/* Textarea con resumen de materiales agregados */}
                    <div className="flex flex-col gap-2 pr-2">
                      <label className="mb-1 block text-sm font-medium text-gray-700">Materiales agregados:</label>
                      <textarea
                        value={
                          nuevosMaterialesCreacion.length > 0
                            ? nuevosMaterialesCreacion
                                .map((m, i) => `${i + 1}. ${m.tipo} - ${m.descripcion}`)
                                .join("\n")
                            : "No se han agregado materiales"
                        }
                        readOnly
                        className="w-full
                          rounded-lg
                          border
                          px-3
                          py-2
                          transition
                          focus:border-[#8B1538]
                          focus:ring-2
                          focus:ring-[#8B1538]/20
                          outline-none h-[68px] resize-none bg-gray-50 text-sm"
                      />
                    </div>

                    {/* Botón para limpiar la lista */}
                    {nuevosMaterialesCreacion.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setNuevosMaterialesCreacion([]);
                          setFormMaterialCreacion({ tipo: "", descripcion: "" });
                        }}
                        className="text-red-600 text-xs underline hover:no-underline"
                      >
                        Limpiar lista
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">Observaciones</label>
                <textarea 
                  name="observaciones" value={form.observaciones} onChange={handleChange} className="w-full
                    rounded-lg
                    border
                    px-3
                    py-2
                    transition
                    focus:border-[#8B1538]
                    focus:ring-2
                    focus:ring-[#8B1538]/20
                    outline-none" />
              </div>

            </div>
          </div>

          {/* SUBIR ARCHIVO */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-600 mb-2">
              Documento digital  <span className="text-red-500 ml-1">*</span>
            </h2>

            <div className="flex justify-center">
              
              {/* Documento */}
              <div className="w-full max-w-xl">
  
                  {/* Input oculto */}
                <input
                  ref={inputRef}
                  type="file"
                  id="archivoDocumento"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];

                    setArchivo(file);

                    if (file) {
                      setErrores((prev) => ({
                        ...prev,
                        archivo: false,
                      }));
                    }
                  }}
                />

                {/* Zona Drag & Drop */}
                <label
                  htmlFor="archivoDocumento"
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActivo(true);
                  }}
                  onDragLeave={() => setDragActivo(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActivo(false);

                    const file = e.dataTransfer.files[0];

                    if (file) {
                      setArchivo(file);

                      setErrores((prev) => ({
                        ...prev,
                        archivo: false,
                      }));
                    }
                  }}
                  className={`relative flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-2 cursor-pointer transition ${
                    errores.archivo
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
                        e.preventDefault();
                        eliminarArchivo();
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X size={14} />
                    </button>
                  )}

                  <Upload size={30} className="text-[#8B1538]" />

                  <p className="text-sm text-gray-600 text-center">
                    {archivo
                      ? archivo.name
                      : "Haz clic o arrastra un archivo aquí"}
                  </p>

                  <span className="text-xs text-gray-400">
                    PDF, DOC, DOCX, JPG, PNG (máx. 5MB)
                  </span>
                </label>

                {errores.archivo && (
                  <p className="mt-2 text-xs text-red-500">
                    El documento digital es obligatorio.
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* BOTÓN */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="bg-[#8B1538] text-white px-6 py-2 rounded"
            >
              Guardar
            </button>
          </div>

        </div>

      {/* MODAL REMITENTE EXTERNO */}
      <AnimatePresence>
        {mostrarModalRemitente && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white w-[700px] rounded shadow-lg overflow-hidden"
            >
              
              {/* HEADER */}
              <div className="flex justify-between items-center bg-gray-400 px-4 py-2">
                <span className="text-white text-sm">
                  Alta remitente externo
                </span>

                <button
                  onClick={() => {
                    setMostrarModalRemitente(false);
                    setForm({ ...form, otroFuncionario: false });
                  }}
                  className="bg-[#8B1538] text-white p-2 rounded-full"
                >
                  <Minus size={16} />
                </button>
              </div>

              {/* BODY */}
              <div className="p-6 grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Nombre completo:
                  </label>
                  <input
                    className="w-full
                    rounded-lg
                    border
                    px-3
                    py-2
                    transition
                    focus:border-[#8B1538]
                    focus:ring-2
                    focus:ring-[#8B1538]/20
                    outline-none"
                    value={nuevoRemitente.nombreCompleto}
                    onChange={(e) => setNuevoRemitente({ ...nuevoRemitente, nombreCompleto: e.target.value })}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Cargo:</label>
                  <input
                    className="w-full
                      rounded-lg
                      border
                      px-3
                      py-2
                      transition
                      focus:border-[#8B1538]
                      focus:ring-2
                      focus:ring-[#8B1538]/20
                      outline-none"
                    value={nuevoRemitente.cargo}
                    onChange={(e) => setNuevoRemitente({ ...nuevoRemitente, cargo: e.target.value })}
                  />
                </div>

                <div className="col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Dependencia:
                  </label>
                  <input
                    className="w-full
                      rounded-lg
                      border
                      px-3
                      py-2
                      transition
                      focus:border-[#8B1538]
                      focus:ring-2
                      focus:ring-[#8B1538]/20
                      outline-none"
                    value={nuevoRemitente.dependencia}
                    onChange={(e) => setNuevoRemitente({ ...nuevoRemitente, dependencia: e.target.value })}
                  />
                </div>
              </div>

              {/* FOOTER */}
              <div className="flex justify-end p-4">
                <button
                  onClick={async () => {
                    try {
                      const data = {
                        name: nuevoRemitente.nombreCompleto,
                        cargo: nuevoRemitente.cargo,
                        dependencia: nuevoRemitente.dependencia,
                        tipo: "Externo", // asumiendo externo
                        area: nuevoRemitente.dependencia, // o algo
                      };
                      const response = await createRemitente(data);
                      if (response.ok) {
                        const nuevoRem = await response.json();
                        setRemitentes([...remitentes, { value: nuevoRem._id, label: `${nuevoRem.name} - ${nuevoRem.cargo} - ${nuevoRem.area}` }]);

                        // Seleccionarlo automáticamente
                        setForm({
                          ...form,
                          remitenteExterno: nuevoRem._id,
                        });
                        setBusquedaRemitenteExt(`${nuevoRem.name} - ${nuevoRem.cargo} - ${nuevoRem.area}`);
                        setMostrarModalRemitente(false);

                        Swal.fire({
                          toast: true,
                          position: "top-end",
                          icon: "success",
                          title: "Remitente agregado",
                          showConfirmButton: false,
                          timer: 2000,
                        });
                      } else {
                        Swal.fire({
                          icon: "error",
                          title: "Error",
                          text: "No se pudo agregar el remitente",
                        });
                      }
                    } catch (error) {
                      console.error(error);
                      Swal.fire({
                        icon: "error",
                        title: "Error de conexión",
                        text: "No se pudo agregar el remitente",
                      });
                    }
                  }}
                  className="bg-red-600 text-white px-6 py-2 rounded"
                >
                  Guardar
                </button>

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DOCUMENTOS RELACIONADOS */}
      <AnimatePresence>
        {mostrarModalRelacionado && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]"
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
                    Buscar documento
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
                              if (!documentosSeleccionados.some(doc => doc.docId === d.docId)) {
                                  setDocumentosSeleccionados(prev => [...prev, d]);

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
                            {d.folio} - {d.asunto || "Sin asunto"}
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
                  <label className="mb-1 block text-sm font-medium text-gray-700">Seleccionados</label>
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
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]"
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
                    className="w-full
                      rounded-lg
                      border
                      px-3
                      py-2
                      transition
                      focus:border-[#8B1538]
                      focus:ring-2
                      focus:ring-[#8B1538]/20
                      outline-none bg-gray-100"
                  />
                </div>

                {/* CLASE ASUNTO (CON BUSCADOR 🔥) */}
                <div className="relative">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
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
                  <label className="mb-1 block text-sm font-medium text-gray-700">
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
                    className="w-full
                      rounded-lg
                      border
                      px-3
                      py-2
                      transition
                      focus:border-[#8B1538]
                      focus:ring-2
                      focus:ring-[#8B1538]/20
                      outline-none"
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
        {mostrarModalRegistro && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMostrarModalRegistro(false)}
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
                {documentoEditar?.folio || ""}
              </span>
              <button
                onClick={() => setMostrarModalRegistro(false)}
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
                            
                            <select name="ejercicio" value={formEditar.ejercicio} disabled onChange={handleChange} className="w-full
                              rounded-lg
                              border
                              px-3
                              py-2.5
                              transition
                              focus:border-[#8B1538]
                              focus:ring-2
                              focus:ring-[#8B1538]/20
                              outline-none">
                              <option value="">Seleccionar tipo de ejercicio</option>
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
                              <input  name="noDocumento" value={documentoEditar?.noDocumento || ""} disabled className="w-full
                                rounded-lg
                                border
                                px-3
                                py-2
                                transition
                                focus:border-[#8B1538]
                                focus:ring-2
                                focus:ring-[#8B1538]/20
                                outline-none bg-gray-100" />
                            </div>

                            <div>
                              <label className="mb-1 block text-sm font-medium text-gray-700">Fecha de documento *</label>
                              <input type="date" name="fechaDocumento"   value={documentoEditar?.fechaDocumento || ""}
                                  disabled
                                  className="w-full
                                    rounded-lg
                                    border
                                    px-3
                                    py-2
                                    transition
                                    focus:border-[#8B1538]
                                    focus:ring-2
                                    focus:ring-[#8B1538]/20
                                    outline-none bg-gray-100" />
                            </div>

                            <div>
                              <label className="mb-1 block text-sm font-medium text-gray-700">Fecha de acuse *</label>
                              <input type="date" name="fechaAcuse" value={documentoEditar?.fechaAcuse || ""} disabled className="w-full
                                rounded-lg
                                border
                                px-3
                                py-2
                                transition
                                focus:border-[#8B1538]
                                focus:ring-2
                                focus:ring-[#8B1538]/20
                                outline-none bg-gray-100" />
                            </div>

                            <div className="hidden">
                              <label className="mb-1 block text-sm font-medium text-gray-700">Fecha de registro *</label>
                              <input type="datetime-local" name="fechaRegistro" value={formEditar.fechaRegistro} disabled className="w-full
                                rounded-lg
                                border
                                px-3
                                py-2
                                transition
                                focus:border-[#8B1538]
                                focus:ring-2
                                focus:ring-[#8B1538]/20
                                outline-none bg-gray-100 cursor-not-allowed" />
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
                              <select name="tipoRemitente" value={formEditar.tipoRemitente} disabled className="w-full
                                  rounded-lg
                                  border
                                  px-3
                                  py-2
                                  transition
                                  focus:border-[#8B1538]
                                  focus:ring-2
                                  focus:ring-[#8B1538]/20
                                  outline-none bg-gray-100 cursor-not-allowed">
                                <option value="">Seleccionar</option>
                                <option value="interno">Interno</option>
                                <option value="externo">Externo</option>
                              </select>
                            </div>

                            {formEditar.tipoRemitente === "interno" && (
                              <div className="col-span-4">
                                <label className="mb-1 block text-sm font-medium text-gray-700">Funcionario / Área *</label>
                                <select 
                                  name="remitenteInterno" 
                                  onChange={handleChange} 
                                  disabled
                                  className="w-full
                                    rounded-lg
                                    border
                                    px-3
                                    py-2
                                    transition
                                    focus:border-[#8B1538]
                                    focus:ring-2
                                    focus:ring-[#8B1538]/20
                                    outline-none bg-gray-100 cursor-not-allowed"
                                  value={obtenerLabel(usuariosInstitucion, documentoEditar?.remitenteInterno)}
                                >
                                  <option value="">{
                                    remitentes.map((remitente) => remitente.value === documentoEditar?.remitenteInterno && remitente.label ? remitente.label : "") }</option>
                                </select>
                              </div>
                            )}

                            {formEditar.tipoRemitente === "externo" && (
                              <div className="col-span-4">
                                <label className="mb-1 block text-sm font-medium text-gray-700">Selecciona remitente externo *</label>
                                <div className="flex items-center gap-3">
                                  <div ref={refRemitenteExt} className="flex-1 relative">
                                    <div className={`flex items-center
                                        rounded-lg
                                        border
                                        px-3
                                        py-2.5
                                        transition
                                        focus-within:border-[#8B1538]
                                        focus-within:ring-2
                                        focus-within:ring-[#8B1538]/20${errores.remitenteExterno ? "border-red-500 bg-red-50" : ""}`}>
                                      {/* <Search size={16} className="text-gray-400" /> */}
                                      <input
                                        value={busquedaRemitenteExt}
                                        disabled
                                        onFocus={() => setMostrarOpcionesRemitenteExt(true)}
                                        className="w-full outline-none bg-transparent text-sm"
                                        placeholder="Buscar y seleccionar opción"
                                      />
                                    </div>

                                    {mostrarOpcionesRemitenteExt && (
                                      <div className="absolute bg-white border w-full mt-1 max-h-40 overflow-y-auto z-10">
                                        {remitentesFiltrados.length > 0 ? (
                                          remitentesFiltrados.map((r) => (
                                            <div
                                              key={r.id}
                                              onClick={() => {
                                                setFormEditar((p) => ({ ...p, remitenteExterno: r.nombre }));
                                                setBusquedaRemitenteExt(r.nombre);
                                                setMostrarOpcionesRemitenteExt(false);
                                              }}
                                              className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                                            >
                                              {r.nombre}
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
                          <div className="flex items-center gap-3 mb-1 mt-3">
                            <div className="h-px flex-1 bg-gray-300" />

                            <h2 className="text-sm font-semibold text-[#8B1538] uppercase tracking-wide">
                              Datos específicos
                            </h2>

                            <div className="h-px flex-1 bg-gray-300" />
                          </div>

                          <div className="grid grid-cols-6 gap-4 items-end">

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
                                {/* <Search size={16} className="text-gray-400" /> */}
                                <input
                                  value={tiposFiltrados.find(t => t.value === formEditar.tipoDocumento && !formEditar.tipoOtro)?.label || ( formEditar.tipoOtro ? formEditar.tipoOtro : "")}
                                  disabled
                                  className="w-full
                                    rounded-lg
                                    border
                                    px-3
                                    py-2
                                    transition
                                    focus:border-[#8B1538]
                                    focus:ring-2
                                    focus:ring-[#8B1538]/20
                                    outline-none bg-gray-100"
                                />
                              </div>

                            </div>

                            {/* Relacionado */}
                            <div className="flex items-center gap-2 mb-2">
                              <span className="mb-1 block text-sm font-medium text-gray-700">Relacionado con:</span>
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
                              <label className="mb-1 block text-sm font-medium text-gray-700">Anexos</label>
                              <textarea
                                value={asuntoSeleccionado?.descripcion || ""}
                                disabled
                                className="w-full
                                rounded-lg
                                border
                                px-3
                                py-2
                                transition
                                focus:border-[#8B1538]
                                focus:ring-2
                                focus:ring-[#8B1538]/20
                                outline-none h-[34px] resize-none bg-gray-100 cursor-not-allowed"
                              />
                            </div>

                          </div>

                          <div className="grid grid-cols-1 gap-2 mt-2">

                            {/* Tema */}
                            <div>

                              <div ref={refTemaPrincipal} className="relative">
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                  Selecciona asunto *
                                </label>

                                <div className={`flex items-center border rounded px-2 ${errores.temaPrincipal ? "border-red-500 bg-red-50" : ""
                                  }`}>
                                  {/* <Search size={16} className="text-gray-400" /> */}
                                  <input
                                    value={busquedaTemaPrincipal}
                                    disabled
                                    onFocus={() => setMostrarOpcionesTemaPrincipal(true)}
                                    className="w-full
                                      rounded-lg
                                      border
                                      px-3
                                      py-2
                                      transition
                                      focus:border-[#8B1538]
                                      focus:ring-2
                                      focus:ring-[#8B1538]/20
                                      outline-none bg-gray-100 cursor-not-allowed"
                                    placeholder="Buscar y seleccionar opción"
                                  />
                                </div>

                              </div>
                            </div>
                            <div className="flex items-center gap-10">
                              <div className="flex items-center gap-2">
                                <label className="mb-1 block text-sm font-medium text-gray-700 flex items-center justify-between">
                                <span>Material adicional</span>
                                </label>
                                <Toggle
                                  checked={form.materialAdicional}
                                  onChange={(value) => setForm({ ...form, materialAdicional: value })}
                                  disabled
                                />
                              </div>
                              
                              <div className="flex items-center gap-2">
                              <label className="mb-1 block text-sm font-medium text-gray-700 flex items-center justify-between"><span>Correspondencia electronica:</span></label>
                              <Toggle
                                checked={form.electronica}
                                onChange={(value) => setForm({ ...form, electronica: value })}
                                disabled
                              />
                              </div>
                            </div>

                            <div className="col-span-4">
                              <label className="mb-1 block text-sm font-medium text-gray-700">
                                Síntesis del asunto *
                              </label>
                              <textarea
                                name="sintesis"
                                value={formEditar.sintesis}
                                onChange={handleChange}
                                disabled
                                className="w-full
                                  rounded-lg
                                  border
                                  px-3
                                  py-2
                                  transition
                                  focus:border-[#8B1538]
                                  focus:ring-2
                                  focus:ring-[#8B1538]/20
                                  outline-none bg-gray-100 cursor-not-allowed"
                              />
                            </div>

                            <div className="col-span-4">
                              <label className="mb-1 block text-sm font-medium text-gray-700">Observaciones</label>
                              <textarea 
                                value={formEditar.observaciones}
                                onChange={handleChange}
                                disabled
                                className="w-full
                                  rounded-lg
                                  border
                                  px-3
                                  py-2
                                  transition
                                  focus:border-[#8B1538]
                                  focus:ring-2
                                  focus:ring-[#8B1538]/20
                                  outline-none bg-gray-100 cursor-not-allowed"
                              />
                            </div>

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
                              <th className="px-3 py-2 text-left">Registrador del anexo y mensaje</th>
                              <th className="px-3 py-2 text-left">Mensaje</th>
                              <th className="px-3 py-2 text-left">Documento anexo</th>
                              <th className="px-3 py-2 text-left">Número del documento</th>
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
                                    className="p-2 rounded hover:bg-red-100 text-gray-500 hover:text-red-600 transition">
                                      <Trash2 size={14} />
                                    </button>
                                  </td>

                                  {/* REGISTRADOR */}
                                  <td className="px-3 py-2 text-gray-700">
                                    {anexo.registrador.nombre ? anexo.registrador.nombre : "N/A"}
                                  </td>

                                  {/* MENSAJE */}
                                  <td className="px-3 py-2 text-gray-700">
                                    {anexo.mensaje || "Sin mensaje"}
                                  </td>

                                  {/* BOTÓN ARCHIVO */}
                                  <td className="px-3 py-2">
                                    <button
                                      onClick={() => {
                                        setArchivoVista(`${import.meta.env.VITE_ARCHIVOS_PATH}${anexo.ruta}`); // o la ruta/url del archivo
                                        setMostrarVisor(true);
                                      }}
                                      className="bg-[#8B1538] text-white px-3 py-1 rounded text-xs hover:opacity-90"
                                    >
                                      Ver Archivo
                                    </button>
                                  </td>

                                  {/* NOMBRE */}
                                  <td className="px-3 py-2 text-gray-700 truncate max-w-[300px]">
                                    {anexo.nombre}
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
                              setDocumentoSeleccionado([]);
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
                            placeholder="Buscar turno..."
                          />
                        </div>

                      </div>

                      <h3 className="text-sm font-semibold text-gray-600 mb-2">
                        Documentos relacionados con este registro.
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
                                className="bg-[#8B1538]
                                  text-white
                                  font-medium
                                  px-10
                                  py-3
                                  rounded-lg
                                  hover:bg-[#6f102c]
                                  transition
                                  shadow-md
                                  hover:shadow-lg"
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
                              <Minus size={18} />
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
                              turnosPaginados.map((turno, index) => (
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
                                  value={formTurno.instruccion}
                                  onChange={(e) => setFormTurno({ ...formTurno, instruccion: e.target.value })}
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
                                  value={formTurno.areaDestino}
                                  onChange={(e) => setFormTurno({ ...formTurno, areaDestino: e.target.value })}
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
                                  value={formTurno.dirigido}
                                  onChange={(e) => setFormTurno({ ...formTurno, dirigido: e.target.value })}
                                  className="w-full border rounded px-3 py-2"
                                >
                                  <option value="">Seleccionar</option>
                                  {usuarios.map((user) => ( formTurno.areaDestino === user.areaId && (
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
                                  value={formTurno.prioridad}
                                  onChange={(e) => setFormTurno({ ...formTurno, prioridad: e.target.value })}
                                  className={`w-full border rounded px-3 py-2 ${erroresTurno.prioridad ? "border-red-500" : "border-gray-300"}`}
                                >
                                  <option value="">Seleccionar</option>
                                  <option value="Urgente">Con fecha de termino</option>
                                  <option value="Normal">Normal</option>
                                </select>
                              </div>

                              {/* Fecha */}
                              {formTurno.prioridad === "Urgente" && (
                              <div>
                                <label>Fecha de termino*</label>
                                <input
                                  type="date"
                                  value={formTurno.fecha}
                                  onChange={(e) =>
                                    setFormTurno({ ...formTurno, fecha: e.target.value })
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
                                  value={formTurno.notas}
                                  onChange={(e) => setFormTurno({ ...formTurno, notas: e.target.value })}
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

                    </div>
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
                      <div className="flex justify-start">
                        <button
                          onClick={() => {setMostrarModalCopias(true);
                            setBusquedaFuncionario("");
                            setSelectedCopiaUsuario(null);}

                          }
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
                            {copiasDocumento.length > 0 ? (
                              copiasPaginadas.map((copia, index) => (
                              <tr
                                key={copia._id || index }
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
                  <div className="w-full flex justify-center bg-[#2f2f2f] py-6">
                    <div className="w-full max-w-4xl">
                
                      {/* Barra visor */}
                      <div className="flex justify-between items-center bg-white border border-gray-200 rounded-lg px-4 py-3 mb-4 shadow-sm">

                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 uppercase tracking-wide">
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
                  </div>
                )}
              </AnimatePresence>
            
            </div>
            
            </motion.div>
          </motion.div>
      )}
    </AnimatePresence>

    </div>
    </div>
  );

}
