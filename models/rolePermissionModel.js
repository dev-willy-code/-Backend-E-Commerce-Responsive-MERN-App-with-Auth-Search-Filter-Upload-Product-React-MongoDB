// models/rolePermissionsModel.js
const mongoose = require("mongoose");

const rolePermissionsSchema = new mongoose.Schema({
    // Rol específico
    role: {
        type: String,
        unique: true, // un documento por rol
        required: true,
    },
    // Objeto con la configuración de permisos
    permisos: {
        type: Object,
        required: true,
    },
});

module.exports = mongoose.model("rolepermission", rolePermissionsSchema);
