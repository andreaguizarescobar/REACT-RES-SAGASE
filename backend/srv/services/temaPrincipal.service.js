import temaPrincipalModel from "../models/temaPrincipal.model.js";
export const getAll = async () => {
  return await temaPrincipalModel.find();
};

const getTemaPrincipal = async (id) => {
  return await temaPrincipalModel.findById(id);
};

const postTemaPrincipal = async (data) => {
  const temaPrincipalExists = await temaPrincipalModel.findOne({
    descripcion: data.descripcion
  });
    if (temaPrincipalExists && data != null) {
    throw new Error("El tema principal ya existe");
  }
    const temaPrincipal = await temaPrincipalModel.create(data);
    return temaPrincipal;
};

const putTemaPrincipal = async (id, data) => {
  return await temaPrincipalModel.findByIdAndUpdate(id, data);
};

const deleteTemaPrincipal = async (id) => {
  return await temaPrincipalModel.findByIdAndDelete(id);
};

export default {
  getAll,
  getTemaPrincipal,
  postTemaPrincipal,
  putTemaPrincipal,
  deleteTemaPrincipal
};