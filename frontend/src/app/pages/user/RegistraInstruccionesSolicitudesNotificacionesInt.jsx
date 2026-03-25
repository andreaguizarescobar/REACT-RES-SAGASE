import { Minus } from "lucide-react";
import { useState } from "react";

export function RegistraInstruccionesSolicitudesNotificacionesInt() {
  const [form, setForm] = useState({
    tipoDocumento: "",
    fecha: "",
    area: "",
    numeroOficio: "",
    asunto: "",
    destinatario: "",
    informacion: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleGuardar = () => {
    console.log("Datos registrados:", form);
  };

  return (
    <div className="flex-1 w-full p-6 bg-gray-100 overflow-y-auto">
      <div className="w-full">

        {/* Header */}
        <div className="bg-gray-300 rounded-t-md flex items-center justify-between px-4 py-2">
          <h1 className="text-sm font-semibold text-gray-800">
            Registra documento y genera notas de atención
          </h1>

          <button className="w-7 h-7 flex items-center justify-center rounded-full bg-[#8B1538] text-white">
            <Minus size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="w-full bg-white rounded-b-md shadow-sm p-6">

          {/* Tipo de documento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs mb-6">

            <div>
              <label className="block mb-1 font-medium">
                Tipo de documento:
              </label>

              <select
                name="tipoDocumento"
                value={form.tipoDocumento}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-2 py-1 h-8 focus:outline-none focus:ring-2 focus:ring-[#8B1538]"
              >
                <option value="">Seleccionar</option>
                <option value="oficio">Oficio</option>
                <option value="circular">Circular</option>
                <option value="memorandum">Memorandum</option>
              </select>
            </div>

            {form.tipoDocumento && (
              <>
                <div>
                  <label className="block mb-1 font-medium">
                    Fecha:
                  </label>

                  <input
                    type="datetime-local"
                    name="fecha"
                    value={form.fecha}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-2 py-1 h-8 focus:outline-none focus:ring-2 focus:ring-[#8B1538]"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">
                    Área:
                  </label>

                  <select
                    name="area"
                    value={form.area}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-2 py-1 h-8 focus:outline-none focus:ring-2 focus:ring-[#8B1538]"
                  >
                    <option value="">Seleccionar</option>
                    <option value="direccionTI">
                      Dirección de Tecnologías de la Información
                    </option>
                    <option value="rh">Recursos Humanos</option>
                    <option value="finanzas">Finanzas</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Formulario principal */}
          {form.tipoDocumento && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">

              {/* Número de oficio */}
              <div>
                <label className="block mb-1 font-medium">
                  Núm. Oficio:
                </label>

                <input
                  type="text"
                  name="numeroOficio"
                  value={form.numeroOficio}
                  onChange={handleChange}
                  placeholder="DG/DTIC/2023"
                  className="w-full border border-gray-300 rounded px-2 py-1 h-8 focus:outline-none focus:ring-2 focus:ring-[#8B1538]"
                />
              </div>

              {/* Destinatario */}
              <div>
                <label className="block mb-1 font-medium">
                  Para:
                </label>

                <input
                  type="text"
                  name="destinatario"
                  value={form.destinatario}
                  onChange={handleChange}
                  placeholder="Nombre del destinatario"
                  className="w-full border border-gray-300 rounded px-2 py-1 h-8 focus:outline-none focus:ring-2 focus:ring-[#8B1538]"
                />
              </div>

              {/* Asunto */}
              <div className="md:col-span-2">
                <label className="block mb-1 font-medium">
                  Asunto:
                </label>

                <input
                  type="text"
                  name="asunto"
                  value={form.asunto}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-2 py-1 h-8 focus:outline-none focus:ring-2 focus:ring-[#8B1538]"
                />
              </div>

              {/* Información */}
              <div className="md:col-span-2">
                <label className="block mb-1 font-medium">
                  Información:
                </label>

                <textarea
                  name="informacion"
                  value={form.informacion}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Escriba aquí la información que se dará a conocer..."
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8B1538]"
                />
              </div>

              {/* Botón */}
              <div className="col-span-full flex justify-end mt-6">
                <button
                  onClick={handleGuardar}
                  className="bg-[#8B1538] text-white px-16 py-2 rounded hover:opacity-90 transition"
                >
                  Guardar
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
