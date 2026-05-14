import express, { type Application, type Request, type Response } from 'express';
import { Pool } from 'pg';

const app: Application = express();
const port: number = 4000;

// Use middleware for parsing JSON body
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

const pool = new Pool({
   connectionString: "postgresql://neondb_owner:npg_y35LCEepmjQB@ep-wandering-surf-aqwjw92r-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
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

app.post('/', async (req: Request, res: Response) => {
    // res.status(200).json({ success: true, message: "Hello World", data: { id: 2, name: "Jane Doe" } });
    // console.log(req.body);
    // res.send('Post request');

    // const body = req.body;
    const { name, email, password} = req.body;
    res.status(201).json(
        { 
            message: "Created",
            data: { name, email } 
        }
    );
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
