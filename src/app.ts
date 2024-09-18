import express, { Request, Response, NextFunction } from "express"
import cors from "cors"
import { authenticateUser } from "./middleware/auth"
import httpContext from "express-http-context"

const app = express()

app.use(cors({ credentials: true, origin: "http://localhost:1234" }))
app.use(httpContext.middleware)

app.get("/health", (req: Request, res: Response) => {
  res.json({
    message: "Server is healthy"
  })
})

app.get("/user-profile", authenticateUser, (req: Request, res: Response) => {
  const user = httpContext.get("user")
  res.json({
    message: "User profile fetched successfully",
    user: user.identity.traits
  })
})

export default app
