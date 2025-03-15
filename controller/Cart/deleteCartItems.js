const addToCartModel = require("../../models/cartProductModel");
const userModel = require("../../models/userModel");

const deleteCartItems = async (req, res) => {
    try {
        const currentUserId = req.userId;
        if (!currentUserId) {
            return res.status(400).json({
                message: "Id del usuario no encontrado.",
                error: true,
                success: false
            });
        }
        const currentUser = await userModel.findById(currentUserId);
        if (!currentUser) {
            return res.status(404).json({
                message: "El usuario que realiza la peticion no existe.",
                error: true,
                success: false
            });
        }

        const deleteProductId = req.body._id;

        if (!deleteProductId) {
            return res.status(400).json({
                message: "Product ID is required",
                error: true,
                success: false,
            });
        }

        const deleteResult = await addToCartModel.deleteOne({ _id: deleteProductId, userId: currentUserId })

        if (deleteResult.deletedCount === 0) {
            return res.status(404).json({
                message: "Product not found in cart or already removed",
                error: true,
                success: false,
            });
        }

        res.json({
            message: "Product Deleted From Cart succesfully",
            error: false,
            success: true,
        })

    } catch (err) {
        console.error("Error deleting product from cart:", err);
        res.json({
            message: err?.message || err,
            error: true,
            success: false
        })
    }
}

module.exports = deleteCartItems