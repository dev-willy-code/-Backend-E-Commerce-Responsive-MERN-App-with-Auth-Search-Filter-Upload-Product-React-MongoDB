const userModel = require("../../models/userModel");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require("crypto"); //nativo de nodejs

const saltRounds = 10;


async function googleAuth(req, res) {
    const { name, email, googlePhotoURL } = req.body; //req.body is the data that is sent to the server from the client

    if (!name || !email || name === '' || email === '') { // Check if all fields are filled
        return res.status(400).json({
            message: "No se obtuvieron los datos de google auth correctamente.",
            success: false,
            error: true
        });
    }
    console.log(email, name, googlePhotoURL); //esto si se imprime bien

    try {
        // el usuario ya existe
        const validUser = await userModel.findOne({ email }); // Find the user by email
        console.log(validUser);
        if (validUser) { //SignIn
            console.log("SigIn google, user already exists");
            //Generar el token
            const tokenData = {
                _id: validUser._id,
                email: validUser.email,
                role: validUser.role,
            };
            const token = jwt.sign(
                tokenData,
                process.env.TOKEN_SECRET_KEY,
                { expiresIn: 60 * 60 * 8 } // 8 horas
            );

            // Opciones para la cookie
            const tokenOptions = {
                httpOnly: true,
                secure: true,
                // sameSite: 'none', // si tu frontend está en distinto dominio/subdominio y requieres enviar cookies cross-site
            };


            // Enviar respuesta con la cookie
            return res
                .cookie("token", token, tokenOptions)
                .status(200)
                .json({
                    message: "Google Login successfully",
                    data: token, // El token puede no ser necesario en la respuesta si solo se maneja por cookie
                    success: true,
                    error: false,
                });

        } else { //Signup and Signin (2 en 1)
            console.log("SigUp google, new user");
            //📌 Más saltRounds = Más seguridad, pero también más lento.
            const salt = bcrypt.genSaltSync(saltRounds);
            const hashPassword = bcrypt.hashSync(crypto.randomBytes(8).toString("hex"), salt);

            if (!hashPassword) {
                throw new Error("Something is wrong with hashPassword, Please try later");
            }

            // Crear el payload del usuario, payload traducido es "carga"
            const payload = {
                ...req.body,
                role: "GENERAL",
                name: name,
                email: email,
                password: hashPassword,
                profilePic: googlePhotoURL
            };
            const newUser = new userModel(payload); // Create a new user

            await newUser.save(); // Save the new user
            console.log("newUser: ", newUser);
            //Generar el token
            const tokenData = {
                _id: newUser._id,
                email: newUser.email,
                role: newUser.role,
            };
            const token = jwt.sign(
                tokenData,
                process.env.TOKEN_SECRET_KEY,
                { expiresIn: 60 * 60 * 8 } // 8 horas
            );

            // Opciones para la cookie
            const tokenOptions = {
                httpOnly: true,
                secure: true,
                // sameSite: 'none', // si tu frontend está en distinto dominio/subdominio y requieres enviar cookies cross-site
            };


            // Enviar respuesta con la cookie
            return res
                .cookie("token", token, tokenOptions)
                .status(200)
                .json({
                    message: "Google Signup/Login successfully",
                    data: token, // El token puede no ser necesario en la respuesta si solo se maneja por cookie
                    success: true,
                    error: false,
                });

        }

    } catch (error) {
        return res.status(400).json({
            message: error.message || "Error en googleAuth",
            success: false,
            error: true,
        });
    }
}

module.exports = googleAuth;