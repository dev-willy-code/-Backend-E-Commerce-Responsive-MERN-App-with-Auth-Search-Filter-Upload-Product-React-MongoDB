const userModel = require("../../models/userModel");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


async function userSignInController(req, res) {
    try {
        const { email, password } = req.body;

        //ACA VALIDAMOS EN BACKEND, PERO EMAIL Y PASSWORD YA ESTA VALIDADO EN FRONTEND CON required

        // 1. Acumulador de errores
        const errors = {};

        // 2. Validaciones básicas (por si el front no las hace o las salta alguien malintencionado)
        if (!email) {
            errors.email = "Provide email.";
        }
        if (!password) {
            errors.password = "Provide password.";
        }

        // Si ya hay errores de entrada, devuélvelos
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                error: true,
                errors,
            });
        }

        const user = await userModel.findOne({ email: email });
        if (!user) {
            return res.status(400).json({
                success: false,
                error: true,
                errors: { email: "User does not exist." }
            });
        }

        //https://www.npmjs.com/package/bcrypt
        // 4. Verificar la contraseña
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                error: true,
                errors: { password: "Password incorrect." },
            });
        }

        // 5. Generar el token
        const tokenData = {
            _id: user._id,
            email: user.email,
            role: user.role,
        };
        const token = jwt.sign(
            tokenData,
            process.env.TOKEN_SECRET_KEY,
            { expiresIn: 60 * 60 * 8 } // 8 horas
        );

        // Opciones para la cookie
        const tokenOptions = {
            httpOnly: true,
            secure: true,  //only when its https
            sameSite: 'None', // si tu frontend está en distinto dominio/subdominio y requieres enviar cookies cross-site
        };

        // 6. Enviar respuesta con la cookie
        return res
            .cookie("token", token, tokenOptions)
            .status(200)
            .json({
                message: "Login successfully",
                data: token, // El token puede no ser necesario en la respuesta si solo se maneja por cookie
                success: true,
                error: false,
            });
    } catch (err) {
        console.error("Error in userSignIn: ", err);

        return res.status(500).json({
            message: err.message || "An error occurred on the server(Sign In)",
            success: false,
            error: true,
        });
    }
}

module.exports = userSignInController;