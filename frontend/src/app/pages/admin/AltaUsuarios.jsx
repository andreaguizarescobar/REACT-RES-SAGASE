import { Minus } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function AltaUsuarios() {
  const [form, setForm] = useState({
    nombre: "",
    iniciales: "",
    sexo: "",
    cargo: "",
    otroCargo: false,
    area: "",
    telefono: "",
    ext: "",
    correo: "",
    copia: false,
  });

  const handleChange = (e) => {
  const { name, value, type, checked } = e.target;

  // limpiar error de ese campo
  setErrors((prev) => ({
    ...prev,
    [name]: false,
  }));

  if (name === "nombre") {
    setForm({
      ...form,
      nombre: value,
      iniciales: generarIniciales(value),
    });
  } else {
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  }
};

  const generarIniciales = (nombre) => {
    return nombre
        .split(" ")
        .filter((p) => p.length > 0)
        .map((p) => p[0].toUpperCase())
        .join("");
    };

    const [showModal, setShowModal] = useState(false);
    const [credenciales, setCredenciales] = useState({
    usuario: "",
    password: "1234",
    });

    const handleGuardar = () => {
    const newErrors = {};

    if (!form.nombre) newErrors.nombre = true;
    if (!form.iniciales) newErrors.iniciales = true;
    if (!form.area) newErrors.area = true;
    if (!form.telefono) newErrors.telefono = true;
    if (!form.correo) newErrors.correo = true;

    setErrors(newErrors);

    // Si hay errores → no continúa
    if (Object.keys(newErrors).length > 0) return;

    const usuarioGenerado = `AGN-${form.iniciales || "USR"}`;

    setCredenciales({
        usuario: usuarioGenerado,
        password: "1234",
    });

    setShowModal(true);
    };

    const [errors, setErrors] = useState({});

    const areas = [
    "Dirección General",
    "Recursos Humanos",
    "Finanzas",
    "Tecnologías de la Información",
    "Jurídico",
    "Compras",
    "Almacén",
    "Atención al Cliente",
    "Planeación",
    "Operaciones",
    ];

  return (
    <div className="flex-1 p-6 bg-gray-100 overflow-y-auto">
      {/* HEADER */}
      <div className="bg-gray-300 rounded-t-md flex items-center justify-between px-4 py-2">
        <h1 className="text-sm font-semibold text-gray-800">
          Alta de usuarios
        </h1>

        <button className="w-6 h-6 flex items-center justify-center rounded-full bg-[#8B1538] text-white">
          <Minus size={14} />
        </button>
      </div>

      {/* CONTENIDO */}
      <div className="bg-white p-6 rounded-b-md shadow-sm text-xs space-y-4">
        
        {/* FILA 1 */}
        <div className="grid grid-cols-4 gap-4">
        <div className="col-span-2">
            <label className="block mb-1">Nombre Completo *:</label>
            <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            className={`w-full border rounded px-2 py-2 ${
                errors.nombre ? "border-red-500 bg-red-50" : ""
            }`}
            />
        </div>

        <div className="col-span-1">
            <label className="block mb-1">Iniciales *:</label>
            <input
            name="iniciales"
            value={form.iniciales}
            onChange={handleChange}
            className={`w-full border rounded px-2 py-2 ${
            errors.iniciales ? "border-red-500 bg-red-50" : ""
            }`}
            />
        </div>
        </div>

        {/* FILA 2 */}
        <div className="grid grid-cols-4 gap-4">
        <div className="col-span-1">
            <label className="block mb-1">Sexo:</label>
            <select
            name="sexo"
            value={form.sexo}
            onChange={handleChange}
            className="w-full border rounded px-2 py-2"
            >
            <option value="">Seleccionar</option>
            <option>Femenino</option>
            <option>Masculino</option>
            </select>
        </div>
        </div>

        {/* FILA 4 */}
        <div className="grid grid-cols-4 gap-4">
        <div className="col-span-2">
            <label className="block mb-1">Área de destino *:</label>
            <select
            name="area"
            value={form.area}
            onChange={handleChange}
            className={`w-full border rounded px-2 py-2 ${
            errors.area ? "border-red-500 bg-red-50" : ""
            }`}
            >
            <option value="">Seleccionar</option>
            {areas.map((area) => (
            <option key={area} value={area}>
                {area}
            </option>
            ))}
            </select>
        </div>
        </div>

        {/* FILA 5 */}
        <div className="grid grid-cols-4 gap-4">
        <div className="col-span-2">
            <label className="block mb-1">Teléfono *:</label>
            <input
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            className={`w-full border rounded px-2 py-2 ${
            errors.telefono ? "border-red-500 bg-red-50" : ""
            }`}
            />
        </div>

        <div className="col-span-1">
            <label className="block mb-1">Ext:</label>
            <input
            name="ext"
            value={form.ext}
            onChange={handleChange}
            className="w-full border rounded px-2 py-2"
            />
        </div>
        </div>

        {/* FILA 6 */}
        <div className="grid grid-cols-2 gap-4 items-center">
          <div>
            <label className="block mb-1">Correo *:</label>
            <input
              name="correo"
              value={form.correo}
              onChange={handleChange}
              className={`w-full border rounded px-2 py-2 ${
                errors.correo ? "border-red-500 bg-red-50" : ""
                }`}
            />
          </div>

          <div className="flex items-center gap-2 mt-5">
            <label>¿Se le podrá mandar copia de los documentos?</label>
            <input
              type="checkbox"
              name="copia"
              checked={form.copia}
              onChange={handleChange}
              className="accent-[#8B1538]"
            />
          </div>
        </div>

        {/* BOTÓN */}
        <div className="flex justify-center pt-4">
          <button
            type="button"
            onClick={handleGuardar}
            className="bg-red-600 text-white px-16 py-2 rounded hover:opacity-90"
            >
            Guardar
            </button>

        </div>
      </div>
      <AnimatePresence>
        {showModal && (
            <motion.div
            className="fixed inset-0 flex items-center justify-center z-[9999]"
            
            // ANIMACIÓN DEL FONDO
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
            >
            <motion.div
                className="bg-white rounded shadow-lg w-[600px] relative"

                // ANIMACIÓN DEL MODAL
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
            >
                
                {/* HEADER */}
                <div className="bg-gray-300 px-4 py-2 text-xs font-semibold text-gray-700">
                Datos de acceso al sistema
                </div>

                {/* BOTÓN CERRAR */}
                <button
                onClick={() => setShowModal(false)}
                className="absolute top-1 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-[#8B1538] text-white"
                >
                <Minus size={14} />
                </button>
                
                {/* CONTENIDO */}
                <div className="p-6 space-y-4 text-xs">

                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <label className="block mb-1">Usuario:</label>
                    <input
                        value={credenciales.usuario}
                        readOnly
                        className="w-full border rounded px-2 py-2 bg-gray-100"
                    />
                    </div>

                    <div>
                    <label className="block mb-1">Contraseña:</label>
                    <input
                        value={credenciales.password}
                        readOnly
                        className="w-full border rounded px-2 py-2 bg-gray-100"
                    />
                    </div>
                </div>

                <div className="text-gray-600">
                    Usuario creado para:{" "}
                    <span className="font-semibold text-gray-800">
                    {form.nombre}
                    </span>
                </div>

                {/* BOTÓN */}
                <div className="flex justify-center pt-2">
                    <button
                    onClick={() => setShowModal(false)}
                    className="bg-[#8B1538] text-white px-10 py-2 rounded hover:opacity-90"
                    >
                    Aceptar
                    </button>
                </div>

                </div>
            </motion.div>
            </motion.div>
        )}
        </AnimatePresence>

    </div>
  );
}
