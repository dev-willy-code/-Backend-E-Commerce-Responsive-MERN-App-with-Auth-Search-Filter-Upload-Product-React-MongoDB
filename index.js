const express = require('express');
const cors = require('cors')
const cookieParser = require('cookie-parser')
require('dotenv').config()
const connectDB = require('./config/db');
const router = require('./routes');

const app = express()
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))
app.use(express.json({ limit: '10mb' })) //para las iamgenes en fomrato 64
app.use(cookieParser())

app.use("/api", router)

const PORT = 8080 || process.env.PORT

//promise
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("Server is running")
    })
})

