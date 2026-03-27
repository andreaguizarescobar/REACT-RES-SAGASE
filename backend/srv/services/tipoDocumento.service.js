import tipoDocumentoModel from "../models/tipoDocumento.model.js";

const getAll = async () => {
  return await tipoDocumentoModel.find();
};

const getTipoDocumento = async (tipo) => {
  return await tipoDocumentoModel.findOne({ tipo });
}; 

const postTipoDocumento = async (data) => {
  try {
    // Validate input data
    if (!data || !data.tipo || typeof data.tipo !== 'string' || data.tipo.trim() === '') {
      throw new Error("El campo 'tipo' es requerido y debe ser una cadena no vacía");
    }

    const tipoDocumentoExists = await tipoDocumentoModel.findOne({
      tipo: data.tipo.trim()
    });
      if (tipoDocumentoExists) {
      throw new Error("El tipo de documento ya existe");
    }
      const tipoDocumento = await tipoDocumentoModel.create({ tipo: data.tipo.trim() });
      return tipoDocumento;
  } catch (error) {
    // Handle MongoDB duplicate key error for null _id
    if (error.code === 11000 && error.message.includes('ID_1') && error.message.includes('null')) {
      console.log('Detected corrupted data with null _id. Attempting to clean up...');
      try {
        // Remove documents with null _id
        await tipoDocumentoModel.collection.deleteMany({ _id: null });
        console.log('Cleaned up corrupted documents. Retrying creation...');
        // Retry the creation
        const tipoDocumento = await tipoDocumentoModel.create({ tipo: data.tipo.trim() });
        return tipoDocumento;
      } catch (cleanupError) {
        console.error('Failed to clean up corrupted data:', cleanupError);
        throw new Error("Error en la base de datos. Contacte al administrador.");
      }
    }
    throw error;
  }
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