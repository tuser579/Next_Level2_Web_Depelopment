import dotenv from "dotenv";
import path from "path";
dotenv.config({ 
    path: path.join(process.cwd(), ".env")
});

const config = {
  db_connection_string: process.env.CONNECTION_STRING,
  port: Number(process.env.PORT),
};

export default config;