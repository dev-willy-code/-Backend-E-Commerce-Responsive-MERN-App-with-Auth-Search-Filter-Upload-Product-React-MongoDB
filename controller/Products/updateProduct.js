const productModel = require("../../models/productModel");
const userModel = require("../../models/userModel");
const handleMongoDuplicate = require("../../utils/handleMongoDuplicate");

async function updateProduct(req, res) {
    try {
        // 1. Leer datos de la petición
        const {
            _id,       // <-- Obligatorio para saber qué producto editar
            productName,
            brandName,
            categoryId,
            description,
            price,
            sellingPrice,
            productImage = [],
            productVideo = [],
        } = req.body;

        const currentUserId = req.userId; // Del middleware de autenticación

        // 2. Verificar usuario actual (quien hace la petición)
        const currentUser = await userModel.findById(currentUserId);
        if (!currentUser) {
            return res.status(404).json({
                message: "Usuario que realiza la petición no existe.",
                error: true,
                success: false,
            });
        }

        // 3. Validar permisos del usuario
        const canUpdateProducts = currentUser?.permisos?.productos?.actualizar || false;
        if (!canUpdateProducts) {
            return res.status(403).json({
                message: "No tienes permisos para actualizar productos.",
                error: true,
                success: false,
            });
        }

        // 4. Acumulador de errores (todos los campos obligatorios)
        const errors = {};

        // productId obligatorio
        if (!_id) {
            errors.productId = "El 'productId' es obligatorio para actualizar un producto.";
        }

        if (!productName || typeof productName !== "string") {
            errors.productName = "El 'productName' es obligatorio y debe ser un string.";
        }

        if (!brandName || typeof brandName !== "string") {
            errors.brandName = "El 'brandName' es obligatorio y debe ser un string.";
        }

        if (!categoryId || typeof categoryId !== "string") {
            errors.category = "El 'categoryId' es obligatorio y debe ser un string.";
        }

        if (!description || typeof description !== "string") {
            errors.description = "El 'description' es obligatorio y debe ser un string.";
        }

        if (!price || isNaN(price)) {
            errors.price = "El 'price' debe ser numérico";
        } else if (price > 1000) {
            errors.price = "Price must not exceed S/.1000.";
        } else if (price < 0) {
            errors.price = "Price must not be under S/.0.";
        }

        if (!sellingPrice || isNaN(sellingPrice)) {
            errors.sellingPrice = "El 'sellingPrice' debe ser numérico";
        } else if (sellingPrice > 1000) {
            errors.sellingPrice = "Price must not exceed S/.1000.";
        } else if (sellingPrice < 0) {
            errors.sellingPrice = "Price must not be under S/.0.";
        }

        if (!Array.isArray(productImage) || productImage.length < 3) {
            errors.productImage = "productImage debe ser un array y contener al menos 3 imágenes.";
        }

        if (!Array.isArray(productVideo) || productVideo.length < 2) {
            errors.productVideo = "productVideo debe ser un array y contener al menos 2 videos.";
        }

        // Si existen errores, devolverlos todos juntos
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                error: true,
                errors,
            });
        }

        // 5. Buscar el producto a actualizar
        const productToUpdate = await productModel.findById(_id);
        if (!productToUpdate) {
            return res.status(404).json({
                message: "Producto a actualizar no encontrado.",
                error: true,
                success: false,
            });
        }

        // 6. Actualizar campos (todos son obligatorios, así que los seteamos siempre)
        productToUpdate.productName = productName;
        productToUpdate.brandName = brandName;
        productToUpdate.categoryId = categoryId;
        productToUpdate.description = description;
        productToUpdate.price = price;
        productToUpdate.sellingPrice = sellingPrice;
        productToUpdate.productImage = productImage;
        productToUpdate.productVideo = productVideo;

        // 7. Guardar cambios
        await productToUpdate.save();

        // 8. Respuesta exitosa
        return res.status(200).json({
            data: productToUpdate,
            message: "Producto actualizado exitosamente.",
            success: true,
            error: false,
        });
    } catch (error) {
        console.error("Error en updateProduct: ", error);

        // 9. Manejo de duplicación (code=11000)
        const duplicationResponse = handleMongoDuplicate(error);
        if (duplicationResponse) {
            return res.status(400).json(duplicationResponse);
        }

        // 10. Error genérico
        return res.status(400).json({
            message: error.message || "Error al actualizar producto",
            success: false,
            error: true,
        });
    }
}

module.exports = updateProduct;
