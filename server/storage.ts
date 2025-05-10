import { 
  User, 
  InsertUser, 
  Otp, 
  InsertOtp,
  Movie,
  InsertMovie,
  Payment,
  InsertPayment
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserSubscription(username: string): Promise<User | undefined>;
  
  // OTP methods
  getOtpByUsername(username: string): Promise<Otp | undefined>;
  createOrUpdateOtp(otp: InsertOtp): Promise<Otp>;
  markOtpAsUsed(username: string): Promise<boolean>;
  
  // Movie methods
  getAllMovies(): Promise<Movie[]>;
  getMovieById(id: number): Promise<Movie | undefined>;
  createMovie(movie: InsertMovie): Promise<Movie>;
  
  // Payment methods
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentsByUsername(username: string): Promise<Payment[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private otps: Map<string, Otp>;
  private movies: Map<number, Movie>;
  private payments: Map<number, Payment>;
  private currentUserId: number;
  private currentMovieId: number;
  private currentPaymentId: number;
  
  constructor() {
    this.users = new Map();
    this.otps = new Map();
    this.movies = new Map();
    this.payments = new Map();
    this.currentUserId = 1;
    this.currentMovieId = 1;
    this.currentPaymentId = 1;
    
    // Initialize with sample movies
    this.initializeMovies();
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      isVerified: false,
      hasActiveSubscription: false,
      subscriptionExpiresAt: null
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserSubscription(username: string): Promise<User | undefined> {
    const user = await this.getUserByUsername(username);
    if (!user) return undefined;
    
    // Set subscription expiry to 30 days from now
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    
    const updatedUser: User = {
      ...user,
      isVerified: true,
      hasActiveSubscription: true,
      subscriptionExpiresAt: expiryDate.toISOString()
    };
    
    this.users.set(user.id, updatedUser);
    return updatedUser;
  }
  
  // OTP methods
  async getOtpByUsername(username: string): Promise<Otp | undefined> {
    return this.otps.get(username);
  }
  
  async createOrUpdateOtp(insertOtp: InsertOtp): Promise<Otp> {
    const id = 1; // For in-memory storage, we can use a fixed ID
    const otp: Otp = { 
      ...insertOtp, 
      id, 
      isUsed: false 
    };
    this.otps.set(insertOtp.username, otp);
    return otp;
  }
  
  async markOtpAsUsed(username: string): Promise<boolean> {
    const otp = this.otps.get(username);
    if (!otp) return false;
    
    const updatedOtp: Otp = {
      ...otp,
      isUsed: true
    };
    
    this.otps.set(username, updatedOtp);
    return true;
  }
  
  // Movie methods
  async getAllMovies(): Promise<Movie[]> {
    return Array.from(this.movies.values());
  }
  
  async getMovieById(id: number): Promise<Movie | undefined> {
    return this.movies.get(id);
  }
  
  async createMovie(insertMovie: InsertMovie): Promise<Movie> {
    const id = this.currentMovieId++;
    // Ensure all required fields are provided with default values if missing
    const movie: Movie = { 
      ...insertMovie, 
      id,
      description: insertMovie.description || null,
      videoUrl: insertMovie.videoUrl || null,
      isFeatured: insertMovie.isFeatured ?? false
    };
    this.movies.set(id, movie);
    return movie;
  }
  
  // Payment methods
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = this.currentPaymentId++;
    const payment: Payment = { ...insertPayment, id };
    this.payments.set(id, payment);
    return payment;
  }
  
  async getPaymentsByUsername(username: string): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(
      (payment) => payment.username === username,
    );
  }
  
  // Initialize sample movies
  private initializeMovies() {
    const sampleMovies: InsertMovie[] = [
      {
        title: "Aksi Pertempuran",
        description: "Film aksi pertempuran dengan efek visual memukau",
        year: "2023",
        category: "Action",
        posterUrl: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=750",
        videoUrl: "https://1024terabox.com/s/1ER-dQL1MU3zuXwFrdG6RoA/action.mp4",
        isFeatured: false
      },
      {
        title: "Kisah Cinta",
        description: "Kisah cinta yang mengharukan",
        year: "2023",
        category: "Drama",
        posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=750",
        videoUrl: "https://1024terabox.com/s/1ER-dQL1MU3zuXwFrdG6RoA/drama.mp4",
        isFeatured: false
      },
      {
        title: "Tawa Seru",
        description: "Film komedi yang mengocok perut",
        year: "2023",
        category: "Komedi",
        posterUrl: "https://images.unsplash.com/photo-1585951237318-9ea5e175b891?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=750",
        videoUrl: "https://1024terabox.com/s/1ER-dQL1MU3zuXwFrdG6RoA/comedy.mp4",
        isFeatured: false
      },
      {
        title: "Rumah Hantu",
        description: "Film horor yang menegangkan",
        year: "2023",
        category: "Horror",
        posterUrl: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=750",
        videoUrl: "https://1024terabox.com/s/1ER-dQL1MU3zuXwFrdG6RoA/horror.mp4",
        isFeatured: false
      },
      {
        title: "Alam Liar",
        description: "Film dokumenter tentang alam liar",
        year: "2023",
        category: "Dokumenter",
        posterUrl: "https://images.unsplash.com/photo-1452802447250-470a88ac82bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=750",
        videoUrl: "https://1024terabox.com/s/1ER-dQL1MU3zuXwFrdG6RoA/documentary.mp4",
        isFeatured: true
      },
      {
        title: "Petualangan Hebat",
        description: "Film petualangan yang menegangkan",
        year: "2023",
        category: "Action",
        posterUrl: "https://images.unsplash.com/photo-1512700115-e769bd1e2b67?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=750",
        videoUrl: "https://1024terabox.com/s/1ER-dQL1MU3zuXwFrdG6RoA/adventure.mp4",
        isFeatured: false
      },
      {
        title: "Kapal Tenggelam",
        description: "Film drama tentang kapal yang tenggelam",
        year: "2023",
        category: "Drama",
        posterUrl: "https://images.unsplash.com/photo-1518133835878-5a93cc3f89e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=750",
        videoUrl: "https://1024terabox.com/s/1ER-dQL1MU3zuXwFrdG6RoA/ship.mp4",
        isFeatured: false
      },
      {
        title: "Teman Sepermainan",
        description: "Film komedi tentang persahabatan",
        year: "2023",
        category: "Komedi",
        posterUrl: "https://images.unsplash.com/photo-1518108621213-2be030acb267?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=750",
        videoUrl: "https://1024terabox.com/s/1ER-dQL1MU3zuXwFrdG6RoA/friends.mp4",
        isFeatured: false
      },
      {
        title: "Dimensi Lain",
        description: "Film horor tentang dimensi lain",
        year: "2023",
        category: "Horror",
        posterUrl: "https://images.unsplash.com/photo-1503596476-1c12a8ba1091?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=750",
        videoUrl: "https://1024terabox.com/s/1ER-dQL1MU3zuXwFrdG6RoA/dimension.mp4",
        isFeatured: false
      },
      {
        title: "Kehidupan Laut",
        description: "Film dokumenter tentang kehidupan laut",
        year: "2023",
        category: "Dokumenter",
        posterUrl: "https://images.unsplash.com/photo-1478650704499-5e0fae207c33?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=750",
        videoUrl: "https://1024terabox.com/s/1ER-dQL1MU3zuXwFrdG6RoA/ocean.mp4",
        isFeatured: false
      }
    ];
    
    // Add each movie to the map
    sampleMovies.forEach(movie => {
      this.createMovie(movie);
    });
  }
}

// Import DatabaseStorage
import { DatabaseStorage } from "./dbstorage";

// Initialize sample movies for database
const initializeDatabaseMovies = async (storage: IStorage) => {
  // Check if movies already exist
  const existingMovies = await storage.getAllMovies();
  if (existingMovies.length > 0) {
    return; // Movies already initialized
  }

  // Sample movies data
  const sampleMovies: InsertMovie[] = [
    {
      title: "Aksi Pertempuran",
      description: "Film aksi pertempuran dengan efek visual memukau",
      year: "2023",
      category: "Action",
      posterUrl: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=750",
      videoUrl: "https://1024terabox.com/s/1ER-dQL1MU3zuXwFrdG6RoA/action.mp4",
      isFeatured: false
    },
    {
      title: "Kisah Cinta",
      description: "Kisah cinta yang mengharukan",
      year: "2023",
      category: "Drama",
      posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=750",
      videoUrl: "https://1024terabox.com/s/1ER-dQL1MU3zuXwFrdG6RoA/drama.mp4",
      isFeatured: false
    },
    {
      title: "Tawa Seru",
      description: "Film komedi yang mengocok perut",
      year: "2023",
      category: "Komedi",
      posterUrl: "https://images.unsplash.com/photo-1585951237318-9ea5e175b891?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=750",
      videoUrl: "https://1024terabox.com/s/1ER-dQL1MU3zuXwFrdG6RoA/comedy.mp4",
      isFeatured: false
    },
    {
      title: "Rumah Hantu",
      description: "Film horor yang menegangkan",
      year: "2023",
      category: "Horror",
      posterUrl: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=750",
      videoUrl: "https://1024terabox.com/s/1ER-dQL1MU3zuXwFrdG6RoA/horror.mp4",
      isFeatured: false
    },
    {
      title: "Alam Liar",
      description: "Film dokumenter tentang alam liar",
      year: "2023",
      category: "Dokumenter",
      posterUrl: "https://images.unsplash.com/photo-1452802447250-470a88ac82bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=750",
      videoUrl: "https://1024terabox.com/s/1ER-dQL1MU3zuXwFrdG6RoA/documentary.mp4",
      isFeatured: true
    },
  ];
  
  // Add each movie to database
  for (const movie of sampleMovies) {
    await storage.createMovie(movie);
  }
};

// Create database storage instance
export const storage = new DatabaseStorage();

// Initialize movies in the database (will run on server start)
initializeDatabaseMovies(storage).catch(error => {
  console.error("Failed to initialize movies:", error);
});
