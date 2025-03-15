const orderModel = require("../../models/orderProductModel")

//this controller brings all the orders of the logged user
const User_Order = async (request, response) => {
    try {
        const currentUserId = request.userId;

        // se coloca sort -1 para mostrar primero los mas recientes
        const orderList = await orderModel.find({ userId: currentUserId }).sort({ createdAt: -1 })
        console.log("orderList: ", orderList);

        response.status(200).json({
            data: orderList,
            message: "Order list",
            success: true
        })

    } catch (error) {
        response.status(500).json({
            message: error.message || error,
            error: true
        })
    }
}

module.exports = User_Order