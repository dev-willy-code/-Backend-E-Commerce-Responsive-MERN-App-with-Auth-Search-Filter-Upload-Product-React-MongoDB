async function userLogout(req, res) {
    try {
        res.clearCookie("token");

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