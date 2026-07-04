import Contador from "../models/contador.model.js";
import Area from "../models/area.model.js";

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizarAreaParaNumero = (area) => {
  const texto = String(area || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]+/g, " ")
    .trim()
    .toUpperCase();

  if (!texto) return "OFICIO";

  const partes = texto.split(/\s+/).filter(Boolean);
  if (!partes.length) return "OFICIO";

  const prefijo = partes.length === 1
    ? partes[0]
    : partes.slice(0, 3).join("");

  return prefijo.slice(0, 8) || "OFICIO";
};

const obtenerPrefijoArea = async (areaValor) => {
  if (!areaValor) return "OFICIO";

  const areaBase = await Area.findOne({ nombre: areaValor });

  if (!areaBase) {
    return normalizarAreaParaNumero(areaValor);
  }

  const cadena = [];
  let actual = areaBase;

  while (actual) {
    const valor = actual.abreviatura || actual.nombre || actual.clave;
    if (valor) {
      cadena.unshift(normalizarAreaParaNumero(valor));
    }

    if (!actual.pertenece) break;
    actual = await Area.findById(actual.pertenece).lean();
  }

  if (cadena.length > 1) {
    return cadena.join("/");
  }

  return cadena[0] || normalizarAreaParaNumero(areaValor);
};

export const obtenerSiguienteNumero = async (nombre) => {
  const contador = await Contador.findOneAndUpdate(
    { nombre },
    { $inc: { valor: 1 } },
    {
      new: true,
      upsert: true,
    }
  );

  return contador.valor;
};

export const generarNumeroOficio = async (req, res) => {
  try {
    const area = req.user?.area || "";
    const prefijo = await obtenerPrefijoArea(area);
    const preview = req.body?.preview === true;

    const anio = new Date().getFullYear();
    const nombreContador = `oficio:${prefijo.toUpperCase()}:${anio}`;

    let contadorValor = 1;
    if (!preview) {
      const contador = await Contador.findOneAndUpdate(
        { nombre: nombreContador },
        { $inc: { valor: 1 } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      contadorValor = contador.valor;
    } else {
      const contadorActual = await Contador.findOne({ nombre: nombreContador }).lean();
      contadorValor = (contadorActual?.valor || 0) + 1;
    }

    const numero = `${prefijo}/${String(contadorValor).padStart(3, "0")}/${anio}`;
    res.status(200).json({ numero, prefijo, anio, contador: contadorValor, preview });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAll = async (req, res) => {
  try {
    const contadorList = await Contador.find();
    res.status(200).json(contadorList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export const create = async (req, res) => {
  try {
    const newContador = await Contador.create(req.body);
    res.status(201).json(newContador);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedContador = await Contador.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updatedContador);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export const deleteContador = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedContador = await Contador.findByIdAndDelete(id);
    res.status(200).json(deletedContador);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export default {
  obtenerSiguienteNumero,
  generarNumeroOficio,
  getAll,
  create,
  update,
  deleteContador
};