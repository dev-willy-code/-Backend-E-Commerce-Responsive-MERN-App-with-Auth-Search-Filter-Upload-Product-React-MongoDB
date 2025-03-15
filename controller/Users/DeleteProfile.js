const userModel = require("../../models/userModel");

// Controlador para que un usuario elimine su propia cuenta
// aca no se revisan Permisos, todos pueden eliminar su propia cuenta

async function deleteProfile(req, res) {
    try {
        //  ID del usuario autenticado, proveniente de middleware(authToken)
        const userId = req.userId;
        if (!userId) { // tmb puede ser if(userId == null)
            return res.status(401).json({
                message: "No se econtro la sesion del usuario",
                success: false,
                error: true
            });
        }

        //Buscar el usuario
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "Usuario no encontrado",
                success: false,
                error: true
            })
        }

        if (user.role == "SUPERADMIN" || user.role == "ADMIN") {
            return res.status(401).json({
                message: "No puedes eliminar una cuenta de tipo superadmin o admin",
                success: false,
                error: true
            });
        }

        //Eliminar usuario
        await userModel.findByIdAndDelete(userId);

        return res.status(200).json({
            message: "Cuenta eliminada con exito",
            success: true,
            error: false
        })

    } catch (error) {
        return res.status(400).json({
            message: error.message || "Error al eliminar la cuenta",
            success: false,
            error: true
        })
    }
}

module.exports = deleteProfile;