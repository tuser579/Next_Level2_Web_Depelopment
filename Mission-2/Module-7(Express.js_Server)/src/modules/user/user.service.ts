import { pool } from "../../db/index.js";
import type { IUser } from "./user.interface.js";

const createUserIntoDB = async(userData: IUser) => {
    const { name, email, password, age} = userData;

    const result = await pool.query(
        `INSERT INTO users (name, email, password, age) VALUES ($1, $2, $3, $4) RETURNING *`,
        [name, email, password, age]
    );
    return result;    
}

const getAllUsersFromDB = async() => {
    const result = await pool.query(`SELECT * FROM users`);
    return result;
}

const getSingleUserFromDB = async(id: Number) => {
    const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
    return result;
}

const updateSingleUserIntoDB = async(id: Number, userData: IUser) => {
    const { name, email, password, age } = userData;
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
    return result;
}

const deleteSingleUserFromDB = async(id: Number) => {
    const result = await pool.query(`DELETE FROM users WHERE id = $1 RETURNING *`, [id]);
    return result;
}

export const userService = {
    createUserIntoDB,
    getAllUsersFromDB,
    getSingleUserFromDB,
    updateSingleUserIntoDB,
    deleteSingleUserFromDB
}