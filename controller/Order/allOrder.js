const orderModel = require("../../models/orderProductModel");
const userModel = require("../../models/userModel");

const allOrder = async (req, res) => {
    try {
        // 1. Obtener el ID del usuario autenticado desde el middleware
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({
                message: "No se encontró la sesión del usuario.",
                success: false,
                error: true,
            });
        }

        // 2. Buscar el usuario en la base de datos
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "Usuario no encontrado.",
                success: false,
                error: true,
            });
        }

        // 3. Verificar permisos para ver órdenes
        const canViewOrders = user?.permisos?.configuracion?.puedeVerOrdenes_Pagos || false;
        if (!canViewOrders) {
            return res.status(403).json({
                message: "No tienes permisos para ver las órdenes.",
                success: false,
                error: true,
            });
        }

        // 4. Obtener todas las órdenes ordenadas por fecha de creación
        const allOrders = await orderModel.find().sort({ createdAt: -1 });

        // 5. Responder con las órdenes
        return res.status(200).json({
            data: allOrders,
            success: true,
            error: false,
        });

    } catch (error) {
        console.error("Error en allOrderController: ", error);
        return res.status(500).json({
            message: error.message || "Error al obtener las órdenes.",
            success: false,
            error: true,
        });
    }
};

module.exports = allOrder;
