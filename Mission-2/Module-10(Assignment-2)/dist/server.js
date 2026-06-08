
            import { createRequire } from 'module';
            const require = createRequire(import.meta.url);
        

// src/app.ts
import express from "express";

// src/modules/auth/auth.route.ts
import { Router } from "express";

// src/modules/auth/auth.service.ts
import bcrypt from "bcryptjs";

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
  refresh_token_expires_in: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
  origin_url: process.env.ORIGIN_URL
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
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role VARCHAR(20) DEFAULT 'contributor' CHECK (role IN ('contributor', 'maintainer')),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
    await pool.query(`
            CREATE TABLE IF NOT EXISTS issues (
                id SERIAL PRIMARY KEY,
                title VARCHAR(150) NOT NULL,
                description TEXT NOT NULL,
                type VARCHAR(20) NOT NULL CHECK (type IN ('bug', 'feature_request')),
                status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
                reporter_id INT REFERENCES users(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};

// src/modules/auth/auth.service.ts
import jwt from "jsonwebtoken";
var registerUserIntoDB = async (registerData) => {
  const { name, email, password, role } = registerData;
  const userData = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );
  if (userData.rows.length > 0) {
    throw new Error("User already exists");
  }
  const hashedPassword = await bcrypt.hash(password, 12);
  const result = await pool.query(
    `INSERT INTO users (name, email, password, role) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *`,
    [name, email, hashedPassword, role]
  );
  delete result.rows[0].password;
  return result.rows[0];
};
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
  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    throw new Error("Invalid password");
  }
  const jwtpayload = {
    id: user.id,
    name: user.name,
    role: user.role
  };
  const token = jwt.sign(jwtpayload, config_default.access_secret_key, { expiresIn: config_default.access_token_expires_in });
  const refreshToken2 = jwt.sign(jwtpayload, config_default.refresh_secret_key, { expiresIn: config_default.refresh_token_expires_in });
  delete userData.rows[0].password;
  return { token, user: userData.rows[0] };
};
var genarateFreshToken = async (token) => {
  if (!token) {
    throw new Error("You are not authorized to access this API");
  }
  const decoded = jwt.verify(
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
    role: userData.rows[0].role
  };
  const accessToken = jwt.sign(jwtpayload, config_default.access_secret_key, { expiresIn: config_default.access_token_expires_in });
  return { accessToken };
};
var authService = {
  registerUserIntoDB,
  loginUserIntoDB,
  genarateFreshToken
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

// src/modules/auth/auth.controller.ts
var registerUser = async (req, res) => {
  try {
    const result = await authService.registerUserIntoDB(req.body);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
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
var loginUser = async (req, res) => {
  try {
    const result = await authService.loginUserIntoDB(req.body);
    const { token } = result;
    res.cookie("refresh_token", token, {
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
      message: "Login successful",
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
  registerUser,
  loginUser,
  refreshToken
};

// src/modules/auth/auth.route.ts
var router = Router();
router.post("/signup", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/refresh-token", authController.refreshToken);
var authRoute = router;

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

// src/modules/issue/issue.route.ts
import { Router as Router2 } from "express";

// src/modules/issue/issue.service.ts
var createIssueIntoDB = async (payload, user) => {
  const result = await pool.query(
    `INSERT INTO issues (title, description, type, reporter_id  ) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *`,
    [payload.title, payload.description, payload.type, user.id]
  );
  return result.rows[0];
};
var getAllIssuesFromDB = async (query) => {
  const { sort, type, status } = query;
  let sql = `SELECT * FROM issues`;
  const queryParams = [];
  const filters = [];
  if (type) {
    queryParams.push(type);
    filters.push(`type = $${queryParams.length}`);
  }
  if (status) {
    queryParams.push(status);
    filters.push(`status = $${queryParams.length}`);
  }
  if (filters.length > 0) {
    sql += ` WHERE ` + filters.join(" AND ");
  }
  if (sort === "oldest") {
    sql += ` ORDER BY created_at ASC`;
  } else {
    sql += ` ORDER BY created_at DESC`;
  }
  const result = await pool.query(sql, queryParams);
  const issues = result.rows;
  if (issues.length === 0) {
    return issues;
  }
  const reporterIds = [...new Set(issues.map((issue) => issue.reporter_id))];
  const userResult = await pool.query(
    `SELECT id, name, role FROM users WHERE id = ANY($1)`,
    [reporterIds]
  );
  const userMap = userResult.rows.reduce((acc, user) => {
    acc[user.id] = user;
    return acc;
  }, {});
  const resultWithReporter = issues.map((issue) => {
    const { reporter_id, ...issueData } = issue;
    return {
      ...issueData,
      reporter: userMap[reporter_id] || null
    };
  });
  return resultWithReporter;
};
var getSingleIssueFromDB = async (id) => {
  const result = await pool.query(
    `SELECT * FROM issues WHERE id = $1`,
    [id]
  );
  const issue = result.rows[0];
  if (!issue) {
    throw new Error("Issue not found");
  }
  const reporterResult = await pool.query(
    `SELECT id, name, role FROM users WHERE id = $1`,
    [issue.reporter_id]
  );
  const reporter = reporterResult.rows[0];
  const { reporter_id, ...issueData } = issue;
  return {
    ...issueData,
    reporter: reporter || null
  };
};
var updateSingleIssueFromDB = async (id, payload, user) => {
  const issue = await getSingleIssueFromDB(id);
  if (user.role === "contributor" && issue.status !== "open") {
    throw new Error("You are not authorized to update this issue");
  }
  const result = await pool.query(
    `UPDATE issues SET title = $1, description = $2, type = $3 WHERE id = $4 RETURNING *`,
    [payload.title, payload.description, payload.type, id]
  );
  if (result.rows.length === 0) {
    throw new Error("Issue not found");
  }
  const updatedIssue = result.rows[0];
  if (user.role === "contributor" && updatedIssue.reporter_id !== user.id) {
    throw new Error("You are not authorized to update this issue");
  }
  return updatedIssue;
};
var deleteSingleIssueFromDB = async (id) => {
  const result = await pool.query(
    `DELETE FROM issues WHERE id = $1 RETURNING *`,
    [id]
  );
  if (result.rows.length === 0) {
    throw new Error("Issue not found");
  }
  return result.rows[0];
};
var issueService = {
  createIssueIntoDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
  updateSingleIssueFromDB,
  deleteSingleIssueFromDB
};

// src/modules/issue/issue.controller.ts
var createIssue = async (req, res) => {
  try {
    const result = await issueService.createIssueIntoDB(req.body, req.user);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
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
var getAllIssues = async (req, res) => {
  try {
    const result = await issueService.getAllIssuesFromDB(req.query);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issues retrived successfully",
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
var getSingleIssue = async (req, res) => {
  try {
    const result = await issueService.getSingleIssueFromDB(req.params.id);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue retrived successfully",
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
var updateSingleIssue = async (req, res) => {
  try {
    const result = await issueService.updateSingleIssueFromDB(req.params.id, req.body, req.user);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
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
var deleteSingleIssue = async (req, res) => {
  try {
    const result = await issueService.deleteSingleIssueFromDB(req.params.id);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully",
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
var issueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateSingleIssue,
  deleteSingleIssue
};

// src/middleware/auth.ts
import "express";
import jwt2 from "jsonwebtoken";
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).json({
          success: false,
          message: "You are not authorized to access this API"
        });
      }
      const decoded = jwt2.verify(
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
      if (roles.length > 0 && !roles.includes(userData.rows[0].role)) {
        return res.status(401).json({
          success: false,
          message: "You are not authorized to access this API"
        });
      }
      req.user = userData.rows[0];
      next();
    } catch (error) {
      next(error);
    }
  };
};
var auth_default = auth;

// src/modules/issue/issue.route.ts
var router2 = Router2();
router2.post("/", auth_default("contributor", "maintainer"), issueController.createIssue);
router2.get("/", issueController.getAllIssues);
router2.get("/:id", issueController.getSingleIssue);
router2.patch("/:id", auth_default("contributor", "maintainer"), issueController.updateSingleIssue);
router2.delete("/:id", auth_default("maintainer"), issueController.deleteSingleIssue);
var issueRoute = router2;

// src/app.ts
var app = express();
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(logger_default);
app.use(cookieParser());
app.use(cors({
  origin: config_default.origin_url
}));
app.get("/", (req, res) => {
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "DevPulse - Assignment Requirements Specification"
  });
});
app.use("/api/auth", authRoute);
app.use("/api/issues", issueRoute);
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