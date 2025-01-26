import express from "express";
import morgan from "morgan";
import http from "http"; // You missed importing 'http'
import cors from "cors"; // You missed importing 'cors'
import connectToDB from "./utilis/connectDb.js";
import authRoutes from "./routers/auth.js";
import userRoutes from "./routers/user.js";
import loanROutes from "./routers/loan.js"
 
const app = express();
const PORT = 4000;

const server = http.createServer(app); // The server was defined, but not used in the original code

app.use(
    cors({
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);

app.use(morgan("tiny"));
app.use(express.json());

connectToDB();

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/loan", loanROutes)

// Use 'server.listen()' instead of 'app.listen()' because you're using 'http.createServer()'
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
