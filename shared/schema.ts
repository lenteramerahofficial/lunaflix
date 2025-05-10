import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  hasActiveSubscription: boolean("has_active_subscription").default(false).notNull(),
  subscriptionExpiresAt: text("subscription_expires_at"),
});

// OTP schema
export const otps = pgTable("otps", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  otp: text("otp").notNull(),
  expiresAt: text("expires_at").notNull(),
  isUsed: boolean("is_used").default(false).notNull(),
});

// Movie schema
export const movies = pgTable("movies", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  year: text("year").notNull(),
  category: text("category").notNull(),
  posterUrl: text("poster_url").notNull(),
  videoUrl: text("video_url"),
  isFeatured: boolean("is_featured").default(false).notNull(),
});

// Payment schema
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  amount: integer("amount").notNull(),
  walletAddress: text("wallet_address").notNull(),
  status: text("status").notNull(), // 'pending', 'completed', 'failed'
  createdAt: text("created_at").notNull(),
});

// Telegram Users schema
export const telegramUsers = pgTable("telegram_users", {
  id: integer("id").primaryKey(),
  username: text("username").notNull().unique(),
  chat_id: integer("chat_id").notNull(),
  created_at: text("created_at").notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertOtpSchema = createInsertSchema(otps).pick({
  username: true,
  otp: true,
  expiresAt: true,
});

export const insertMovieSchema = createInsertSchema(movies).pick({
  title: true,
  description: true,
  year: true,
  category: true,
  posterUrl: true,
  videoUrl: true,
  isFeatured: true,
});

export const insertPaymentSchema = createInsertSchema(payments).pick({
  username: true,
  amount: true,
  walletAddress: true,
  status: true,
  createdAt: true,
});

export const insertTelegramUserSchema = createInsertSchema(telegramUsers).pick({
  id: true,
  username: true,
  chat_id: true,
  created_at: true,
});

// Type definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertOtp = z.infer<typeof insertOtpSchema>;
export type Otp = typeof otps.$inferSelect;

export type InsertMovie = z.infer<typeof insertMovieSchema>;
export type Movie = typeof movies.$inferSelect;

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

export type InsertTelegramUser = z.infer<typeof insertTelegramUserSchema>;
export type TelegramUser = typeof telegramUsers.$inferSelect;

// Auth related schemas
export const requestOtpSchema = z.object({
  username: z.string().regex(/^@[a-zA-Z0-9_]+$/, {
    message: "Username harus diawali @ dan hanya mengandung huruf, angka, dan underscore",
  }),
});

export const verifyOtpSchema = z.object({
  username: z.string(),
  otp: z.string().regex(/^\d{4}$/, {
    message: "OTP harus 4 digit angka",
  }),
});

export const verifyPaymentSchema = z.object({
  username: z.string(),
  amount: z.number().min(5000),
  wallet: z.string(),
});
