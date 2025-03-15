//esta controlador es para obtener el review de un producto por e usuario logueado.
//para saber si el usuairo ya creo un review, o todavia

const reviewModel = require("../../models/reviewModel");

const getProductReview = async (req, res) => {
    const { productId } = req.params;

    const userId = req.userId;

    try {
        const review = await reviewModel.findOne({ productId, userId }); // Busca solo la del usuario
        if (review) {
            return res.status(201).json({
                message: "Review encontrado exitosamente.",
                error: false,
                success: true,
                data: review
            });
        }

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Error al obtener la reseña (getProductReview.js).",
            error: true,
            success: false,
        });
    }
};

module.exports = getProductReview;
