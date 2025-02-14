import { Sequelize, Options } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

interface DatabaseConfig {
  name: string;
  user: string;
  password: string;
  options: Options;
}

// Định nghĩa config cho database
const dbConfig: DatabaseConfig = {
  name: process.env.DB_NAME || "database",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  options: {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    timezone: "+07:00", // Timezone cho Việt Nam
  },
};

// Khởi tạo kết nối database
const sequelize: Sequelize = new Sequelize(
  dbConfig.name,
  dbConfig.user,
  dbConfig.password,
  dbConfig.options
);

// Hàm kết nối database với error handling tốt hơn
export const connectDB = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");
  } catch (error) {
    console.error(
      "Unable to connect to the database:",
      error instanceof Error ? error.message : error
    );
    process.exit(1); // Thoát process nếu không kết nối được database
  }
};

export default sequelize;
