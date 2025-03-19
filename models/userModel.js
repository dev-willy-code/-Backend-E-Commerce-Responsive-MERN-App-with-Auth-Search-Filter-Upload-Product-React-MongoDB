const mongoose = require('mongoose')
const RolePermissions = require("../models/rolePermissionModel");

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
        required: true,
    },
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