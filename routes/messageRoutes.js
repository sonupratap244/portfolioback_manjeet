
import express from "express";
import Message from "../models/Message.js";
import protect from "../middleware/authMiddleware.js";
import nodemailer from "nodemailer"; // add this

const router = express.Router();

/* -------------------- CREATE (Public route) -------------------- */
router.post("/create", async (req, res) => {
  try {
    const { name, email, message, meetingDate, meetingTime } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email, and message are required." });
    }

    //  Save message to DB
    const newMessage = await Message.create({
      name,
      email,
      message,
      meetingDate,
      meetingTime,
    });

    // Send email to admin
    try {
      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "manjeetmau1994@gmail.com",       // Replace with your Gmail
          pass: "jvrdleiekwjabmwy",          // Use App Password
        },
      });

      let mailOptions = {
        from: "YOUR_GMAIL@gmail.com",
        to: "manjeetmau1994@gmail.com",       // Admin email
        subject: `New Candidate Message from ${name}`,
        html: `
          <h2>New Message from Candidate</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong> ${message}</p>
          <p><strong>Meeting Date:</strong> ${meetingDate || "Not provided"}</p>
          <p><strong>Meeting Time:</strong> ${meetingTime || "Not provided"}</p>
          <p><a href="https://portfoliofront-sooty.vercel.app/login" target="_blank">Login to see candidate details</a></p>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log("Admin email sent successfully");
    } catch (emailError) {
      console.error("Failed to send admin email:", emailError);
    }

    //  Respond to client
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ message: "Error saving message" });
  }
});

/* -------------------- READ (Admin only) -------------------- */
router.get("/", protect, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Error fetching messages" });
  }
});

/* -------------------- UPDATE (Admin only) -------------------- */
router.put("/:id", protect, async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    res.json(message);
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).json({ message: "Error updating message" });
  }
});

/* -------------------- DELETE (Admin only) -------------------- */
router.delete("/:id", protect, async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ message: "Error deleting message" });
  }
});

export default router;
