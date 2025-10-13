const Database = require("better-sqlite3");
const path = require("path");

// Initialize SQLite database
const db = new Database(path.join(__dirname, "data/data.db"));

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    price REAL NOT NULL,
    timestamp TEXT NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS price_endpoint_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL
  )
`);

// Insert stock price with UTC timestamp
const insertStockPrice = (price) => {
  const stmt = db.prepare("INSERT INTO prices (price, timestamp) VALUES (?, ?)");
  const timestamp = new Date().toISOString();
  return stmt.run(price, timestamp);
};

// Get the latest stock price
const getLatestStockPrice = () => {
  const stmt = db.prepare("SELECT price, timestamp FROM prices ORDER BY id DESC LIMIT 1");
  return stmt.get();
};

// Log /price endpoint access
const logPriceEndpointAccess = () => {
  const stmt = db.prepare("INSERT INTO price_endpoint_logs (timestamp) VALUES (?)");
  const timestamp = new Date().toISOString();
  return stmt.run(timestamp);
};

module.exports = {
  db,
  insertStockPrice,
  getLatestStockPrice,
  logPriceEndpointAccess,
};
