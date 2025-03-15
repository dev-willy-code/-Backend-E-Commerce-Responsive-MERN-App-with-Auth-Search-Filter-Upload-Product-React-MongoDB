const reviewModel = require("../../models/reviewModel");

/**
 * Controlador para eliminar una reseña.
 * @param {Object} req - Objeto de solicitud (Request).
 * @param {Object} res - Objeto de respuesta (Response).
 */
const deleteReview = async (req, res) => {
    try {
        // 1️⃣ Obtener el reviewId del cuerpo de la solicitud
        const { reviewId } = req.body;
        const userId = req.userId;

        // 2️⃣ Validar que los campos requeridos estén presentes
        if (!reviewId || !userId) {
            return res.status(400).json({
                message: "El reviewId y userId son obligatorios.",
                error: true,
                success: false,
            });
        }

        // 3️⃣ Buscar la reseña por ID y verificar que le pertenece al usuario
        const review = await reviewModel.findOne({ _id: reviewId, userId });

        if (!review) {
            return res.status(404).json({
                message: "Reseña no encontrada o no autorizada para eliminar.",
                error: true,
                success: false,
            });
        }

        // 4️⃣ Eliminar la reseña
        await reviewModel.deleteOne({ _id: reviewId });

        // 5️⃣ Enviar respuesta de éxito
        return res.status(200).json({
            message: "Reseña eliminada exitosamente.",
            error: false,
            success: true,
        });

    } catch (err) {
        // 6️⃣ Manejo de errores generales
        console.error("Error en deleteReviewController: ", err);
        return res.status(500).json({
            message: "Error interno del servidor.",
            error: true,
            success: false,
        });
    }
};

module.exports = deleteReview;
