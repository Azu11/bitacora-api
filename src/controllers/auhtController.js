import bcrypt from "bcrypt";
import User from "../models/Usermodel.js";
import { generateToken } from "../utils/helperFunctions.js";

export const login = async (req, res) => {
  const { username, password } = req.body;

  // Validar que los campos no estén vacíos
  if (!username || !password) {
    return res.status(400).json({ message: "El nombre de usuario y la contraseña son requeridos" });
  }

  try {
    // Buscar el usuario por nombre de usuario
    const user = await User.findOne({ username }).populate("roles", "name");

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar si el usuario está activo antes de comparar contraseñas
    if (user.status !== "activo") {
      return res.status(403).json({ message: "El usuario está inactivo" });
    }

    // Verificar la contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Generar el token JWT
    const token = generateToken(user);

    // Formatear la respuesta del usuario
    const formattedUser = {
      id: user._id,
      username: user.username,
      roles: user.roles.map((role) => role.name),
      status: user.status,
    };

    // Responder con el token y los datos del usuario
    res.status(200).json({
      message: "Inicio de sesión exitoso",
      token,
      user: formattedUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al iniciar sesión", error: error.message });
  }
};
