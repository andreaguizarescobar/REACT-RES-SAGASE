import { Minus } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAreas } from "../../services/catalogos.service.js";
import { registerRequest } from "../../services/auth.service.js";
import Swal from "sweetalert2";

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
    rol: "",
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
    if (!form.rol) newErrors.rol = true;

    setErrors(newErrors);

    // Si hay errores → muestra una alerta tipo Toast
    if (Object.keys(newErrors).length > 0) {
        Swal.fire({
            toast: true,
            position: "top-end",
            icon: "warning",
            title: "Complete todos los campos obligatorios.",
            text: "Revise los campos marcados en rojo.",
            showConfirmButton: false,
            timer: 3500,
            timerProgressBar: true,
            customClass: {
                popup: "text-sm"
            },
            didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
            }
        });

        return;
    }

    const usuarioGenerado = `AGN-${form.iniciales || "USR"}`;

    setCredenciales({
        usuario: usuarioGenerado,
        password: "1234",
    });

    setShowModal(true);
    };


    const handleRegistrar = async () => {
    const nuevoUsuario = {
        userId: `user-${form.iniciales}-${Date.now()}`,
        nombre: form.nombre,
        iniciales: form.iniciales,
        sexo: form.sexo,
        cargo: form.cargo,
        area: form.area,
        telefono: form.telefono,
        ext: form.ext,
        email: form.correo,
        copia: form.copia,
        roles: [{ rol: form.rol }],
        username: credenciales.usuario,
        password: credenciales.password,
    };

    const response = await registerRequest(nuevoUsuario, localStorage.getItem("token"));
    if (response.ok) {
        Swal.fire({
        icon: "success",
        title: "Usuario creado",
        text: `El usuario ${credenciales.usuario} ha sido creado exitosamente.`,
        });
    } else {
        Swal.fire({
            icon: "error",
            title: "Error al crear usuario",
            text: response.error || "Ocurrió un error al crear el usuario. Por favor, intenta de nuevo.",
        });
        setShowModal(false);
        return;
    }
    
    setShowModal(false);
    // Limpiar formulario
    setForm({
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
        rol: "",
    });
    };

    const [errors, setErrors] = useState({});
    const [areas, setAreas] = useState([]);
    const [loadingAreas, setLoadingAreas] = useState(false);

    useEffect(() => {
        const cargarAreas = async () => {
            try {
                setLoadingAreas(true);
                const response = await getAreas();
                if (response.ok) {
                    const data = await response.json();
                    setAreas(data);
                } else {
                    console.error("Error cargando áreas:", response.status);
                }
            } catch (error) {
                console.error("Error cargando áreas:", error);
            } finally {
                setLoadingAreas(false);
            }
        };

        cargarAreas();
    }, []);

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
        <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-gray-300" />

            <h2 className="text-sm font-semibold text-[#8B1538] uppercase tracking-wide">
                Información personal
            </h2>

            <div className="h-px flex-1 bg-gray-300" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="lg:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nombre completo
              <span className="text-red-600"> *</span>
            </label>
            <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            className={`w-full rounded-lg border px-3 py-2 transition
            focus:border-[#8B1538]
            focus:ring-2
            focus:ring-[#8B1538]/20
            outline-none
            ${
                errors.nombre
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
            }`}
            />
        </div>

        <div className="lg:col-span-1">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Iniciales
              <span className="text-red-600"> *</span>
            </label>
            <input
            name="iniciales"
            value={form.iniciales}
            onChange={handleChange}
            readOnly
            disabled
            className={`w-full rounded-lg border px-3 py-2
            cursor-not-allowed
            text-gray-600
            ${
                errors.iniciales
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 bg-gray-100"
            }`}
            />
        </div>

          <div className="lg:col-span-1">
            <label className="mb-1 block text-sm font-medium text-gray-700">Sexo:</label>
            <select
            name="sexo"
            value={form.sexo}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 transition
            focus:border-[#8B1538]
            focus:ring-2
            focus:ring-[#8B1538]/20
            outline-none"
            >
            <option value="">Seleccionar</option>
            <option>Femenino</option>
            <option>Masculino</option>
            <option>Otro</option>
            </select>
        </div>
        </div>

        {/* FILA 2
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="col-span-1">
            <label className="block mb-1">Sexo:</label>
            <select
            name="sexo"
            value={form.sexo}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 transition
            focus:border-[#8B1538]
            focus:ring-2
            focus:ring-[#8B1538]/20
            outline-none"
            >
            <option value="">Seleccionar</option>
            <option>Femenino</option>
            <option>Masculino</option>
            <option>Otro</option>
            </select>
        </div>

        </div> */}

        {/* FILA 4 */}
        <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-gray-300" />

            <h2 className="text-sm font-semibold text-[#8B1538] uppercase tracking-wide">
                Información institucional
            </h2>

            <div className="h-px flex-1 bg-gray-300" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="col-span-1">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Área de destino
              <span className="text-red-600"> *</span>
            </label>
            <select
            name="area"
            value={form.area}
            onChange={handleChange}
            disabled={loadingAreas}
            className={`w-full rounded-lg border px-3 py-2.5 transition
              focus:border-[#8B1538]
              focus:ring-2
              focus:ring-[#8B1538]/20
              outline-none ${
            errors.area ? "border-red-500 bg-red-50" : ""
            } ${loadingAreas ? "bg-gray-100 cursor-not-allowed" : ""}`}
            >
            <option value="">{loadingAreas ? "Cargando áreas..." : "Seleccionar"}</option>
            {areas.map((area) => (
            <option key={area.nombre} value={area.nombre}>
                {area.nombre}
            </option>
            ))}
            </select>
        </div>
 
        </div>

        {/* FILA 5 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    Teléfono institucional
                    <span className="text-red-600"> *</span>
                </label>

                <input
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    placeholder="Ej. 3111234567"
                    className={`w-full rounded-lg border px-3 py-2 transition
                    focus:border-[#8B1538]
                    focus:ring-2
                    focus:ring-[#8B1538]/20
                    outline-none
                    ${
                        errors.telefono
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                    }`}
                />
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    Ext.
                </label>

                <input
                    name="ext"
                    value={form.ext}
                    onChange={handleChange}
                    placeholder="Ej. 123"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 transition focus:border-[#8B1538] focus:ring-2 focus:ring-[#8B1538]/20 outline-none"
                />
            </div>
        </div>

        {/* FILA 6 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Correo institucional
              <span className="text-red-600"> *</span>
            </label>
            <input
              name="correo"
              value={form.correo}
              onChange={handleChange}
              className={`w-full rounded-lg border px-3 py-2 transition
              focus:border-[#8B1538]
              focus:ring-2
              focus:ring-[#8B1538]/20
              outline-none${
                errors.correo ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
            />
          </div>
          
        </div>
        <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-gray-300" />

            <h2 className="text-sm font-semibold text-[#8B1538] uppercase tracking-wide">
                Configuración del usuario
            </h2>

            <div className="h-px flex-1 bg-gray-300" />
        </div>

        
        {/* FILA 7 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <div className="lg:col-span-1">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Rol
              <span className="text-red-600"> *</span>
            </label>
            <select
            name="rol"
            value={form.rol}
            onChange={handleChange}
             className={`w-full rounded-lg border px-3 py-2.5 transition
              focus:border-[#8B1538]
              focus:ring-2
              focus:ring-[#8B1538]/20
              outline-none
              ${
                  errors.rol
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
              }`}
            >
            <option value="">Seleccionar</option>
            <option value="ADMIN">ADMIN</option>
            <option value="REGISTRADOR">REGISTRADOR</option>
            <option value="EJECUTOR">EJECUTOR</option>
            <option value="VALIDADOR">VALIDADOR</option>
            </select>
        </div>
        {/* <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
            <label className="flex items-center gap-3 cursor-pointer">
         
              <input
                type="checkbox"
                name="copia"
                checked={form.copia}
                onChange={handleChange}
                className="w-4 h-4 accent-[#8B1538]"
              />

               <div>
                  <p className="font-medium">
                      Recibir copia de documentos
                  </p>

                  <p className="text-gray-500 text-xs">
                      El usuario recibirá copia de los documentos relacionados con los asuntos en los que participe.
                  </p>
              </div>
            </label>
          </div> */}

        </div>
        {/* BOTÓN */}
        <div className="flex justify-center pt-4">
          <button
            type="button"
            onClick={handleGuardar}
            className="
              bg-[#8B1538]
              text-white
              font-medium
              px-10
              py-3
              rounded-lg
              hover:bg-[#6f102c]
              transition
              shadow-md
              hover:shadow-lg
              "
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
                    onClick={handleRegistrar}
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
