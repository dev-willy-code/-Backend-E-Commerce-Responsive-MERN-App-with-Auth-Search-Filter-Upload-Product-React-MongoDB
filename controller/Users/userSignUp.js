const userModel = require("../../models/userModel");
const handleMongoDuplicate = require("../../utils/handleMongoDuplicate"); // <--- importa el helper

//bcrypt
//sync
const bcrypt = require('bcrypt');
const saltRounds = 10;

//throw interrumpe la ejecución normal del código y lanza un error.
//El Error es un objeto que describe el problema, y puede ser manejado por un bloque try-catch para evitar que la aplicación falle inesperadamente.

async function userSignUpController(req, res) {
    try {
        const { name, email, password, profilePic, confirmPassword } = req.body;

        // Acumulador para los errores
        const errors = {};

        // Validación de campos
        if (!email) {
            errors.email = "Provide email.";
        }
        if (!name) {
            errors.name = "Provide name.";
        }

        if (!password) {
            errors.password = "Provide password.";
        } else if (password.length < 6) {
            errors.password = "La contraseña debe tener al menos 6 caracteres.";
        } else if (!/[a-z]/.test(password)) {
            errors.password = "La contraseña debe tener al menos una letra minuscula.";
        } else if (!/[A-Z]/.test(password)) {
            errors.password = "La contraseña debe tener al menos una letra mayuscula.";
        } else if (!/[0-9]/.test(password)) {
            errors.password = "La contraseña debe tener al menos un numero.";
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.password = "La contraseña debe tener al menos un caracter especial.";
        }

        if (!confirmPassword) {
            errors.confirmPassword = "Provide confirmPassword.";
        } else if (password !== confirmPassword) {
            errors.confirmPassword = "Passwords do not match.";
        }

        if (!profilePic) {
            errors.profilePic = "Provide profile picture.";
        }


        // Verificar si el usuario ya existe
        const user = await userModel.findOne({ email: email });
        if (user) {
            errors.email = "User already exists.";
        }


        // Si existen errores, devolverlos todos juntos
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                error: true,
                errors: errors,
            });
        }

        // Si todo está bien, procedemos a hacer el hash de la contraseña
        //📌 Más saltRounds = Más seguridad, pero también más lento.
        const salt = bcrypt.genSaltSync(saltRounds);
        const hashPassword = bcrypt.hashSync(password, salt);

        if (!hashPassword) {
            throw new Error("Something is wrong with hashPassword, Please try later");
        }

        // Crear el payload del usuario, payload traducido es "carga"
        const payload = {
            ...req.body,
            role: "GENERAL",
            password: hashPassword,
        };

        const userData = new userModel(payload);
        const saveUser = await userData.save();

        // Respuesta exitosa
        //El código 201 es esencial porque comunica a nivel de red (y de protocolos HTTP) que la operación de creación fue exitosa.
        res.status(201).json({
            data: saveUser,
            success: true,
            error: false,
            message: "User created successfully",
        });

    } catch (error) {
        //8. Manejo de errores
        console.error("Error en SignUp: ", error);

        // 1. Revisar si es error de duplicación
        const duplicationResponse = handleMongoDuplicate(error);
        if (duplicationResponse) {
            // Si no es null, significa que sí hubo duplicación
            return res.status(400).json(duplicationResponse);
        }

        // 2. Si no es duplicación, maneja el error normalmente
        return res.status(400).json({
            message: error.message || "Error en SignUp",
            success: false,
            error: true,
        });
    }
}

module.exports = userSignUpController

//Why is async mode recommended over sync mode?
//We recommend using async API if you use bcrypt on a server.Bcrypt hashing is CPU intensive which will cause the sync APIs to block the event loop and prevent your application from servicing any inbound requests or events.The async version uses a thread pool which does not block the main event loop.

