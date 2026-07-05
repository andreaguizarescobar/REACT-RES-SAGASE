import { Minus, ChevronDown } from "lucide-react";
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
    <div className="flex-1 w-full p-3 sm:p-4 md:p-6 bg-gray-100 overflow-y-auto">
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
        <div className="bg-white p-6 rounded-b-md shadow-sm text-xs space-y-6">

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-300" />

              <h2 className="text-sm font-semibold text-[#8B1538] uppercase tracking-wide">
                  Datos del Oficio
              </h2>

              <div className="h-px flex-1 bg-gray-300" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 gap-x-6 gap-y-6 text-xs">


            {/* Fondo */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Fondo</label>
              <input
                type="text"
                name="fondo"
                value={form.fondo}
                onChange={handleChange}
                className="
                  w-full
                  rounded-xl
                  border
                  border-gray-300
                  px-4
                  py-2
                  text-sm
                  outline-none
                  transition
                  focus:border-[#8B1538]
                  focus:ring-2
                  focus:ring-[#8B1538]/20
                  "
              />
            </div>

            {/* Año */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Año</label>
              <input
                type="text"
                name="anio"
                value={form.anio}
                onChange={handleChange}
                className="
                  w-full
                  rounded-xl
                  border
                  border-gray-300
                  px-4
                  py-2
                  text-sm
                  outline-none
                  transition
                  focus:border-[#8B1538]
                  focus:ring-2
                  focus:ring-[#8B1538]/20
                  "
              />
            </div>

            {/* Folio */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Folio</label>
              <input
                type="text"
                name="folio"
                value={form.folio}
                onChange={handleChange}
                className="
                  w-full
                  rounded-xl
                  border
                  border-gray-300
                  px-4
                  py-2
                  text-sm
                  outline-none
                  transition
                  focus:border-[#8B1538]
                  focus:ring-2
                  focus:ring-[#8B1538]/20
                  "
              />
            </div>

            {/* Fecha elaboración */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Fecha de elaboración</label>
              <input
                type="date"
                name="fechaElaboracion"
                value={form.fechaElaboracion}
                onChange={handleChange}
                className="
                  w-full
                  rounded-xl
                  border
                  border-gray-300
                  px-4
                  py-2
                  text-sm
                  outline-none
                  transition
                  focus:border-[#8B1538]
                  focus:ring-2
                  focus:ring-[#8B1538]/20
                  "
              />
            </div>

            {/* Tipo de Oficio */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Tipo de Oficio</label>
              <input
                type="text"
                name="tipoOficio"
                value={form.tipoOficio}
                onChange={handleChange}
                className="
                  w-full
                  rounded-xl
                  border
                  border-gray-300
                  px-4
                  py-2
                  text-sm
                  outline-none
                  transition
                  focus:border-[#8B1538]
                  focus:ring-2
                  focus:ring-[#8B1538]/20
                  "
              />
            </div>

            {/* Asunto */}
            <div className="col-span-full">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">Asunto</label>
                <textarea
                  name="asunto"
                  value={form.asunto}
                  onChange={handleChange}
                  rows={3}
                  className="
                    w-full
                    rounded-xl
                    border
                    border-gray-300
                    px-4
                    py-3
                    resize-none
                    outline-none
                    transition
                    focus:border-[#8B1538]
                    focus:ring-2
                    focus:ring-[#8B1538]/20
                    "
                />
              </div>
            </div>

            {/* Área */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Área</label>
            <div className="relative">
              <select
                name="area"
                value={form.area}
                onChange={handleChange}
                className="
                  w-full
                  rounded-xl
                  border
                  border-gray-300
                  px-4
                  py-2
                  pr-10
                  text-sm
                  appearance-none
                  outline-none
                  transition
                  focus:border-[#8B1538]
                  focus:ring-2
                  focus:ring-[#8B1538]/20
                  "

              >
                <option value="">Seleccionar</option>
                <option value="direccion">Dirección</option>
                <option value="rh">Recursos Humanos</option>
                <option value="finanzas">Finanzas</option>
              </select>

               <ChevronDown
                    size={18}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                />
              </div>
            </div>

            {/* Para */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Destinatario</label>

            <div className="relative">
                <select
                  name="para"
                  value={form.para}
                  onChange={handleChange}
                  className="
                    w-full
                  rounded-xl
                  border
                  border-gray-300
                  px-4
                  py-2
                  pr-10
                  text-sm
                  appearance-none
                  outline-none
                  transition
                  focus:border-[#8B1538]
                  focus:ring-2
                  focus:ring-[#8B1538]/20
                  "

              >
                <option value="">Seleccionar</option>
                <option value="interno">Interno</option>
                <option value="externo">Externo</option>
              </select>

               <ChevronDown
                    size={18}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                />
              </div>
            </div>

            {/* Atentamente */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Atentamente</label>

              <div className="relative">
                <select
                  name="atentamente"
                  value={form.atentamente}
                  onChange={handleChange}
                  className="
                    w-full
                  rounded-xl
                  border
                  border-gray-300
                  px-4
                  py-2
                  pr-10
                  text-sm
                  appearance-none
                  outline-none
                  transition
                  focus:border-[#8B1538]
                  focus:ring-2
                  focus:ring-[#8B1538]/20
                  "

              >
                <option value="">Seleccionar</option>
                <option value="director">Director</option>
                <option value="subdirector">Subdirector</option>
              </select>

               <ChevronDown
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
              />
              </div>
            </div>

            {/* Botón */}
            <div className="col-span-full flex justify-center sm:justify-end mt-6">
              <button
                onClick={handleGuardar}
                className="
                bg-[#8B1538]
                text-white
                font-semibold
                px-12
                py-3.5
                rounded-xl
                shadow-md
                hover:shadow-xl
                hover:scale-105
                transition-all
                duration-200
                "
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
