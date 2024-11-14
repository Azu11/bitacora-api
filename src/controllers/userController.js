import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import User from "../models/Usermodel.js";
import Role from "../models/Rolemodel.js";
import { findRoleByName, formatUserResponse, updatePassword } from "../utils/helperFunctions.js";

// Centralized error handler to streamline repetitive error responses
const handleErrors = (res, error, status = 400) => res.status(status).json({ message: error.message });

// Centralized role retrieval logic
const getRoles = async (roleNames) => {
  return roleNames && roleNames.length > 0
    ? await Role.find({ name: { $in: roleNames } })
    : [await findRoleByName("colaborador")];
};

// Crear un nuevo usuario con múltiples roles
export const createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { username, password, roleNames } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: "El nombre de usuario ya existe" });

    const roles = await getRoles(roleNames);
    if (roles.length === 0) return res.status(400).json({ message: "No se pudo encontrar ningún rol válido" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
      roles: roles.map((role) => role._id),
    });
    const savedUser = await newUser.save();
    res.status(201).json(formatUserResponse(savedUser));
  } catch (error) {
    handleErrors(res, error);
  }
};

// Crear un nuevo usuario a partir de una autenticación con red social
export const createUserWithSocialProfile = async (profile, provider) => {
  try {
    const defaultRole = await findRoleByName("colaborador");
    const newUser = new User({
      username: profile.displayName || profile.username,
      email: profile.emails ? profile.emails[0].value : undefined,
      roles: [defaultRole._id],
      [`${provider}Id`]: profile.id,
    });
    return await newUser.save();
  } catch (error) {
    throw new Error("Failed to create social profile user");
  }
};

// Obtener todos los usuarios con el rol
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().populate("roles", "name");
    res.status(200).json(users.map(formatUserResponse));
  } catch (error) {
    handleErrors(res, error, 500);
  }
};

// Obtener un usuario por ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("roles", "name");
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    res.status(200).json(formatUserResponse(user));
  } catch (error) {
    handleErrors(res, error, 500);
  }
};

// Actualizar un usuario con múltiples roles
export const updateUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { username, password, roleNames, status } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const updatedFields = {
      ...(username && username !== user.username && { username }),
      ...(status && status !== user.status && { status }),
      ...(roleNames && {
        roles: (await getRoles(roleNames)).map((role) => role._id),
      }),
      ...(password && { password: await updatePassword(password, user.password) }),
    };

    if (Object.keys(updatedFields).length === 0) {
      return res.status(400).json({ message: "No hay cambios para actualizar" });
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updatedFields, { new: true }).select("-password");
    res.status(200).json(formatUserResponse(updatedUser));
  } catch (error) {
    handleErrors(res, error);
  }
};

// Añadir roles a un usuario existente
export const addRolesToUser = async (req, res) => {
  try {
    const { roleNames } = req.body;
    const user = await User.findById(req.params.id).populate("roles", "name");
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const newRoles = (await Role.find({ name: { $in: roleNames } }))
      .filter(role => !user.roles.some(r => r._id.equals(role._id)))
      .map(role => role._id);

    if (!newRoles.length) return res.status(400).json({ message: "Todos los roles ya están asignados al usuario" });

    user.roles.push(...newRoles);
    await user.save();
    res.status(200).json(formatUserResponse(user));
  } catch (error) {
    handleErrors(res, error, 500);
  }
};

// Eliminar un usuario por ID
export const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: "Usuario no encontrado" });
    res.status(200).json({ message: "Usuario eliminado" });
  } catch (error) {
    handleErrors(res, error, 500);
  }
};
