const addToCartModel = require("../../models/cartProductModel");

const viewCartItems = async (req, res) => {
    try {
        const currentUser = req.userId;

        if (!currentUser) {
            return res.status(400).json({
                message: "Usuario no autenticado.",
                error: true,
                success: false
            });
        }

        const allProducts = await addToCartModel.find({ userId: currentUser })
            .populate({
                path: "productId",
                populate: { path: "categoryId" } // 🔥 Populate dentro de otro populate
            });

        res.status(200).json({
            data: allProducts,
            success: true,
            error: false
        });

    } catch (err) {
        console.error("Error en addToCartViewProduct:", err);
        res.status(500).json({
            message: err.message || "Error interno del servidor.",
            error: true,
            success: false
        });
    }
};

module.exports = viewCartItems;
