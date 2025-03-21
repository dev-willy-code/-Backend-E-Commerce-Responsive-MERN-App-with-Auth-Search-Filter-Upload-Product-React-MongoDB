const productModel = require("../../models/productModel");
const userModel = require("../../models/userModel");

// Obtiene todos los productos sin paginacion
// verifica que el usuario este autenticado y tenga permisos para leer productos.

async function getAllProducts(req, res) {
    try {
        //1. Identificar al usuario que hace la peticion
        const currentUserId = req.userId; //Valor inyectado desde un middlware de autenticacion
        const currentUser = await userModel.findById(currentUserId);

        if (!currentUser) {
            return res.status(404).json({
                message: "El usuario que realiza la peticion no existe.",
                error: true,
                success: false
            });
        }

        // 2. Comprobar permiso para eliminar productos
        const canListProducts = currentUser?.permisos?.productos?.listar || false;
        if (!canListProducts) {
            return res.status(403).json({
                message: "No tienes permisos para listar todos los productos.",
                success: false,
                error: true,
            });
        }

        //2. Obtener todos los productos
        const allproducts = await productModel
            .find({})
            .populate("categoryId")
            .lean()
            .sort({ createdAt: -1 });



        console.log(allproducts);
        res.json({
            message: "All Products",
            success: true,
            error: false,
            data: allproducts
        });

    } catch (error) {
        res.status(400).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

module.exports = getAllProducts;