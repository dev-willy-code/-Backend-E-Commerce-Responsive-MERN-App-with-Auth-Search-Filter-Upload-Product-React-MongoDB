/**
 * handleMongoDuplicate
 * - Verifica si el error proviene de un índice único de MongoDB (code === 11000).
 * - Si es así, construye un objeto 'errors' con mensajes amigables.
 * - Si no lo es, retorna 'null' para indicar que no se trata de un error de duplicación.
 */
function handleMongoDuplicate(error) {
    if (error.code === 11000 && error.keyPattern) {
        const duplicatedFields = Object.keys(error.keyPattern);
        const errors = {};

        duplicatedFields.forEach((field) => {
            errors[field] = `Ya existe un registro con este '${field}'.`;
        });

        return {
            success: false,
            error: true,
            errors,
            message: `Ya existe un registro con el mismo ${duplicatedFields.join(", ")}.`
        };
    }

    // No es error de duplicación
    return null;
}


module.exports = handleMongoDuplicate;






// function handleMongoDuplicate(error) {
//     if (error.code === 11000 && error.keyValue) {
//         const duplicatedFields = Object.keys(error.keyValue);
//         const errors = {};

//         duplicatedFields.forEach((field) => {
//             //[field]: es de objeto, no confuncdir con arreglos
//             errors[field] = El valor '${error.keyValue[field]}' para el campo '${field}' ya está en uso.;
//         });

//         return {
//             success: false,
//             error: true,
//             errors,
//             message: El valor '${error.keyValue[field]} ' para el campo '${field} ' ya está en uso.
//         };
//     }

//     // No es error de duplicación
//     return null;
// }

// //esto no me funciona con esto:
// reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

