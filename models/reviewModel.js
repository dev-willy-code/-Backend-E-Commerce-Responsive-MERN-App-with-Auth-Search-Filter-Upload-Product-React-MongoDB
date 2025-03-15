const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', // Referencia al usuario que hizo la reseña
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product', // Referencia al producto calificado
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5 // Suponiendo que la calificación va de 1 a 5
    },
    comment: {
        type: String,
        required: false // El comentario es opcional
    }
}, {
    timestamps: true
});

// 🔥 Agregar índice único para evitar duplicados
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

// Middleware para evitar que un usuario califique el mismo producto más de una vez
// reviewSchema.pre('save', async function (next) {
//     const existingReview = await mongoose.model('review').findOne({
//         userId: this.userId,
//         productId: this.productId
//     });

//     if (existingReview) {
//         const error = new Error('El usuario ya ha calificado .');
//         return next(error);
//     }

//     next();
// });

const reviewModel = mongoose.model('review', reviewSchema);

module.exports = reviewModel;
