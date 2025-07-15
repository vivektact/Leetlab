import { asyncHandler } from "../utils/async-handler.js";
import prisma from "../lib/db.js";
import { ApiResponse } from "../utils/api-response.js";
import bcrypt from "bcryptjs"
import { UserRole } from "../generated/prisma/index.js";
import jwt from "jsonwebtoken"



const register = asyncHandler(async (req, res) => {
    const {name, email, password} = req.body

    const existingUser = await prisma.User.findUnique({
        where: {
            email
        }
    })

    if(existingUser){
        return res.status(409).json(new ApiResponse(409, email, "User already registered with this email"))
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await prisma.User.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role: UserRole.USER
        }
    })

    const token = jwt.sign(
        {id: newUser.id,  email: newUser.email},
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY });

    res.cookie('token', token, {
    httpOnly: true,  
    maxAge: 7 * 24 * 60 * 60 * 1000,  
    secure: process.env.NODE_ENV !== "development",     
    sameSite:"strict"
    });

    res.status(201).json(new ApiResponse(200,"You are onboarded", "Account created successfully"))

})


const login = asyncHandler(async (req, res) => {
    const {email, password} = req.body

    const existingUser = await prisma.User.findUnique({
        where:{
            email
        }
    })

    if(!existingUser){
        return res.status(404).json(new ApiResponse(404, email, "User not found"))
    }


    if(!await bcrypt.compare(password, existingUser.password)){
        return res.status(401).json(new ApiResponse(401, password, "Incorrect password"))
    }

    const token = jwt.sign(
    {id: existingUser.id, email: existingUser.email},
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY });

    res.cookie('token', token, {
    httpOnly: true,  
    maxAge: 7 * 24 * 60 * 60 * 1000,  
    secure: process.env.NODE_ENV !== "development",     
    sameSite:"strict"
    });

    res.status(200).json(new ApiResponse(200,"You are onboarded", "Login successfully"))

})


const logout = asyncHandler(async (req, res) => {
    res.cookie('token', '', {
    httpOnly: true,  
    expires: new Date(0),  
    secure: process.env.NODE_ENV !== "development",     
    sameSite:"strict"
    });

    res.status(200).json(new ApiResponse(200,"You are onboarded", "Logout successfully"))
})


const check = asyncHandler(async (req, res) => {
    res.status(200).json(new ApiResponse(200, req.user, "User checked successfully"))
})


export {register, login, logout, check}