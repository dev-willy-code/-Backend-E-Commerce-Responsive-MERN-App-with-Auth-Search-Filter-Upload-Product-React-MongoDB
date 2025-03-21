const addToCartModel = require("../../models/cartProductModel");
const productModel = require("../../models/productModel");
const userModel = require("../../models/userModel");

async function deleteProduct(req, res) {
    const session = await mongoose.startSession(); // Inicia una sesión de transacción
    session.startTransaction();
    try {
        // 1. Leer datos de la petición
        //    Asumimos que el ID viene en req.body, podrías usar req.params si es '/products/:id'
        const { productId } = req.body;

        // 2. Usuario actual desde el middleware de autenticación
        const currentUserId = req.userId;
        if (!currentUserId) {
            return res.status(401).json({
                message: "No se encontró la sesión del usuario.",
                success: false,
                error: true,
            });
        }

        // 3. Verificar que el usuario exista
        const currentUser = await userModel.findById(currentUserId);
        if (!currentUser) {
            return res.status(404).json({
                message: "Usuario no encontrado",
                success: false,
                error: true,
            });
        }

        // 4. Comprobar permiso para eliminar productos
        const canDeleteProducts = currentUser?.permisos?.productos?.eliminar || false;
        if (!canDeleteProducts) {
            return res.status(403).json({
                message: "No tienes permisos para eliminar productos.",
                success: false,
                error: true,
            });
        }

        // 5. Validar que productId exista
        if (!productId) {
            return res.status(400).json({
                message: "Falta el 'productId' para eliminar el producto.",
                success: false,
                error: true,
            });
        }

        // 6. Buscar el producto en la BD
        const productToDelete = await productModel.findById(productId);
        if (!productToDelete) {
            return res.status(404).json({
                message: "Producto no encontrado",
                success: false,
                error: true,
            });
        }


        // Eliminar cualquier carrito asociado al usuario
        await addToCartModel.deleteMany({ productId: productId }).session(session);;

        // 7. Eliminar
        //    - O puedes usar productModel.findByIdAndDelete(productId)
        await productToDelete.deleteOne().session(session);

        await session.commitTransaction(); // Confirma la transacción
        session.endSession();

        // 8. Respuesta exitosa
        return res.status(200).json({
            message: "Producto eliminado correctamente.",
            success: true,
            error: false,
        });
    } catch (error) {
        await session.abortTransaction(); // Revierte los cambios si algo falla
        session.endSession();

        console.error("Error en deleteProduct: ", error);
        return res.status(500).json({
            message: error.message || "Error al eliminar producto",
            success: false,
            error: true,
        });
    }
}

module.exports = deleteProduct;
