import { Pool } from "pg";
import config from "../config/index.js";

export const pool = new Pool({
   connectionString: config.db_connection_string,
})

export const initDB = async() => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255),
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                age INTEGER,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `)

        await pool.query(`
            CREATE TABLE IF NOT EXISTS profiles (
                id SERIAL PRIMARY KEY,
                user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,

                bio TEXT,
                address TEXT,
                phone_number VARCHAR(15),
                gender VARCHAR(10),
                
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `)

        console.log('Database initialized');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}