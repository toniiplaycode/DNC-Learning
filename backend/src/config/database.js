const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: false, // tắt log SQL queries
    pool: {
      max: 5, // maximum số connection trong pool
      min: 0, // minimum số connection trong pool
      acquire: 30000, // thời gian tối đa (ms) pool cố gắng kết nối trước khi báo lỗi
      idle: 10000, // thời gian tối đa (ms) một connection có thể idle trước khi bị đóng
    },
  }
);

// Kiểm tra kết nối
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection to database has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

module.exports = { sequelize, connectDB };
