import axios from "axios"
import { NextFunction, Request, Response } from "express"
import httpContext from "express-http-context"

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.headers.cookie) {
      return res.status(401).json({ message: "No session provided" })
    }

    // Verify the session token with Ory Kratos
    const response = await axios.get(
      `${process.env.ORY_API_URL}/sessions/whoami`,
      {
        headers: {
          Cookie: `${req.headers.cookie}`,
          "Content-Type": "application/json"
        }
      }
    )

    httpContext.set("user", response.data)

    const traits = response.data.identity.traits

    if (!traits.role || traits.role !== "user") {
      return res.status(401).json({ message: "Unauthorized" })
    }

    next() // Proceed to the next middleware or route handler
  } catch (error) {
    return res.status(401).json({ message: "User not authenticated" })
  }
}
