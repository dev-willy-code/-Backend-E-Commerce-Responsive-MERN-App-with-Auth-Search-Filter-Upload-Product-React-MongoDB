const { default: mongoose } = require("mongoose");
const monogoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("mongodb connected succesfuly");
    } catch (err) {
        console.log(err);
    }
}

module.exports = connectDB;