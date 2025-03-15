const reviewModel = require("../../models/reviewModel");
const productModel = require("../../models/productModel");
const handleMongoDuplicate = require("../../utils/handleMongoDuplicate");

/**
 * Controlador para agregar una reseña a un producto.
 * @param {Object} req - Objeto de solicitud (Request).
 * @param {Object} res - Objeto de respuesta (Response).
 */
const addReview = async (req, res) => {
    console.log("xxxxxxxxxxxxxx addreview");
    try {
        // 1️⃣ Extraer datos del cuerpo de la solicitud
        const { productId, rating, comment } = req.body;
        const userId = req.userId;


        // 2️⃣ Validar que todos los campos requeridos estén presentes
        if (!userId || !productId || rating == null) {
            return res.status(400).json({
                message: "Faltan datos obligatorios (userId, productId, rating).",
                error: true,
                success: false,
            });
        }

        // 3️⃣ Verificar si el producto existe
        const productExists = await productModel.findById(productId);
        if (!productExists) {
            return res.status(404).json({
                message: "El producto no existe.",
                error: true,
                success: false,
            });
        }

        // 4️⃣ Verificar si el usuario ya calificó el producto
        const existingReview = await reviewModel.findOne({ userId, productId });
        if (existingReview) {
            return res.status(400).json({
                message: "El usuario ya ha calificado este producto.",
                error: true,
                success: false,
            });
        }

        // 5️⃣ Crear la nueva reseña
        const newReview = new reviewModel({
            userId,
            productId,
            rating,
            comment
        });

        // 6️⃣ Guardar la reseña en la base de datos
        await newReview.save();

        // 7️⃣ Enviar respuesta de éxito
        return res.status(201).json({
            message: "Reseña agregada exitosamente.",
            error: false,
            success: true,
            data: newReview
        });

    } catch (err) {
        // 8️⃣ Manejo de errores generales
        console.error("Error en addReviewController: ", err);

        const duplicationResponse = handleMongoDuplicate(err);
        if (duplicationResponse) {
            // Si no es null, significa que sí hubo duplicación
            return res.status(400).json(duplicationResponse);
        }
        return res.status(500).json({
            message: err.message || "Error interno del servidor.",
            error: true,
            success: false,
        });
    }
};






// Usa module.exports = { addReview }; si planeas exportar múltiples funciones en un objeto.
// ✔ Usa module.exports = addReview; si solo exportarás una única función.
module.exports = addReview;
