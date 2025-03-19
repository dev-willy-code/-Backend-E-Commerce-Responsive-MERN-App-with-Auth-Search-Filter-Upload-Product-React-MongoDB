const userModel = require("../../models/userModel");

async function updateUser(req, res) {
    try {
        // 1. ID del usuario que será modificado
        const { userId, email, name, role } = req.body;

        // 2. Usuario actual (quien hace la petición)
        //    Suponiendo que tenemos `req.userId` gracias al middleware de autenticación
        //    (podrías usar también `req.user` si lo cargas completo).
        const currentUser = await userModel.findById(req.userId);
        if (!currentUser) {
            return res.status(404).json({
                message: "El usuario actual (quien hace la petición) no existe.",
                error: true,
                success: false,
            });
        }

        // 3. Verificar que este usuario tenga permiso para "actualizar" usuarios
        //    Obtenemos los roles que tiene permiso de actualizar (los que tengan `true` en el objeto)
        const rolesPermitidos = Object.keys(currentUser.permisos?.usuarios?.actualizar || {}).filter(
            role => currentUser.permisos.usuarios.actualizar[role]
        );

        // 4. Buscar al usuario que se desea actualizar
        const userToUpdate = await userModel.findById(userId);
        if (!userToUpdate) {
            return res.status(404).json({
                message: "Usuario a actualizar no encontrado",
                error: true,
                success: false,
            });
        }

        // 5. Validar que el `role` de ese usuario está en la lista de roles que el actualUser puede actualizar
        //    Por ejemplo, si rolesPermitidos = ["GENERAL"], y userToUpdate.role = "ADMIN", no podrás actualizarlo.
        if (!rolesPermitidos.includes(userToUpdate.role)) {
            return res.status(403).json({
                message: `No puedes actualizar usuarios con el rol ${userToUpdate.role}.`,
                error: true,
                success: false,
            });
        }
        console.log("role: ", role);
        // 6. Aplicar los cambios
        if (email) userToUpdate.email = email;
        if (name) userToUpdate.name = name;
        if (role) userToUpdate.role = role; // Esto también podría requerir lógica adicional
        // Por ejemplo, que no puedas cambiar un GENERAL a SUPERADMIN(ya implementado )

        // 7. Guardar cambios (ejecuta el pre('save') si cambia el rol)
        await userToUpdate.save();

        return res.json({
            data: userToUpdate,
            message: "User Updated",
            success: true,
            error: false,
        });
    } catch (err) {
        return res.status(400).json({
            message: err.message,
            error: true,
            success: false,
        });
    }
}

module.exports = updateUser;
