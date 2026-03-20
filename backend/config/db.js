const mysql = require("mysql2");
require("dotenv").config();

const parseDatabaseUrl = (databaseUrl) => {
  if (!databaseUrl) return {};

  try {
    const parsed = new URL(databaseUrl);
    return {
      host: parsed.hostname,
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname.replace(/^\//, ""),
      port: parsed.port ? Number(parsed.port) : undefined
    };
  } catch {
    return {};
  }
};

const dbFromUrl = parseDatabaseUrl(process.env.DATABASE_URL);
const isRailwayInternalHost = (process.env.DB_HOST || "").endsWith(".railway.internal");

const dbConfig = {
  host: isRailwayInternalHost ? dbFromUrl.host : process.env.DB_HOST,
  user: process.env.DB_USER || dbFromUrl.user,
  password: process.env.DB_PASSWORD || dbFromUrl.password,
  database: process.env.DB_NAME || dbFromUrl.database,
  port: Number(process.env.DB_PORT || dbFromUrl.port),

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const db = mysql.createPool(dbConfig);

db.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err.message);
    return;
  }

  console.log("Connected to Railway MySQL database!");
  connection.release();
});

module.exports = db;
