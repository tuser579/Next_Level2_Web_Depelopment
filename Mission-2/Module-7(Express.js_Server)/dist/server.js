
            import { createRequire } from 'module';
            const require = createRequire(import.meta.url);
        

// src/app.ts
import express from "express";

// src/modules/user/user.route.ts
import { Router } from "express";

// src/db/index.ts
import { Pool } from "pg";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  db_connection_string: process.env.CONNECTION_STRING,
  port: Number(process.env.PORT),
  access_secret_key: process.env.JWT_ACCESS_SECRET,
  refresh_secret_key: process.env.JWT_REFRESH_SECRET,
  access_token_expires_in: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
  refresh_token_expires_in: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN
};
var config_default = config;

// src/db/index.ts
var pool = new Pool({
  connectionString: config_default.db_connection_string
});
var initDB = async () => {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255),
                email VARCHAR(255) NOT NULL UNIQUE,
                password TEXT NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                age INTEGER,
                
                role VARCHAR(50) DEFAULT 'user',
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
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
        `);
    console.log("Database initialized");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};

// src/modules/user/user.service.ts
import bcrypt from "bcryptjs";
var createUserIntoDB = async (userData) => {
  const { name, email, password, age, role } = userData;
  const hashPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    // `INSERT INTO users (name, email, password, age) VALUES ($1, $2, $3, $4) RETURNING name,email,age,created_at`,
    `INSERT INTO users (name, email, password, age, role) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [name, email, hashPassword, age, role || "user"]
  );
  delete result.rows[0].password;
  return result;
};
var getAllUsersFromDB = async () => {
  const result = await pool.query(`SELECT * FROM users`);
  return result;
};
var getSingleUserFromDB = async (id) => {
  const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
  return result;
};
var updateSingleUserIntoDB = async (id, userData) => {
  const { name, email, password, age } = userData;
  const result = await pool.query(
    `
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
};
var deleteSingleUserFromDB = async (id) => {
  const result = await pool.query(`DELETE FROM users WHERE id = $1 RETURNING *`, [id]);
  return result;
};
var userService = {
  createUserIntoDB,
  getAllUsersFromDB,
  getSingleUserFromDB,
  updateSingleUserIntoDB,
  deleteSingleUserFromDB
};

// src/utility/sendResponse.ts
import "express";
var sendResponse = (res, data) => {
  if (data.statusCode === 200 || data.statusCode === 201) {
    res.status(data.statusCode).json({
      success: data.success,
      message: data.message,
      data: data.data || null
    });
  } else if (data.statusCode === 404) {
    res.status(data.statusCode).json({
      success: data.success,
      message: data.message
    });
  } else {
    res.status(data.statusCode).json({
      success: data.success,
      message: data.message,
      error: data.error || null
    });
  }
};
var sendResponse_default = sendResponse;

// src/modules/user/user.controller.ts
var createUser = async (req, res) => {
  try {
    const result = await userService.createUserIntoDB(req.body);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "User Created Successfully!",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: "Error creating user",
      error: error?.message
    });
  }
};
var getAllUsers = async (req, res) => {
  console.log("Controllers:", req.user);
  try {
    const result = await userService.getAllUsersFromDB();
    if (result.rows.length === 0) {
      sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "Users not found"
      });
      return;
    }
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "User Fetched Successfully!",
      data: result.rows
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: "Error fetching users",
      error: error?.message
    });
  }
};
var getSingleUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await userService.getSingleUserFromDB(Number(id));
    if (result.rows.length === 0) {
      sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "User not found"
      });
      return;
    }
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "User Fetched Successfully!",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: "Error fetching user",
      error: error?.message
    });
  }
};
var updateSingleUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await userService.updateSingleUserIntoDB(Number(id), req.body);
    if (result.rows.length === 0) {
      sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "User not found"
      });
      return;
    }
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "User Updated Successfully!",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: "Error updating user",
      error: error?.message
    });
  }
};
var deleteSingleUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await userService.deleteSingleUserFromDB(Number(id));
    if (result.rows.length === 0) {
      sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "User not found"
      });
      return;
    }
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "User Deleted Successfully!",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: "Error deleting user",
      error: error?.message
    });
  }
};
var userController = {
  createUser,
  getAllUsers,
  getSingleUser,
  updateSingleUser,
  deleteSingleUser
};

// src/middleware/auth.ts
import "express";
import jwt from "jsonwebtoken";
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      console.log(roles);
      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).json({
          success: false,
          message: "You are not authorized to access this API"
        });
      }
      const decoded = jwt.verify(
        token,
        config_default.access_secret_key
      );
      const userData = await pool.query(`SELECT * FROM users WHERE id = $1`, [decoded.id]);
      if (userData.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: "You are not authorized to access this API"
        });
      }
      if (!userData.rows[0].is_active) {
        return res.status(401).json({
          success: false,
          message: "Your account is not active"
        });
      }
      console.log("auth role", userData.rows[0].role);
      req.user = userData.rows[0];
      next();
    } catch (error) {
      next(error);
    }
  };
};
var auth_default = auth;

// src/modules/user/user.route.ts
var router = Router();
router.post("/", userController.createUser);
router.get("/", auth_default("admin", "agent"), userController.getAllUsers);
router.get("/:id", userController.getSingleUser);
router.put(`/:id`, userController.updateSingleUser);
router.delete(`/:id`, userController.deleteSingleUser);
var userRoute = router;

// src/modules/profile/profile.route.ts
import { Router as Router2 } from "express";

// src/modules/profile/profile.service.ts
var createProfileIntoDB = async (profileData) => {
  const { user_id, bio, address, phone_number, gender } = profileData;
  const isUserValid = await pool.query(
    `SELECT * FROM users WHERE id = $1`,
    [user_id]
  );
  if (isUserValid.rows.length === 0) {
    throw new Error("Invalid user");
  }
  const isProfileExist = await pool.query(
    `SELECT * FROM profiles WHERE user_id = $1`,
    [user_id]
  );
  if (isProfileExist.rows.length > 0) {
    throw new Error("Profile already exist");
  }
  const result = await pool.query(
    `INSERT INTO profiles (user_id, bio, address, phone_number, gender) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [user_id, bio, address, phone_number, gender]
  );
  return result;
};
var profileService = {
  createProfileIntoDB
};

// src/modules/profile/profile.controller.ts
var createProfile = async (req, res) => {
  try {
    const result = await profileService.createProfileIntoDB(req.body);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "Profile Created Successfully!",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: "Error creating profile",
      error: error?.message
    });
  }
};
var profileController = {
  createProfile
};

// src/modules/profile/profile.route.ts
var router2 = Router2();
router2.post("/", profileController.createProfile);
var profileRoute = router2;

// src/modules/auth/auth.route.ts
import { Router as Router3 } from "express";

// src/modules/auth/auth.service.ts
import bcrypt2 from "bcryptjs";
import jwt2 from "jsonwebtoken";
var loginUserIntoDB = async (loginData) => {
  const { email, password } = loginData;
  const userData = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );
  if (userData.rows.length === 0) {
    throw new Error("User not found");
  }
  const user = userData.rows[0];
  const isPasswordMatched = await bcrypt2.compare(password, user.password);
  if (!isPasswordMatched) {
    throw new Error("Invalid password");
  }
  const jwtpayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    is_active: user.is_active
  };
  const accessToken = jwt2.sign(jwtpayload, config_default.access_secret_key, { expiresIn: config_default.access_token_expires_in });
  const refreshToken2 = jwt2.sign(jwtpayload, config_default.refresh_secret_key, { expiresIn: config_default.refresh_token_expires_in });
  return { accessToken, refreshToken: refreshToken2 };
};
var genarateFreshToken = async (token) => {
  if (!token) {
    throw new Error("You are not authorized to access this API");
  }
  const decoded = jwt2.verify(
    token,
    config_default.refresh_secret_key
  );
  const userData = await pool.query(`SELECT * FROM users WHERE id = $1`, [decoded.id]);
  if (userData.rows.length === 0) {
    throw new Error("User not found");
  }
  if (!userData.rows[0].is_active) {
    throw new Error("Your account is not active");
  }
  const jwtpayload = {
    id: userData.rows[0].id,
    name: userData.rows[0].name,
    email: userData.rows[0].email,
    role: userData.rows[0].role,
    is_active: userData.rows[0].is_active
  };
  const accessToken = jwt2.sign(jwtpayload, config_default.access_secret_key, { expiresIn: config_default.access_token_expires_in });
  return { accessToken };
};
var authService = {
  loginUserIntoDB,
  genarateFreshToken
};

// src/modules/auth/auth.controller.ts
var loginUser = async (req, res) => {
  try {
    const result = await authService.loginUserIntoDB(req.body);
    const { refreshToken: refreshToken2 } = result;
    res.cookie("refresh_token", refreshToken2, {
      httpOnly: true,
      // for security and why httpOnly is true? Javascript can't access this cookie, only server can access this cookie, so it's more secure 
      secure: false,
      // In production, set this to true
      sameSite: "lax"
      // maxAge: 7 * 24 * 60 * 60 * 1000
    });
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "User logged in successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};
var refreshToken = async (req, res) => {
  try {
    const result = await authService.genarateFreshToken(req.cookies.refresh_token);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Access token generated successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};
var authController = {
  loginUser,
  refreshToken
};

// src/modules/auth/auth.route.ts
var router3 = Router3();
router3.post("/login", authController.loginUser);
router3.post("/refresh-token", authController.refreshToken);
var authRoute = router3;

// src/middleware/logger.ts
import fs from "fs";
var logger = (req, res, next) => {
  const log = `
Method - ${req.method}, URL - ${req.url}, Body - ${req.body}, Date - ${/* @__PURE__ */ new Date()}
`;
  fs.appendFile("logger.txt", log, (err) => {
  });
  next();
};
var logger_default = logger;

// src/app.ts
import cookieParser from "cookie-parser";
import cors from "cors";

// src/middleware/globalErrorHandler.ts
import "express";
var globalErrorHandler = (err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
};
var globalErrorHandler_default = globalErrorHandler;

// src/app.ts
var app = express();
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(logger_default);
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5000"
}));
app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Hello World! Welcome to University Management System" });
});
app.use("/api/users", userRoute);
app.use("/api/profiles", profileRoute);
app.use("/api/auth", authRoute);
app.use(globalErrorHandler_default);
var app_default = app;

// src/server.ts
var port = config_default.port || 3e3;
var main = () => {
  initDB();
  app_default.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
};
main();
//# sourceMappingURL=server.js.map