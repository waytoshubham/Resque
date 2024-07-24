import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);

// Helper function to simulate sending notifications
const sendNotification = (user, message) => {
  console.log(`Notification sent to ${user.email}: ${message}`);
};

app.post("/api/send-traffic-notification", async (req, res) => {
  const { area, message } = req.body;
  try {
    const newNotification = await prisma.trafficNotification.create({
      data: { area, message },
    });

    // Fetch users whose traffic profile has the specified area
    const trafficUsers = await prisma.trafficProfile.findMany({
      where: { area: area },
      include: { user: true },
    });

    // Send notifications only to users in the specified area
    for (const trafficUser of trafficUsers) {
      sendNotification(trafficUser.user, message);
    }

    res.status(200).json(newNotification);
  } catch (error) {
    console.error("Error sending traffic notification:", error);
    res.status(500).json({ error: "Failed to send traffic notification" });
  }
});

// Route to get traffic notifications
app.get("/api/traffic-notifications", async (req, res) => {
  try {
    const notifications = await prisma.trafficNotification.findMany({
      where: { status: "PENDING" },
    });
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching traffic notifications:", error);
    res.status(500).json({ error: "Failed to fetch traffic notifications" });
  }
});

app.post("/api/traffic-notifications/:id/respond", async (req, res) => {
  const { id } = req.params;
  const { status, userId } = req.body;
  try {
    const updatedNotification = await prisma.trafficNotification.update({
      where: { id: parseInt(id) },
      data: { status, trafficProfile: { connect: { userId: userId } } },
    });

    const trafficUser = await prisma.trafficProfile.findUnique({
      where: { userId: userId },
      include: { user: true },
    });

    if (!trafficUser) {
      throw new Error(`Traffic user with ID ${userId} not found`);
    }

    const confirmationMessage =
      status === "ACCEPTED"
        ? "The signal is clear. You are welcome."
        : "The signal is busy having congestion. Kindly divert your way.";

    await prisma.trafficProfile.update({
      where: { userId: userId },
      data: { status: status },
    });

    res.status(200).json({
      message: confirmationMessage,
      area: trafficUser.area,
      trafficUserName: trafficUser.user.name,
    });
  } catch (error) {
    console.error("Error responding to traffic notification:", error);
    res.status(500).json({ error: "Failed to update traffic notification" });
  }
});

app.get("/api/traffic-confirmations", async (req, res) => {
  const { area } = req.query;
  try {
    const confirmations = await prisma.trafficNotification.findMany({
      where: { status: { in: ["ACCEPTED", "DENIED"] }, area: area },
      include: {
        trafficProfile: {
          include: { user: true },
        },
      },
    });
    res.status(200).json(confirmations.map(confirmation => ({
      ...confirmation,
      message: confirmation.status === "ACCEPTED"
        ? "The signal is clear. You are welcome."
        : "The signal is busy having congestion. Kindly divert your way."
    })));
  } catch (error) {
    console.error("Error fetching traffic confirmations:", error);
    res.status(500).json({ error: "Failed to fetch traffic confirmations" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
