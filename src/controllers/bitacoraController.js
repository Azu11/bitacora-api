import Bitacora from "../models/bitacoramodel.js";
import { findRoleByName, formatBitacoraResponse } from "../utils/helperFunctions.js";

// Gestor de errores centralizado para agilizar las respuestas a errores repetitivos
const handleErrors = (res, error, status = 400) => res.status(status).json({ message: error.message });

// Lógica centralizada de recuperación de roles
const getRoles = async (roleNames) => {
  return roleNames && roleNames.length > 0
    ? await Role.find({ name: { $in: roleNames } })
    : [await findRoleByName("colaborador")];
};

// Obtener todos los bitacoras
export const getBitacorasList = async (req, res) => {
  try {
    const bitacoras = await Bitacora.find().populate("roles", "name");
    res.status(200).json(bitacoras.map(formatBitacoraResponse));
  } catch (error) {
    handleErrors(res, error, 500);
  }
};

// Obtener un bitacora por ID
export const getBitacoraById = async (req, res) => {
  try {
    const bitacora = await Bitacora.findById(req.params.id).populate("roles", "name");
    if (!bitacora) return res.status(404).json({ message: "Bitácora no encontrada" });
    res.status(200).json(formatBitacoraResponse(bitacora));
  } catch (error) {
    handleErrors(res, error, 500);
  }
};

// Crear un nuevo bitacora
export const createBitacora = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { title, description, location, conditions, details, observations, createdBy } = req.body;

    const roles = await getRoles(createdBy.roleNames);
    if (roles.length === 0) return res.status(400).json({ message: "No se pudo encontrar ningún rol válido" });

    const newBitacora = new Bitacora({
      title,
      description,
      location,
      conditions,
      details,
      observations,
      createdBy: createdBy._id,
      roles: roles.map((role) => role._id),
    });
    const savedBitacora = await newBitacora.save();
    res.status(201).json(formatBitacoraResponse(savedBitacora));
  } catch (error) {
    handleErrors(res, error);
  }
};      

// Actualizar un bitacora
export const updateBitacora = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { title, description, location, conditions, details, observations, createdBy } = req.body;
    const bitacora = await Bitacora.findById(req.params.id);
    if (!bitacora) return res.status(404).json({ message: "Bitácora no encontrada" });

    const updatedFields = {
      ...(title && title !== bitacora.title && { title }),
      ...(description && description !== bitacora.description && { description }),
      ...(location && location !== bitacora.location && { location }),
      ...(conditions && conditions !== bitacora.conditions && { conditions }),
      ...(details && details !== bitacora.details && { details }),
      ...(observations && observations !== bitacora.observations && { observations }),
      ...(createdBy && createdBy !== bitacora.createdBy && { createdBy }),
    };

    if (Object.keys(updatedFields).length === 0) {
      return res.status(400).json({ message: "No hay cambios para actualizar" });
    }

    const updatedBitacora = await Bitacora.findByIdAndUpdate(req.params.id, updatedFields, { new: true }).select("-password");
    res.status(200).json(formatBitacoraResponse(updatedBitacora));
  } catch (error) {
    handleErrors(res, error);
  }
};

// Eliminar un bitacora por ID
export const deleteBitacora = async (req, res) => {
  try {
    const deletedBitacora = await Bitacora.findByIdAndDelete(req.params.id);
    if (!deletedBitacora) return res.status(404).json({ message: "Bitácora no encontrada" });
    res.status(200).json({ message: "Bitácora eliminada" });
  } catch (error) {
    handleErrors(res, error, 500);
  }
};