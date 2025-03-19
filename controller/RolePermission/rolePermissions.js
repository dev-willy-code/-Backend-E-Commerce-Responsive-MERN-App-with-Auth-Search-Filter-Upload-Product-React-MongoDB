// controllers/rolePermissionsController.js
const RolePermissions = require("../../models/rolePermissionModel");
const UserModel = require("../../models/userModel");

//actuallizar los permisos de un rol en especifico como admin o general ,etc
async function updateRolePermissions(req, res) {
    try {

        const currentUser = await UserModel.findById(req.userId);
        if (!currentUser) {
            return res.status(404).json({
                message: "El usuario actual (quien hace la petición) no existe.",
                error: true,
                success: false,
            });
        }

        const puedeMofifcarPermisos = currentUser.permisos?.configuracion?.puedeModificarPermisos;
        if (!puedeMofifcarPermisos) {
            return res.status(403).json({
                message: "No puede modifcar permisos, NO AUTORIZADO",
                error: true,
                success: false,
            });
        }

        const { role, newPermisos } = req.body;

        // 1. Actualiza la definición de permisos en la colección "rolePermissions"
        const updatedRolePerm = await RolePermissions.findOneAndUpdate(
            { role: role },
            { permisos: newPermisos },
            { new: true } // Devuelve el documento modificado
        );

        if (!updatedRolePerm) {
            return res.status(404).json({
                message: `No existe el rol ${role} en la base de datos`,
                success: false
            });
        }

        // 2. Actualiza a TODOS los usuarios que tengan ese rol.
        //    Para que sus 'permisos' coincidan de forma inmediata.
        await UserModel.updateMany(
            { role: role },
            { permisos: newPermisos }
        );

        return res.status(200).json({
            message: "Permisos globales actualizados y usuarios sincronizados",
            success: true,
            data: updatedRolePerm,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false,
        });
    }
}


async function getAllRolesPermissions(req, res) {
    const currentUser = await UserModel.findById(req.userId);
    if (!currentUser) {
        return res.status(404).json({
            message: "El usuario actual (quien hace la petición) no existe.",
            error: true,
            success: false,
        });
    }

    const puedeMofifcarPermisos = currentUser.permisos?.configuracion?.puedeModificarPermisos;
    if (!puedeMofifcarPermisos) {
        return res.status(403).json({
            message: "No puede ver roles para modificar permisos, NO AUTORIZADO",
            error: true,
            success: false,
        });
    }

    try {
        // Opción 1: Simplemente obtener todos los documentos
        const allRoles = await RolePermissions.find({});
        // Retornará un array de objetos, 
        // por ejemplo: [{role: "ADMIN", permisos: {...}}, {role: "GENERAL", permisos: {...}}, etc.]

        // Estructura de respuesta
        return res.status(200).json({
            success: true,
            error: false,
            data: allRoles,
        });

    } catch (error) {
        console.error("Error al obtener los roles:", error);
        return res.status(500).json({
            success: false,
            error: true,
            message: error.message,
        });
    }
}

module.exports = {
    getAllRolesPermissions,
    updateRolePermissions
};

//module.exports = updateRolePermissions
