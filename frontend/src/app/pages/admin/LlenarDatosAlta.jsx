import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import bgNayarit from "../../assets/images/personajenayarit2.jpg";
import nayaritLogo from "../../assets/images/nayaritLogo.png";

export function LlenarDatosAlta() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    iniciales: "",
    sexo: "",
    area: "",
    telefono: "",
    ext: "",
    correo: "",
    copia: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const validarFormulario = () => {
    return (
      form.nombre &&
      form.iniciales &&
      form.sexo &&
      form.area &&
      form.correo
    );
  };

  const handleSubmit = async () => {
    if (!validarFormulario()) {
      return Swal.fire({
        toast: true,
        position: "top-end",
        icon: "warning",
        title: "Complete TODOS los campos, son obligatorios",
        showConfirmButton: false,
        timer: 3000,
      });
    }

    // 🔥 Aquí iría tu servicio (createUserRequest)
    console.log("Datos enviados:", form);

    Swal.fire({
      icon: "success",
      title: "Solicitud enviada",
      text: "Su solicitud de alta ha sido registrada. Espere aprobación.",
      confirmButtonColor: "#8B1538",
    });

    setTimeout(() => {
      navigate("/");
    }, 2000);
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
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white w-[550px] p-6 rounded-xl shadow-lg"
        >
          {/* HEADER */}
          <div className="text-center pt-1">
            <img
              src={nayaritLogo}
              alt="Nayarit"
              className="h-16 mx-auto mb-4"
            />
            <h1 className="text-4xl font-semibold text-[#8B1538] tracking-widest">
              SAGASE
            </h1>
          </div>

          {/* TÍTULO */}
          <h2 className="pt-3 text-xl text-center mb-4 text-gray-800">
            Solicitud de alta de usuario
          </h2>

          <div className="space-y-3 text-sm">
            <input
              name="nombre"
              placeholder="Nombre completo"
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />

            <select
              name="sexo"
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Seleccione sexo</option>
              <option>Masculino</option>
              <option>Femenino</option>
            </select>

            <div className="col-span-2">
                <label className="block mb-1 text-sm">Área de destino:</label>
                <select
                name="area"
                value={form.area}
                onChange={handleChange}
                disabled={loadingAreas}
                className={`w-full border rounded px-2 py-2 ${
                errors.area ? "border-red-500 bg-red-50" : ""
                } ${loadingAreas ? "bg-gray-100 cursor-not-allowed" : ""}`}
                >
                <option value="">{loadingAreas ? "Cargando áreas..." : "Seleccionar área de destino"}</option>
                {areas.map((area) => (
                <option key={area.nombre} value={area.nombre}>
                    {area.nombre}
                </option>
                ))}
                </select>
            </div>

            <div className="flex gap-2">
              <input
                name="telefono"
                placeholder="Teléfono"
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
              <input
                name="ext"
                placeholder="Ext"
                onChange={handleChange}
                className="w-24 border rounded px-3 py-2"
              />
            </div>

            <input
              name="correo"
              placeholder="Correo institucional"
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />

            <button
            onClick={handleSubmit}
            className="block mx-auto w-[200px] py-2 rounded text-white bg-[#8B1538] hover:bg-[#6B0F2A] transition"
            >
            Enviar solicitud
            </button>
          </div>
        </motion.div>
      </div>

      {/* IMAGEN INFERIOR */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full h-[120px] overflow-hidden"
      >
        <img
          src={bgNayarit}
          alt="Decoración"
          className="w-full h-full object-cover"
        />
      </motion.div>
    </div>
  );
}