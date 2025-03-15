const userModel = require("../../models/userModel");
const handleMongoDuplicate = require("../../utils/handleMongoDuplicate"); // <--- importa el helper


//bcrypt
//sync
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Controlador para que un usuario actualice su propio perfil
// Solo el dueño del perfil puede actualizarlo
async function updateProfile(req, res) {
    try {
        // Obtenemos los campos que deseamos permitir
        const {
            name,
            email,
            profilePic,
            password,
            wantsToChangePassword,
            confirmPassword
        } = req.body;

        // El ID del usuario autenticado viene del middleware (token)
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({
                message: "No se encontró la sesión del usuario.",
                success: false,
                error: true,
            });
        }

        // 1. Cargar al usuario
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "Usuario no encontrado",
                success: false,
                error: true,
            });
        }

        // ==================================
        // ACUMULADOR DE ERRORES
        // ==================================
        const errors = {};

        // 2. Validar 'name'
        //    Obligatorio, string y mínimo 2 caracteres
        if (!name) {
            errors.name = "El nombre es obligatorio";
        } else if (typeof name !== "string" || name.trim().length < 2) {
            errors.name = "El nombre debe tener al menos 2 caracteres";
        }

        // 3. Validar 'email'
        //    Obligatorio, con formato válido
        if (!email) {
            errors.email = "El correo electrónico es obligatorio";
        } else {
            const emailRegex = /^\S+@\S+\.\S+$/;
            if (!emailRegex.test(email)) {
                errors.email = "El email no es válido";
            }
        }


        // 4. Si wantsToChangePassword == true, validar 'password' y 'confirmPassword'
        if (wantsToChangePassword) {
            if (!password) {
                errors.password = "La contraseña es obligatoria para cambiarla";
            } else if (password.length < 6) {
                errors.password = "La contraseña debe tener al menos 6 caracteres";
            }

            if (!confirmPassword) {
                errors.confirmPassword = "La confirmación de la contraseña es obligatoria";
            } else if (password !== confirmPassword) {
                errors.confirmPassword = "Las contraseñas no coinciden";
            }
        }

        // Si existen errores, los devolvemos todos juntos
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                error: true,
                errors,
            });
        }

        // ====================
        // APLICAR CAMBIOS
        // ====================

        user.name = name; // name es obligatorio 
        user.email = email; // email es obligatorio
        // Si no viene profilePic, usar "" (para limpiar foto de perfil)
        user.profilePic = profilePic || "";

        // Solo actualizamos la contraseña si wantsToChangePassword == true
        if (wantsToChangePassword && password) {
            // En un caso real, aquí encriptarías con bcrypt:
            // const hashed = await bcrypt.hash(password, 10);
            // user.password = hashed;
            //To hash a password:
            const salt = bcrypt.genSaltSync(saltRounds);
            //bcrypt.hashSync() es una función síncrona, no se debe usar con await.
            const hashPassword = bcrypt.hashSync(password, salt);

            if (!hashPassword) {
                throw new Error("Ocurrió un error al encriptar la contraseña, intenta más tarde")
            }
            //user.password = "$2b$10$oSVCuD9CGynQ/S2GBbR4Buow0Rp6mx.Vr0EcjpXvWCqow7JMDv9bK";
            user.password = hashPassword;
        }

        // Guardar cambios
        await user.save();

        return res.status(200).json({
            message: "Perfil actualizado con éxito",
            success: true,
            error: false,
            data: user,
        });
    } catch (error) {
        console.error("Error en updateProfile:", error);

        // 1. Revisar si es error de duplicación
        const duplicationResponse = handleMongoDuplicate(error);
        if (duplicationResponse) {
            // Si no es null, significa que sí hubo duplicación
            return res.status(400).json(duplicationResponse);
        }

        // 2. Si no es duplicación, maneja el error normalmente
        return res.status(400).json({
            message: error.message || "Error al actualizar el perfil",
            success: false,
            error: true,
        });
    }
}


module.exports = updateProfile;


//En un objeto: Los corchetes ([]) no indican un arreglo, sino que se usa la notación de acceso dinámico (usando variables como claves).