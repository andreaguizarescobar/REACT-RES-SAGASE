import { useEffect, useMemo, useState } from "react";
import { createArea, getAreas, updateArea } from "../../services/catalogos.service";

function AreaTreeNode({ area, areas, depth, selectedAreaId, onSelect, onEdit, onCreateChild, expandedNodes, onToggleExpand }) {
  const children = areas.filter((item) => String(item.pertenece) === String(area._id));
  const isSelected = String(selectedAreaId) === String(area._id);
  const isExpanded = expandedNodes.includes(String(area._id));

  return (
    <div className="space-y-2">
      <div
        className={`group rounded-xl border px-3 py-3 transition ${
          isSelected
            ? "border-[#8B1538] bg-[#FBEFF2]"
            : "border-gray-200 bg-white hover:border-[#8B1538] hover:bg-gray-50"
        }`}
        style={{ marginLeft: depth * 16 }}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-1 items-start gap-2">
            {children.length > 0 && (
              <button
                type="button"
                onClick={() => onToggleExpand(area._id)}
                className="mt-0.5 rounded border border-gray-300 bg-white px-1.5 py-1 text-xs text-gray-600 hover:border-[#8B1538] hover:text-[#8B1538]"
              >
                {isExpanded ? "▾" : "▸"}
              </button>
            )}
            <button type="button" onClick={() => onSelect(area)} className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#8B1538]">
                  {area.pertenece ? "Subárea" : "Área principal"}
                </span>
              </div>
            <h4 className="mt-1 text-sm font-semibold text-gray-800">
              {area.nombre || area.clave || "Sin nombre"}
            </h4>
            <p className="mt-1 text-xs text-gray-500">
              {area.clave || "Sin clave"} · {area.abreviatura || "Sin abreviatura"}
            </p>
            </button>
          </div>

          <div className="flex flex-wrap gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => onEdit(area)}
              className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:border-[#8B1538] hover:text-[#8B1538]"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => onCreateChild(area)}
              className="rounded-lg bg-[#8B1538] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-[#6f102d]"
            >
              Añadir subárea
            </button>
          </div>
        </div>
      </div>

      {children.length > 0 && isExpanded && (
        <div className="space-y-2 border-l-2 border-[#8B1538]/20 pl-4">
          {children.map((child) => (
            <AreaTreeNode
              key={child._id}
              area={child}
              areas={areas}
              depth={depth + 1}
              selectedAreaId={selectedAreaId}
              onSelect={onSelect}
              onEdit={onEdit}
              onCreateChild={onCreateChild}
              expandedNodes={expandedNodes}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function GestionAreas({ selectedAreaId = null }) {
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [parentSearch, setParentSearch] = useState("");
  const [showParentOptions, setShowParentOptions] = useState(false);
  const [areaSearch, setAreaSearch] = useState("");
  const [showAreaOptions, setShowAreaOptions] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState([]);
  const [formData, setFormData] = useState({
    _id: "",
    clave: "",
    nombre: "",
    abreviatura: "",
    direccion: false,
    pertenece: "",
  });

  const cargarAreas = async () => {
    try {
      setLoading(true);
      const response = await getAreas();
      const data = response?.ok ? await response.json() : response ? await response.json().catch(() => null) : null;
      const areasData = Array.isArray(data) ? data : [];
      setAreas(areasData);
      return areasData;
    } catch (error) {
      console.error("Error al cargar áreas:", error);
      setAreas([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAreas();
  }, []);

  useEffect(() => {
    if (!selectedAreaId) {
      setSelectedArea(null);
      return;
    }

    const areaSeleccionada = areas.find((area) => String(area._id) === String(selectedAreaId));
    setSelectedArea(areaSeleccionada || null);
  }, [areas, selectedAreaId]);

  const areasJerarquizadas = useMemo(() => {
    return [...areas].sort((a, b) => {
      const nombreA = a?.nombre || a?.clave || "";
      const nombreB = b?.nombre || b?.clave || "";
      return nombreA.localeCompare(nombreB);
    });
  }, [areas]);

  const areaSeleccionadaActual = selectedArea || null;
  const areaPadre = areas.find((area) => String(area._id) === String(areaSeleccionadaActual?.pertenece)) || null;

  const seleccionarAreaPadre = (area = null) => {
    if (area) {
      setFormData((prev) => ({ ...prev, pertenece: String(area._id) }));
      setParentSearch(area.nombre || area.clave || "Sin nombre");
    } else {
      setFormData((prev) => ({ ...prev, pertenece: "" }));
      setParentSearch("");
    }
    setShowParentOptions(false);
  };

  const filteredParentAreas = useMemo(() => {
    const query = parentSearch.toLowerCase().trim();

    return areas.filter((area) => {
      if (String(area._id) === String(formData._id)) {
        return false;
      }

      const label = `${area.nombre || area.clave || "Sin nombre"}`.toLowerCase();
      return !query || label.includes(query);
    }).slice(0, 8);
  }, [areas, formData._id, parentSearch]);

  const filteredAreaOptions = useMemo(() => {
    const query = areaSearch.toLowerCase().trim();

    return areas
      .filter((area) => {
        const label = `${area.nombre || area.clave || "Sin nombre"}`.toLowerCase();
        return !query || label.includes(query);
      })
      .slice(0, 8);
  }, [areas, areaSearch]);

  const toggleExpand = (areaId) => {
    setExpandedNodes((prev) =>
      prev.includes(String(areaId))
        ? prev.filter((id) => id !== String(areaId))
        : [...prev, String(areaId)]
    );
  };

  const abrirFormulario = (modo, area = null) => {
    setFormMode(modo);
    setFeedback("");
    const parentArea = areas.find((item) => String(item._id) === String(area?.pertenece || ""));

    setFormData({
      _id: area?._id || "",
      clave: area?.clave || "",
      nombre: area?.nombre || "",
      abreviatura: area?.abreviatura || "",
      direccion: Boolean(area?.direccion),
      pertenece: area?.pertenece ? String(area.pertenece) : "",
    });
    setParentSearch(parentArea ? (parentArea.nombre || parentArea.clave || "Sin nombre") : "");
    setShowParentOptions(false);
    setIsFormOpen(true);
  };

  const abrirNuevaSubarea = (areaPadreSeleccionado) => {
    setFormMode("create");
    setFeedback("");
    setFormData({
      _id: "",
      clave: "",
      nombre: "",
      abreviatura: "",
      direccion: false,
      pertenece: areaPadreSeleccionado ? String(areaPadreSeleccionado._id) : "",
    });
    setParentSearch(areaPadreSeleccionado ? (areaPadreSeleccionado.nombre || areaPadreSeleccionado.clave || "Sin nombre") : "");
    setShowParentOptions(false);
    setIsFormOpen(true);
  };

  const manejarEnvio = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFeedback("");

    const payload = {
      clave: formData.clave,
      nombre: formData.nombre,
      abreviatura: formData.abreviatura,
      direccion: formData.direccion,
      pertenece: formData.pertenece || undefined,
    };

    try {
      let response;
      if (formMode === "edit") {
        response = await updateArea(formData._id || formData.clave, payload);
      } else {
        response = await createArea(payload);
      }

      const data = response?.ok ? await response.json() : response ? await response.json().catch(() => null) : null;
      if (!response || !response.ok) {
        throw new Error(data?.error || "No se pudo guardar el área");
      }

      await cargarAreas();
      setSelectedArea(data || null);
      setFeedback(formMode === "edit" ? "Área actualizada correctamente." : "Área creada correctamente.");
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error al guardar el área:", error);
      setFeedback(error.message || "No se pudo guardar el área");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8F9FB] p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Gestión de áreas</h1>
              <p className="mt-1 text-sm text-gray-500">
                Visualice la jerarquía del organigrama y gestione cada área con acciones rápidas.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => abrirFormulario("create")}
                className="rounded-lg bg-[#8B1538] px-3 py-2 text-sm font-medium text-white hover:bg-[#6f102d]"
              >
                Nueva área raíz
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700" htmlFor="area-search">
                Buscar área
              </label>
              <div className="relative">
                <input
                  id="area-search"
                  type="text"
                  value={areaSearch}
                  onChange={(event) => {
                    setAreaSearch(event.target.value);
                    setShowAreaOptions(true);
                  }}
                  onFocus={() => setShowAreaOptions(true)}
                  placeholder="Buscar área"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-[#8B1538] focus:outline-none"
                  disabled={loading}
                />

                {showAreaOptions && (
                  <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedArea(null);
                        setAreaSearch("");
                        setShowAreaOptions(false);
                      }}
                      className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Seleccione un área
                    </button>
                    {filteredAreaOptions.length > 0 ? (
                      filteredAreaOptions.map((area) => (
                        <button
                          key={area._id}
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => {
                            setSelectedArea(area);
                            setAreaSearch(area.nombre || area.clave || "Sin nombre");
                            setShowAreaOptions(false);
                          }}
                          className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                        >
                          {`${"  ".repeat(area.pertenece ? 1 : 0)}${area.nombre || area.clave || "Sin nombre"}`}
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500">No hay resultados</div>
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                {areaSeleccionadaActual ? (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-800">
                          {areaSeleccionadaActual.nombre || areaSeleccionadaActual.clave}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                          {areaSeleccionadaActual.clave || "Sin clave"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => abrirFormulario("edit", areaSeleccionadaActual)}
                          className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:border-[#8B1538] hover:text-[#8B1538]"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => abrirNuevaSubarea(areaSeleccionadaActual)}
                          className="rounded-lg bg-[#8B1538] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-[#6f102d]"
                        >
                          Añadir subárea
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2 text-sm text-gray-600">
                      <p>
                        <span className="font-medium text-gray-700">Abreviatura:</span>{" "}
                        {areaSeleccionadaActual.abreviatura || "Sin abreviatura"}
                      </p>
                      <p>
                        <span className="font-medium text-gray-700">Dirección:</span>{" "}
                        {areaSeleccionadaActual.direccion ? "Sí" : "No"}
                      </p>
                      <p>
                        <span className="font-medium text-gray-700">Pertenece a otra área:</span>{" "}
                        {areaSeleccionadaActual.pertenece ? "Sí" : "No"}
                      </p>
                      {areaPadre && (
                        <p>
                          <span className="font-medium text-gray-700">Área padre:</span>{" "}
                          {areaPadre.nombre || areaPadre.clave}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">Seleccione un área para ver sus datos completos.</p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold text-gray-800">Jerarquía de áreas</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Cada área aparece debajo de su padre cuando corresponde.
                  </p>
                </div>
              </div>

              <div className="mt-4 max-h-[420px] space-y-2 overflow-y-auto pr-1">
                {loading ? (
                  <p className="text-sm text-gray-500">Cargando áreas...</p>
                ) : areasJerarquizadas.length > 0 ? (
                  areasJerarquizadas
                    .filter((area) => !area.pertenece)
                    .map((area) => (
                      <AreaTreeNode
                        key={area._id}
                        area={area}
                        areas={areasJerarquizadas}
                        depth={0}
                        selectedAreaId={selectedAreaId || selectedArea?._id}
                        onSelect={(item) => setSelectedArea(item)}
                        onEdit={(item) => abrirFormulario("edit", item)}
                        onCreateChild={(item) => abrirNuevaSubarea(item)}
                        expandedNodes={expandedNodes}
                        onToggleExpand={toggleExpand}
                      />
                    ))
                ) : (
                  <p className="text-sm text-gray-500">No hay áreas registradas.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {formMode === "edit" ? "Editar área" : "Agregar nueva área"}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Complete los datos del área y asóciela a un padre si aplica.
                </p>
              </div>
              <button type="button" onClick={() => setIsFormOpen(false)} className="text-sm text-gray-500 hover:text-gray-700">
                Cerrar
              </button>
            </div>

            <form className="mt-5 space-y-4" onSubmit={manejarEnvio}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Clave</label>
                  <input
                    required
                    value={formData.clave}
                    onChange={(event) => setFormData({ ...formData, clave: event.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#8B1538] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    required
                    value={formData.nombre}
                    onChange={(event) => setFormData({ ...formData, nombre: event.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#8B1538] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Abreviatura</label>
                  <input
                    value={formData.abreviatura}
                    onChange={(event) => setFormData({ ...formData, abreviatura: event.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#8B1538] focus:outline-none"
                  />
                </div>
                <div className="relative">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Área padre</label>
                  <input
                    type="text"
                    value={parentSearch}
                    onChange={(event) => {
                      setParentSearch(event.target.value);
                      setShowParentOptions(true);
                    }}
                    onFocus={() => setShowParentOptions(true)}
                    placeholder="Buscar área padre"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#8B1538] focus:outline-none"
                  />

                  {showParentOptions && (
                    <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                      <button
                        type="button"
                        onClick={() => seleccionarAreaPadre(null)}
                        className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Sin área padre
                      </button>
                      {filteredParentAreas.length > 0 ? (
                        filteredParentAreas.map((area) => (
                          <button
                            key={area._id}
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => seleccionarAreaPadre(area)}
                            className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          >
                            {area.nombre || area.clave || "Sin nombre"}
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">No hay resultados</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.direccion}
                  onChange={(event) => setFormData({ ...formData, direccion: event.target.checked })}
                />
                ¿Es una dirección?
              </label>

              {feedback && (
                <div className={`rounded-lg border px-3 py-2 text-sm ${feedback.includes("correctamente") ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
                  {feedback}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsFormOpen(false)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="rounded-lg bg-[#8B1538] px-3 py-2 text-sm font-medium text-white hover:bg-[#6f102d] disabled:cursor-not-allowed disabled:opacity-70">
                  {saving ? "Guardando..." : formMode === "edit" ? "Guardar cambios" : "Crear área"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
