import cors from "cors";
import express from "express";
import authRoutes from "./modules/auth/auth.route.js";
import dashboardRoutes from "./modules/dashboard/dashboard.route.js";
import eventRoutes from "./modules/event/event.route.js";
import eventGuestRoutes from "./modules/eventGuest/eventGuest.route.js";
import guestRoutes from "./modules/guest/guest.route.js";

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
app.use(`${API_PREFIX}/dashboard`, dashboardRoutes);
app.use(`${API_PREFIX}/events`, eventRoutes);
app.use(`${API_PREFIX}/events`, eventGuestRoutes);
app.use(`${API_PREFIX}/guests`, guestRoutes);

export default app;
