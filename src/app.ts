import cors from "cors";
import express from "express";
import authRoutes from "./modules/auth/auth.route.js";

const app = express();
const API_VERSION = "v1";
const API_PREFIX = `/api/${API_VERSION}`;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Health check successful",
    data: { service: "inviteprobackend" },
  });
});

app.use(`${API_PREFIX}/auth`, authRoutes);

export default app;
