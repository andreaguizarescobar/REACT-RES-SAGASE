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
} from "lucide-react";


export function Projects() {
  const [proyectos, setProyectos] = useState([
    {
      id: 1,
      nombre: "Sistema Automatizado de Gestión de Archivos",
      clave: "SAGA_AGN",
      fecha: "2021-04-12",
    },
    {
      id: 2,
      nombre: "Portal Educativo",
      clave: "PORTAL_EDU",
      fecha: "2023-01-10",
    },
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

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-xl mb-4 text-gray-800">Proyectos</h1>

      {/* Input */}
      <div className="flex gap-2 mb-6">
        <input
          value={nuevo}
          onChange={(e) => setNuevo(e.target.value)}
          placeholder="Nuevo proyecto"
          className="border px-3 py-2 rounded w-full text-sm"
        />
        <button
          onClick={agregarProyecto}
          className="bg-[#8B1538] text-white px-4 rounded text-sm hover:opacity-90"
        >
          Agregar
        </button>
      </div>

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
                <PieChart size={16} />
                <Route size={16} />
                <Coins size={16} />

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
                              z-10"
                  >
                    <Clock className="hover:scale-110 cursor-pointer" size={16} />
                    <List className="hover:scale-110 cursor-pointer" size={16} />
                    <FileText className="hover:scale-110 cursor-pointer" size={16} />

                    <div className="relative group/item">
                      <FileUp
                        size={16}
                        className="hover:scale-110 cursor-pointer"
                        onClick={() => setOpenModal(true)}
                      />

                      {/* Tooltip */}
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2
                        bg-gray-800 text-white text-[10px] px-2 py-1 rounded
                        opacity-0 group-hover/item:opacity-100
                        transition whitespace-nowrap"
                      >
                        Carga de reportes
                        <div className="absolute left-1/2 -bottom-1 -translate-x-1/2
                          w-2 h-2 bg-gray-800 rotate-45"></div>
                      </div>
                    </div>

                    <Settings className="hover:scale-110 cursor-pointer" size={16} />
                    <FileOutput className="hover:scale-110 cursor-pointer" size={16} />
                    <LogOut className="hover:scale-110 cursor-pointer" size={16} />
                    <Mail className="hover:scale-110 cursor-pointer" size={16} />
                    <Undo className="hover:scale-110 cursor-pointer" size={16} />
                  </div>
                </div>

                <ListChecks size={16} />
                <KeyRound size={16} />
                <Info size={16} />
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
    </div>
    
  );
}
