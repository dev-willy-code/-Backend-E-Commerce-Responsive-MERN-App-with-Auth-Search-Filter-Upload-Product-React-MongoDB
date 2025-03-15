const productModel = require("../../models/productModel")
//const userModel = require("../../models/userModel");
const ProductCategoryModel = require("../../models/productCategoryModel"); // 1️⃣ Importar el modelo

const getProductsByCategory = async (req, res) => {
    try {
        //1. Obtener la categoria desde el body o query params
        const { category } = req.query; //puede ser tambien req.body, pero lol cambie porque category noes data sensibe, mejor es query
        //const currentUserId = req.userId; //Del middleware de autenticacion

        //2. Validar que la cateogria este presetne y sea un string
        if (!category || typeof category !== "string") {
            return res.status(400).json({
                message: "La categoria es obligatoria y debe ser un string.",
                success: false,
                error: true
            });
        }

        // 3. Buscar el _id de la categoría en la base de datos
        const categoryDoc = await ProductCategoryModel.findOne({ value: category });
        console.log(categoryDoc, " :cateogryDoc");
        if (!categoryDoc) {
            return res.status(404).json({
                message: `No se encontró la categoría: ${category}`,
                error: true,
                success: false,
            });
        }

        // //3.Verificar si el usuario que realiza la peticion existe
        // const currentUser = await userModel.findById(currentUserId);
        // if (!currentUser) {
        //     return res.status(404).json({
        //         message: "Usuario que realiza la peticion no existe.",
        //         error: true,
        //         success: false,
        //     });
        // }


        //4. Buscar productos por categoria
        const products = await productModel
            .find({ categoryId: categoryDoc._id })
            .populate("categoryId"); // 🔥 Aquí se aplica el populate


        //DEBUG para probar que hay en products
        //console.log("products", products);

        //5. Si no hay productos en esa categoria
        if (!products.length) {
            return res.status(404).json({
                message: "No se encontraron productos en esta categoría: " + category,
                error: true,
                success: false,
            });
        }

        //6. Respuesta exitosa con los productos
        return res.status(200).json({
            data: products,
            message: "Productos obtenidos exitosamente.",
            error: false,
            success: true,
        });

    } catch (error) {
        console.error("Error en getProductsByCategory", error);

        //7. Manejo de error genérico
        return res.status(500).json({
            message: error.message || "Error al obtener productos por categoria.",
            error: true,
            success: false,
        });
    }
}

module.exports = getProductsByCategory;
