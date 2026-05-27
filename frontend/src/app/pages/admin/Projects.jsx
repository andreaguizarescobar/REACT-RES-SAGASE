import { useState } from "react";
import {
  PieChart,
  Route,     
  Coins,     
  Boxes,
  ListChecks,
  KeyRound,
  Info,
  Clock,
  List,
  FileText,
  FileUp,
  Settings,
  FileOutput,
  LogOut,
  Mail,
  Undo,
  Minus,
  Search,
  Trash2,
  Pencil,
  History,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";

export function Projects() {
  const [proyectos, setProyectos] = useState([
    {
      id: 1,
      nombre: "Sistema Automatizado de Gestión de Archivos",
      clave: "SAGA_AGN",
      fecha: "2021-04-12",
    },
    // {
    //   id: 2,
    //   nombre: "Portal Educativo",
    //   clave: "PORTAL_EDU",
    //   fecha: "2023-01-10",
    // },
  ]);

  const [nuevo, setNuevo] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [tab, setTab] = useState("reportes");

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
  const [fondosTablasAdicionales, setMaterialesAdicionales] = useState([]);

  const [busquedaMaterial, setBusquedaMaterial] = useState("");
  const [mostrarOpcionesMaterial, setMostrarOpcionesMaterial] = useState(false);
  const fondosTablasFiltrados = fondosTablasAdicionales.filter((m) =>
    m.label.toLowerCase().includes(busquedaMaterial.toLowerCase())
  );

   const [fondosTablas, setMateriales] = useState([
      {
        id: 1,
        nombre: "CD",
        abreviatura: "Contiene información digital del asunto",
        direccion: "Víctor Manuel Enríquez Paniagua",
        correo: "example@gmail.com",
        telefono: "1234567890",
      },
    ]);

  const [busquedaMaterialAdicional, setBusquedaMaterialAdicional] = useState("");
  
    const fondosFiltrados = fondosTablas.filter((m) =>
      m.nombre.toLowerCase().includes(busquedaMaterialAdicional.toLowerCase()) ||
      m.abreviatura.toLowerCase().includes(busquedaMaterialAdicional.toLowerCase()) ||
      m.direccion.toLowerCase().includes(busquedaMaterialAdicional.toLowerCase()) ||
      m.correo.toLowerCase().includes(busquedaMaterialAdicional.toLowerCase()) ||
      m.telefono.toLowerCase().includes(busquedaMaterialAdicional.toLowerCase())
    );
  
  const [mostrarModalFondo, setMostrarModalFondo] = useState(false);
  
  const [modoEdicion, setModoEdicion] = useState(false);

  const [fondoEditando, setFondoEditando] = useState({
    id: null,
    nombre: "",
    abreviatura: "",
    direccion: "",
    correo: "",
    telefono: "",
    encabezado: "",
    pie: "",
    background: "",
  });

  const [mostrarModalTipoDocumento, setMostrarModalTipoDocumento] = useState(false);
  const [busquedaTipoDocumento, setBusquedaTipoDocumento] = useState("");

  const [tipoDocumentoEditando, setTipoDocumentoEditando] = useState({
    id: null,
    nombre: "",
    descripcion: "",
  });


  const [busquedaTemaPrincipal, setBusquedaTemaPrincipal] = useState("");

  const [mostrarModalTemaPrincipal, setMostrarModalTemaPrincipal] = useState(false);

  const [temaPrincipalEditando, setTemaPrincipalEditando] = useState({
    id: null,
    nombre: "",
    descripcion: "",
    validacion: true,
  });

/* 🧍 REMITENTES INTERNOS */
const remitentesInternosMock = [
  {
    id: 1,
    nombreCompleto: "Juan Carlos Pérez López",
    cargo: "Jefe de Departamento",
    areaAdscripcion: "Recursos Humanos",
  },
  {
    id: 2,
    nombreCompleto: "María Fernanda Ruiz",
    cargo: "Auxiliar Administrativo",
    areaAdscripcion: "Secretaría General",
  },
  {
    id: 3,
    nombreCompleto: "Luis Alberto Sánchez",
    cargo: "Director",
    areaAdscripcion: "Tecnologías de la Información",
  },
];

/* 🌎 REMITENTES EXTERNOS */
const remitentesExternosMock = [
  {
    id: 1,
    nombreCompleto: "Ana Sofía Martínez",
    cargo: "Gerente General",
    areaAdscripcion: "Empresa XYZ",
  },
  {
    id: 2,
    nombreCompleto: "Carlos Eduardo Ramírez",
    cargo: "Representante Legal",
    areaAdscripcion: "Gobierno del Estado",
  },
  {
    id: 3,
    nombreCompleto: "Patricia Hernández Gómez",
    cargo: "Coordinadora",
    areaAdscripcion: "Universidad Autónoma",
  },
];

/* 📄 TIPOS DE DOCUMENTO */
const tiposDocumentoMock = [
  {
    id: 1,
    nombre: "Oficio",
    descripcion:
      "Documento oficial utilizado para comunicación interna y externa.",
  },
  {
    id: 2,
    nombre: "Memorándum",
    descripcion:
      "Documento breve utilizado para comunicación interna.",
  },
  {
    id: 3,
    nombre: "Circular",
    descripcion:
      "Documento informativo dirigido a múltiples personas.",
  },
];

/* 🏷 TEMAS PRINCIPALES */
const temasPrincipalesMock = [
  {
    id: 1,
    nombre: "Recursos Humanos",
    descripcion:
      "Temas relacionados con personal, incidencias y administración.",
    validacion: true,
  },
  {
    id: 2,
    nombre: "Finanzas",
    descripcion:
      "Documentación relacionada con presupuestos y pagos.",
    validacion: false,
  },
  {
    id: 3,
    nombre: "Infraestructura",
    descripcion:
      "Temas relacionados con mantenimiento y equipamiento.",
    validacion: true,
  },
];


/* ============================= */
/* 🧠 STATES */
/* ============================= */

const [remitentesInternos, setRemitentesInternos] = useState(
  remitentesInternosMock
);

const [remitentesExternos, setRemitentesExternos] = useState(
  remitentesExternosMock
);

const [tiposDocumento, setTiposDocumento] = useState(
  tiposDocumentoMock
);

const [temasPrincipales, setTemasPrincipales] = useState(
  temasPrincipalesMock
);


/* ============================= */
/* 🔍 FILTRADOS */
/* ============================= */

const remitentesInternosFiltrados =
  remitentesInternos.filter((item) =>
    item.nombreCompleto
      .toLowerCase()
      .includes(busquedaMaterial.toLowerCase())
  );

const remitentesExternosFiltrados =
  remitentesExternos.filter((item) =>
    item.nombreCompleto
      .toLowerCase()
      .includes(busquedaMaterial.toLowerCase())
  );

const tiposDocumentoFiltrados =
  tiposDocumento.filter((item) =>
    item.nombre
      .toLowerCase()
      .includes(busquedaTipoDocumento.toLowerCase())
  );

const temasPrincipalesFiltrados =
  temasPrincipales.filter((item) =>
    item.nombre
      .toLowerCase()
      .includes(busquedaTemaPrincipal.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-xl mb-4 text-gray-800">Proyectos</h1>

      {/* Input */}
      {/* <div className="flex gap-2 mb-6">
        <input
          value={nuevo}
          onChange={(e) => setNuevo(e.target.value)}
          placeholder="Nuevo proyecto"
          className="border px-3 py-2 rounded w-100 text-sm"
        />
        <button
          onClick={agregarProyecto}
          className="bg-[#79142A] text-white px-4 rounded text-sm hover:opacity-90"
        >
          Agregar
        </button>
      </div> */}

      {/* GRID DE TARJETAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {proyectos.map((p) => (
          <div
            key={p.id}
            className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition"
          >
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

            {/* ICONOS */}
            <div className="relative">
              {/* BOTÓN / ÁREA HOVER */}
             <div className="flex gap-3 text-[#8B1538] mt-2 cursor-pointer">
                {/* <PieChart size={16} />
                <Route size={16} />
                <Coins size={16} /> */}

                {/* 👇 SOLO ESTE CONTROLA EL MENÚ */}
                <div className="relative group/boxes">
                  <Boxes size={16} />

                  {/* MENÚ FLOTANTE */}
                  <div
                    className="absolute left-1/2 -translate-x-1/2
                              bg-white border shadow-md rounded-md px-3 py-2
                              flex gap-3 text-[#8B1538]
                              opacity-0 group-hover/boxes:opacity-100
                              transition-all duration-200
                              pointer-events-none group-hover/boxes:pointer-events-auto
                              z-[9999]"
                  >
                    {/* <Clock className="hover:scale-110 cursor-pointer" size={16} />
                    <List className="hover:scale-110 cursor-pointer" size={16} />
                    <FileText className="hover:scale-110 cursor-pointer" size={16} /> */}

                    <div className="relative group/item">
                      <FileUp
                        size={16}
                        className="hover:scale-110 cursor-pointer"
                        onClick={() => setOpenModal(true)}
                      />

                      {/* Tooltip */}
                     <div
                        className="absolute -top-10 left-0
                        bg-gray-800 text-white text-[10px] px-2 py-1 rounded
                        opacity-0 group-hover/item:opacity-100
                        transition whitespace-nowrap
                        z-[99999] shadow-lg"
                      >
                        Carga de reportes

                        <div
                          className="absolute left-1 -bottom-1
                          w-2 h-2 bg-gray-800 rotate-45"
                        ></div>
                      </div>
                    </div>

                    <div className="relative group/settings">
                      <Settings
                        className="hover:scale-110 cursor-pointer"
                        size={16}
                        onClick={() => setOpenConfigModal(true)}
                      />

                      {/* Tooltip */}
                      <div
                        className="absolute -top-10 left-0
                        bg-gray-800 text-white text-[10px] px-2 py-1 rounded
                        opacity-0 group-hover/settings:opacity-100
                        transition whitespace-nowrap
                        z-[99999] shadow-lg"
                      >
                        Configurar catálogos

                        <div
                          className="absolute left-1 -bottom-1
                          w-2 h-2 bg-gray-800 rotate-45"
                        ></div>
                      </div>
                    </div>
                    {/* <FileOutput className="hover:scale-110 cursor-pointer" size={16} />
                    <LogOut className="hover:scale-110 cursor-pointer" size={16} />
                    <Mail className="hover:scale-110 cursor-pointer" size={16} />
                    <Undo className="hover:scale-110 cursor-pointer" size={16} /> */}
                  </div>
                </div>
{/* 
                <ListChecks size={16} />
                <KeyRound size={16} />
                <Info size={16} /> */}
              </div>

            </div>

          </div>
        ))}
      </div>
      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[420px]">

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
            <div className="p-4">

              {/* REPORTES */}
              {tab === "reportes" && (
                <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition">
                  <FileUp size={28} className="text-[#8B1538] mb-2" />
                  <p className="text-sm text-gray-600">Cargar Reporte</p>
                  <input type="file" className="hidden" />
                </div>
              )}

              {/* IMÁGENES */}
              {tab === "imagenes" && (
                <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition">
                  <FileUp size={28} className="text-[#8B1538] mb-2" />
                  <p className="text-sm text-gray-600">Cargar Imagen</p>
                  <input type="file" accept="image/*" className="hidden" />
                </div>
              )}

            </div>

            {/* FOOTER */}
            <div className="flex justify-end gap-2 px-4 pb-4">
              <button
                onClick={() => setOpenModal(false)}
                className="px-3 py-1 text-sm border rounded"
              >
                Cancelar
              </button>
              <button className="px-3 py-1 text-sm bg-[#8B1538] text-white rounded">
                Subir
              </button>
            </div>

          </div>
        </div>
      )}

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
                      label: "Tema principal",
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
                        {/* 🔥 HEADER */}
                        <div className="flex items-center gap-2 mb-2">
  
                          {/* Botón añadir */}
                          <button
                            onClick={() => {
                              setModoEdicion(false);

                              setFondoEditando({
                                id: null,
                                nombre: "",
                                abreviatura: "",
                                direccion: "",
                                correo: "",
                                telefono: "",
                                encabezado: "",
                                pie: "",
                                background: "",
                              });

                              setMostrarModalFondo(true);
                            }}
                            className="bg-[#8B1538] text-white px-4 py-2 rounded shadow hover:opacity-90"
                          >
                            Añadir fondo
                          </button>
  
                          {/* 🔍 Buscador */}
                          <div className="flex-1 flex items-center border rounded px-2">
                            <Search size={16} className="text-gray-400" />
                            <input
                              value={busquedaMaterial}
                              onChange={(e) => setBusquedaMaterial(e.target.value)}
                              className="w-full px-2 py-2 outline-none text-sm"
                              placeholder="Buscar fondosTabla..."
                            />
                          </div>
  
                        </div>
  
                        {/* 🧾 TABLA */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm border border-gray-200">
  
                            <thead className="bg-[#8B1538] text-white">
                              <tr>
                                <th className="px-4 py-2 text-left">Editar</th>
                                <th className="px-4 py-2 text-left">Nombre Fondo</th>
                                <th className="px-4 py-2 text-left">Abreviatura</th>
                                <th className="px-4 py-2 text-left">Dirección</th>
                                <th className="px-4 py-2 text-left">Correo</th>
                                <th className="px-4 py-2 text-left">Teléfono</th>
                              </tr>
                            </thead>
  
                            <tbody>
                              {fondosFiltrados.length > 0 ? (
                                fondosFiltrados.map((fondosTabla) => (
                                  <tr key={fondosTabla.id} className="border-t hover:bg-gray-50">
  
                                    {/* 🗑 ELIMINAR */}
                                    <td className="px-4 py-2">
                                      <button
                                        onClick={() => {

                                          setModoEdicion(true);

                                          setFondoEditando({
                                            id: fondosTabla.id,
                                            nombre: fondosTabla.nombre || "",
                                            abreviatura: fondosTabla.abreviatura || "",
                                            direccion: fondosTabla.direccion || "",
                                            correo: "correo@ejemplo.com",
                                            telefono: "3111234567",
                                            encabezado: "",
                                            pie: "",
                                            background: "",
                                          });

                                          setMostrarModalFondo(true);
                                        }}
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
                                      {fondosTabla.direccion}
                                    </td>
  
                                    <td className="px-4 py-2 text-gray-700">
                                      {fondosTabla.correo}
                                    </td>

                                    <td className="px-4 py-2 text-gray-700">
                                      {fondosTabla.telefono}
                                    </td>

                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={4} className="text-center py-4 text-gray-400">
                                    Sin fondosTablas adicionales
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
                                    {modoEdicion ? "Editar registro" : "Agregar registro"}
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
                                          onChange={(e) =>
                                            setFondoEditando({
                                              ...fondoEditando,
                                              nombre: e.target.value,
                                            })
                                          }
                                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
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
                                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#8B1538]/30 outline-none"
                                          placeholder="Ingrese abreviatura"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Dirección
                                        </label>

                                        <input
                                          type="text"
                                          value={fondoEditando.direccion}
                                            onChange={(e) =>
                                              setFondoEditando({
                                                ...fondoEditando,
                                                direccion: e.target.value,
                                              })
                                            }
                                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#8B1538]/30 outline-none"
                                          placeholder="Ingrese dirección"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Correo
                                        </label>

                                        <input
                                          type="email"
                                          value={fondoEditando.correo}
                                            onChange={(e) =>
                                              setFondoEditando({
                                                ...fondoEditando,
                                                correo: e.target.value,
                                              })
                                            }
                                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#8B1538]/30 outline-none"
                                          placeholder="Ingrese correo"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Teléfono
                                        </label>

                                        <input
                                          type="text"
                                          value={fondoEditando.telefono}
                                          onChange={(e) =>
                                            setFondoEditando({
                                              ...fondoEditando,
                                              telefono: e.target.value,
                                            })
                                          }
                                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#8B1538]/30 outline-none"
                                          placeholder="Ingrese teléfono"
                                        />
                                      </div>
                                    </div>

                                    {/* COLUMNA DERECHA */}
                                    <div className="space-y-5">

                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Imagen encabezado
                                        </label>

                                        <textarea
                                          value={fondoEditando.encabezado}
                                            onChange={(e) =>
                                              setFondoEditando({
                                                ...fondoEditando,
                                                encabezado: e.target.value,
                                              })
                                            }
                                          rows={3}
                                          className="w-full border border-gray-300 rounded-lg px-3 py-2 resize-none focus:ring-2 focus:ring-[#8B1538]/30 outline-none"
                                          placeholder="Ingrese URL o ruta de la imagen"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Imagen pie de página
                                        </label>

                                        <textarea
                                          value={fondoEditando.pie}
                                          onChange={(e) =>
                                            setFondoEditando({
                                              ...fondoEditando,
                                              pie: e.target.value,
                                            })
                                          }
                                          rows={3}
                                          className="w-full border border-gray-300 rounded-lg px-3 py-2 resize-none focus:ring-2 focus:ring-[#8B1538]/30 outline-none"
                                          placeholder="Ingrese URL o ruta de la imagen"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Background de reporte
                                        </label>

                                        <textarea
                                          value={fondoEditando.background}
                                            onChange={(e) =>
                                              setFondoEditando({
                                                ...fondoEditando,
                                                background: e.target.value,
                                              })
                                            }
                                          rows={4}
                                          className="w-full border border-gray-300 rounded-lg px-3 py-2 resize-none focus:ring-2 focus:ring-[#8B1538]/30 outline-none"
                                          placeholder="Ingrese URL o configuración"
                                        />
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
                        key="fondo"
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -15 }}
                        transition={{ duration: 0.2 }}
                      >

                        <div className="space-y-4">

                          {/* 🔥 HEADER */}
                          <div className="flex items-center gap-2 mb-2">

                            {/* Botón añadir */}
                            <button
                              onClick={() => {
                                setModoEdicion(false);

                                setFondoEditando({
                                  id: null,
                                  nombreCompleto: "",
                                  cargo: "",
                                  areaAdscripcion: "",
                                });

                                setMostrarModalFondo(true);
                              }}
                              className="bg-[#8B1538] text-white px-4 py-2 rounded shadow hover:opacity-90"
                            >
                              Añadir rem internos
                            </button>

                            {/* 🔍 Buscador */}
                            <div className="flex-1 flex items-center border rounded px-2">
                              <Search size={16} className="text-gray-400" />

                              <input
                                value={busquedaMaterial}
                                onChange={(e) => setBusquedaMaterial(e.target.value)}
                                className="w-full px-2 py-2 outline-none text-sm"
                                placeholder="Buscar remitente..."
                              />
                            </div>

                          </div>

                          {/* 🧾 TABLA */}
                          <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="w-full text-sm">

                              <thead className="bg-[#8B1538] text-white">
                                <tr>
                                  <th className="px-4 py-3 text-left">Editar</th>
                                  <th className="px-4 py-3 text-left">Nombre completo</th>
                                  <th className="px-4 py-3 text-left">Cargo</th>
                                  <th className="px-4 py-3 text-left">Área de adscripción</th>
                                  <th className="px-4 py-3 text-center">Eliminar</th>
                                </tr>
                              </thead>

                              <tbody>
                                {remitentesInternosFiltrados.length > 0 ? (
                                  remitentesInternosFiltrados.map((remitente) => (
                                    <tr
                                      key={remitente.id}
                                      className="border-t hover:bg-gray-50 transition"
                                    >

                                      {/* ✏️ EDITAR */}
                                      <td className="px-4 py-3">
                                        <button
                                          onClick={() => {

                                            setModoEdicion(true);

                                            setFondoEditando({
                                              id: remitente.id,
                                              nombreCompleto: remitente.nombreCompleto || "",
                                              cargo: remitente.cargo || "",
                                              areaAdscripcion:
                                                remitente.areaAdscripcion || "",
                                            });

                                            setMostrarModalFondo(true);
                                          }}
                                          className="p-2 rounded hover:bg-blue-100 text-gray-500 hover:text-blue-600 transition"
                                        >
                                          <Pencil size={16} />
                                        </button>
                                      </td>

                                      {/* NOMBRE */}
                                      <td className="px-4 py-3 text-gray-700">
                                        {remitente.nombreCompleto}
                                      </td>

                                      {/* CARGO */}
                                      <td className="px-4 py-3 text-gray-700">
                                        {remitente.cargo}
                                      </td>

                                      {/* ÁREA */}
                                      <td className="px-4 py-3 text-gray-700">
                                        {remitente.areaAdscripcion}
                                      </td>

                                      {/* 🗑 ELIMINAR */}
                                      <td className="px-4 py-3 text-center">
                                        <button
                                          onClick={async () => {

                                            const result = await Swal.fire({
                                              title: "¿Eliminar remitente interno?",
                                              text: "Esta acción no se puede deshacer.",
                                              icon: "warning",
                                              showCancelButton: true,
                                              confirmButtonColor: "#8B1538",
                                              cancelButtonColor: "#6B7280",
                                              confirmButtonText: "Sí, eliminar",
                                              cancelButtonText: "Cancelar",
                                            });

                                            if (result.isConfirmed) {

                                              setRemitentesInternos((prev) =>
                                                prev.filter((item) => item.id !== remitente.id)
                                              );

                                              Swal.fire({
                                                toast: true,
                                                position: "top-end",
                                                icon: "success",
                                                title: "El remitente interno fue eliminado.",
                                                showConfirmButton: false,
                                                timer: 3000,
                                                timerProgressBar: true,
                                                background: "#fff",
                                                color: "#333",
                                              });
                                            }
                                          }}
                                          className="p-2 rounded hover:bg-red-100 text-gray-500 hover:text-red-600 transition"
                                        >
                                          <Trash2 size={16} />
                                        </button>
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

                          {/* MODAL */}
                          <AnimatePresence>
                            {mostrarModalFondo && (
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
                                        ? "Editar remitente interno"
                                        : "Agregar remitente interno"}
                                    </h2>

                                    <button
                                      onClick={() => setMostrarModalFondo(false)}
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
                                          value={fondoEditando.nombreCompleto}
                                          onChange={(e) =>
                                            setFondoEditando({
                                              ...fondoEditando,
                                              nombreCompleto: e.target.value,
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
                                          value={fondoEditando.cargo}
                                          onChange={(e) =>
                                            setFondoEditando({
                                              ...fondoEditando,
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
                                          value={fondoEditando.areaAdscripcion}
                                          onChange={(e) =>
                                            setFondoEditando({
                                              ...fondoEditando,
                                              areaAdscripcion: e.target.value,
                                            })
                                          }
                                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#8B1538]/30 outline-none"
                                          placeholder="Ingrese área"
                                        />
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

                          {/* 🔥 HEADER */}
                          <div className="flex items-center gap-2 mb-2">

                            {/* Botón añadir */}
                            <button
                              onClick={() => {
                                setModoEdicion(false);

                                setFondoEditando({
                                  id: null,
                                  nombreCompleto: "",
                                  cargo: "",
                                  areaAdscripcion: "",
                                });

                                setMostrarModalFondo(true);
                              }}
                              className="bg-[#8B1538] text-white px-4 py-2 rounded shadow hover:opacity-90"
                            >
                              Añadir rem externos
                            </button>

                            {/* 🔍 Buscador */}
                            <div className="flex-1 flex items-center border rounded px-2">
                              <Search size={16} className="text-gray-400" />

                              <input
                                value={busquedaMaterial}
                                onChange={(e) => setBusquedaMaterial(e.target.value)}
                                className="w-full px-2 py-2 outline-none text-sm"
                                placeholder="Buscar remitente..."
                              />
                            </div>

                          </div>

                          {/* 🧾 TABLA */}
                          <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="w-full text-sm">

                              <thead className="bg-[#8B1538] text-white">
                                <tr>
                                  <th className="px-4 py-3 text-left">Editar</th>
                                  <th className="px-4 py-3 text-left">Nombre completo</th>
                                  <th className="px-4 py-3 text-left">Cargo</th>
                                  <th className="px-4 py-3 text-left">Área de adscripción</th>
                                  <th className="px-4 py-3 text-center">Eliminar</th>
                                </tr>
                              </thead>

                              <tbody>
                                {remitentesExternosFiltrados.length > 0 ? (
                                  remitentesExternosFiltrados.map((remitenteExt) => (
                                    <tr
                                      key={remitenteExt.id}
                                      className="border-t hover:bg-gray-50 transition"
                                    >

                                      {/* ✏️ EDITAR */}
                                      <td className="px-4 py-3">
                                        <button
                                          onClick={() => {

                                            setModoEdicion(true);

                                            setFondoEditando({
                                              id: remitenteExt.id,
                                              nombreCompleto:
                                                remitenteExt.nombreCompleto || "",
                                              cargo: remitenteExt.cargo || "",
                                              areaAdscripcion:
                                                remitenteExt.areaAdscripcion || "",
                                            });

                                            setMostrarModalFondo(true);
                                          }}
                                          className="p-2 rounded hover:bg-blue-100 text-gray-500 hover:text-blue-600 transition"
                                        >
                                          <Pencil size={16} />
                                        </button>
                                      </td>

                                      {/* NOMBRE */}
                                      <td className="px-4 py-3 text-gray-700">
                                        {remitenteExt.nombreCompleto}
                                      </td>

                                      {/* CARGO */}
                                      <td className="px-4 py-3 text-gray-700">
                                        {remitenteExt.cargo}
                                      </td>

                                      {/* ÁREA */}
                                      <td className="px-4 py-3 text-gray-700">
                                        {remitenteExt.areaAdscripcion}
                                      </td>

                                      {/* 🗑 ELIMINAR */}
                                      <td className="px-4 py-3 text-center">
                                        <button
                                          onClick={async () => {

                                            const result = await Swal.fire({
                                              title: "¿Eliminar remitente externo?",
                                              text: "Esta acción no se puede deshacer.",
                                              icon: "warning",
                                              showCancelButton: true,
                                              confirmButtonColor: "#8B1538",
                                              cancelButtonColor: "#6B7280",
                                              confirmButtonText: "Sí, eliminar",
                                              cancelButtonText: "Cancelar",
                                            });

                                            if (result.isConfirmed) {

                                              setRemitentesExternos((prev) =>
                                                prev.filter((item) => item.id !== remitenteExt.id)
                                              );

                                              Swal.fire({
                                                toast: true,
                                                position: "top-end",
                                                icon: "success",
                                                title: "El remitente externo fue eliminado.",
                                                showConfirmButton: false,
                                                timer: 3000,
                                                timerProgressBar: true,
                                                background: "#fff",
                                                color: "#333",
                                              });
                                            }
                                          }}
                                          className="p-2 rounded hover:bg-red-100 text-gray-500 hover:text-red-600 transition"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </td>

                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td
                                      colSpan={5}
                                      className="text-center py-6 text-gray-400"
                                    >
                                      Sin remitentes externos registrados
                                    </td>
                                  </tr>
                                )}
                              </tbody>

                            </table>
                          </div>

                          {/* MODAL */}
                          <AnimatePresence>
                            {mostrarModalFondo && (
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
                                      onClick={() => setMostrarModalFondo(false)}
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
                                          value={fondoEditando.nombreCompleto}
                                          onChange={(e) =>
                                            setFondoEditando({
                                              ...fondoEditando,
                                              nombreCompleto: e.target.value,
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
                                          value={fondoEditando.cargo}
                                          onChange={(e) =>
                                            setFondoEditando({
                                              ...fondoEditando,
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
                                          value={fondoEditando.areaAdscripcion}
                                          onChange={(e) =>
                                            setFondoEditando({
                                              ...fondoEditando,
                                              areaAdscripcion: e.target.value,
                                            })
                                          }
                                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#8B1538]/30 outline-none"
                                          placeholder="Ingrese área"
                                        />
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

                          {/* 🔥 HEADER */}
                          <div className="flex items-center gap-2 mb-2">

                            {/* ➕ AÑADIR */}
                            <button
                              onClick={() => {

                                setModoEdicion(false);

                                setTipoDocumentoEditando({
                                  id: null,
                                  nombre: "",
                                  descripcion: "",
                                });

                                setMostrarModalTipoDocumento(true);
                              }}
                              className="bg-[#8B1538] text-white px-4 py-2 rounded shadow hover:opacity-90"
                            >
                              Añadir tipo documento
                            </button>

                            {/* 🔍 BUSCADOR */}
                            <div className="flex-1 flex items-center border rounded px-2">
                              <Search size={16} className="text-gray-400" />

                              <input
                                value={busquedaTipoDocumento}
                                onChange={(e) =>
                                  setBusquedaTipoDocumento(e.target.value)
                                }
                                className="w-full px-2 py-2 outline-none text-sm"
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
                                  <th className="px-4 py-3 text-left">
                                    Descripción del tipo de documento
                                  </th>
                                  <th className="px-4 py-3 text-center">Histórico</th>
                                  <th className="px-4 py-3 text-center">Eliminar</th>
                                </tr>
                              </thead>

                              <tbody>
                                {tiposDocumentoFiltrados.length > 0 ? (
                                  tiposDocumentoFiltrados.map((tipo) => (
                                    <tr
                                      key={tipo.id}
                                      className="border-t hover:bg-gray-50 transition"
                                    >

                                      {/* ✏️ EDITAR */}
                                      <td className="px-4 py-3">
                                        <button
                                          onClick={() => {

                                            setModoEdicion(true);

                                            setTipoDocumentoEditando({
                                              id: tipo.id,
                                              nombre: tipo.nombre || "",
                                              descripcion: tipo.descripcion || "",
                                            });

                                            setMostrarModalTipoDocumento(true);
                                          }}
                                          className="p-2 rounded hover:bg-blue-100 text-gray-500 hover:text-blue-600 transition"
                                        >
                                          <Pencil size={16} />
                                        </button>
                                      </td>

                                      {/* 📄 NOMBRE */}
                                      <td className="px-4 py-3 text-gray-700">
                                        {tipo.nombre}
                                      </td>

                                      {/* 📝 DESCRIPCIÓN */}
                                      <td className="px-4 py-3 text-gray-700">
                                        {tipo.descripcion}
                                      </td>

                                      {/* 🕘 HISTÓRICO */}
                                      <td className="px-4 py-3 text-center">
                                        <button
                                          className="p-2 rounded hover:bg-yellow-100 text-gray-500 hover:text-yellow-600 transition"
                                        >
                                          <History size={16} />
                                        </button>
                                      </td>

                                      {/* 🗑 ELIMINAR */}
                                      <td className="px-4 py-3 text-center">
                                        <button
                                          onClick={async () => {

                                            const result = await Swal.fire({
                                              title: "¿Eliminar tipo de documento?",
                                              text: "Esta acción no se puede deshacer.",
                                              icon: "warning",
                                              showCancelButton: true,
                                              confirmButtonColor: "#8B1538",
                                              cancelButtonColor: "#6B7280",
                                              confirmButtonText: "Sí, eliminar",
                                              cancelButtonText: "Cancelar",
                                            });

                                            if (result.isConfirmed) {

                                              setTiposDocumento((prev) =>
                                                prev.filter((item) => item.id !== tipo.id)
                                              );

                                              Swal.fire({
                                                toast: true,
                                                position: "top-end",
                                                icon: "success",
                                                title: "El tipo de documento fue eliminado.",
                                                showConfirmButton: false,
                                                timer: 3000,
                                                timerProgressBar: true,
                                                background: "#fff",
                                                color: "#333",
                                              });
                                            }
                                          }}
                                          className="p-2 rounded hover:bg-red-100 text-gray-500 hover:text-red-600 transition"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </td>

                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td
                                      colSpan={5}
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
                                      <div>
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
                                      </div>

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

                          {/* 🔥 HEADER */}
                          <div className="flex items-center gap-2 mb-2">

                            {/* ➕ AÑADIR */}
                            <button
                              onClick={() => {

                                setModoEdicion(false);

                                setTemaPrincipalEditando({
                                  id: null,
                                  nombre: "",
                                  descripcion: "",
                                  validacion: true,
                                });

                                setMostrarModalTemaPrincipal(true);
                              }}
                              className="bg-[#8B1538] text-white px-4 py-2 rounded shadow hover:opacity-90"
                            >
                              Añadir tema principal
                            </button>

                            {/* 🔍 BUSCADOR */}
                            <div className="flex-1 flex items-center border rounded px-2">
                              <Search size={16} className="text-gray-400" />

                              <input
                                value={busquedaTemaPrincipal}
                                onChange={(e) =>
                                  setBusquedaTemaPrincipal(e.target.value)
                                }
                                className="w-full px-2 py-2 outline-none text-sm"
                                placeholder="Buscar tema principal..."
                              />
                            </div>

                          </div>

                          {/* 🧾 TABLA */}
                          <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="w-full text-sm">

                              <thead className="bg-[#8B1538] text-white">
                                <tr>
                                  <th className="px-4 py-3 text-left">Editar</th>

                                  <th className="px-4 py-3 text-left">
                                    Nombre
                                  </th>

                                  <th className="px-4 py-3 text-left">
                                    Descripción del tema principal
                                  </th>

                                  <th className="px-4 py-3 text-center">
                                    Con validación
                                  </th>

                                  <th className="px-4 py-3 text-center">
                                    Histórico
                                  </th>

                                  <th className="px-4 py-3 text-center">
                                    Eliminar
                                  </th>
                                </tr>
                              </thead>

                              <tbody>
                                {temasPrincipalesFiltrados.length > 0 ? (
                                  temasPrincipalesFiltrados.map((tema) => (
                                    <tr
                                      key={tema.id}
                                      className="border-t hover:bg-gray-50 transition"
                                    >

                                      {/* ✏️ EDITAR */}
                                      <td className="px-4 py-3">
                                        <button
                                          onClick={() => {

                                            setModoEdicion(true);

                                            setTemaPrincipalEditando({
                                              id: tema.id,
                                              nombre: tema.nombre || "",
                                              descripcion: tema.descripcion || "",
                                              validacion: tema.validacion || false,
                                            });

                                            setMostrarModalTemaPrincipal(true);
                                          }}
                                          className="p-2 rounded hover:bg-blue-100 text-gray-500 hover:text-blue-600 transition"
                                        >
                                          <Pencil size={16} />
                                        </button>
                                      </td>

                                      {/* 📄 NOMBRE */}
                                      <td className="px-4 py-3 text-gray-700">
                                        {tema.nombre}
                                      </td>

                                      {/* 📝 DESCRIPCIÓN */}
                                      <td className="px-4 py-3 text-gray-700">
                                        {tema.descripcion}
                                      </td>

                                      {/* ✅ VALIDACIÓN */}
                                      <td className="px-4 py-3 text-center">
                                        <span
                                          className={`px-3 py-1 rounded-full text-xs font-medium
                                            ${tema.validacion
                                              ? "bg-green-100 text-green-700"
                                              : "bg-red-100 text-red-700"
                                            }`}
                                        >
                                          {tema.validacion ? "Sí" : "No"}
                                        </span>
                                      </td>

                                      {/* 🕘 HISTÓRICO */}
                                      <td className="px-4 py-3 text-center">
                                        <button
                                          className="p-2 rounded hover:bg-yellow-100 text-gray-500 hover:text-yellow-600 transition"
                                        >
                                          <History size={16} />
                                        </button>
                                      </td>

                                      {/* 🗑 ELIMINAR */}
                                      <td className="px-4 py-3 text-center">
                                        <button
                                          onClick={async () => {

                                            const result = await Swal.fire({
                                              title: "¿Eliminar tema principal?",
                                              text: "Esta acción no se puede deshacer.",
                                              icon: "warning",
                                              showCancelButton: true,
                                              confirmButtonColor: "#8B1538",
                                              cancelButtonColor: "#6B7280",
                                              confirmButtonText: "Sí, eliminar",
                                              cancelButtonText: "Cancelar",
                                            });

                                            if (result.isConfirmed) {

                                              setTemasPrincipales((prev) =>
                                                prev.filter((item) => item.id !== tema.id)
                                              );

                                              Swal.fire({
                                              toast: true,
                                              position: "top-end",
                                              icon: "success",
                                              title: "El tema principal fue eliminado.",
                                              showConfirmButton: false,
                                              timer: 3000,
                                              timerProgressBar: true,
                                              background: "#fff",
                                              color: "#333",
                                            });
                                            }
                                          }}
                                          className="p-2 rounded hover:bg-red-100 text-gray-500 hover:text-red-600 transition"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </td>

                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td
                                      colSpan={6}
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
                                        ? "Editar tema principal"
                                        : "Agregar tema principal"}
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

                                      {/* 📄 NOMBRE */}
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Nombre
                                        </label>

                                        <input
                                          type="text"
                                          value={temaPrincipalEditando.nombre}
                                          onChange={(e) =>
                                            setTemaPrincipalEditando({
                                              ...temaPrincipalEditando,
                                              nombre: e.target.value,
                                            })
                                          }
                                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#8B1538]/30 outline-none"
                                          placeholder="Ingrese nombre del tema principal"
                                        />
                                      </div>

                                      {/* 📝 DESCRIPCIÓN */}
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Descripción del tema principal
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

                                      {/* ✅ VALIDACIÓN */}
                                      <div className="flex items-center gap-3">

                                        <input
                                          type="checkbox"
                                          checked={temaPrincipalEditando.validacion}
                                          onChange={(e) =>
                                            setTemaPrincipalEditando({
                                              ...temaPrincipalEditando,
                                              validacion: e.target.checked,
                                            })
                                          }
                                          className="w-4 h-4 accent-[#8B1538]"
                                        />

                                        <label className="text-sm font-medium text-gray-700">
                                          Con validación
                                        </label>

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
