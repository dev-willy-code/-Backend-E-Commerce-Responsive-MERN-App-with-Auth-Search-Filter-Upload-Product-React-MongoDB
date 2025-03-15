const mongoose = require('mongoose')
const RolePermissions = require("../models/rolePermissionModel");

// Permisos por defecto según roles
// const defaultPermisos = {
//     SUPERADMIN: {
//         puedeModificarPermisos: true,
//         usuarios: {
//             listar: ["GENERAL", "ADMIN", "SUPERADMIN"],
//             actualizar: ["GENERAL", "ADMIN"],
//             eliminar: ["GENERAL", "ADMIN"],
//         },
//         configuraciones: {
//             acceso: true,
//         },
//     },
//     ADMIN: {
//         usuarios: {
//             listar: ["GENERAL", "ADMIN"],
//             actualizar: ["GENERAL"],
//             eliminar: ["GENERAL"],
//         },
//         configuraciones: {
//             acceso: false,
//         },
//     },
//     GENERAL: {
//         usuarios: {
//             listar: [],
//             actualizar: [],
//             eliminar: [],
//         },
//         configuraciones: {
//             acceso: false,
//         },
//     },
// };

const userSchema = mongoose.Schema({
    name: String,
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: String,
    profilePic: String,
    role: {
        type: String,
        enum: ["SUPERADMIN", "ADMIN", "GENERAL"],
        required: true,
    },
    // permisos: {
    //     type: Object,
    //     required: true,
    //     default: function () {
    //         return defaultPermisos[this.role] || {};
    //     },
    // },
    permisos: {
        type: Object,
        required: true,
        default: {},
    },
}, {
    timestamps: true
})


// Middleware para actualizar permisos al cambiar el rol
userSchema.pre('save', async function (next) {
    // Verifica si es un documento nuevo o si se modificó el rol
    if (this.isNew || this.isModified("role")) {
        // Busca los permisos correspondientes en la colección "rolePermissions"
        const rolePermDoc = await RolePermissions.findOne({ role: this.role });
        // Si existe, asigna esos permisos; de lo contrario, asigna {}
        this.permisos = rolePermDoc ? rolePermDoc.permisos : {};
    }
    next();
});

const userModel = mongoose.model("user", userSchema)

module.exports = userModel;