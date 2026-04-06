import { Minus } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getUsers } from "../../services/user.service.js";

export function Users() {
  const [criterio, setCriterio] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        const response = await getUsers(token);

        if (!response.ok) {
          setError("No se pudieron cargar los usuarios.");
          console.error("Error cargando usuarios:", response.status, response.statusText);
          return;
        }

        const data = await response.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch (fetchError) {
        setError("Error de red al cargar los usuarios.");
        console.error("Error cargando usuarios:", fetchError);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // 🔍 FILTRO EN TIEMPO REAL
  const filteredUsers = users.filter((user) => {
    const texto = criterio.toLowerCase();
    return (
      (user.nombre?.toLowerCase().includes(texto) ||
      user.iniciales?.toLowerCase().includes(texto) ||
      user.area?.toLowerCase().includes(texto) ||
      (user.email || user.correo)?.toLowerCase().includes(texto)) &&
      !user.roles?.some(r => r.rol.includes('ADMIN'))
    );
  });

  return (
    <div className="flex-1 p-6 bg-gray-100 overflow-y-auto">
      {/* HEADER */}
      <div className="bg-gray-300 rounded-t-md flex items-center justify-between px-4 py-2">
        <h1 className="text-sm font-semibold text-gray-800">
          Consulta de usuarios
        </h1>

        <button className="w-6 h-6 flex items-center justify-center rounded-full bg-[#8B1538] text-white">
          <Minus size={14} />
        </button>
      </div>

      {/* CONTENIDO */}
      <div className="bg-white p-6 rounded-b-md shadow-sm space-y-6 text-xs">
        {/* BUSCADOR */}
        <div>
          <label className="block mb-2 font-medium">
            Criterio de búsqueda:
          </label>

          <input
            type="text"
            value={criterio}
            onChange={(e) => setCriterio(e.target.value)}
            className="w-full border rounded px-2 py-2"
            placeholder="Buscar por nombre, iniciales, área, correo..."
          />
        </div>

        {/* TABLA */}
        <AnimatePresence>
          <motion.div
            key="tabla"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="overflow-x-auto border rounded"
          >
            <table className="min-w-full text-xs">
              <thead className="bg-[#8B1538] text-white">
                <tr>
                  <th className="px-3 py-2 text-left">Nombre</th>
                  <th className="px-3 py-2 text-left">Iniciales</th>
                  <th className="px-3 py-2 text-left">Sexo</th>
                  <th className="px-3 py-2 text-left">Área</th>
                  <th className="px-3 py-2 text-left">Teléfono</th>
                  <th className="px-3 py-2 text-left">Ext</th>
                  <th className="px-3 py-2 text-left">Correo</th>
                  <th className="px-3 py-2 text-left">Copia</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-gray-500">
                      Cargando usuarios...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <tr key={user.userId || index} className="border-t hover:bg-gray-100">
                      <td className="px-3 py-2">{user.nombre}</td>
                      <td className="px-3 py-2">{user.iniciales}</td>
                      <td className="px-3 py-2">{user.sexo}</td>
                      <td className="px-3 py-2">{user.area}</td>
                      <td className="px-3 py-2">{user.telefono}</td>
                      <td className="px-3 py-2">{user.ext || "-"}</td>
                      <td className="px-3 py-2">{user.email || user.correo}</td>
                      <td className="px-3 py-2">{user.copia ? "Sí" : "No"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-gray-500">
                      No hay resultados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
