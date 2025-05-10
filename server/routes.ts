import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { requestOtpSchema, verifyOtpSchema, verifyPaymentSchema } from "@shared/schema";
import { z } from "zod";
import { sendOTP } from "./telegram";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/requestOtp", async (req, res) => {
    try {
      const data = requestOtpSchema.parse(req.body);
      const { username } = data;
      
      // Generate a random 4-digit OTP
      const otp = Math.floor(Math.random() * 9000 + 1000).toString();
      
      // Set expiration to 5 minutes from now
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      
      // Save OTP to storage
      await storage.createOrUpdateOtp({
        username,
        otp,
        expiresAt,
      });
      
      // Kirim OTP melalui Telegram Bot
      const sent = await sendOTP(username, otp);
      
      // Log OTP untuk debugging/pengembangan
      console.log(`OTP for ${username}: ${otp}`);
      
      if (!sent) {
        console.warn(`Gagal mengirim OTP ke ${username} melalui Telegram, menggunakan konsol log sebagai fallback`);
      }
      
      res.json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: (error as z.ZodError).message });
      } else {
        console.error("Request OTP error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });
  
  app.post("/api/auth/verifyOtp", async (req, res) => {
    try {
      const data = verifyOtpSchema.parse(req.body);
      const { username, otp } = data;
      
      // Get OTP from storage
      const otpRecord = await storage.getOtpByUsername(username);
      
      if (!otpRecord) {
        return res.status(404).json({ error: "OTP not found" });
      }
      
      if (otpRecord.isUsed) {
        return res.status(400).json({ error: "OTP already used" });
      }
      
      if (new Date(otpRecord.expiresAt) < new Date()) {
        return res.status(400).json({ error: "OTP expired" });
      }
      
      if (otpRecord.otp !== otp) {
        return res.status(400).json({ error: "Invalid OTP" });
      }
      
      // Mark OTP as used
      await storage.markOtpAsUsed(username);
      
      res.json({ success: true, message: "OTP verified successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: (error as z.ZodError).message });
      } else {
        console.error("Verify OTP error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });
  
  // Payment routes
  app.post("/api/payment/verify", async (req, res) => {
    try {
      const data = verifyPaymentSchema.parse(req.body);
      const { username, amount, wallet } = data;
      
      // In a real app, we would verify the payment with the blockchain
      // For now, we just simulate a successful payment
      
      // Create a new payment record
      await storage.createPayment({
        username,
        amount,
        walletAddress: wallet,
        status: "completed",
        createdAt: new Date().toISOString(),
      });
      
      // Update user subscription status
      await storage.updateUserSubscription(username);
      
      res.json({ success: true, message: "Payment verified successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: (error as z.ZodError).message });
      } else {
        console.error("Verify payment error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });
  
  // Movies routes
  app.get("/api/movies", async (req, res) => {
    try {
      const movies = await storage.getAllMovies();
      res.json(movies);
    } catch (error) {
      console.error("Get movies error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  const httpServer = createServer(app);
  
  return httpServer;
}
