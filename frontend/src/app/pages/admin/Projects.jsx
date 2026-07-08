import { useState, useEffect, useRef } from "react";
import { 
  Boxes,
  FileUp,
  Settings,
  Minus,
  Search,
  Pencil,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import { getRemitentes, createRemitente, updateRemitente, deleteRemitente } from "../../services/remitente.service";
import { getTemaPrincipal, getInstrucciones, getAreas, createTemaPrincipal, updateTemaPrincipal, deleteTemaPrincipal, createInstruccion, updateInstruccion, deleteInstruccion } from "../../services/catalogos.service";
import { getTipoDocument, createTipoDocument, updateTipoDocument, deleteTipoDocument } from "../../services/tipoDocumento.service";
import { getFondos, createFondo, updateFondo, deleteFondo } from "../../services/fondo.service";

export function Projects() {
  const [archivoReporte, setArchivoReporte] = useState(null);
  const [archivoImagen, setArchivoImagen] = useState(null);

  const inputReporteRef = useRef(null);
  const inputImagenRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (tab === "reportes") {
      const extensionesPermitidas = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!extensionesPermitidas.includes(file.type)) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "error",
          title: "Archivo no permitido",
          text: "Solo se permiten archivos PDF, DOC y DOCX.",
          timer: 2500,
          showConfirmButton: false,
          timerProgressBar: true,
        });

        e.target.value = "";
        return;
      }

      setArchivoReporte(file);
    } else {
      const extensionesPermitidas = [
        "image/jpeg",
        "image/png",
      ];

      if (!extensionesPermitidas.includes(file.type)) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "error",
          title: "Archivo no permitido",
          text: "Solo se permiten imágenes JPG y PNG.",
          timer: 2500,
          timerProgressBar: true,
          showConfirmButton: false,
        });

        e.target.value = "";
        return;
      }

      setArchivoImagen(file);
    }

    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: `${file.name} seleccionado`,
      showConfirmButton: false,
      timer: 2000,
    });
  };

  const handleUpload = async () => {
    const archivo =
      tab === "reportes"
        ? archivoReporte
        : archivoImagen;

    if (!archivo) {
      Swal.fire({
        icon: "warning",
        title: "Ningún archivo seleccionado",
        text:
          tab === "reportes"
            ? "Seleccione un reporte."
            : "Seleccione una imagen.",
        confirmButtonColor: "#8B1538",
      });
      return;
    }

    const result = await Swal.fire({
      title: "¿Subir archivo?",
      text: archivo.name,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Subir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#8B1538",
    });

    if (!result.isConfirmed) return;

    // Aquí irá tu servicio de subida

    Swal.fire({
      icon: "success",
      title: "Archivo cargado",
      text: "El archivo se subió correctamente.",
      timer: 2500,
      showConfirmButton: false,
      position: "top-end",
      timerProgressBar: true,
      toast: true,
    });

    setArchivoReporte(null);
    setArchivoImagen(null);
    setOpenModal(false);
  };

  const [proyectos, setProyectos] = useState([
    {
      id: 1,
      nombre: "Sistema Automatizado de Gestión de Archivos",
      clave: "SAGA_AGN",
      fecha: "2026-07",
    },
  ]);

  const [nuevo, setNuevo] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [tab, setTab] = useState("reportes");
  const token = localStorage.getItem("token");

  const agregarProyecto = () => {
    if (!nuevo) return;
    setProyectos([
      ...proyectos,
      {
        id: Date.now(),
        nombre: nuevo,
        clave: "NUEVO",
        fecha: new Date().toISOString().split("T")[0],
      },
    ]);
    setNuevo("");
  };

  const [openConfigModal, setOpenConfigModal] = useState(false);
  const [configTab, setConfigTab] = useState("fondo");
  const [fondos, setFondos] = useState([]);

  const [busquedaFondo, setBusquedaFondo] = useState("");
  
  const fondosFiltrados = fondos.filter((m) => {
    if (!m) return false;

    return (
      (m.nombre || "")
        .toLowerCase()
        .includes(busquedaFondo.toLowerCase()) ||
      (m.abreviatura || "")
        .toLowerCase()
        .includes(busquedaFondo.toLowerCase())
    );
  });
  
  const [mostrarModalFondo, setMostrarModalFondo] = useState(false);
  
  const [modoEdicion, setModoEdicion] = useState(false);

  const [fondoEditando, setFondoEditando] = useState({
    id: null,
    nombre: "",
    abreviatura: "",
    encabezado: null,
    pie: null,
    fondo: null,
    activo: true
  });

  const [mostrarModalTipoDocumento, setMostrarModalTipoDocumento] = useState(false);
  const [busquedaTipoDocumento, setBusquedaTipoDocumento] = useState("");

  const [tipoDocumentoEditando, setTipoDocumentoEditando] = useState({
    id: null,
    nombre: "",
    descripcion: "",
    activo: true
  });


  const [busquedaTemaPrincipal, setBusquedaTemaPrincipal] = useState("");

  const [mostrarModalTemaPrincipal, setMostrarModalTemaPrincipal] = useState(false);

  const [temaPrincipalEditando, setTemaPrincipalEditando] = useState({
    id: null,
    nombre: "",
    descripcion: "",
    activo: true,
  });

const [remitentesInternos, setRemitentesInternos] = useState([]);
const [busquedaInterno, setBusquedaInterno] = useState("");

const [remitentesExternos, setRemitentesExternos] = useState([]);
const [busquedaExterno, setBusquedaExterno] = useState("");

const [tiposDocumento, setTiposDocumento] = useState([]);

const [temasPrincipales, setTemasPrincipales] = useState([]);

const [instrucciones, setInstrucciones] = useState([]);

const [instruccionEditando, setInstruccionEditando] = useState({
  id: null,
  descripcion: "",
  activo: true,
});

const [busquedaInstruccion, setBusquedaInstruccion] = useState("");

const [areas, setAreas] = useState([]);

const [mostrarModalInstruccion, setMostrarModalInstruccion] = useState(false);

const [mostrarModalRemitenteInterno, setMostrarModalRemitenteInterno] = useState(false);
const [mostrarModalRemitenteExterno, setMostrarModalRemitenteExterno] = useState(false);
const [busquedaAreaInterno, setBusquedaAreaInterno] = useState("");
const [mostrarOpcionesArea, setMostrarOpcionesArea] = useState(false);

const areasFiltradasInterno = areas.filter((area) =>
  (area.nombre || area.descripcion || "").toLowerCase().includes(busquedaAreaInterno.toLowerCase())
);

const [remitenteEditando, setRemitenteEditando] = useState({
  id: null,
  name: "",
  cargo: "",
  area: "",
  dependencia: "",
  tipo: "Interno",
  activo: true
});

  useEffect(() => {
  const fetchAreas = async () => {
    try {
      const response = await getAreas();
      if (response.ok) {
        const data = await response.json();
        setAreas(data);
      }
    } catch (error) {
      console.error("Error al obtener las áreas:", error);
    }
  };

  const fetchFondos = async () => {
    try {
      const response = await getFondos(token);
      if (response.ok) {
        const data = await response.json();
        setFondos(data);
      }
    } catch (error) {
      console.error("Error al obtener los fondos:", error);
    }
  };

  const fetchRemitentesInternos = async () => {
    try {
      const response = await getRemitentes();
      if (response.ok) {
        const data = await response.json();
        setRemitentesInternos(data.filter((r) => r.tipo === "Interno"));
        setRemitentesExternos(data.filter((r) => r.tipo === "Externo"));
      }
    } catch (error) {
      console.error("Error al obtener los remitentes:", error);
    }
  };

  const fetchTiposDocumento = async () => {
    try {
      const response = await getTipoDocument();
      if (response.ok) {
        const data = await response.json();
        setTiposDocumento(data);
      }
    } catch (error) {
      console.error("Error al obtener los tipos de documento:", error);
    }
  };

  const fetchTemasPrincipales = async () => {
    try {
      const response = await getTemaPrincipal();
      if (response.ok) {
        const data = await response.json();
        setTemasPrincipales(data);
      }
    } catch (error) {
      console.error("Error al obtener los temas principales:", error);
    }
  };

  const fetchInstrucciones = async () => {
    try {
      const response = await getInstrucciones();
      if (response.ok) {
        const data = await response.json();
        setInstrucciones(data);
      }
    } catch (error) {
      console.error("Error al obtener las instrucciones:", error);
    }
  };

  fetchAreas();
  fetchFondos();
  fetchRemitentesInternos();
  fetchTiposDocumento();
  fetchTemasPrincipales();
  fetchInstrucciones();
}, []);


/* ============================= */
/* FILTRADOS */
/* ============================= */

const remitentesInternosFiltrados =
  remitentesInternos.filter((item) => {
    if (!item) return false;

    return (
      (item.name || "").toLowerCase().includes(busquedaInterno.toLowerCase()) ||
      (item.cargo || "").toLowerCase().includes(busquedaInterno.toLowerCase()) ||
      (item.dependencia || "").toLowerCase().includes(busquedaInterno.toLowerCase()) ||
      (item.area || "").toLowerCase().includes(busquedaInterno.toLowerCase())
    );
  });

const remitentesExternosFiltrados =
  remitentesExternos.filter((item) => {
    if (!item) return false;

    return (
      (item.name || "").toLowerCase().includes(busquedaExterno.toLowerCase()) ||
      (item.cargo || "").toLowerCase().includes(busquedaExterno.toLowerCase()) ||
      (item.dependencia || "").toLowerCase().includes(busquedaExterno.toLowerCase()) ||
      (item.area || "").toLowerCase().includes(busquedaExterno.toLowerCase())
    );
  });

const tiposDocumentoFiltrados =
tiposDocumento.filter((item) =>
  item && (item.tipo || "")
    .toLowerCase()
    .includes(busquedaTipoDocumento.toLowerCase())
);

const temasPrincipalesFiltrados =
  temasPrincipales.filter((item) =>
    item &&
    (item.descripcion || "")
      .toLowerCase()
      .includes(busquedaTemaPrincipal.toLowerCase())
  );

const instruccionesFiltrados =
  instrucciones.filter((item) =>
    item &&
    (item.descripcion || "")
      .toLowerCase()
      .includes(busquedaInstruccion.toLowerCase())
  );

/* ============================= */
/*  HANDLE ACTIVO TOGGLE */
/* ============================= */

const handleActivoTipoDocumento = async (e, id) => {
  const checked = e.target.checked;
  try {
    const tipoDoc = tiposDocumento.find(t => t.id === id || t._id === id);
    if (!tipoDoc) return;
    const response = await updateTipoDocument(tipoDoc.tipo, { activo: checked });
    if (response.ok) {
      setTiposDocumento(prev => prev.map(t => (t.id === id || t._id === id) ? { ...t, activo: checked } : t));
    }
  } catch (error) {
    console.error("Error al actualizar tipo de documento:", error);
  }
};

const handleActivoTemaPrincipal = async (e, id) => {
  const checked = e.target.checked;
  try {
    const response = await updateTemaPrincipal(id, { activo: checked });
    if (response.ok) {
      setTemasPrincipales(prev => prev.map(t => (t.id === id || t._id === id) ? { ...t, activo: checked } : t));
    }
  } catch (error) {
    console.error("Error al actualizar tema principal:", error);
  }
};

const handleActivoInstruccion = async (e, id) => {
  const checked = e.target.checked;
  try {
    const response = await updateInstruccion(id, { activo: checked });
    if (response.ok) {
      setInstrucciones(prev => prev.map(t => (t.id === id || t._id === id) ? { ...t, activo: checked } : t));
    }
  } catch (error) {
    console.error("Error al actualizar instrucción:", error);
  }
};

const handleActivoFondo = async (e, id) => {
  const checked = e.target.checked;
  try {
    const response = await updateFondo(id, { activo: checked }, token);
    if (response.ok) {
      setFondos(prev => prev.map(t => (t.id === id || t._id === id) ? { ...t, activo: checked } : t));
    }
  } catch (error) {
    console.error("Error al actualizar fondo:", error);
  }
};

const handleActivoRemitente = async (e, remId) => {
  const checked = e.target.checked;
  try {
    const response = await updateRemitente(remId, { activo: checked });
    if (response.ok) {
      setRemitentesInternos(prev => prev.map(r => r.remId === remId ? { ...r, activo: checked } : r));
      setRemitentesExternos(prev => prev.map(r => r.remId === remId ? { ...r, activo: checked } : r));
    }
  } catch (error) {
    console.error("Error al actualizar remitente:", error);
  }
};

/* ============================= */
/* 💾 SAVE HANDLERS */
/* ============================= */

const handleSaveFondo = async () => {

  const errores = {
    nombre: !fondoEditando.nombre.trim(),
    encabezado: !fondoEditando.encabezado,
    pie: !fondoEditando.pie,
  };

  setErroresFondo(errores);

  if (Object.values(errores).some(Boolean)) {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "warning",
      title: "Complete los campos obligatorios",
      text: "Nombre, Encabezado y Pie de página son requeridos.",
      timer: 3000,
      showConfirmButton: false,
      timerProgressBar: true,
    });

    return;
  }

  const result = await Swal.fire({
    title: modoEdicion
      ? "¿Actualizar fondo?"
      : "¿Guardar fondo?",
    text: modoEdicion
      ? "Se actualizará la información del fondo."
      : "Se creará un nuevo fondo.",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#8B1538",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Sí, guardar",
    cancelButtonText: "Cancelar",
  });

  if (!result.isConfirmed) {
    return;
  }

  try {
    const hasFiles = fondoEditando.encabezado instanceof File || 
                     fondoEditando.pie instanceof File || 
                     fondoEditando.fondo instanceof File;

    let response;
    if (hasFiles) {
      const formData = new FormData();
      formData.append('nombre', fondoEditando.nombre);
      formData.append('abreviatura', fondoEditando.abreviatura);
      formData.append('activo', fondoEditando.activo !== undefined ? fondoEditando.activo : true);
      
      if (fondoEditando.encabezado instanceof File) {
        formData.append('encabezado', fondoEditando.encabezado);
      }
      if (fondoEditando.pie instanceof File) {
        formData.append('pie', fondoEditando.pie);
      }
      if (fondoEditando.fondo instanceof File) {
        formData.append('fondo', fondoEditando.fondo);
      }

      if (modoEdicion && fondoEditando.id) {
        response = await updateFondo(fondoEditando.id, formData, token);
      } else {
        response = await createFondo(formData, token);
      }
    } else {
      const data = {
        nombre: fondoEditando.nombre,
        abreviatura: fondoEditando.abreviatura,
        encabezado: fondoEditando.encabezado,
        pie: fondoEditando.pie,
        fondo: fondoEditando.fondo,
        activo: fondoEditando.activo !== undefined ? fondoEditando.activo : true,
      };

      if (modoEdicion && fondoEditando.id) {
        response = await updateFondo(fondoEditando.id, data, token);
      } else {
        response = await createFondo(data, token);
      }
    }

    if (response.ok) {
      const updatedData = await response.json();
      if (modoEdicion) {
        setFondos(prev => prev.map(f => (f.id === fondoEditando.id || f._id === fondoEditando.id) ? updatedData : f));
      } else {
        setFondos(prev => [...prev, updatedData]);
      }
      setMostrarModalFondo(false);

    } else {
      const err = await response.json();
      Swal.fire("Error", err.error || "Error al guardar fondo", "error");
    }
  } catch (error) {
    console.error("Error al guardar fondo:", error);
    Swal.fire("Error", "Error al guardar fondo", "error");
  }
};

const handleSaveTipoDocumento = async () => {
  // Validación
  if (!tipoDocumentoEditando.nombre.trim()) {
    Swal.fire({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timerProgressBar: true,
      icon: "warning",
      title: "Campo obligatorio",
      text: "Debe ingresar el nombre del tipo de documento.",
      timer: 3000,

    });
    return;
  }

  // Confirmación
  const result = await Swal.fire({
    title: modoEdicion
      ? "¿Actualizar tipo de documento?"
      : "¿Guardar tipo de documento?",
    text: modoEdicion
      ? "Se actualizará la información del tipo de documento."
      : "Se creará un nuevo tipo de documento.",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#8B1538",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Sí, guardar",
    cancelButtonText: "Cancelar",
  });

  if (!result.isConfirmed) return;
  
  try {
    const data = {
      tipo: tipoDocumentoEditando.nombre,
      activo: tipoDocumentoEditando.activo !== undefined ? tipoDocumentoEditando.activo : true,
    };

    let response;
    if (modoEdicion && tipoDocumentoEditando.id) {
      const tipoDoc = tiposDocumento.find(t => t.id === tipoDocumentoEditando.id || t._id === tipoDocumentoEditando.id);
      response = await updateTipoDocument(tipoDoc?.tipo || tipoDocumentoEditando.nombre, data);
    } else {
      response = await createTipoDocument(data);
    }

    if (response.ok) {
      const updatedData = await response.json();
      if (modoEdicion) {
        setTiposDocumento(prev => prev.map(t => (t.id === tipoDocumentoEditando.id || t._id === tipoDocumentoEditando.id) ? updatedData : t));
      } else {
        setTiposDocumento(prev => [...prev, updatedData]);
      }
      setMostrarModalTipoDocumento(false);
       Swal.fire({
        icon: "success",
        title: "Éxito",
        text: modoEdicion
          ? "Tipo de documento actualizado correctamente."
          : "Tipo de documento creado correctamente.",
        confirmButtonColor: "#8B1538",
      });

    } else {
      const err = await response.json();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.error || "Error al guardar tipo de documento.",
        confirmButtonColor: "#8B1538",
      });
    }
  } catch (error) {
    console.error("Error al guardar tipo de documento:", error);
     Swal.fire({
      icon: "error",
      title: "Error",
      text: "Error al guardar tipo de documento.",
      confirmButtonColor: "#8B1538",
    });
  }
};

const handleSaveTemaPrincipal = async () => {
// Validación
  if (!temaPrincipalEditando.descripcion?.trim()) {
    return Swal.fire({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timerProgressBar: true,
      icon: "warning",
      title: "Campos obligatorios",
      timer: 2500,
      text: "Todos los campos son obligatorios.",
      confirmButtonColor: "#8B1538",
    });
  }

  // Confirmación
  const confirmacion = await Swal.fire({
    title: modoEdicion
      ? "¿Actualizar asunto del documento?"
      : "¿Guardar asunto del documento?",
    text: modoEdicion
      ? "Se actualizará el asunto del documento."
      : "Se guardará el nuevo asunto del documento.",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, guardar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#8B1538",
    cancelButtonColor: "#6B7280",
    reverseButtons: true,
  });

  if (!confirmacion.isConfirmed) return;

  try {
    const data = {
      descripcion: temaPrincipalEditando.descripcion,
      activo: temaPrincipalEditando.activo !== undefined ? temaPrincipalEditando.activo : true,
    };

    let response;
    if (modoEdicion && temaPrincipalEditando.id) {
      response = await updateTemaPrincipal(temaPrincipalEditando.id, data);
    } else {
      response = await createTemaPrincipal(data);
    }

    if (response.ok) {
      const updatedData = await response.json();
      if (modoEdicion) {
        setTemasPrincipales(prev => prev.map(t => (t.id === temaPrincipalEditando.id || t._id === temaPrincipalEditando.id) ? updatedData : t));
      } else {
        setTemasPrincipales(prev => [...prev, updatedData]);
      }
      setMostrarModalTemaPrincipal(false);

      Swal.fire({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timerProgressBar: true,
        timer: 2500,
        icon: "success",
        title: "Éxito",
        text: modoEdicion
          ? "Asunto del documento actualizado correctamente."
          : "Asunto del documento creado correctamente.",
        confirmButtonColor: "#8B1538",
      });
    } else {
      const err = await response.json();
      Swal.fire({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timerProgressBar: true,
        timer: 2500,
        icon: "error",
        title: "Error",
        text: err.error || "Error al guardar el asunto del documento.",
        confirmButtonColor: "#8B1538",
      });
    }
  } catch (error) {
    console.error("Error al guardar tema principal:", error);
    Swal.fire({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timerProgressBar: true,
      timer: 2500,
      icon: "error",
      title: "Error",
      text: "Error al guardar el asunto del documento.",
      confirmButtonColor: "#8B1538",
    });
  }
};

const handleSaveInstruccion = async () => {
  // Validación
  if (!instruccionEditando.descripcion?.trim()) {
    return Swal.fire({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timerProgressBar: true,
      timer: 2500,
      icon: "warning",
      title: "Campos obligatorios",
      text: "Todos los campos son obligatorios.",
      confirmButtonColor: "#8B1538",
    });
  }

  // Confirmación
  const confirmacion = await Swal.fire({
    title: modoEdicion
      ? "¿Actualizar instrucción?"
      : "¿Guardar instrucción?",
    text: modoEdicion
      ? "Se actualizará la información de la instrucción."
      : "Se guardará la nueva instrucción.",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, guardar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#8B1538",
    cancelButtonColor: "#6B7280",
    reverseButtons: true,
  });

  if (!confirmacion.isConfirmed) return;

  try {
    const data = {
      descripcion: instruccionEditando.descripcion,
      activo: instruccionEditando.activo !== undefined ? instruccionEditando.activo : true,
    };

    let response;
    if (modoEdicion && instruccionEditando.id) {
      response = await updateInstruccion(instruccionEditando.id, data);
    } else {
      response = await createInstruccion(data);
    }

    if (response.ok) {
      const updatedData = await response.json();
      if (modoEdicion) {
        setInstrucciones(prev => prev.map(t => (t.id === instruccionEditando.id || t._id === instruccionEditando.id) ? updatedData : t));
      } else {
        setInstrucciones(prev => [...prev, updatedData]);
      }
      setMostrarModalInstruccion(false);
      Swal.fire({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timerProgressBar: true,
        timer: 2500,
        icon: "success",
        title: "Éxito",
        text: modoEdicion
          ? "Instrucción actualizada correctamente."
          : "Instrucción creada correctamente.",
        confirmButtonColor: "#8B1538",
      });
    } else {
      const err = await response.json();
      Swal.fire({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timerProgressBar: true,
        timer: 2500,
        icon: "error",
        title: "Error",
        text: err.error || "Error al guardar la instrucción.",
        confirmButtonColor: "#8B1538",
      });
    }
  } catch (error) {
    console.error("Error al guardar instrucción:", error);
    Swal.fire({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timerProgressBar: true,
      timer: 2500,
      icon: "error",
      title: "Error",
      text: "Error al guardar la instrucción.",
      confirmButtonColor: "#8B1538",
    });
  }
};

const handleSaveRemitente = async (tipo) => {
  // Validación de campos obligatorios
  if (
    !remitenteEditando.name?.trim() ||
    !remitenteEditando.cargo?.trim() ||
    !remitenteEditando.area?.trim() ||
    (tipo === "Externo" && !remitenteEditando.dependencia?.trim())
  ) {
    return Swal.fire({
      position: "top-end",
      toast: true,
      showConfirmButton: false,
      timerProgressBar: true,
      timer: 2500,
      icon: "warning",
      title: "Campos obligatorios",
      text: "Todos los campos son obligatorios.",
      // confirmButtonColor: "#8B1538",
    });
  }

  // Confirmación antes de guardar
  const confirmacion = await Swal.fire({
    title: modoEdicion
      ? "¿Actualizar remitente?"
      : "¿Guardar remitente?",
    text: modoEdicion
      ? "Se actualizará la información del remitente."
      : "Se guardará el nuevo remitente.",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, guardar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#8B1538",
    cancelButtonColor: "#6B7280",
    reverseButtons: true,
  });

  if (!confirmacion.isConfirmed) return;

  try {
    const data = {
      name: remitenteEditando.name,
      cargo: remitenteEditando.cargo,
      area: remitenteEditando.area,
      dependencia: remitenteEditando.dependencia || "",
      tipo: tipo,
      activo: true,
    };

    let response;
    if (modoEdicion && remitenteEditando.id) {
      response = await updateRemitente(remitenteEditando.id, data);
    } else {
      response = await createRemitente(data);
    }

    if (response.ok) {
      // Refresh the lists
      const allResponse = await getRemitentes();
      if (allResponse.ok) {
        const allData = await allResponse.json();
        setRemitentesInternos(allData.filter((r) => r.tipo === "Interno"));
        setRemitentesExternos(allData.filter((r) => r.tipo === "Externo"));
      }
      if (tipo === "Interno") {
        setMostrarModalRemitenteInterno(false);
      } else {
        setMostrarModalRemitenteExterno(false);
      }
      
      Swal.fire({
        icon: "success",
        title: "Éxito",
        text: modoEdicion
          ? "Remitente actualizado correctamente."
          : "Remitente creado correctamente.",
        confirmButtonColor: "#8B1538",
      });
    } else {
      const err = await response.json();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.error || "Error al guardar remitente.",
        confirmButtonColor: "#8B1538",
      });
    }
  } catch (error) {
    console.error("Error al guardar remitente:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Error al guardar remitente.",
      position: "top-end",
      toast: true,
      showConfirmButton: false,
      timerProgressBar: true,
      timer: 2500,
    });
  }
};

const [erroresFondo, setErroresFondo] = useState({
  nombre: false,
  encabezado: false,
  pie: false,
});

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-xl mb-4 text-gray-800">Proyectos</h1>

      {/* GRID DE TARJETAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {proyectos.map((p) => (
          <div
            key={p.id}
            className="relative bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition"
          >

            {/* Botón Configuración */}
            <button
              onClick={() => setOpenConfigModal(true)}
              className="
                absolute top-3 right-3
                w-8 h-8
                flex items-center justify-center
                rounded-full
                text-gray-500
                hover:text-[#8B1538]
                hover:bg-[#8B1538]/10
                transition-all
              "
              title="Configurar catálogos"
            >
              <Settings size={18} />
            </button>
            
            {/* Título */}
            <h2 className="text-sm font-semibold text-gray-800 mb-2">
              {p.nombre}
            </h2>

            {/* Info */}
            <p className="text-[11px] text-gray-500">
              Id proyecto: <span className="text-gray-700">{p.clave}</span>
            </p>
            <p className="text-[11px] text-gray-500 mb-3">
              Fecha de creación:{" "}
              <span className="text-gray-700">{p.fecha}</span>
            </p>

            

          </div>
        ))}
      </div>

      <AnimatePresence>
      {openModal && (
         <motion.div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
        <motion.div
          className="bg-white rounded-lg shadow-lg w-[420px]"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{
            duration: 0.25,
            ease: "easeOut",
          }}
        >

            {/* HEADER */}
            <div className="px-4 pt-4">
              <h2 className="text-sm font-semibold text-gray-800">
                Carga de reportes
              </h2>
            </div>

            {/* TABS */}
            <div className="flex border-b mt-3 text-sm">
              <button
                onClick={() => setTab("reportes")}
                className={`flex-1 py-2 ${
                  tab === "reportes"
                    ? "border-b-2 border-blue-500 text-blue-500 font-medium"
                    : "text-gray-500"
                }`}
              >
                Reportes
              </button>

              <button
                onClick={() => setTab("imagenes")}
                className={`flex-1 py-2 ${
                  tab === "imagenes"
                    ? "border-b-2 border-blue-500 text-blue-500 font-medium"
                    : "text-gray-500"
                }`}
              >
                Imágenes
              </button>
            </div>

            {/* CONTENIDO */}
            <div className="p-4 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* REPORTES */}
                  {tab === "reportes" && (
                    <div
                      onClick={() => inputReporteRef.current.click()}
                      className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition"
                    >
                      <FileUp size={28} className="text-[#8B1538] mb-2" />

                      <p className="text-sm text-gray-600">
                        {archivoReporte
                          ? archivoReporte.name
                          : "Haz clic para cargar un reporte"}
                      </p>

                      <input
                        ref={inputReporteRef}
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                  )}

                  {/* IMÁGENES */}
                  {tab === "imagenes" && (
                    <div
                      onClick={() => inputImagenRef.current.click()}
                      className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition"
                    >
                      <FileUp size={28} className="text-[#8B1538] mb-2" />

                      <p className="text-sm text-gray-600">
                        {archivoImagen
                          ? archivoImagen.name
                          : "Haz clic para cargar una imagen"}
                      </p>

                      <input
                        ref={inputImagenRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* FOOTER */}
            <div className="flex justify-end gap-2 px-4 pb-4">
              <button
                onClick={() => setOpenModal(false)}
                className="px-3 py-1 text-sm border rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpload}
                className="px-3 py-1 text-sm bg-[#8B1538] text-white rounded hover:bg-[#70102d] transition"
              >
                Subir
              </button>
            </div>

        </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      <AnimatePresence>
        {openConfigModal && (

          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >

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
                  Configuración de catálogos
                </span>

                <button
                  onClick={() => setOpenConfigModal(false)}
                  className="bg-[#8B1538] text-white p-2 rounded-full flex items-center justify-center"
                >
                  <Minus size={16} />
                </button>

              </div>

              {/* TABS SUPERIORES */}
                <div className="flex border-b text-sm overflow-x-auto bg-white">

                  {[
                    {
                      id: "fondo",
                      label: "Fondo",
                    },
                    {
                      id: "remitentesInternos",
                      label: "Remitentes internos",
                    },
                    {
                      id: "remitentesExternos",
                      label: "Remitentes externos",
                    },
                    {
                      id: "tipoDocumento",
                      label: "Tipo de documento",
                    },
                    {
                      id: "temaPrincipal",
                      label: "Asuntos",
                    },
                    {
                      id: "Instrucciones",
                      label: "Instrucciones",
                    },
                  ].map((tab) => (

                    <button
                      key={tab.id}
                      onClick={() => setConfigTab(tab.id)}
                      className={`px-4 py-3 whitespace-nowrap transition-all
                        ${
                          configTab === tab.id
                            ? "border-b-2 border-[#8B1538] text-[#8B1538] font-semibold"
                            : "text-gray-600 hover:text-[#8B1538]"
                        }`}
                    >
                      {tab.label}
                    </button>

                  ))}

                </div>

                {/* BODY */}
                <div className="flex-1 overflow-y-auto p-3 bg-gray-50">


                {/* CONTENIDO */}
                <div className="flex-1 p-1 overflow-y-auto">

                  <AnimatePresence mode="wait">

                    {/* TAB FONDO */}
                    {configTab === "fondo" && (

                      <motion.div
                        key="fondo"
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -15 }}
                        transition={{ duration: 0.2 }}
                      >

                      <div className="space-y-4">
                        {/* HEADER */}
                        <div className="flex items-center gap-2 mb-2">

                        <div className="relative group inline-flex">
                          {/* Botón añadir */}
                          <button
                            onClick={() => {
                              setModoEdicion(false);

                              setFondoEditando({
                                id: null,
                                nombre: "",
                                abreviatura: "",
                                encabezado: null,
                                pie: null,
                                fondo: null,
                                activo: true,
                              });

                              setMostrarModalFondo(true);
                            }}
                            className="w-11 h-11 rounded-xl bg-[#8B1538] text-white flex items-center justify-center shadow-lg hover:scale-110 transition"
                            title="Agregar remitente"
                          >
                            <Plus size={22} className="group-hover:rotate-90 transition-transform duration-300"/>
                            
                          </button>
  
                        </div>
                        
                          {/* 🔍 Buscador */}
                          <div className="relative flex-1">
                            <Search 
                              size={18}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                            <input
                              value={busquedaFondo}
                              onChange={(e) => setBusquedaFondo(e.target.value)}
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
                              placeholder="Buscar fondos..."
                            />
                          </div>
  
                        </div>
  
                        {/* 🧾 TABLA */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm border border-gray-200">
  
                            <thead className="bg-gradient-to-r from-[#8B1538] to-[#6E0E2C] text-white">
                              <tr>
                                <th className="px-4 py-2 text-left">Editar</th>
                                <th className="px-4 py-2 text-left">Nombre Fondo</th>
                                <th className="px-4 py-2 text-left">Abreviatura</th>
                                <th className="px-4 py-2 text-left">Encabezado</th>
                                <th className="px-4 py-2 text-left">Pie</th>
                                <th className="px-4 py-2 text-left">Fondo</th>
                                <th className="px-4 py-2 text-left">Activo</th>
                              </tr>
                            </thead>
  
                            <tbody>
                              {fondosFiltrados.length > 0 ? (
                                fondosFiltrados
                                .filter(Boolean)
                                .map((fondosTabla) => (
                                  <tr key={fondosTabla.id || fondosTabla._id}>
  
                                    {/* EDITAR */}
                                    <td className="px-4 py-2">
                                      <button
                                        onClick={() => {

                                          setModoEdicion(true);

                                          setFondoEditando({
                                            id: fondosTabla.id || fondosTabla._id,
                                            nombre: fondosTabla.nombre || "",
                                            abreviatura: fondosTabla.abreviatura || "",
                                            encabezado: fondosTabla.encabezado || "",
                                            pie: fondosTabla.pie || "",
                                            fondo: fondosTabla.fondo || "",
                                            activo: fondosTabla.activo !== undefined ? fondosTabla.activo : true,
                                          });

                                          setMostrarModalFondo(true);
                                        }}
                                        title="Editar fondo"
                                        className="p-2 rounded hover:bg-blue-100 text-gray-500 hover:text-blue-600 transition"
                                      >
                                        <Pencil size={16} />
                                      </button>
                                    </td>
  
                                    <td className="px-4 py-2 text-gray-700">
                                      {fondosTabla.nombre}
                                    </td>
  
                                    <td className="px-4 py-2 text-gray-700">
                                      {fondosTabla.abreviatura}
                                    </td>
  
                                    <td className="px-4 py-2 text-gray-700">
                                      {fondosTabla.encabezado}
                                    </td>
  
                                    <td className="px-4 py-2 text-gray-700">
                                      {fondosTabla.pie}
                                    </td>

                                    <td className="px-4 py-2 text-gray-700">
                                      {fondosTabla.fondo}
                                    </td>
  
                                    <td className="px-4 py-2 text-gray-700 text-center">
                                      <input
                                        type="checkbox"
                                        checked={fondosTabla.activo}
                                        onChange={(e) => handleActivoFondo(e, fondosTabla.id || fondosTabla._id)}
                                        className="
                                        w-5
                                        h-5
                                        rounded
                                        accent-[#8B1538]
                                        cursor-pointer
                                        "
                                      />
                                    </td>

                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={7} className="text-center py-4 text-gray-400">
                                    Sin fondos registrados
                                  </td>
                                </tr>
                              )}
                            </tbody>
  
                          </table>
                        </div>
  
  
                        <AnimatePresence>
                          {mostrarModalFondo && (
                            <motion.div
                              className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              <motion.div
                                className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                              >
                                {/* HEADER */}
                                <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
                                  <h2 className="text-xl font-semibold text-gray-800">
                                    {modoEdicion ? "Editar registro de fondo" : "Agregar registro de fondo"}
                                  </h2>

                                  <button
                                    onClick={() => setMostrarModalFondo(false)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-[#8B1538] text-white hover:bg-[#74112F] transition"
                                  >
                                    <Minus size={16} />
                                  </button>
                                </div>

                                {/* CONTENIDO */}
                                <div className="p-6 max-h-[80vh] overflow-y-auto">
                                  
                                  {/* GRID GENERAL */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    
                                    {/* COLUMNA IZQUIERDA */}
                                    <div className="space-y-5">

                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Nombre Fondo
                                        </label>

                                        <input
                                          type="text"
                                          value={fondoEditando.nombre}
                                          onChange={(e) => {
                                            const nombre = e.target.value;

                                            const abreviatura = nombre
                                              .trim()
                                              .split(" ")
                                              .filter(Boolean)
                                              .map((palabra) => palabra[0])
                                              .join("")
                                              .toUpperCase();

                                            setFondoEditando({
                                              ...fondoEditando,
                                              nombre,
                                              abreviatura,
                                            });

                                            setErroresFondo((prev) => ({
                                              ...prev,
                                              nombre: false,
                                            }));
                                          }}
                                           className={`
                                            w-full
                                            border
                                            border-gray-300
                                            rounded-lg
                                            px-3
                                            py-2
                                            ${
                                              erroresFondo.nombre
                                                ? "border-red-500 bg-red-50"
                                                : "border-gray-300"
                                            }
                                          `}
                                          placeholder="Ingrese nombre del fondo"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Abreviatura
                                        </label>

                                        <input
                                          type="text"
                                          value={fondoEditando.abreviatura}
                                          onChange={(e) =>
                                            setFondoEditando({
                                              ...fondoEditando,
                                              abreviatura: e.target.value,
                                            })
                                          }
                                          disabled
                                          className="
                                          w-full
                                          border
                                          border-gray-300
                                          rounded-lg
                                          px-3
                                          py-2
                                          bg-gray-100
                                          text-gray-500
                                          cursor-not-allowed
                                        "
                                          placeholder="Ingrese abreviatura"
                                        />
                                      </div>

                                    </div>

                                    {/* COLUMNA DERECHA */}
                                    <div className="space-y-5">

                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Imagen encabezado
                                        </label>
                                        <input
                                          type="file"
                                          accept="image/*"
                                           onChange={(e) => {
                                          setFondoEditando({
                                            ...fondoEditando,
                                            encabezado: e.target.files[0] || null,
                                          });

                                          setErroresFondo((prev) => ({
                                            ...prev,
                                            encabezado: false,
                                          }));
                                        }}
                                        className={`
                                          w-full rounded-lg px-3 py-2 text-sm border
                                          ${
                                            erroresFondo.encabezado
                                              ? "border-red-500 bg-red-50"
                                              : "border-gray-300"
                                          }
                                        `}
                                        />
                                        {fondoEditando.encabezado && typeof fondoEditando.encabezado === 'string' && (
                                          <p className="text-xs text-gray-500 mt-1">Archivo actual: {fondoEditando.encabezado.split('/').pop()}</p>
                                        )}
                                      </div>

                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Imagen pie de página
                                        </label>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => {
                                          setFondoEditando({
                                            ...fondoEditando,
                                            pie: e.target.files[0] || null,
                                          });

                                          setErroresFondo((prev) => ({
                                            ...prev,
                                            pie: false,
                                          }));
                                        }}
                                        className={`
                                          w-full rounded-lg px-3 py-2 text-sm border
                                          ${
                                            erroresFondo.pie
                                              ? "border-red-500 bg-red-50"
                                              : "border-gray-300"
                                          }
                                        `}
                                        />
                                        {fondoEditando.pie && typeof fondoEditando.pie === 'string' && (
                                          <p className="text-xs text-gray-500 mt-1">Archivo actual: {fondoEditando.pie.split('/').pop()}</p>
                                        )}
                                      </div>

                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Background de reporte
                                        </label>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) =>
                                            setFondoEditando({
                                              ...fondoEditando,
                                              fondo: e.target.files[0] || null,
                                            })
                                          }
                                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                        />
                                        {fondoEditando.fondo && typeof fondoEditando.fondo === 'string' && (
                                          <p className="text-xs text-gray-500 mt-1">Archivo actual: {fondoEditando.fondo.split('/').pop()}</p>
                                        )}
                                      </div>

                                    </div>
                                  </div>
                                </div>

                                {/* FOOTER */}
                                <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
                                  <button
                                    onClick={() => setMostrarModalFondo(false)}
                                    className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition"
                                  >
                                    Cancelar
                                  </button>

                                  <button
                                    onClick={handleSaveFondo}
                                    className="px-5 py-2 rounded-lg bg-[#8B1538] hover:bg-[#74112F] text-white shadow-md transition"
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

                    {/* TAB REM INTERNOS */}
                    {configTab === "remitentesInternos" && (

                      <motion.div
                        key="remitentesInternos"
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -15 }}
                        transition={{ duration: 0.2 }}
                      >

                        <div className="space-y-4">

                          {/* 🔥 HEADER */}
                          <div className="flex items-center gap-2 mb-2">
                            <div className="relative group inline-flex">
                              {/* Botón añadir */}
                              <button
                                onClick={() => {
                                  setModoEdicion(false);

                                  setRemitenteEditando({
                                    id: null,
                                    name: "",
                                    cargo: "",
                                    area: "",
                                    dependencia: "",
                                    tipo: "Interno",
                                    activo: true,
                                  });

                                  setMostrarModalRemitenteInterno(true);
                                }}
                                className="w-11 h-11 rounded-xl bg-[#8B1538] text-white flex items-center justify-center shadow-lg hover:scale-110 transition"
                                title="Agregar remitente"
                              >
                                <Plus
                                  size={22}
                                  className="group-hover:rotate-90 transition-transform duration-300"
                                />
                              </button>
                            </div>
                            
                            {/* 🔍 Buscador */}
                            <div className="relative flex-1">
                              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                              <input
                                value={busquedaInterno}
                                onChange={(e) => setBusquedaInterno(e.target.value)}
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
                                placeholder="Buscar remitente..."
                              />
                            </div>

                          </div>

                          {/* 🧾 TABLA */}
                          <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="w-full text-sm">

                              <thead className="bg-gradient-to-r from-[#8B1538] to-[#6E0E2C] text-white">
                                <tr>
                                  <th className="px-4 py-3 text-left">Editar</th>
                                  <th className="px-4 py-3 text-left">Nombre completo</th>
                                  <th className="px-4 py-3 text-left">Cargo</th>
                                  <th className="px-4 py-3 text-left">Área</th>
                                  <th className="px-4 py-3 text-center">Activo</th>
                                </tr>
                              </thead>

                              <tbody>
                                {remitentesInternosFiltrados.length > 0 ? (
                                  remitentesInternosFiltrados.map((remitente) => (
                                    <tr
                                      key={remitente.id || remitente._id}
                                      className="
                                      hover:bg-[#8B1538]/5
                                      transition
                                      duration-200
                                      border-b
                                      "
                                    >

                                      {/* EDITAR */}
                                      <td className="px-4 py-3">
                                        <button
                                          onClick={() => {

                                            setModoEdicion(true);

                                            setRemitenteEditando({
                                              id: remitente.remId,
                                              name: remitente.name || "",
                                              cargo: remitente.cargo || "",
                                              area: remitente.area || "",
                                              dependencia: remitente.dependencia || "",
                                              tipo: "Interno",
                                              activo: remitente.activo !== undefined ? remitente.activo : true,
                                            });
                                            
                                            setMostrarModalRemitenteInterno(true);
                                          }}
                                          title="Editar remitente interno"
                                          className="p-2 rounded hover:bg-blue-100 text-gray-500 hover:text-blue-600 transition"
                                        >
                                          <Pencil size={16} />
                                        </button>
                                      </td>

                                      {/* NOMBRE */}
                                      <td className="px-4 py-3 text-gray-700">
                                        {remitente.name}
                                      </td>

                                      {/* CARGO */}
                                      <td className="px-4 py-3 text-gray-700">
                                        {remitente.cargo}
                                      </td>

                                      {/* ÁREA */}
                                      <td className="px-4 py-3 text-gray-700">
                                        {remitente.area}
                                      </td>

                                      <td className="px-4 py-3 text-center">
                                        <input
                                          type="checkbox"
                                          checked={remitente.activo}
                                          onChange={(e) => handleActivoRemitente(e, remitente.remId)}
                                          className="
                                          w-5
                                          h-5
                                          rounded
                                          accent-[#8B1538]
                                          cursor-pointer
                                          "
                                        />
                                      </td>

                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td
                                      colSpan={5}
                                      className="text-center py-6 text-gray-400"
                                    >
                                      Sin remitentes internos registrados
                                    </td>
                                  </tr>
                                )}
                              </tbody>

                            </table>
                          </div>

                          {/* MODAL REMITENTE INTERNO */}
                          <AnimatePresence>
                            {mostrarModalRemitenteInterno && (
                              <motion.div
                                className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                              >
                                <motion.div
                                  className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl"
                                  initial={{ scale: 0.9, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0.9, opacity: 0 }}
                                >

                                  {/* HEADER */}
                                  <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
                                    <h2 className="text-xl font-semibold text-gray-800">
                                      {modoEdicion
                                        ? "Editar remitente interno"
                                        : "Agregar remitente interno"}
                                    </h2>

                                    <button
                                      onClick={() => setMostrarModalRemitenteInterno(false)}
                                      className="w-8 h-8 flex items-center justify-center rounded-full bg-[#8B1538] text-white hover:bg-[#74112F] transition"
                                    >
                                      <Minus size={16} />
                                    </button>
                                  </div>

                                  {/* CONTENIDO */}
                                  <div className="p-6 overflow-visible">

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                      {/* NOMBRE */}
                                      <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Nombre completo
                                        </label>

                                        <input
                                          type="text"
                                          value={remitenteEditando.name}
                                          onChange={(e) =>
                                            setRemitenteEditando({
                                              ...remitenteEditando,
                                              name: e.target.value,
                                            })
                                          }
                                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#8B1538]/30 outline-none"
                                          placeholder="Ingrese nombre completo"
                                        />
                                      </div>

                                      {/* CARGO */}
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Cargo
                                        </label>

                                        <input
                                          type="text"
                                          value={remitenteEditando.cargo}
                                          onChange={(e) =>
                                            setRemitenteEditando({
                                              ...remitenteEditando,
                                              cargo: e.target.value,
                                            })
                                          }
                                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#8B1538]/30 outline-none"
                                          placeholder="Ingrese cargo"
                                        />
                                      </div>

                                      {/* ÁREA */}
                                      <div className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Área de adscripción
                                        </label>

                                        <div className="flex items-center border rounded-lg px-3">
                                          <Search size={16} className="text-gray-400" />
                                          <input
                                            type="text"
                                            value={busquedaAreaInterno}
                                            onChange={(e) => {
                                              setBusquedaAreaInterno(e.target.value);
                                              setRemitenteEditando({
                                                ...remitenteEditando,
                                                area: e.target.value,
                                              });
                                            }}
                                            onFocus={() => setMostrarOpcionesArea(true)}
                                            className="w-full px-2 py-2 outline-none text-sm"
                                            placeholder="Buscar y seleccionar área"
                                          />
                                        </div>

                                        {mostrarOpcionesArea && (
                                          <div 
                                            className="absolute bg-white border w-full mt-1 max-h-40 overflow-y-auto z-50 rounded-lg shadow-lg"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            {areasFiltradasInterno.length > 0 ? (
                                              areasFiltradasInterno.map((area) => (
                                                <div
                                                  key={area.clave || area._id}
                                                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                                  onClick={() => {
                                                    setRemitenteEditando({
                                                      ...remitenteEditando,
                                                      area: area.nombre,
                                                    });
                                                    setBusquedaAreaInterno(area.nombre);
                                                    setMostrarOpcionesArea(false);
                                                  }}
                                                >
                                                  {area.nombre}
                                                </div>
                                              ))
                                            ) : (
                                              <div className="px-3 py-2 text-gray-400 text-sm">
                                                Sin resultados
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>

                                    </div>
                                  </div>

                                  {/* FOOTER */}
                                  <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
                                    <button
                                      onClick={() => setMostrarModalRemitenteInterno(false)}
                                      className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition"
                                    >
                                      Cancelar
                                    </button>

                                    <button
                                      onClick={() => handleSaveRemitente("Interno")}
                                      className="px-5 py-2 rounded-lg bg-[#8B1538] hover:bg-[#74112F] text-white shadow-md transition"
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

                    {/* TAB REM EXTERNOS */}
                    {configTab === "remitentesExternos" && (

                      <motion.div
                        key="remitentesExternos"
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -15 }}
                        transition={{ duration: 0.2 }}
                      >

                        <div className="space-y-4">

                          {/* HEADER */}
                          <div className="flex items-center gap-2 mb-2">

                            <div className="relative group inline-flex">
                              {/* Botón añadir */}
                              <button
                                onClick={() => {
                                  setModoEdicion(false);

                                  setRemitenteEditando({
                                    id: null,
                                    name: "",
                                    cargo: "",
                                    area: "",
                                    dependencia: "",
                                    tipo: "Externo",
                                    activo: true,
                                  });

                                  setMostrarModalRemitenteExterno(true);
                                }}
                                title="Agregar remitente"
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
                                value={busquedaExterno}
                                onChange={(e) => setBusquedaExterno(e.target.value)}
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
                                placeholder="Buscar remitente..."
                              />
                            </div>

                          </div>

                          {/* TABLA */}
                          <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="w-full text-sm">

                              <thead className="bg-gradient-to-r from-[#8B1538] to-[#6E0E2C] text-white">
                                <tr>
                                  <th className="px-4 py-3 text-left">Editar</th>
                                  <th className="px-4 py-3 text-left">Nombre completo</th>
                                  <th className="px-4 py-3 text-left">Cargo</th>
                                  <th className="px-4 py-3 text-left">Área de adscripción</th>
                                  <th className="px-4 py-3 text-center">Dependencia</th>
                                  <th className="px-4 py-3 text-center">Activo</th>
                                </tr>
                              </thead>

                              <tbody>
                                {remitentesExternosFiltrados.length > 0 ? (
                                  remitentesExternosFiltrados.map((remitenteExt) => (
                                    <tr
                                      key={remitenteExt.id || remitenteExt._id}
                                      className="
                                      hover:bg-[#8B1538]/5
                                      transition
                                      duration-200
                                      border-b
                                      "
                                    >

                                      {/* EDITAR */}
                                      <td className="px-4 py-3">
                                        <button
                                          onClick={() => {

                                            setModoEdicion(true);

                                            setRemitenteEditando({
                                              id: remitenteExt.remId,
                                              name: remitenteExt.name || "",
                                              cargo: remitenteExt.cargo || "",
                                              area: remitenteExt.area || "",
                                              dependencia: remitenteExt.dependencia || "",
                                              tipo: "Externo",
                                              activo: remitenteExt.activo !== undefined ? remitenteExt.activo : true,
                                            });

                                            setMostrarModalRemitenteExterno(true);
                                          }}
                                          title="Editar remitente externo"
                                          className="p-2 rounded hover:bg-blue-100 text-gray-500 hover:text-blue-600 transition"
                                        >
                                          <Pencil size={16} />
                                        </button>
                                      </td>

                                      {/* NOMBRE */}
                                      <td className="px-4 py-3 text-gray-700">
                                        {remitenteExt.name}
                                      </td>

                                      {/* CARGO */}
                                      <td className="px-4 py-3 text-gray-700">
                                        {remitenteExt.cargo}
                                      </td>

                                      {/* ÁREA */}
                                      <td className="px-4 py-3 text-gray-700">
                                        {remitenteExt.area}
                                      </td>

                                      {/* DEPENDENCIA */}
                                      <td className="px-4 py-3 text-gray-700">
                                        {remitenteExt.dependencia}
                                      </td>

                                      <td className="px-4 py-3 text-center">
                                        <input
                                          type="checkbox"
                                          checked={remitenteExt.activo}
                                          onChange={(e) => handleActivoRemitente(e, remitenteExt.remId)}
                                          className="
                                          w-5
                                          h-5
                                          rounded
                                          accent-[#8B1538]
                                          cursor-pointer
                                          "
                                        />
                                      </td>

                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td
                                      colSpan={6}
                                      className="text-center py-6 text-gray-400"
                                    >
                                      Sin remitentes externos registrados
                                    </td>
                                  </tr>
                                )}
                              </tbody>

                            </table>
                          </div>

                          {/* MODAL REMITENTE EXTERNO */}
                          <AnimatePresence>
                            {mostrarModalRemitenteExterno && (
                              <motion.div
                                className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                              >
                                <motion.div
                                  className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
                                  initial={{ scale: 0.9, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0.9, opacity: 0 }}
                                >

                                  {/* HEADER */}
                                  <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
                                    <h2 className="text-xl font-semibold text-gray-800">
                                      {modoEdicion
                                        ? "Editar remitente externo"
                                        : "Agregar remitente externo"}
                                    </h2>

                                    <button
                                      onClick={() => setMostrarModalRemitenteExterno(false)}
                                      className="w-8 h-8 flex items-center justify-center rounded-full bg-[#8B1538] text-white hover:bg-[#74112F] transition"
                                    >
                                      <Minus size={16} />
                                    </button>
                                  </div>

                                  {/* CONTENIDO */}
                                  <div className="p-6">

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                      {/* NOMBRE */}
                                      <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Nombre completo
                                        </label>

                                        <input
                                          type="text"
                                          value={remitenteEditando.name}
                                          onChange={(e) =>
                                            setRemitenteEditando({
                                              ...remitenteEditando,
                                              name: e.target.value,
                                            })
                                          }
                                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#8B1538]/30 outline-none"
                                          placeholder="Ingrese nombre completo"
                                        />
                                      </div>

                                      {/* CARGO */}
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Cargo
                                        </label>

                                        <input
                                          type="text"
                                          value={remitenteEditando.cargo}
                                          onChange={(e) =>
                                            setRemitenteEditando({
                                              ...remitenteEditando,
                                              cargo: e.target.value,
                                            })
                                          }
                                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#8B1538]/30 outline-none"
                                          placeholder="Ingrese cargo"
                                        />
                                      </div>

                                      {/* ÁREA */}
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Área de adscripción
                                        </label>

                                        <input
                                          type="text"
                                          value={remitenteEditando.area}
                                          onChange={(e) =>
                                            setRemitenteEditando({
                                              ...remitenteEditando,
                                              area: e.target.value,
                                            })
                                          }
                                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#8B1538]/30 outline-none"
                                          placeholder="Ingrese área"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Dependencia
                                        </label>

                                        <input
                                          type="text"
                                          value={remitenteEditando.dependencia}
                                          onChange={(e) =>
                                            setRemitenteEditando({
                                              ...remitenteEditando,
                                              dependencia: e.target.value,
                                            })
                                          }
                                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#8B1538]/30 outline-none"
                                          placeholder="Ingrese dependencia"
                                        />
                                      </div>

                                    </div>
                                  </div>

                                  {/* FOOTER */}
                                  <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
                                    <button
                                      onClick={() => setMostrarModalRemitenteExterno(false)}
                                      className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition"
                                    >
                                      Cancelar
                                    </button>

                                    <button
                                      onClick={() => handleSaveRemitente("Externo")}
                                      className="px-5 py-2 rounded-lg bg-[#8B1538] hover:bg-[#74112F] text-white shadow-md transition"
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

                    {/* TAB TIPO DOCUMENTO */}
                    {configTab === "tipoDocumento" && (

                      <motion.div
                        key="tipoDocumento"
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -15 }}
                        transition={{ duration: 0.2 }}
                      >

                        <div className="space-y-4">

                          {/* HEADER */}
                          <div className="flex items-center gap-2 mb-2">
                            <div className="relative group inline-flex">
                              {/* AÑADIR */}
                              <button
                                onClick={() => {

                                  setModoEdicion(false);

                                  setTipoDocumentoEditando({
                                    id: null,
                                    nombre: "",
                                    descripcion: "",
                                    activo: true
                                  });

                                  setMostrarModalTipoDocumento(true);
                                }}
                                title="Agregar tipo de documento"
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
                              <Search size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                              <input
                                value={busquedaTipoDocumento}
                                onChange={(e) =>
                                  setBusquedaTipoDocumento(e.target.value)
                                }
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
                                placeholder="Buscar tipo de documento..."
                              />
                            </div>

                          </div>

                          {/* 🧾 TABLA */}
                          <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="w-full text-sm">

                              <thead className="bg-[#8B1538] text-white">
                                <tr>
                                  <th className="px-4 py-3 text-left">Editar</th>
                                  <th className="px-4 py-3 text-left">Nombre</th>
                                  <th className="px-4 py-3 text-center">Activo</th>
                                </tr>
                              </thead>

                              <tbody>
                                {tiposDocumentoFiltrados.length > 0 ? (
                                  tiposDocumentoFiltrados.map((tipo) => (
                                    <tr
                                      key={tipo.id || tipo._id}
                                      className="
                                      hover:bg-[#8B1538]/5
                                      transition
                                      duration-200
                                      border-b
                                      "
                                    >

                                      {/* EDITAR */}
                                      <td className="px-4 py-3">
                                        <button
                                          onClick={() => {

                                            setModoEdicion(true);

                                            setTipoDocumentoEditando({
                                              id: tipo.id || tipo._id,
                                              nombre: tipo.tipo || "",
                                              descripcion: tipo.descripcion || "",
                                              activo: tipo.activo
                                            });

                                            setMostrarModalTipoDocumento(true);
                                          }}
                                          title="Editar tipo de documento"
                                          className="p-2 rounded hover:bg-blue-100 text-gray-500 hover:text-blue-600 transition"
                                        >
                                          <Pencil size={16} />
                                        </button>
                                      </td>

                                      {/* NOMBRE */}
                                      <td className="px-4 py-3 text-gray-700">
                                        {tipo.tipo}
                                      </td>

                                    <td className="px-4 py-2 text-gray-700 text-center">
                                      <input
                                        type="checkbox"
                                        checked={tipo.activo}
                                        onChange={(e) => {
                                          handleActivoTipoDocumento(e, tipo.id || tipo._id);
                                        }}
                                        className="
                                        w-5
                                        h-5
                                        rounded
                                        accent-[#8B1538]
                                        cursor-pointer
                                        "
                                      />
                                    </td>

                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td
                                      colSpan={3}
                                      className="text-center py-6 text-gray-400"
                                    >
                                      Sin tipos de documento registrados
                                    </td>
                                  </tr>
                                )}
                              </tbody>

                            </table>
                          </div>

                          {/* 🪟 MODAL */}
                          <AnimatePresence>
                            {mostrarModalTipoDocumento && (
                              <motion.div
                                className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                              >

                                <motion.div
                                  className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
                                  initial={{ scale: 0.9, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0.9, opacity: 0 }}
                                >

                                  {/* HEADER */}
                                  <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
                                    <h2 className="text-xl font-semibold text-gray-800">
                                      {modoEdicion
                                        ? "Editar tipo de documento"
                                        : "Agregar tipo de documento"}
                                    </h2>

                                    <button
                                      onClick={() =>
                                        setMostrarModalTipoDocumento(false)
                                      }
                                      className="w-8 h-8 flex items-center justify-center rounded-full bg-[#8B1538] text-white hover:bg-[#74112F] transition"
                                    >
                                      <Minus size={16} />
                                    </button>
                                  </div>

                                  {/* CONTENIDO */}
                                  <div className="p-6">

                                    <div className="space-y-5">

                                      {/* NOMBRE */}
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Nombre
                                        </label>

                                        <input
                                          type="text"
                                          value={tipoDocumentoEditando.nombre}
                                          onChange={(e) =>
                                            setTipoDocumentoEditando({
                                              ...tipoDocumentoEditando,
                                              nombre: e.target.value,
                                            })
                                          }
                                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#8B1538]/30 outline-none"
                                          placeholder="Ingrese nombre"
                                        />
                                      </div>

                                      {/* DESCRIPCIÓN */}
                                      {/* <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Descripción del tipo de documento
                                        </label>

                                        <textarea
                                          rows={5}
                                          value={tipoDocumentoEditando.descripcion}
                                          onChange={(e) =>
                                            setTipoDocumentoEditando({
                                              ...tipoDocumentoEditando,
                                              descripcion: e.target.value,
                                            })
                                          }
                                          className="w-full border border-gray-300 rounded-lg px-3 py-2 resize-none focus:ring-2 focus:ring-[#8B1538]/30 outline-none"
                                          placeholder="Ingrese descripción"
                                        />
                                      </div> */}

                                    </div>

                                  </div>

                                  {/* FOOTER */}
                                  <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">

                                    <button
                                      onClick={() =>
                                        setMostrarModalTipoDocumento(false)
                                      }
                                      className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition"
                                    >
                                      Cancelar
                                    </button>

                                    <button
                                      onClick={handleSaveTipoDocumento}
                                      className="px-5 py-2 rounded-lg bg-[#8B1538] hover:bg-[#74112F] text-white shadow-md transition"
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

                    {/* TAB TEMA PRINCIPAL */}
                    {configTab === "temaPrincipal" && (

                      <motion.div
                        key="temaPrincipal"
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -15 }}
                        transition={{ duration: 0.2 }}
                      >

                        <div className="space-y-4">

                          {/* HEADER */}
                          <div className="flex items-center gap-2 mb-2">

                            <div className="relative group inline-flex">
                              {/* AÑADIR */}
                              <button
                                onClick={() => {

                                  setModoEdicion(false);

                                  setTemaPrincipalEditando({
                                    id: null,
                                    descripcion: "",
                                    activo: true,
                                  });

                                  setMostrarModalTemaPrincipal(true);
                                }}
                                title="Agregar asunto"
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
                              <Search
                                  size={18}
                                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                              />

                              <input
                                value={busquedaTemaPrincipal}
                                onChange={(e) =>
                                  setBusquedaTemaPrincipal(e.target.value)
                                }
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
                                placeholder="Buscar tema principal..."
                              />
                            </div>

                          </div>

                          {/* TABLA */}
                          <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="w-full text-sm border border-gray-200">

                              <thead className="bg-gradient-to-r from-[#8B1538] to-[#6E0E2C] text-white">
                                <tr>
                                  <th className="px-4 py-3 text-left">Editar</th>
                                  <th className="px-4 py-3 text-left">
                                    Descripción del asunto
                                  </th>

                                  <th className="px-4 py-3 text-center">
                                    Activo
                                  </th>
                                </tr>
                              </thead>

                              <tbody>
                                {temasPrincipalesFiltrados.length > 0 ? (
                                  temasPrincipalesFiltrados.map((tema) => (
                                    <tr
                                      key={tema.id || tema._id}
                                      className="
                                      border-b
                                      hover:bg-[#8B1538]/5
                                      transition
                                      duration-200
                                      "
                                    >

                                      {/* EDITAR */}
                                      <td className="px-4 py-3">
                                        <button
                                          onClick={() => {

                                            setModoEdicion(true);

                                            setTemaPrincipalEditando({
                                              id: tema.id || tema._id,
                                              nombre: tema.nombre || "",
                                              descripcion: tema.descripcion || "",
                                              activo: tema.activo !== undefined ? tema.activo : true,
                                            });

                                            setMostrarModalTemaPrincipal(true);
                                          }}
                                          title="Editar asunto"
                                          className="p-2 rounded hover:bg-blue-100 text-gray-500 hover:text-blue-600 transition"
                                        >
                                          <Pencil size={16} />
                                        </button>
                                      </td>
                                      {/* DESCRIPCIÓN */}
                                      <td className="px-4 py-3 text-gray-700">
                                        {tema.descripcion}
                                      </td>

                                    <td className="px-4 py-2 text-gray-700 text-center">
                                      <input
                                        type="checkbox"
                                        checked={tema.activo}
                                        onChange={(e) => {
                                          handleActivoTemaPrincipal(e, tema.id || tema._id);
                                        }}
                                        className="
                                        w-5
                                        h-5
                                        rounded
                                        accent-[#8B1538]
                                        cursor-pointer
                                        "
                                      />
                                    </td>

                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td
                                      colSpan={4}
                                      className="text-center py-6 text-gray-400"
                                    >
                                      Sin temas principales registrados
                                    </td>
                                  </tr>
                                )}
                              </tbody>

                            </table>
                          </div>

                          {/* 🪟 MODAL */}
                          <AnimatePresence>
                            {mostrarModalTemaPrincipal && (
                              <motion.div
                                className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                              >

                                <motion.div
                                  className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
                                  initial={{ scale: 0.9, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0.9, opacity: 0 }}
                                >

                                  {/* HEADER */}
                                  <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">

                                    <h2 className="text-xl font-semibold text-gray-800">
                                      {modoEdicion
                                        ? "Editar asunto del documento"
                                        : "Agregar asunto del documento"}
                                    </h2>

                                    <button
                                      onClick={() =>
                                        setMostrarModalTemaPrincipal(false)
                                      }
                                      className="w-8 h-8 flex items-center justify-center rounded-full bg-[#8B1538] text-white hover:bg-[#74112F] transition"
                                    >
                                      <Minus size={16} />
                                    </button>

                                  </div>

                                  {/* CONTENIDO */}
                                  <div className="p-6">

                                    <div className="space-y-5">

                                      {/* DESCRIPCIÓN */}
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Descripción del asunto del documento
                                        </label>

                                        <textarea
                                          rows={5}
                                          value={temaPrincipalEditando.descripcion}
                                          onChange={(e) =>
                                            setTemaPrincipalEditando({
                                              ...temaPrincipalEditando,
                                              descripcion: e.target.value,
                                            })
                                          }
                                          className="w-full border border-gray-300 rounded-lg px-3 py-2 resize-none focus:ring-2 focus:ring-[#8B1538]/30 outline-none"
                                          placeholder="Ingrese descripción"
                                        />
                                      </div>

                                    </div>

                                  </div>

                                  {/* FOOTER */}
                                  <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">

                                    <button
                                      onClick={() =>
                                        setMostrarModalTemaPrincipal(false)
                                      }
                                      className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition"
                                    >
                                      Cancelar
                                    </button>

                                    <button
                                      onClick={handleSaveTemaPrincipal}
                                      className="px-5 py-2 rounded-lg bg-[#8B1538] hover:bg-[#74112F] text-white shadow-md transition"
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

                    {configTab === "Instrucciones" && (

                      <motion.div
                        key="Instrucciones"
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -15 }}
                        transition={{ duration: 0.2 }}
                      >

                        <div className="space-y-4">

                          {/* HEADER */}
                          <div className="flex items-center gap-2 mb-2">
                            <div className="relative group inline-flex">
                              {/* AÑADIR */}
                              <button
                                onClick={() => {

                                  setModoEdicion(false);

                                  setInstruccionEditando({
                                    id: null,
                                    descripcion: "",
                                    activo: true,
                                  });

                                  setMostrarModalInstruccion(true);
                                }}
                                title="Agregar instrucción"
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
                              <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                              />

                              <input
                                value={busquedaInstruccion}
                                onChange={(e) =>
                                  setBusquedaInstruccion(e.target.value)
                                }
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
                                placeholder="Buscar instrucción..."
                              />
                            </div>

                          </div>

                          {/* TABLA */}
                          <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="w-full text-sm">

                              <thead className="bg-gradient-to-r from-[#8B1538] to-[#6E0E2C] text-white">
                                <tr>
                                  <th className="px-4 py-3 text-left">Editar</th>

                                  <th className="px-4 py-3 text-left">
                                    Instrucción
                                  </th>


                                  <th className="px-4 py-3 text-center">
                                    Activo
                                  </th>
                                </tr>
                              </thead>

                              <tbody>
                                {instruccionesFiltrados.length > 0 ? (
                                  instruccionesFiltrados.map((instruccion) => (
                                    <tr
                                      key={instruccion.id || instruccion._id}
                                      className="
                                      border-b
                                      hover:bg-[#8B1538]/5
                                      transition
                                      duration-200
                                      "
                                    >

                                      {/* EDITAR */}
                                      <td className="px-4 py-3">
                                        <button
                                          onClick={() => {

                                            setModoEdicion(true);

                                            setInstruccionEditando({
                                              id: instruccion.id || instruccion._id,
                                              descripcion: instruccion.descripcion || "",
                                              activo: instruccion.activo !== undefined ? instruccion.activo : true,
                                            });

                                            setMostrarModalInstruccion(true);
                                          }}
                                          title="Editar instrucción"
                                          className="p-2 rounded hover:bg-blue-100 text-gray-500 hover:text-blue-600 transition"
                                        >
                                          <Pencil size={16} />
                                        </button>
                                      </td>

                                      {/* DESCRIPCIÓN */}
                                      <td className="px-4 py-3 text-gray-700">
                                        {instruccion.descripcion}
                                      </td>

                                    <td className="px-4 py-2 text-gray-700 text-center">
                                      <input
                                        type="checkbox"
                                        checked={instruccion.activo}
                                        onChange={(e) => {
                                          handleActivoInstruccion(e, instruccion.id || instruccion._id);
                                        }}
                                        className="
                                        w-5
                                        h-5
                                        rounded
                                        accent-[#8B1538]
                                        cursor-pointer
                                        "
                                      />
                                    </td>

                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td
                                      colSpan={3}
                                      className="text-center py-6 text-gray-400"
                                    >
                                      Sin instrucciones registradas
                                    </td>
                                  </tr>
                                )}
                              </tbody>

                            </table>
                          </div>

                          {/* 🪟 MODAL */}
                          <AnimatePresence>
                            {mostrarModalInstruccion && (
                              <motion.div
                                className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                              >

                                <motion.div
                                  className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
                                  initial={{ scale: 0.9, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0.9, opacity: 0 }}
                                >

                                  {/* HEADER */}
                                  <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">

                                    <h2 className="text-xl font-semibold text-gray-800">
                                      {modoEdicion
                                        ? "Editar instruccion"
                                        : "Agregar instruccion"}
                                    </h2>

                                    <button
                                      onClick={() =>
                                        setMostrarModalInstruccion(false)
                                      }
                                      className="w-8 h-8 flex items-center justify-center rounded-full bg-[#8B1538] text-white hover:bg-[#74112F] transition"
                                    >
                                      <Minus size={16} />
                                    </button>

                                  </div>

                                  {/* CONTENIDO */}
                                  <div className="p-6">

                                    <div className="space-y-5">

                                      {/* 📝 DESCRIPCIÓN */}
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Descripción de la instrucción
                                        </label>

                                        <textarea
                                          rows={5}
                                          value={instruccionEditando.descripcion}
                                          onChange={(e) =>
                                            setInstruccionEditando({
                                              ...instruccionEditando,
                                              descripcion: e.target.value,
                                            })
                                          }
                                          className="w-full border border-gray-300 rounded-lg px-3 py-2 resize-none focus:ring-2 focus:ring-[#8B1538]/30 outline-none"
                                          placeholder="Ingrese descripción"
                                        />
                                      </div>

                                      {/* ✅ ACTIVO */}
                                      <div className="flex items-center gap-3">

                                        <input
                                          type="checkbox"
                                          checked={instruccionEditando.activo}
                                          onChange={(e) =>
                                            setInstruccionEditando({
                                              ...instruccionEditando,
                                              activo: e.target.checked,
                                            })
                                          }
                                          className="
                                          w-5
                                          h-5
                                          rounded
                                          accent-[#8B1538]
                                          cursor-pointer
                                          "
                                        />

                                        <label className="text-sm font-medium text-gray-700">
                                          Activo
                                        </label>

                                      </div>

                                    </div>

                                  </div>

                                  {/* FOOTER */}
                                  <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">

                                    <button
                                      onClick={() =>
                                        setMostrarModalInstruccion(false)
                                      }
                                      className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition"
                                    >
                                      Cancelar
                                    </button>

                                    <button
                                      onClick={handleSaveInstruccion}
                                      className="px-5 py-2 rounded-lg bg-[#8B1538] hover:bg-[#74112F] text-white shadow-md transition"
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
                  </AnimatePresence>

                </div>

              </div>

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>
    </div>
    
  );
}