//este controlador actualiza un review

const reviewModel = require("../../models/reviewModel");

/**
 * Controlador para actualizar una reseña de un producto.
 * @param {Object} req - Objeto de solicitud (Request).
 * @param {Object} res - Objeto de respuesta (Response).
 */
const updateReview = async (req, res) => {
    console.log("xxxxxxxxxxxxxx updateReview");
    try {
        // 1️⃣ Extraer datos del cuerpo de la solicitud
        const { reviewId, rating, comment } = req.body;
        const userId = req.userId;

        // 2️⃣ Validar que los campos requeridos estén presentes
        if (!userId || !reviewId || rating == null) {
            return res.status(400).json({
                message: "Faltan datos obligatorios (userId, reviewId, rating).",
                error: true,
                success: false,
            });
        }

        // 3️⃣ Buscar la reseña en la base de datos y verificar que pertenece al usuario
        const review = await reviewModel.findOne({ _id: reviewId, userId });
        if (!review) {
            return res.status(404).json({
                message: "Reseña no encontrada o no autorizada para actualizar.",
                error: true,
                success: false,
            });
        }

        // 4️⃣ Actualizar los campos permitidos (rating y comentario)
        review.rating = rating;
        review.comment = comment;


        // 5️⃣ Guardar los cambios en la base de datos
        await review.save();

        // 6️⃣ Enviar respuesta de éxito
        return res.status(200).json({
            message: "Reseña actualizada exitosamente.",
            error: false,
            success: true,
            data: review
        });

    } catch (err) {
        // 7️⃣ Manejo de errores generales
        console.error("Error en updateReviewController: ", err);
        return res.status(500).json({
            message: "Error interno del servidor.",
            error: true,
            success: false,
        });
    }
};

module.exports = updateReview;
