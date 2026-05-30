import { useState } from "react";
import Swal from "sweetalert2";
import { createRemitente } from "../../services/remitente.service";

export function ModalNuevoRemitente({ isOpen, onClose, onRemitentCreated }) {
  const [formData, setFormData] = useState({
    name: "",
    tipo: "",
    cargo: "",
    area: "",
    dependencia: "",
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar campos requeridos
    if (!formData.name || !formData.tipo || !formData.cargo) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Nombre, tipo y cargo son obligatorios",
      });
      return;
    }

    setLoading(true);
    try {
      const nuevoRemitente = await createRemitente(formData);
      Swal.fire({
        icon: "success",
        title: "Éxito",
        text: "Remitente creado correctamente",
      });
      setFormData({
        name: "",
        tipo: "",
        cargo: "",
        area: "",
        dependencia: "",
      });
      onRemitentCreated(nuevoRemitente);
      onClose();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Error al crear el remitente",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-4">Nuevo Remitente</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Nombre*
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:border-[#8B1538]"
              placeholder="Nombre del remitente"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tipo*</label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:border-[#8B1538]"
            >
              <option value="">Selecciona tipo</option>
              <option value="interno">Interno</option>
              <option value="externo">Externo</option>
              <option value="ciudadano">Ciudadano</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Cargo*</label>
            <input
              type="text"
              name="cargo"
              value={formData.cargo}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:border-[#8B1538]"
              placeholder="Cargo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Área</label>
            <input
              type="text"
              name="area"
              value={formData.area}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:border-[#8B1538]"
              placeholder="Área"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Dependencia</label>
            <input
              type="text"
              name="dependencia"
              value={formData.dependencia}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:border-[#8B1538]"
              placeholder="Dependencia"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#8B1538] text-white rounded hover:opacity-90 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
