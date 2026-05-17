import { pool } from "../../db/index.js";

const createProfileIntoDB = async(profileData: any) => {
    const { user_id, bio, address, phone_number, gender } = profileData;

    // firstly check the user is valid or not
    const isUserValid = await pool.query(
        `SELECT * FROM users WHERE id = $1`,
        [user_id]
    );

    if(isUserValid.rows.length === 0) {
        throw new Error("Invalid user");
    }

    // check profile already exist or not
    const isProfileExist = await pool.query(
        `SELECT * FROM profiles WHERE user_id = $1`,
        [user_id]
    );

    if(isProfileExist.rows.length > 0) {
        throw new Error("Profile already exist");
    }

    const result = await pool.query(
        `INSERT INTO profiles (user_id, bio, address, phone_number, gender) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [user_id, bio, address, phone_number, gender]
    );
    return result;    
}

export const profileService = { 
    createProfileIntoDB,
};