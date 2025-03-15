//this xpunts the total cart items
const addToCartModel = require("../../models/cartProductModel");

const countAddToCartProduct = async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(400).json({
                message: "User ID is required",
                error: true,
                success: false
            });
        }

        const count = await addToCartModel.countDocuments({
            userId: userId
        });

        res.status(200).json({
            data: {
                count: count
            },
            message: "Cart items succesfully counted",
            error: false,
            success: true
        })
    } catch (error) {
        res.json({
            message: error.message || error,
            error: true,
            success: false,
        })
    }
}

module.exports = countAddToCartProduct