import { asyncHandler } from "../utils/async-handler.js"
import { ApiResponse } from "../utils/api-response.js"
import jwt from "jsonwebtoken"
import prisma from "../lib/db.js"

const authMiddleware = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token

  if (!token) {
    return res.status(404).json(new ApiResponse(401, null, "Unauthorized"))
  }

  const decode = jwt.verify(token, process.env.JWT_SECRET)

  const user = await prisma.User.findUnique({
    where: {
      id: decode.id,
    },
    select: {
      id: true,
      email: true,
      image: true,
      role: true,
      name: true,
    },
  })
  req.user = user
  next()
})

const checkAdmin = asyncHandler(async (req, res, next) => {
  const userId = req.user.id

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      role: true,
    },
  })

  if (!user || user.role !== "ADMIN") {
    return res
      .status(403)
      .json(new ApiResponse(403, null, "Access denied - Admins only"))
  }

  next()
})

export { authMiddleware, checkAdmin }
