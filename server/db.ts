import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'voyage.db');

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
      email_verified INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS email_verification_tokens (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      destination_id TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(user_id, destination_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS payment_intents (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount_inr INTEGER NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT,
      item_ref TEXT NOT NULL,
      qr_payload TEXT NOT NULL,
      status TEXT NOT NULL,
      last_error TEXT,
      card_brand TEXT,
      card_last4 TEXT,
      receipt_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      payment_intent_id TEXT NOT NULL,
      item_json TEXT NOT NULL,
      payment_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      user_id TEXT,
      ip TEXT,
      details TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS destinations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      region TEXT NOT NULL,
      theme TEXT NOT NULL,
      budget TEXT NOT NULL,
      image TEXT NOT NULL,
      description TEXT NOT NULL,
      long_description TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
    CREATE INDEX IF NOT EXISTS idx_payment_intents_user ON payment_intents(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
  `);

  const count = db.prepare('SELECT COUNT(*) as c FROM destinations').get() as { c: number };
  if (count.c === 0) {
    const seed = defaultDestinationsSeed();
    const ins = db.prepare(`
      INSERT INTO destinations (id, name, region, theme, budget, image, description, long_description, sort_order)
      VALUES (@id, @name, @region, @theme, @budget, @image, @description, @long_description, @sort_order)
    `);
    const tx = db.transaction(() => {
      seed.forEach((row, i) => ins.run({ ...row, sort_order: i }));
    });
    tx();
  }

  bootstrapAdminIfNeeded();
}

function defaultDestinationsSeed() {
  return [
    { id: '1', name: 'Rajasthan', region: 'North', theme: 'Heritage', budget: 'Luxury', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Thar_Khuri.jpg/960px-Thar_Khuri.jpg', description: 'Majestic forts, vibrant culture, and golden deserts.', long_description: 'Rajasthan, the Land of Kings.' },
    { id: '2', name: 'Kerala', region: 'South', theme: 'Nature', budget: 'Mid-range', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Boathouse_%287063399547%29.jpg/960px-Boathouse_%287063399547%29.jpg', description: 'Tranquil backwaters, lush hills, and pristine beaches.', long_description: "God's Own Country." },
    { id: '3', name: 'Goa', region: 'West', theme: 'Beach', budget: 'Budget', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/BeachFun.jpg/960px-BeachFun.jpg', description: 'Sun-kissed beaches and Portuguese heritage.', long_description: 'Goa coastline and culture.' },
    { id: '4', name: 'Himachal Pradesh', region: 'North', theme: 'Adventure', budget: 'Mid-range', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Kinnaur_Kailash.jpg/960px-Kinnaur_Kailash.jpg', description: 'Himalayan landscapes and monasteries.', long_description: 'Northern Himalayan state.' },
    { id: '5', name: 'Varanasi', region: 'North', theme: 'Spiritual', budget: 'Budget', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Varanasi%2C_India%2C_Ghats%2C_Cremation_ceremony_in_progress.jpg/960px-Varanasi%2C_India%2C_Ghats%2C_Cremation_ceremony_in_progress.jpg', description: 'Spiritual capital on the Ganges.', long_description: 'Ancient city of temples.' },
    { id: '6', name: 'Andaman', region: 'South', theme: 'Beach', budget: 'Luxury', image: '/images/andaman.png', description: 'Pristine beaches and coral reefs.', long_description: 'Bay of Bengal archipelago.' },
    { id: '7', name: 'Golden Temple, Amritsar', region: 'North', theme: 'Spiritual', budget: 'Budget', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/The_Golden_Temple_of_Amrithsar_7.jpg/960px-The_Golden_Temple_of_Amrithsar_7.jpg', description: 'Holiest Gurdwara of Sikhism.', long_description: 'Harmandir Sahib.' },
    { id: '8', name: 'Meenakshi Temple, Madurai', region: 'South', theme: 'Heritage', budget: 'Mid-range', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/An_aerial_view_of_Madurai_city_from_atop_of_Meenakshi_Amman_temple.jpg/960px-An_aerial_view_of_Madurai_city_from_atop_of_Meenakshi_Amman_temple.jpg', description: 'Historic temple city.', long_description: 'Tamil Nadu heritage.' },
    { id: '9', name: 'Jama Masjid, Delhi', region: 'North', theme: 'Spiritual', budget: 'Luxury', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Jama_Masjid_-_In_the_Noon.jpg/960px-Jama_Masjid_-_In_the_Noon.jpg', description: 'One of the largest mosques in India.', long_description: 'Mughal-era mosque.' },
  ];
}

function bootstrapAdminIfNeeded() {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!email || !password || password.length < 8) return;

  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (exists) return;

  const hash = bcrypt.hashSync(password, 12);
  const id = randomUUID();
  db.prepare(
    `INSERT INTO users (id, email, password_hash, display_name, role, email_verified, created_at)
     VALUES (?, ?, ?, ?, 'admin', 1, ?)`
  ).run(id, email, hash, 'Administrator', new Date().toISOString());

  console.log('[bootstrap] Admin user created for', email);
}

export function auditLog(eventType: string, userId: string | null, ip: string | undefined, details: Record<string, unknown>) {
  db.prepare(
    `INSERT INTO audit_logs (id, event_type, user_id, ip, details, created_at) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(randomUUID(), eventType, userId, ip ?? null, JSON.stringify(details), new Date().toISOString());
}
