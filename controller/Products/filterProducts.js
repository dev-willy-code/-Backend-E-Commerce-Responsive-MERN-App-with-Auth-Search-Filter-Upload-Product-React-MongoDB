const productModel = require("../../models/productModel");
const productCategoryModel = require("../../models/productCategoryModel"); // 1️⃣ Importar el modelo

/**
 * Controlador para filtrar productos por categoría.
 * @param {Object} req - Objeto de solicitud (Request).
 * @param {Object} res - Objeto de respuesta (Response).
 */
const filterProductController = async (req, res) => {
    try {
        // 1. Extraer la lista de categorías del cuerpo de la solicitud
        const categoryList = req?.body?.category;
        console.log("categoryList: ", categoryList);

        if (Array.isArray(categoryList) && categoryList.length === 0) {
            return res.status(200).json({
                data: [],
                message: "Productos encontrados.",
                error: false,
                success: true,
            });
        }

        // 2. Validar que categoryList sea un array válido
        if (!Array.isArray(categoryList) || categoryList.length === 0) {
            return res.status(400).json({
                message: "Debe proporcionar al menos una categoría válida para poder filtrar.",
                error: true,
                success: false,
            });
        }

        // 3. Buscar los _id de las categorías correspondientes
        const categories = await productCategoryModel.find({ value: { $in: categoryList } });

        // 4. Extraer solo los _id de las categorías encontradas
        const categoryIds = categories.map(cat => cat._id);

        if (categoryIds.length === 0) {
            return res.status(404).json({
                message: "No se encontraron categorías con los nombres proporcionados.",
                error: true,
                success: false,
            });
        }

        // 5. Consultar los productos que pertenecen a las categorías especificadas y popular la categoría
        const products = await productModel.find({
            categoryId: { $in: categoryIds }, // Filtrar por los IDs de categoría
        }).populate("categoryId"); // Populate para traer información de la categoría

        // 6. Enviar la respuesta con los productos encontrados
        return res.status(200).json({
            data: products,
            message: "Productos encontrados.",
            error: false,
            success: true,
        });

    } catch (err) {
        // 7. Manejo de errores generales
        console.error("Error en filterProductController: ", err);
        return res.status(500).json({
            message: "Error interno del servidor.",
            error: true,
            success: false,
        });
    }
};

module.exports = filterProductController;
