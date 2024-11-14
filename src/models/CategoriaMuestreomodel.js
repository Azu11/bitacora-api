import mongoose from 'mongoose';

const categoriaMuestreoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre de la categoría es obligatorio'],
    unique: true
  },
  descripcion: String,
  status: {
    type: String,
    enum: ['activo', 'inactivo'],
    default: 'activo'
  }
}, {
  timestamps: true
});

const CategoriaMuestreo = mongoose.model('CategoriaMuestreo', categoriaMuestreoSchema);
export default CategoriaMuestreo;