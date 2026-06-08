import dotenv from "dotenv";
import path from "path";
dotenv.config({ 
    path: path.join(process.cwd(), ".env")
});

const config = {
  db_connection_string: process.env.CONNECTION_STRING,
  port: Number(process.env.PORT),
  access_secret_key: process.env.JWT_ACCESS_SECRET,
  refresh_secret_key: process.env.JWT_REFRESH_SECRET,
  access_token_expires_in: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
  refresh_token_expires_in: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
};

export default config;