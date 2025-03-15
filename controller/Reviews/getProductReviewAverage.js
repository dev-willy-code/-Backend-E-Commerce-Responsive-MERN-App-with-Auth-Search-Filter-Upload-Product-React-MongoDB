const reviewModel = require("../../models/reviewModel");

const getProductReviewAverage = async (req, res) => {
    const { productId } = req.params; // Se obtiene el ID del producto desde los parámetros de la URL
    console.log("aa si se aaaaaaaaaaaaaaaaaaa");
    try {
        // Se buscan todas las reseñas del producto específico
        const reviews = await reviewModel.find({ productId });

        if (reviews.length === 0) {
            return res.status(404).json({
                message: "No hay reseñas para este producto.",
                error: false,
                success: true,
                data: 0, // Se retorna 0 si no hay reseñas
            });
        }

        // Se calcula el promedio de las calificaciones
        const totalScore = reviews.reduce((sum, review) => sum + review.rating, 0);
        const average = (totalScore / reviews.length).toFixed(1); // Se redondea a 1 decimal

        return res.status(200).json({
            message: "Promedio de reseñas obtenido exitosamente.",
            error: false,
            success: true,
            data: parseFloat(average), // Se convierte a número flotante para evitar cadenas
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Error al obtener el promedio de reseñas (getProductReviewAverage.js).",
            error: true,
            success: false,
        });
    }
};

module.exports = getProductReviewAverage;
