const addToCartModel = require("../../models/cartProductModel");

const addToCart = async (req, res) => {
    try {
        const { productId } = req?.body;
        const currentUser = req.userId;

        // Validar que `productId` no esté vacío
        if (!productId) {
            return res.status(400).json({
                message: "Product ID is required",
                success: false,
                error: true
            });
        }

        // Verificar si el producto ya está en el carrito del usuario
        const isProductAvailable = await addToCartModel.findOne({ productId, userId: currentUser });
        console.log("isProductAvailable: ", isProductAvailable);

        if (isProductAvailable) {
            return res.status(409).json({ //409: Conflict
                message: "Product already exits in cart",
                success: false,
                error: true
            })
        }

        const payload = {
            productId: productId,
            quantity: 1,
            userId: currentUser
        }

        // Crear y guardar el nuevo producto en el carrito
        const newCartItem = new addToCartModel(payload);
        const savedCartItem = await newCartItem.save();

        return res.status(201).json({ //201: Created
            data: savedCartItem,
            message: "Product Added in Cart",
            success: true,
            error: false
        })

    } catch (err) {
        res.json({
            message: err?.message || err,
            error: true,
            success: false
        })
    }
}

module.exports = addToCart;

