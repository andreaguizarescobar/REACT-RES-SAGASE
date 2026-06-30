import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import bgNayarit from "../../assets/images/personajenayarit2.jpg";
import nayaritLogo from "../../assets/images/nayaritLogo.png";
import { getAreas } from "../../services/catalogos.service.js";
import { createSolicitud } from "../../services/user.service.js";

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

  const generarIniciales = (nombre) => {
    return nombre
      .split(" ")
      .filter((parte) => parte.trim().length > 0)
      .map((parte) => parte[0].toUpperCase())
      .join("");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextForm = {
      ...form,
      [name]: type === "checkbox" ? checked : value,
    };

    if (name === "nombre") {
      nextForm.iniciales = generarIniciales(value);
    }

    setForm(nextForm);
  };

  const validarFormulario = () => {
    return (
      form.nombre &&
      form.sexo &&
      form.area &&
      form.telefono &&
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

    try {
      const payload = {
        ...form,
        email: form.correo,
      };

      const response = await createSolicitud(payload);
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "No se pudo enviar la solicitud");
      }

      Swal.fire({
        icon: "success",
        title: "Solicitud enviada",
        text: "Su solicitud de alta ha sido registrada. Espere aprobación.",
        confirmButtonColor: "#8B1538",
      });

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Error enviando solicitud:", error);
      Swal.fire({
        icon: "error",
        title: "Error al enviar",
        text: error.message || "Hubo un problema al enviar la solicitud",
        confirmButtonColor: "#8B1538",
      });
    }
  };

  const [areas, setAreas] = useState([]);
  const [busquedaArea, setBusquedaArea] = useState("");
  const [mostrarOpcionesArea, setMostrarOpcionesArea] = useState(false);

  const areasFiltradas = areas.filter((area) =>
    (area.nombre || "").toLowerCase().includes(busquedaArea.toLowerCase())
  );
  
      useEffect(() => {
          const cargarAreas = async () => {
              try {
                  const response = await getAreas();
                  if (response.ok) {
                      const data = await response.json();
                      setAreas(data);
                  } else {
                      console.error("Error cargando áreas:", response.status);
                  }
              } catch (error) {
                  console.error("Error cargando áreas:", error);
              }
          };
  
          cargarAreas();
      }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white w-[550px] p-6 rounded-xl shadow-lg">
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
              value={form.nombre}
              placeholder="Nombre completo"
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />

            <input
              name="iniciales"
              value={form.iniciales}
              readOnly
              placeholder="Iniciales generadas"
              className="w-full border rounded px-3 py-2 bg-gray-100"
            />

            <select
              name="sexo"
              value={form.sexo}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Seleccione sexo</option>
              <option>Masculino</option>
              <option>Femenino</option>
              <option>Otro</option>
            </select>

            <div className="relative">
                <label className="block mb-1 text-sm">Área de destino:</label>
                <div className="flex items-center border rounded px-2 py-2">
                    <Search size={16} className="text-gray-400 mr-1" />
                    <input
                    type="text"
                    value={busquedaArea}
                    onChange={(e) => {
                        setBusquedaArea(e.target.value);
                        setForm({...form, area: e.target.value});
                    }}
                    onFocus={() => setMostrarOpcionesArea(true)}
                    className="w-full outline-none text-sm"
                    placeholder="Buscar y seleccionar área"
                    />
                </div>

                {mostrarOpcionesArea && (
                    <div 
                    className="absolute bg-white border w-full mt-1 max-h-40 overflow-y-auto z-50 rounded-lg shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                    >
                    {areasFiltradas.length > 0 ? (
                        areasFiltradas.map((area) => (
                        <div
                            key={area._id}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                            onClick={() => {
                            setForm({...form, area: area.nombre || area._id});
                            setBusquedaArea(area.nombre);
                            setMostrarOpcionesArea(false);
                            }}
                        >
                            {area.nombre}
                        </div>
                        ))
                    ) : (
                        <div className="px-3 py-2 text-gray-400 text-sm">Sin resultados</div>
                    )}
                    </div>
                )}
            </div>

            <div className="flex gap-2">
              <input
                name="telefono"
                value={form.telefono}
                placeholder="Teléfono"
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
              <input
                name="ext"
                value={form.ext}
                placeholder="Ext"
                onChange={handleChange}
                className="w-24 border rounded px-3 py-2"
              />
            </div>

            <input
              name="correo"
              value={form.correo}
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
        </div>
      </div>

      {/* IMAGEN INFERIOR */}
      <div className="w-full h-[120px] overflow-hidden">
        <img
          src={bgNayarit}
          alt="Decoración"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}