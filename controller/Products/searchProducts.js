const productModel = require("../../models/productModel");
const ProductCategoryModel = require("../../models/productCategoryModel"); // 1️⃣ Importar el modelo

const searchProducts = async (req, res) => {
    try {
        //obtener el paramentro de busqueda
        let query = req.query.q?.trim().replace(/\s+/g, " "); // Reemplaza múltiples espacios por uno solo, trim: para quitar espacios
        console.log("query: ", query);
        //Validar que la consulta no este vacia
        if (!query) {
            return res.status(400).json({
                message: "El parametro de busqueda q es requerido",
                error: true,
                success: false
            });
        }

        //Crear expresion regular para busqueda insensible a mayusculas y minusculas
        const regex = new RegExp(query, "i");

        // 4️⃣ Buscar categorías que coincidan con la consulta
        const categories = await ProductCategoryModel.find({ value: regex }).lean();
        const categoryIds = categories.map(cat => cat._id);


        //Buscar productos en base a nomber o categoria
        const products = await productModel.find({
            $or: [
                { productName: regex },
                { categoryId: { $in: categoryIds } },
            ]
        }).populate("categoryId") // Populate para traer solo el nombre de la categoría
            .lean(); // Optimizar la consulta para devolver objetos JavaScript planos

        // Respuesta
        res.status(200).json({
            data: products,
            message: products.length ? "Productos encontrados" : "No se encontraron productos",
            error: false,
            success: true,
        });

    } catch (err) {
        // Manejo de errores con código HTTP adecuado
        res.status(500).json({
            message: "Error en la búsqueda: " + (err.message || err),
            error: true,
            success: false,
        });

    }
}

module.exports = searchProducts