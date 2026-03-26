import tipoDocumentoModel from "../models/tipoDocumento.model.js";

const getAll = async () => {
  return await tipoDocumentoModel.find();
};

const getTipoDocumento = async (tipo) => {
  return await tipoDocumentoModel.findOne({ tipo });
}; 

const postTipoDocumento = async (data) => {
  const tipoDocumentoExists = await tipoDocumentoModel.findOne({
    tipo: data.tipo
  });
    if (tipoDocumentoExists && data != null) {
    throw new Error("El tipo de documento ya existe");
  }
    const tipoDocumento = await tipoDocumentoModel.create(data);
    return tipoDocumento;
};

const putTipoDocumento = async (tipo, data) => {
  return await tipoDocumentoModel.findOneAndUpdate({ tipo }, data);
};

const deleteTipoDocumento = async (tipo) => {
  return await tipoDocumentoModel.deleteOne({ tipo });
};

export default {
  getAll,
  getTipoDocumento,
  postTipoDocumento,
  putTipoDocumento,
  deleteTipoDocumento
};