const productModel = require("../../models/productModel");
const userModel = require("../../models/userModel");
const handleMongoDuplicate = require("../../utils/handleMongoDuplicate"); // <--- importa el helper

async function uploadProduct(req, res) {
    try {
        //1. Leer datos de la peticion
        const {
            productName,
            brandName,
            categoryId,
            description,
            price,
            sellingPrice,
            productImage = [],
            productVideo = [],
        } = req.body;

        const currentUserId = req.userId; //Esto viene de Middleware

        //2. Verificar usuario actual (quien hace la peticion)
        const currentUser = await userModel.findById(currentUserId);
        if (!currentUser) {
            return res.status(404).json({
                message: "Usuario que realiza la peticion no existe.",
                error: true,
                success: false,
            });
        }

        //3. Validar permisos del usuario
        const canCreateProducts = currentUser?.permisos?.productos?.crear || false;
        if (!canCreateProducts) {
            return res.status(403).json({
                message: "No tienes permisos para crear productos.",
                error: true,
                success: false,
            });
        }

        // 4. Acumulador de errores
        const errors = {};

        if (!productName || typeof productName !== "string") {
            errors.productName = "El 'productName' es obligatorio y debe ser un string";
        }

        if (!brandName || typeof brandName !== "string") {
            errors.brandName = "El 'brandName' es obligatorio y debe ser un string";
        }

        if (!categoryId || typeof categoryId !== "string") {
            errors.category = "El 'categoryId' es obligatorio y debe ser un string";
        }

        if (!description || typeof description !== "string") {
            errors.description = "El 'description' es obligatorio y debe ser un string";
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
            errors.productImage = "productImage  debe ser arreglo (Array) y al menos deben ser 3 imagenes.";
        }

        if (!Array.isArray(productVideo) || productVideo.length < 2) {
            errors.productVideo = "productVideo  debe ser arreglo (Array) y al menos deben ser 2 videos.";
        }


        // Si hay errores, devolverlos juntos
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                error: true,
                errors: errors,
            });
        }

        //5. Crear el objeto del nuevo producto
        const newProduct = new productModel({
            productName,
            brandName,
            categoryId,
            description,
            price,
            sellingPrice,
            productImage,
            productVideo,
            createdBy: currentUserId,
        });

        //6. Guardar en DB(database)
        await newProduct.save();

        //7. Respuesta exitosa
        return res.status(200).json({
            data: newProduct,
            message: "Producto creado exitosamente.",
            success: true,
            error: false,
        })


    } catch (error) {
        //8. Manejo de errores
        console.error("Error en UploadProduct: ", error);

        // 1. Revisar si es error de duplicación
        const duplicationResponse = handleMongoDuplicate(error);
        if (duplicationResponse) {
            // Si no es null, significa que sí hubo duplicación
            return res.status(400).json(duplicationResponse);
        }

        // 2. Si no es duplicación, maneja el error normalmente
        return res.status(400).json({
            message: error.message || "Error al crear product",
            success: false,
            error: true,
        });
    }
}

//exportar
module.exports = uploadProduct;


//En un objeto: Los corchetes ([]) no indican un arreglo, sino que se usa la notación de acceso dinámico (usando variables como claves).