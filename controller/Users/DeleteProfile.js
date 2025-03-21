const mongoose = require("mongoose");
const userModel = require("../../models/userModel");
const reviewModel = require("../../models/reviewModel");
const cartModel = require("../../models/cartProductModel");

async function deleteProfile(req, res) {
    const session = await mongoose.startSession(); // Inicia una sesión de transacción
    session.startTransaction();

    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({
                message: "No se encontró la sesión del usuario",
                success: false,
                error: true
            });
        }

        const user = await userModel.findById(userId).session(session);
        if (!user) {
            return res.status(404).json({
                message: "Usuario no encontrado",
                success: false,
                error: true
            });
        }

        if (user.role === "SUPERADMIN" || user.role === "ADMIN") {
            return res.status(401).json({
                message: "No puedes eliminar una cuenta de tipo superadmin o admin",
                success: false,
                error: true
            });
        }

        // Eliminar todas las reviews del usuario
        await reviewModel.deleteMany({ userId }).session(session);

        // Eliminar cualquier carrito asociado al usuario
        await cartModel.deleteMany({ userId }).session(session);

        // Eliminar usuario
        await userModel.findByIdAndDelete(userId).session(session);

        await session.commitTransaction(); // Confirma la transacción
        session.endSession();

        return res.status(200).json({
            message: "Cuenta eliminada con éxito, junto con sus reviews y carritos",
            success: true,
            error: false
        });

    } catch (error) {
        await session.abortTransaction(); // Revierte los cambios si algo falla
        session.endSession();

        return res.status(400).json({
            message: error.message || "Error al eliminar la cuenta",
            success: false,
            error: true
        });
    }
}

module.exports = deleteProfile;
