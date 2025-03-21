const RolePermissionsModel = require("../../models/rolePermissionModel");
const userModel = require("../../models/userModel");

//Crea un rol nuevo
const createRole = async (req, res) => {
    try {
        let { role } = req.body;

        // ✂️ Eliminar espacios en blanco
        role = role.trim();

        // 1️⃣ Validar que el rol no esté vacío y sea string
        if (!role || typeof role !== "string") {
            return res.status(400).json({
                message: "El nombre del rol es obligatorio y debe ser un string.",
                success: false,
                error: true
            });
        }
        if (role.length > 10) {
            return res.status(400).json({
                message: "El rol no puede tener más de 10 caracteres.",
                success: false,
                error: true
            });
        }

        // 2️⃣ Obtener todos los roles existentes
        const allRoles = await RolePermissionsModel.find({});
        const existingRoles = allRoles.map(item => item.role);

        // 3️⃣ Verificar si el rol ya existe
        if (existingRoles.includes(role)) {
            return res.status(400).json({
                message: "El rol ya existe.",
                success: false,
                error: true
            });
        }

        //1- existingRoles:  [ 'GENERAL', 'ADMIN', 'SUPERADMIN', 'MANAGER' ]
        console.log("1- existingRoles: ", existingRoles);

        // 4️⃣ Crear nuevo rol con permisos en false por defecto
        const newRole = new RolePermissionsModel({
            role,
            permisos: {
                configuracion: {
                    puedeModificarPermisos: false,
                    puedeCrearRoles: false,
                    puedeAbrirPanelAdmin: false,
                    puedeVerOrdenes_Pagos: false
                },
                usuarios: {
                    "listar": Object.fromEntries(existingRoles.map(r => [r, false])),
                    "actualizar": Object.fromEntries(existingRoles.map(r => [r, false])),
                    "eliminar": Object.fromEntries(existingRoles.map(r => [r, false]))
                },
                productos: {
                    listar: false,
                    actualizar: false,
                    eliminar: false,
                    crear: false
                }
            }
        });

        console.log("2- newRole: ", newRole);


        await newRole.save();

        // 5️⃣ Agregar el nuevo rol en todos los documentos existentes
        await RolePermissionsModel.updateMany(
            {},
            {
                $set: {
                    [`permisos.usuarios.listar.${role}`]: false,
                    [`permisos.usuarios.actualizar.${role}`]: false,
                    [`permisos.usuarios.eliminar.${role}`]: false
                }
            }
        );

        return res.status(201).json({
            message: "Rol creado exitosamente.",
            success: true,
            error: false
        });

    } catch (error) {
        console.error("Error en createRole:", error);
        return res.status(500).json({
            message: error.message || "Error al crear el rol.",
            error: true,
            success: false
        });
    }
};


const deleteRole = async (req, res) => {
    console.log("duck");
    try {
        const { role } = req.params;

        // 1️⃣ Validar que el rol no esté vacío y sea string
        if (!role || typeof role !== "string") {
            return res.status(400).json({
                message: "El nombre del rol es obligatorio y debe ser un string.",
                success: false,
                error: true
            });
        }

        // 2️⃣ Verificar si el rol existe
        const existingRole = await RolePermissionsModel.findOne({ role });
        if (!existingRole) {
            return res.status(404).json({
                message: "El rol no existe.",
                success: false,
                error: true
            });
        }

        // 3️⃣ Eliminar el rol de la colección `RolePermissionsModel`
        await RolePermissionsModel.deleteOne({ role });

        // 4️⃣ Quitar el rol de los permisos de `usuarios.listar`, `usuarios.actualizar`, `usuarios.eliminar`
        await RolePermissionsModel.updateMany(
            {},
            {
                $unset: {
                    [`permisos.usuarios.listar.${role}`]: "",
                    [`permisos.usuarios.actualizar.${role}`]: "",
                    [`permisos.usuarios.eliminar.${role}`]: ""
                }
            }
        );


        // 5️⃣ Obtener los permisos del rol "GENERAL"
        const generalRole = await RolePermissionsModel.findOne({ role: "GENERAL" });
        const generalPermisos = generalRole ? generalRole.permisos : {};

        console.log("role: ", role);

        // 6️⃣ Reasignar el rol "GENERAL" y sus permisos a los usuarios que tenían el rol eliminado
        const updatedUsers = await userModel.updateMany(
            { role }, // Solo a los usuarios con el rol eliminado
            {
                $set: {
                    role: "GENERAL",
                    permisos: generalPermisos // Asignar los permisos del rol "GENERAL"
                }
            }
        );

        console.log("updatedUsers: ", updatedUsers);

        return res.status(200).json({
            message: `Rol eliminado exitosamente. Se actualizaron ${updatedUsers.modifiedCount} usuarios a 'GENERAL' con permisos correspondientes.`,
            success: true,
            error: false
        });

    } catch (error) {
        console.error("Error en deleteRole:", error);
        return res.status(500).json({
            message: error.message || "Error al eliminar el rol.",
            error: true,
            success: false
        });
    }
};

module.exports = { createRole, deleteRole };
