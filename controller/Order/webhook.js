const stripe = require('../../config/stripe');
const orderModel = require("../../models/orderProductModel");
const addToCartModel = require("../../models/cartProductModel")

const endpointSecret = process.env.STRIPE_ENDPOINT_WEBHOOK_SECRET_KEY;
// console.log("stripe: ", stripe); //DEBUG

// lineItems.data[0].price.product:  prod_RvxrGLdgUNdOt3

// esto es un lineItems.data[0] impreo en consola:
// {
//     id: 'li_1R2c6DP50fBLh89dti5y8q6G',
//     object: 'item',
//     amount_discount: 0,
//     amount_subtotal: 800,
//     amount_tax: 0,
//     amount_total: 800,
//     currency: 'pen',
//     description: 'Product 2',
//     price: {
//       id: 'price_1R2c6DP50fBLh89dbJ1l3lMf',
//       object: 'price',
//       active: false,
//       billing_scheme: 'per_unit',
//       created: 1741973565,
//       currency: 'pen',
//       custom_unit_amount: null,
//       livemode: false,
//       lookup_key: null,
//       metadata: {},
//       nickname: null,
//       product: 'prod_RvxrboUqElmfwm',
//       recurring: null,
//       tax_behavior: 'unspecified',
//       tiers_mode: null,
//       transform_quantity: null,
//       type: 'one_time',
//       unit_amount: 800,
//       unit_amount_decimal: '800'
//     },
//     quantity: 1
//   }
// ]


//solo te trae  product_data:  de payment.js
// const product = await stripe.products.retrieve(item.price.product);
// product:  {
//     id: 'prod_RvxrboUqElmfwm',
//     object: 'product',
//     active: false,
//     attributes: [],
//     created: 1741849905,
//     default_price: null,
//     description: null,
//     images: [
//       'https://firebasestorage.googleapis.com/v0/b/mern-free.firebasestorage.app/o/1740877896819boAt%20Airdopes%20131%203.webp?alt=media&token=58679194-430f-473f-8bdf-d71c9c2bca8c',
//       'https://firebasestorage.googleapis.com/v0/b/mern-free.firebasestorage.app/o/1740877896817boAt%20Airdopes%20131%202.webp?alt=media&token=db43efb5-f84e-4090-a2f9-fab556f91431',
//       'https://firebasestorage.googleapis.com/v0/b/mern-free.firebasestorage.app/o/1740877896814boAt%20Airdopes%20131%201.webp?alt=media&token=71999624-58df-40bc-aee8-ad3c56f5d7b2'
//     ],
//     livemode: false,
//     marketing_features: [],
//     metadata: { productId: '67c3b0a155df553d50ae0be6' },
//     name: 'Product 2',
//     package_dimensions: null,
//     shippable: null,
//     statement_descriptor: null,
//     tax_code: null,
//     type: 'service',
//     unit_label: null,
//     updated: 1741849905,
//     url: null
//   }


//stripe.products es propio de estripe
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
            console.log("session.payment_intent: ", session.payment_intent);

            //Obtener email
            const customerId = session.customer;
            const customer = await stripe.customers.retrieve(customerId);
            console.log("Email del cliente: ", customer.email);



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
                totalAmount: session.amount_total / 100
            }

            const order = new orderModel(orderDetails);

            const saveOrder = await order.save();
            if (saveOrder?._id) {
                const deleteCartItem = await addToCartModel.deleteMany({ userId: session.metadata.userId })
            }
            // console.log("saveOrder: ", saveOrder);

            break;
        // ... handle other event types
        default: //esto se imprime porque hay vaarios tipos de eventos ,solol estamos anjeando el principa y mas usado : checkout.session.completed 
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.status(200).send();
}

module.exports = webhooks;