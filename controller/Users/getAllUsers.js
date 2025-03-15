const userModel = require("../../models/userModel");

async function getAllUsers(req, res) {
    try {
        // 1. Obtén el usuario que está haciendo la petición.
        //    Esto supone que en tu middleware de autenticación
        //    tienes algo como req.userId con el ID del usuario.
        //    Si ya tienes el usuario en req.user, úsalo directamente.
        const currentUser = await userModel.findById(req.userId);
        if (!currentUser) {
            return res.status(404).json({
                message: "El usuario actual no existe.",
                success: false,
                error: true
            });
        }

        // 2. Verifica los roles que puede "listar" este usuario
        const rolesPermitidos = currentUser.permisos?.usuarios?.listar || [];

        // Si no hay roles permitidos para listar, devuelves 403
        if (rolesPermitidos.length === 0) {
            return res.status(403).json({
                message: "No tienes permisos para listar usuarios",
                success: false,
                error: true
            });
        }

        // 3. Filtra los usuarios en la base de datos
        //    Devolverá solo aquellos cuyo `role` esté incluido en rolesPermitidos
        const allUsers = await userModel.find({
            role: { $in: rolesPermitidos },
        });

        return res.json({
            message: "Usuarios listados correctamente",
            data: allUsers,
            success: true,
            error: false
        });
    } catch (err) {
        return res.status(400).json({
            message: err.message || err,
            error: true,
            success: false
        });
    }
}

module.exports = getAllUsers;
