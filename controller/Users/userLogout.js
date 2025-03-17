async function userLogout(req, res) {
    try {
        // Opciones para la cookie
        const tokenOptions = {
            httpOnly: true,
            secure: true, //only when its https
            sameSite: 'None', // si tu frontend está en distinto dominio/subdominio y requieres enviar cookies cross-site
        };
        res.clearCookie("token", tokenOptions);

        res.json({
            message: "Logged out succesfully",
            error: false,
            success: true
        })
    } catch (error) {
        res.json({
            message: error.message,
            error: true,
            success: false
        })
    }
}


module.exports = userLogout;