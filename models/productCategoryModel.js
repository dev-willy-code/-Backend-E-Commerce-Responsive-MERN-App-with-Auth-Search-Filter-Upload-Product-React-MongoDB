const mongoose = require('mongoose');

const productCategory = new mongoose.Schema({
    value: {
        type: String,
        required: true,
        unique: true
    }
}, {
    timestamps: true
});

//"productcategory" → Nombre del modelo en Mongoose.
// productCategory → Esquema que define la estructura de los documentos.
// "productCategories" → Nombre exacto de la colección en MongoDB. //opcional
const ProductCategory = mongoose.model("productcategory", productCategory); //siempre se guarda en plural: productcategories
//const ProductCategory = mongoose.model("productcategory", productCategory, "productCategories"); // el tercer parametro es para 


module.exports = ProductCategory;
//Si no exportas ProductCategory, no podrías importarlo en otros archivos:
