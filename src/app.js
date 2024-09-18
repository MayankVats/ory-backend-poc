const express = require("express")
const axios = require("axios")
const dotenv = require("dotenv")
const cors = require("cors")

dotenv.config()

const app = express()
const port = 3000

app.use(cors({ credentials: true, origin: "http://localhost:1234" }))

const authenticateUser = async (req, res, next) => {
  try {
    console.log(req.headers.cookie)

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

    req.user = response.data

    const traits = req.user.identity.traits

    if (!traits.role || traits.role !== "user") {
      return res.status(401).json({ message: "Unauthorized" })
    }

    next() // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Error verifying session:", error.message)
    return res.status(401).json({ message: "User not authenticated" })
  }
}

app.get("/user-profile", authenticateUser, (req, res) => {
  const user = req.user
  res.json({
    message: "User profile fetched successfully",
    user: user.identity.traits
  })
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
