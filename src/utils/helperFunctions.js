const findRoleByName = async (roleName) => {
  return roleName && roleName.length > 0
    ? await Role.findOne({ name: roleName })
    : await Role.findOne({ name: "colaborador" });
};

const formatUserResponse = (user) => {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    roles: user.roles.map((role) => role.name),
    status: user.status,
  };
};

const updatePassword = async (newPassword, currentPassword) => {
  return await bcrypt.compare(currentPassword, currentPassword)
    ? await bcrypt.hash(newPassword, 10)
    : Promise.reject(new Error("La contraseña actual no es correcta"));
};

const formatBitacoraResponse = (bitacora) => {
  return {
    id: bitacora._id,
    title: bitacora.title,
    description: bitacora.description,
    location: bitacora.location,
    conditions: bitacora.conditions,
    details: bitacora.details,
    observations: bitacora.observations,
    createdBy: bitacora.createdBy.username,
    createdAt: bitacora.createdAt,
    updatedAt: bitacora.updatedAt,
    roles: bitacora.roles.map((role) => role.name),
  };
};

export { findRoleByName, formatUserResponse, updatePassword, formatBitacoraResponse };
