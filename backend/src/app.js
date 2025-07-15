import express from "express"
import cors from "cors"
import authRouter from "./routes/auth.routes.js"
import cookieParser from "cookie-parser"
import problemRoutes from "./routes/problem.routes.js"
import executeCodeRoutes from "./routes/executeCode.routes.js"


const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser());

app.use(cors({
    origin: process.env.BASE_URL,
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use("/api/v1/auth", authRouter)
app.use("/api/v1/problems", problemRoutes)
app.use("/api/v1/extecute-code", executeCodeRoutes)



export default app