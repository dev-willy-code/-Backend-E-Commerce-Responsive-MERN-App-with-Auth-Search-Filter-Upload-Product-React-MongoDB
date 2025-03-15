const reviewModel = require("../../models/reviewModel");

/**
 * Controlador para obtener todas las reseñas de un producto.
 * @param {Object} req - Objeto de solicitud (Request).
 * @param {Object} res - Objeto de respuesta (Response).
 */
const getProductReviews = async (req, res) => {
    try {
        // 1️⃣ Obtener el productId de los parámetros
        const { productId } = req.params;

        // 2️⃣ Validar que el productId fue proporcionado
        if (!productId) {
            return res.status(400).json({
                message: "El productId es obligatorio.",
                error: true,
                success: false,
            });
        }

        // 3️⃣ Buscar todas las reseñas del producto
        const reviews = await reviewModel.find({ productId }).populate("userId", "name")
        console.log("PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP");
        console.log("reviews: ", reviews);
        // 4️⃣ Enviar respuesta con las reseñas
        return res.status(200).json({
            data: reviews,
            message: "Reseñas obtenidas exitosamente.",
            error: false,
            success: true,
        });

    } catch (err) {
        // 5️⃣ Manejo de errores generales
        console.error("Error en getProductReviewsController: ", err);
        return res.status(500).json({
            message: "Error interno del servidor.",
            error: true,
            success: false,
        });
    }
};

module.exports = getProductReviews;