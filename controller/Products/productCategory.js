const ProductCategoryModel = require("../../models/productCategoryModel"); // 1️⃣ Importar el modelo

// 2️⃣ Función para obtener todas las categorías
const getCategories = async (req, res) => {
    try {
        // 3️⃣ Consultar la base de datos y obtener todas las categorías
        const categories = await ProductCategoryModel.find({});

        // 4️⃣ Enviar la respuesta con las categorías obtenidas
        res.status(200).json({
            message: "All categories",
            success: true,
            error: false,
            data: categories
        });
    } catch (error) {
        // 5️⃣ Manejo de errores en caso de fallo en la consulta
        console.error("Error al obtener categorías: ", error);
        res.status(500).json({ message: "Error al obtener categorías" });
    }
};

// 6️⃣ Exportar la función para usarla en las rutas
module.exports = getCategories;
