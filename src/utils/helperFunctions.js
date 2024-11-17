import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Role from "../models/Rolemodel.js";

// Función para buscar un rol por nombre
const findRoleByName = async (roleName) => {
  try {
    return roleName && roleName.length > 0
      ? await Role.findOne({ name: roleName })
      : await Role.findOne({ name: "colaborador" });
  } catch (error) {
    throw new Error("Error al buscar el rol: " + error.message);
  }
};

// Función para formatear la respuesta de un usuario
const formatUserResponse = (user) => {
  return {
    id: user._id,
    username: user.username,
    email: user.email || null,
    roles: Array.isArray(user.roles) ? user.roles.map((role) => role.name) : [],
    status: user.status || "inactivo",
  };
};

// Función para actualizar la contraseña
const updatePassword = async (newPassword, currentPassword, hashedPassword) => {
  const isPasswordValid = await bcrypt.compare(currentPassword, hashedPassword);
  if (!isPasswordValid) {
    throw new Error("La contraseña actual no es correcta");
  }
  return await bcrypt.hash(newPassword, 10);
};

// Función para formatear la respuesta de una bitácora
const formatBitacoraResponse = (bitacora) => {
  return {
    id: bitacora._id,
    title: bitacora.title,
    description: bitacora.description,
    location: bitacora.location || "No especificada",
    conditions: bitacora.conditions || "No especificadas",
    details: bitacora.details || {},
    observations: bitacora.observations || "Sin observaciones",
    createdBy: bitacora.createdBy ? bitacora.createdBy.username : "Desconocido",
    createdAt: bitacora.createdAt,
    updatedAt: bitacora.updatedAt,
    roles: Array.isArray(bitacora.roles) ? bitacora.roles.map((role) => role.name) : [],
  };
};

// Función para formatear la respuesta de un rol
const formatRoleResponse = (role) => {
  return {
    id: role._id,
    name: role.name || "Sin nombre",
    status: role.status || "inactivo",
  };
};

// Función para generar un token JWT
const generateToken = (user) => {
  const payload = {
    id: user._id,
    username: user.username,
    email: user.email,
    roles: user.roles.map((role) => role.name),
    status: user.status,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Función para verificar un token JWT
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Función para validar si un token es válido
const isTokenValid = (token) => {
  const decoded = verifyToken(token);
  return decoded !== null;
};

export {
  findRoleByName,
  formatUserResponse,
  updatePassword,
  formatBitacoraResponse,
  formatRoleResponse,
  generateToken,
  verifyToken,
  isTokenValid,
};
