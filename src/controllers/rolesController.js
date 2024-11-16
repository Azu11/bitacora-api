import Role from "../models/Rolemodel.js";
import { findRoleByName, formatRoleResponse } from "../utils/helperFunctions.js";

// Gestor de errores centralizado para agilizar las respuestas a errores repetitivos
const handleErrors = (res, error, status = 400) => res.status(status).json({ message: error.message });

// Lógica centralizada de recuperación de roles
const getRoles = async (roleNames) => {
  return roleNames && roleNames.length > 0
    ? await Role.find({ name: { $in: roleNames } })
    : [await findRoleByName("colaborador")];
};

// Crear un nuevo rol
export const createRole = async (req, res) => {
  const { name, status } = req.body;

  // Validación de entrada
  if (!name) {
    return res.status(400).json({ message: "El campo 'name' es obligatorio" });
  }

  try {
    // Verificar si el rol ya existe
    const existingRole = await Role.findOne({ name: name.toLowerCase().trim() });
    if (existingRole) {
      return res.status(400).json({ message: "El rol ya existe" });
    }

    // Crear y guardar el nuevo rol
    const newRole = new Role({
      name: name.toLowerCase().trim(),
      status: status || "activo",
    });

    const savedRole = await newRole.save();

    res.status(201).json({
      message: "Rol creado exitosamente",
      role: formatRoleResponse(savedRole), // Formatear la respuesta si es necesario
    });
  } catch (error) {
    handleErrors(res, error);
  }
};

// Obtener todos los roles
export const getRolesList = async (req, res) => {
  try {
    const roles = await Role.find().populate("users", "username");
    res.status(200).json(roles.map(formatRoleResponse));
  } catch (error) {
    handleErrors(res, error, 500);
  }
};

// Obtener un rol por ID
export const getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ message: "Rol no encontrado" });
    res.status(200).json(formatRoleResponse(role));
  } catch (error) {
    handleErrors(res, error, 500);
  }
};


// Actualizar un rol con múltiples usuarios
export const updateRole = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { name, userIds, status } = req.body;
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ message: "Rol no encontrado" });

    const updatedFields = {
      ...(name && name !== role.name && { name }),
      ...(status && status !== role.status && { status }),
      ...(userIds && {
        users: (await getUsers(userIds)).map((user) => user._id),
      }),
    };

    if (Object.keys(updatedFields).length === 0) {
      return res.status(400).json({ message: "No hay cambios para actualizar" });
    }

    const updatedRole = await Role.findByIdAndUpdate(req.params.id, updatedFields, { new: true }).select("-password");
    res.status(200).json(formatRoleResponse(updatedRole));
  } catch (error) {
    handleErrors(res, error);
  }
};

// Eliminar un rol por ID
export const deleteRole = async (req, res) => {
  try {
    const deletedRole = await Role.findByIdAndDelete(req.params.id);
    if (!deletedRole) return res.status(404).json({ message: "Rol no encontrado" });
    res.status(200).json({ message: "Rol eliminado" });
  } catch (error) {
    handleErrors(res, error, 500);
  }
};