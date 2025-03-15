const jwt = require('jsonwebtoken')
const userModel = require("../models/userModel");


function authToken(req, res, next) {
    try {
        const token = req.cookies?.token
        console.log("token: ", token);

        if (!token) {
            return res.status(200).json({
                message: "User not logged in",
                error: true,
                success: false
            })
        }

        jwt.verify(token, process.env.TOKEN_SECRET_KEY, async function (err, decoded) {
            console.log("Error en authtoken:", err);
            console.log("decoded: ", decoded);

            if (err) {
                console.log("error auth", err);
                return res.status(401).json({
                    message: "Wrong token, expired or invalid",
                    error: true,
                    success: false
                })
            }

            // Usar el `_id` de decoded para buscar en la base de datos
            const user = await userModel.findById(decoded._id);
            if (!user) {
                return res.status(404).json({ message: "User not found", error: true });
            }



            // Pasar los datos del usuario a las siguientes capas
            req.userId = user._id;
            //req.role = user.role;
            next();

        });


    } catch (err) {
        res.status(500).json({ //Server error
            message: err.message,
            error: true,
            success: false,
        })
    }
};


module.exports = authToken