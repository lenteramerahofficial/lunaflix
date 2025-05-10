import TelegramBot from 'node-telegram-bot-api';
import { db } from './db';
import { eq } from 'drizzle-orm';
import { pgTable, text, integer } from "drizzle-orm/pg-core";

// Tabel untuk menyimpan user Telegram
export const telegramUsers = pgTable("telegram_users", {
  id: integer("id").primaryKey(),
  username: text("username").notNull().unique(),
  chat_id: integer("chat_id").notNull(),
  created_at: text("created_at").notNull(),
});

// Cek apakah token Telegram Bot telah dikonfigurasi
if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.warn('TELEGRAM_BOT_TOKEN tidak ditemukan. Fitur Telegram bot tidak akan bekerja.');
}

const token = process.env.TELEGRAM_BOT_TOKEN || '';

// Inisialisasi bot dengan pooling
let bot: any = null;

try {
  // Hanya buat instance jika token tersedia
  if (token) {
    bot = new TelegramBot(token, { polling: true });
    console.log('Telegram bot diinisialisasi dan siap digunakan');
    
    // Tangani pesan /start
    bot.onText(/\/start/, async (msg: any) => {
      const chatId = msg.chat.id;
      const username = msg.from?.username;
      
      if (username) {
        try {
          // Cek apakah username sudah terdaftar
          const existingUser = await getUserByChatId(chatId);
          
          if (!existingUser) {
            // Simpan informasi user ke database
            await db.insert(telegramUsers).values({
              id: Math.floor(Math.random() * 1000000), // Menggunakan angka yang lebih kecil
              username: username.toLowerCase(),
              chat_id: chatId,
              created_at: new Date().toISOString()
            });
            
            console.log(`User Telegram baru terdaftar: @${username} dengan chat ID ${chatId}`);
          }
        } catch (error) {
          console.error('Gagal menyimpan user Telegram:', error);
        }
      }
      
      bot.sendMessage(
        chatId,
        `Halo ${username || 'Pengguna'}! 👋\n\nSaya adalah bot untuk layanan LunaFlix. Saya akan mengirimkan kode OTP saat Anda mencoba login di aplikasi LunaFlix.\n\nPerintah yang tersedia:\n/start - Memulai interaksi dengan bot\n/help - Menampilkan bantuan\n\nPastikan Anda telah memulai bot ini sebelum mencoba login di aplikasi.`
      );
    });
    
    // Tangani pesan /help
    bot.onText(/\/help/, (msg: any) => {
      const chatId = msg.chat.id;
      
      bot.sendMessage(
        chatId,
        `*Bantuan LunaFlix Bot*\n\nBot ini digunakan untuk verifikasi otentikasi pada layanan LunaFlix.\n\nPerintah yang tersedia:\n/start - Memulai interaksi dengan bot\n/help - Menampilkan bantuan\n\nPastikan Anda telah memulai bot ini sebelum mencoba login di aplikasi.`,
        { parse_mode: 'Markdown' }
      );
    });
  }
} catch (error) {
  console.error('Gagal menginisialisasi Telegram bot:', error);
}

// Cek dan buat tabel telegramUsers jika belum ada
async function initTelegramUserTable() {
  try {
    // Push schema ke database
    console.log('Memastikan tabel telegram_users telah dibuat...');
    
    // Coba ambil semua user untuk mengecek apakah tabel sudah ada
    await db.select().from(telegramUsers).limit(1);
    console.log('Tabel telegram_users sudah ada');
  } catch (error: any) {
    if (error.code === '42P01') { // Relation doesn't exist
      console.log('Tabel telegram_users belum ada, membuat tabel baru...');
      // Tabel akan dibuat lewat drizzle-kit push
    }
  }
}

// Init tabel
initTelegramUserTable();

/**
 * Fungsi untuk mengirim OTP ke pengguna Telegram
 * @param username Username Telegram pengguna (tanpa @)
 * @param otp Kode OTP yang akan dikirim
 * @returns Promise<boolean> Berhasil atau tidak
 */
export async function sendOTP(username: string, otp: string): Promise<boolean> {
  if (!bot) {
    console.warn('Bot Telegram tidak diinisialisasi, tidak dapat mengirim OTP');
    return false;
  }
  
  // Hapus @ jika ada di awal username
  const cleanUsername = username.startsWith('@') ? username.substring(1) : username;
  
  try {
    // Coba cari pengguna berdasarkan username
    const user = await getUserByUsername(cleanUsername);
    
    if (!user) {
      console.warn(`Pengguna Telegram dengan username ${cleanUsername} tidak ditemukan. Pastikan pengguna telah menjalankan perintah /start pada bot @lunaflix_bot`);
      return false;
    }
    
    // Kirim OTP
    await bot.sendMessage(
      user.chat_id, 
      `*Kode OTP LunaFlix Anda*\n\n🔐 *${otp}* 🔐\n\nKode ini berlaku untuk 5 menit. Jangan bagikan ke siapapun.`,
      { parse_mode: 'Markdown' }
    );
    
    console.log(`OTP berhasil dikirim ke ${username} (${user.chat_id})`);
    return true;
  } catch (error) {
    console.error(`Gagal mengirim OTP ke ${username}:`, error);
    return false;
  }
}

/**
 * Mendapatkan user Telegram berdasarkan username
 */
async function getUserByUsername(username: string): Promise<{id: number, username: string, chat_id: number} | null> {
  try {
    const [user] = await db.select().from(telegramUsers).where(eq(telegramUsers.username, username.toLowerCase()));
    return user || null;
  } catch (error) {
    console.error('Error saat mencari user Telegram:', error);
    return null;
  }
}

/**
 * Mendapatkan user Telegram berdasarkan chat ID
 */
async function getUserByChatId(chatId: number): Promise<{id: number, username: string, chat_id: number} | null> {
  try {
    const [user] = await db.select().from(telegramUsers).where(eq(telegramUsers.chat_id, chatId));
    return user || null;
  } catch (error) {
    console.error('Error saat mencari user Telegram:', error);
    return null;
  }
}

// Export bot instance jika diperlukan
export default bot;