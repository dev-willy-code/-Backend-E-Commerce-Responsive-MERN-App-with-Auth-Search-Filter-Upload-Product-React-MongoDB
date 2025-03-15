const stripe = require('../../config/stripe');
const userModel = require("../../models/userModel");




const payment = async (req, res) => {
    try {
        const { cartItems } = req.body;
        const user = await userModel.findOne({ _id: req.userId });
        console.log("cart items: ", cartItems);
        //aca esposibe ahcer populate porque los datos ya viene asi del frontend
        console.log(cartItems[0].productId.productName);
        console.log(cartItems[0].productId.categoryId.value);

        //////////////Esto es para que se genre clientes por cada correo/////////////////////////////
        // Buscar si el cliente ya existe en Stripe
        const customers = await stripe.customers.list({ email: user.email, limit: 1 });

        let customerId;
        if (customers.data.length > 0) {
            // Cliente ya existe, usar su ID
            customerId = customers.data[0].id;
        } else {
            // Cliente no existe, crearlo
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name, // Puedes agregar más datos si quieres
            });
            customerId = customer.id;
        }
        ////////////////////////////////////////////////////////////////////////////


        const params = {
            submit_type: 'pay',
            mode: "payment",
            payment_method_types: ['card'],
            billing_address_collection: 'auto',
            shipping_options: [
                {
                    shipping_rate: "shr_1R23UZP50fBLh89dkKM83aZb"
                }
            ],
            customer: customerId,
            // customer_email: user.email,
            metadata: { //metadata es para usarlo en webhook.js para poder gurdar las ordenes en base de datos
                userId: String(req.userId)
            },
            line_items: cartItems.map((item, index) => {
                return {
                    price_data: {
                        currency: 'pen',
                        product_data: {
                            name: item.productId.productName,
                            images: item.productId.productImage, //array
                            metadata: {  //metadata es para usarlo en webhook.js para poder gurdar las ordenes en base de datos
                                productId: item.productId._id
                            }
                        },
                        unit_amount: Math.round(item.productId.sellingPrice * 100)
                    },
                    adjustable_quantity: {
                        enabled: true,
                        minimum: 1
                    },
                    quantity: item.quantity
                }
            }),
            success_url: `${process.env.FRONTEND_URL}/success`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel`
        }

        const session = await stripe.checkout.sessions.create(params);
        res.status(303).json(session);

    } catch (error) {
        console.error("Error en paymentController: ", error);
        return res.status(500).json({
            message: error.message || "Error al hacer el payment",
            success: false,
            error: true,
        });
    }
}

module.exports = payment;