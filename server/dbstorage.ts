import { db } from "./db";
import { IStorage } from "./storage";
import { eq, and, desc } from "drizzle-orm";
import {
  User,
  InsertUser,
  Otp,
  InsertOtp,
  Movie,
  InsertMovie,
  Payment,
  InsertPayment,
  users,
  otps,
  movies,
  payments
} from "@shared/schema";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        isVerified: false,
        hasActiveSubscription: false,
        subscriptionExpiresAt: null
      })
      .returning();
    return user;
  }
  
  async updateUserSubscription(username: string): Promise<User | undefined> {
    // Set subscription expiry to 30 days from now
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    
    const [updatedUser] = await db
      .update(users)
      .set({ 
        isVerified: true,
        hasActiveSubscription: true,
        subscriptionExpiresAt: expiryDate.toISOString()
      })
      .where(eq(users.username, username))
      .returning();
    
    return updatedUser || undefined;
  }
  
  // OTP methods
  async getOtpByUsername(username: string): Promise<Otp | undefined> {
    const [otp] = await db
      .select()
      .from(otps)
      .where(eq(otps.username, username))
      .orderBy(desc(otps.id))
      .limit(1);
    
    return otp || undefined;
  }
  
  async createOrUpdateOtp(insertOtp: InsertOtp): Promise<Otp> {
    // Check if there's an existing OTP for this username
    const existingOtp = await this.getOtpByUsername(insertOtp.username);
    
    let otp: Otp;
    
    if (existingOtp) {
      // Update existing OTP
      const [updatedOtp] = await db
        .update(otps)
        .set({ 
          otp: insertOtp.otp,
          expiresAt: insertOtp.expiresAt,
          isUsed: false
        })
        .where(eq(otps.id, existingOtp.id))
        .returning();
      
      otp = updatedOtp;
    } else {
      // Create new OTP
      const [newOtp] = await db
        .insert(otps)
        .values({ 
          ...insertOtp,
          isUsed: false
        })
        .returning();
      
      otp = newOtp;
    }
    
    return otp;
  }
  
  async markOtpAsUsed(username: string): Promise<boolean> {
    const otp = await this.getOtpByUsername(username);
    if (!otp) return false;
    
    await db
      .update(otps)
      .set({ isUsed: true })
      .where(eq(otps.id, otp.id));
    
    return true;
  }
  
  // Movie methods
  async getAllMovies(): Promise<Movie[]> {
    return db.select().from(movies);
  }
  
  async getMovieById(id: number): Promise<Movie | undefined> {
    const [movie] = await db
      .select()
      .from(movies)
      .where(eq(movies.id, id));
    
    return movie || undefined;
  }
  
  async createMovie(insertMovie: InsertMovie): Promise<Movie> {
    const [movie] = await db
      .insert(movies)
      .values({
        ...insertMovie,
        description: insertMovie.description || null,
        videoUrl: insertMovie.videoUrl || null,
        isFeatured: insertMovie.isFeatured ?? false
      })
      .returning();
    
    return movie;
  }
  
  // Payment methods
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values(insertPayment)
      .returning();
    
    return payment;
  }
  
  async getPaymentsByUsername(username: string): Promise<Payment[]> {
    return db
      .select()
      .from(payments)
      .where(eq(payments.username, username));
  }
}