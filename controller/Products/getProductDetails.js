const productModel = require("../../models/productModel")

const getProductDetails = async (req, res) => {
    try {
        const { productId } = req.query; // Puede ser query o body según la implementación

        if (!productId) {
            //error 400 si no se proporciona.
            return res.status(400).json({
                message: "El productId es requerido.",
                error: true,
                success: false,
            });
        }

        const product = await productModel
            .findById(productId)
            .populate("categoryId") // Trae solo el campo "value" de la categoría
            .lean(); // Optimizar la consulta
        ;
        console.log(product, " :zzzzzz");
        if (!product) {
            //error 404 si el producto no existe.
            return res.status(404).json({
                message: "Producto no encontrado.",
                error: true,
                success: false,
            });
        }

        return res.json({
            data: product,
            message: "getProductsDetails exitoso",
            success: true,
            error: false
        })
    } catch (error) {
        console.error("Error en getProductDeTails: ", error);

        //7. Manejo de error genérico
        return res.status(500).json({
            message: error.message || "Error al obtener detalles del producto, error en el servidor(500).",
            error: true,
            success: false,
        });
    }
}

module.exports = getProductDetails;
