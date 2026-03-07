import { Minus } from "lucide-react";
import { useState } from "react";

export function ControlOficios() {
  const [form, setForm] = useState({
    fondo: "",
    anio: "",
    folio: "",
    fechaElaboracion: "",
    tipoOficio: "",
    asunto: "",
    area: "",
    para: "",
    atentamente: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGuardar = () => {
    console.log("Datos guardados:", form);
  };

  return (
    <div className="flex-1 w-full p-6 bg-gray-100 overflow-y-auto">
      <div className="w-full">
        
        {/* Header */}
        <div className="bg-gray-300 rounded-t-md flex items-center justify-between px-4 py-2">
          <h1 className="text-sm font-semibold text-gray-800">
            Control de oficios
          </h1>
          <button className="w-7 h-7 flex items-center justify-center rounded-full bg-[#8B1538] text-white">
            <Minus size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="w-full bg-white rounded-b-md shadow-sm p-4 sm:p-6 md:p-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-6 text-xs">

            {/* Fondo */}
            <div>
              <label className="block mb-1">Fondo:</label>
              <input
                type="text"
                name="fondo"
                value={form.fondo}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-2 py-1 h-8 focus:outline-none focus:ring-2 focus:ring-[#8B1538]"
              />
            </div>

            {/* Año */}
            <div>
              <label className="block mb-1">Año:</label>
              <input
                type="text"
                name="anio"
                value={form.anio}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-2 py-1 h-8 focus:outline-none focus:ring-2 focus:ring-[#8B1538]"
              />
            </div>

            {/* Folio */}
            <div>
              <label className="block mb-1">Folio:</label>
              <input
                type="text"
                name="folio"
                value={form.folio}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-2 py-1 h-8 focus:outline-none focus:ring-2 focus:ring-[#8B1538]"
              />
            </div>

            {/* Fecha elaboración */}
            <div>
              <label className="block mb-1">Fecha de elaboración:</label>
              <input
                type="date"
                name="fechaElaboracion"
                value={form.fechaElaboracion}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-2 py-1 h-8 focus:outline-none focus:ring-2 focus:ring-[#8B1538]"
              />
            </div>

            {/* Tipo de Oficio */}
            <div>
              <label className="block mb-1">Tipo de Oficio:</label>
              <input
                type="text"
                name="tipoOficio"
                value={form.tipoOficio}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-2 py-1 h-8 focus:outline-none focus:ring-2 focus:ring-[#8B1538]"
              />
            </div>

            {/* Asunto */}
            <div>
              <label className="block mb-1">Asunto:</label>
              <textarea
                name="asunto"
                value={form.asunto}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#8B1538]"
              />
            </div>

            {/* Área */}
            <div>
              <label className="block mb-1">Área:</label>
              <select
                name="area"
                value={form.area}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-2 py-1 h-8 focus:outline-none focus:ring-2 focus:ring-[#8B1538]"
              >
                <option value="">Seleccionar</option>
                <option value="direccion">Dirección</option>
                <option value="rh">Recursos Humanos</option>
                <option value="finanzas">Finanzas</option>
              </select>
            </div>

            {/* Para */}
            <div>
              <label className="block mb-1">Para:</label>
              <select
                name="para"
                value={form.para}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-2 py-1 h-8 focus:outline-none focus:ring-2 focus:ring-[#8B1538]"
              >
                <option value="">Seleccionar</option>
                <option value="interno">Interno</option>
                <option value="externo">Externo</option>
              </select>
            </div>

            {/* Atentamente */}
            <div>
              <label className="block mb-1">Atentamente:</label>
              <select
                name="atentamente"
                value={form.atentamente}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-2 py-1 h-8 focus:outline-none focus:ring-2 focus:ring-[#8B1538]"
              >
                <option value="">Seleccionar</option>
                <option value="director">Director</option>
                <option value="subdirector">Subdirector</option>
              </select>
            </div>

            {/* Botón */}
            <div className="col-span-full flex justify-center sm:justify-end mt-6">
              <button
                onClick={handleGuardar}
                className="bg-[#8B1538] text-white px-16 py-2 rounded hover:opacity-90 transition"
              >
                Guardar
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
