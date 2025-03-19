const stripe = require('../../config/stripe');
const orderModel = require("../../models/orderProductModel");
const addToCartModel = require("../../models/cartProductModel")

const endpointSecret = process.env.STRIPE_ENDPOINT_WEBHOOK_SECRET_KEY;

//stripe.products es propio de stripe
async function getLineItems(lineItems) { //lineItems es los productos del carrito
    let ProductItems = [];

    if (lineItems?.data?.length) {
        for (const item of lineItems.data) {
            const product = await stripe.products.retrieve(item.price.product);
            console.log("product: ", product);
            const productId = product.metadata.productId; //esta metadata se escribio en payment.js

            const productData = {
                productId: productId,
                name: product.name,
                price: item.price.unit_amount / 100, //entre 100 porque esta en centavos
                quantity: item.quantity,
                image: product.images
            }
            ProductItems.push(productData);
        }
    }
    // console.log("ProductItems: ", ProductItems); //DEBUG
    return ProductItems;
}

const webhooks = async (req, res) => {

    const payloadString = JSON.stringify(req.body);

    const header = stripe.webhooks.generateTestHeaderString({
        payload: payloadString,
        secret: endpointSecret
    });

    let event;

    try {
        event = stripe.webhooks.constructEvent(payloadString, header, endpointSecret);
    } catch (err) {
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    // Handle the event
    //checkout.session.completed es el mejor evento para registrar la orden
    // Es el más seguro porque garantiza que el cliente completó el proceso de pago en el checkout.
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            //console.log("session", session); //DEBUG

            const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
            // console.log("lineItems: ", lineItems.data);
            // console.log("lineItems price: ", lineItems.data[0].price.product);

            const productDetails = await getLineItems(lineItems)

            //Obtener email
            const customerId = session.customer;
            const customer = await stripe.customers.retrieve(customerId);
            console.log("Email del cliente: ", customer.email);

            //obtener datos de card
            const payment_intent = await stripe.paymentIntents.retrieve(session.payment_intent);
            const paymentMethodId = payment_intent.payment_method;
            const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);




            const orderDetails = {
                productDetails: productDetails,
                // email: session.customer_email,
                email: customer.email,
                userId: session.metadata.userId,
                paymentDetails: {
                    paymentId: session.payment_intent,
                    payment_method_type: session.payment_method_types,
                    payment_status: session.payment_status,
                },
                shipping_options: session.shipping_options.map(s => {
                    return {
                        ...s,
                        shipping_amount: s.shipping_amount / 100
                    }
                }),
                totalAmount: session.amount_total / 100,
                country: session.customer_details?.address?.country,
                card_details: {
                    country: paymentMethod.card.country,
                    display_brand: paymentMethod.card.display_brand,
                    expiration_date: paymentMethod.card.exp_year,
                    funding: paymentMethod.card.funding,
                    last4: paymentMethod.card.last4,
                    regulated_status: paymentMethod.card.regulated_status
                }
            }

            const order = new orderModel(orderDetails);

            const saveOrder = await order.save();
            if (saveOrder?._id) {
                const deleteCartItem = await addToCartModel.deleteMany({ userId: session.metadata.userId })
            }

            break;
        // ... handle other event types
        default: //esto se imprime porque hay vaarios tipos de eventos ,solol estamos anjeando el principa y mas usado : checkout.session.completed 
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.status(200).send();
}

module.exports = webhooks;