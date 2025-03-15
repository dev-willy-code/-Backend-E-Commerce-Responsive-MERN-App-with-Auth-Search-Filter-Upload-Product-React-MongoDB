const productModel = require("../../models/productModel");
const userModel = require("../../models/userModel");
const ProductCategoryModel = require("../../models/productCategoryModel"); // 1️⃣ Importar el modelo

async function getOneProductByCategory(_, res) {
    try {
        // 1. Obtener la lista DISTINCT de categorías de productos
        //const productCategories = await productModel.distinct("category");

        // productCategories podría ser algo como ["Zapatos", "Camisas", "Accesorios", ...]


        const productCategories = await ProductCategoryModel.find({}).lean();


        // 2. Para cada categoría, obtener un producto “ejemplo”
        const productByCategory = []; //esto sera arreglo de objetos de Productos
        for (const cat of productCategories) {
            const oneProduct = await productModel.findOne({ categoryId: cat._id }).populate("categoryId").lean();
            if (oneProduct) {
                productByCategory.push(oneProduct);
            }
        }
        console.log("productByCategory: ", productByCategory);
        // 3. Respuesta exitosa
        return res.status(200).json({
            message: "Lista de productos representativos por categoría",
            data: productByCategory,
            success: true,
            error: false,
        });
    } catch (err) {
        // 4. Manejo de errores
        console.error("Error en getCategoryProduct:", err);
        return res.status(500).json({
            message: err.message || "Error interno al obtener categorías.",
            success: false,
            error: true,
        });
    }
}

module.exports = getOneProductByCategory;

//En este controller no  se verifica req.userId, porque esto es publico paara tods
//No se usa handleMongoDuplicate aquí porque no hay escritura/actualización que provoque un error de índice único. Esta acción es de lectura.