
const addToCartModel = require("../../models/cartProductModel")
const userModel = require("../../models/userModel");

const updateCartItems = async (req, res) => {
    try {
        const currentUserId = req.userId;
        const ProductId_toUpdate = req?.body?._id

        const qty = req?.body?.quantity // la cantidad de items de ese producto

        // Verificar si el usuario está autenticado
        if (!currentUserId) {
            return res.status(401).json({
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

        // Verificar si se envió un ID de producto
        if (!ProductId_toUpdate) {
            return res.status(400).json({
                message: "ID del producto es requerido.",
                error: true,
                success: false
            });
        }

        // Verificar si la cantidad es válida
        if (qty === undefined || qty < 1) {
            return res.status(400).json({
                message: "La cantidad debe ser mayor a 0.",
                error: true,
                success: false
            });
        }

        // Buscar el producto en el carrito
        const existingProduct = await addToCartModel.findById({ _id: ProductId_toUpdate, userId: currentUserId });
        if (!existingProduct) {
            return res.status(404).json({
                message: "Producto no encontrado en el carrito del usuario logueado.",
                error: true,
                success: false
            });
        }

        // Actualizar la cantidad del producto en el carrito
        const updatedProduct = await addToCartModel.findByIdAndUpdate(
            ProductId_toUpdate,
            { quantity: qty },
            { new: true } // Retorna el documento actualizado
        );

        res.json({
            message: "Product Updated succesfully",
            data: updatedProduct,
            error: false,
            success: true
        })

    } catch (err) {
        res.status(500).json({
            message: err?.message || err,
            error: true,
            success: false
        })
    }
}

module.exports = updateCartItems
