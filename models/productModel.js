const mongoose = require('mongoose')
const addToCartModel = require("../models/cartProductModel");

const productSchema = mongoose.Schema({
    productName: { type: String, unique: true, required: true },
    brandName: { type: String, required: true },
    categoryId: {
        ref: 'productcategory',
        type: String
    },
    productImage: [],
    productVideo: [],
    description: String,
    price: String,
    sellingPrice: String,
    createdBy: { type: String, required: true }
}, {
    timestamps: true
})


//No puedes poner document: true, query: true en un solo middleware.
//✅ Debes crear dos middlewares separados si quieres manejar ambos casos
//✅ Uno manejará instancias de documento (findById().deleteOne()), y otro manejará consultas directas (deleteOne({ _id: id })).
productSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
    console.log("Middleware ejecutado en documento");
    const productId = this._id;
    await addToCartModel.deleteMany({ productId: productId });
    next();
});

const productModel = mongoose.model("product", productSchema)


module.exports = productModel