const userModel = require("../../models/userModel");

async function deleteUser(req, res) {
    try {
        //1. ID del usuario que se desea eliminar
        const { userId } = req.body;

        //2. Usuario actual (quien hace la peticion a la base de datos)
        const currentUser = await userModel.findById(req.userId);
        if (!currentUser) {
            return res.status(404).json({
                message: "El usuario actual (quien hace la peticion) no existe.",
                error: true,
                success: false,
            });
        }

        // 3. Verificar si este usuario tiene permiso para eliminar usuarios
        const rolesPermitidosObj = currentUser.permisos?.usuarios?.eliminar || {};

        const rolesPermitidos = Object.keys(rolesPermitidosObj).filter(
            (rol) => rolesPermitidosObj[rol] === true
        );

        if (rolesPermitidos.length === 0) {
            return res.status(403).json({
                message: "No tienes permisos para eliminar usuarios",
                error: true,
                success: false,
            });
        }

        // 4. Buscar al usuario que se desea eliminar
        const userToDelete = await userModel.findById(userId);
        if (!userToDelete) {
            return res.status(404).json({
                message: "Usuario a eliminar no encontrado",
                error: true,
                success: false,
            });
        }

        // 5. Validar que el rol del usuario a eliminar esté en la lista de roles permitidos
        if (!rolesPermitidos.includes(userToDelete.role)) {
            return res.status(403).json({
                message: `No puedes eliminar usuarios con el rol ${userToDelete.role}.`,
                error: true,
                success: false,
            });
        }


        //6. Eliminar al usuario
        await userModel.findByIdAndDelete(userId);

        return res.json({
            message: "User deleted succesfully",
            success: true,
            error: false,
        })
    } catch (error) {
        return res.status(400).json({
            message: error.message,
            error: true,
            success: false
        });
    }

}

module.exports = deleteUser;