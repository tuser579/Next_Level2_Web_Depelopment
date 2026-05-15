import express, { type Application, type Request, type Response } from 'express';
import { Pool } from 'pg';
import config from './config/index.js';

const app: Application = express();
const port: number = config.port || 3000;

// Use middleware for parsing JSON body
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

const pool = new Pool({
   connectionString: config.db_connection_string,
})

const initDB = async() => {
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
        console.log('Database initialized');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

initDB(); 

// application route

app.get('/', (req: Request, res: Response) => {
    //   res.send('Hello World!');
    res.status(200).json({ success: true, message: "Hello World", data: { id: 1, name: "John Doe" } });
})

app.post('/api/users', async (req: Request, res: Response) => {
    // res.status(200).json({ success: true, message: "Hello World", data: { id: 2, name: "Jane Doe" } });
    // console.log(req.body);
    // res.send('Post request');
    // const body = req.body;

    const { name, email, password, age} = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO users (name, email, password, age) VALUES ($1, $2, $3, $4) RETURNING *`,
            [name, email, password, age]
        );
        res.status(201).json(
            { 
                message: "User Created Successfully!",
                data: result.rows
            }
        );
    } catch (error: any) {
        // console.error('Error creating user:', error);
        res.status(500).json({ message: "Error creating user", error:  error?.message});
    }
})

app.get('/api/users', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT * FROM users
        `);
        if (result.rows.length === 0) {
            res.status(404).json({ message: "User data not found" });
            return;
        }
        res.status(200).json(
            { 
                message: "User Fetched Successfully!",
                data: result.rows
            }
        );
    } catch (error: any) {
        // console.error('Error fetching users:', error);
        res.status(500).json({ message: "Error fetching users", error:  error?.message});
    }
})

app.get('/api/users/:id', async(req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT * FROM users WHERE id = $1`, 
            [id]
        );
        if (result.rows.length === 0) {
            res.status(404).json({ message: "User not found" });
            return;  // for safe return
        }
        res.status(200).json(
            { 
                message: "User Fetched Successfully!",
                data: result.rows[0]
            }
        );
    } catch (error: any) {
        // console.error('Error fetching user:', error);
        res.status(500).json({ message: "Error fetching user", error:  error?.message});
    }
})

app.put(`/api/users/:id`, async(req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const { name, email, password, age } = req.body;
        const result = await pool.query(`
            UPDATE users 
            SET 
            name = COALESCE($1, name),
            email = COALESCE($2, email), 
            password = COALESCE($3, password), 
            age = COALESCE($4, age) 
            WHERE id = $5 RETURNING *`, 
            [name, email, password, age, id]
        );
        if (result.rows.length === 0) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json(
            { 
                message: "User Updated Successfully!",
                data: result.rows[0]
            }
        );
    } catch (error: any) {
        // console.error('Error updating user:', error);
        res.status(500).json({ message: "Error updating user", error:  error?.message});
    }
})

app.delete(`/api/users/:id`, async(req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            DELETE FROM users WHERE id = $1 RETURNING *`, 
            [id]
        );
        if (result.rows.length === 0) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json(
            { 
                message: "User Deleted Successfully!",
                data: result.rows[0]
            }
        );
    } catch (error: any) {
        // console.error('Error deleting user:', error);
        res.status(500).json({ message: "Error deleting user", error:  error?.message});
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})