import Contador from "../models/contador.model.js";

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
  getAll,
  create,
  update,
  deleteContador
};