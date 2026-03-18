// Import Package dan File
const express = require("express");
const sequelize = require("./config/database");
const noteRoutes = require("./routes/noteRoutes");

// Inisialisasi Express dan Cors
const app = express();
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// Routes
app.use("/api/v1/notes", noteRoutes);

// Root redirect
app.get("/", (req, res) => {
  res.redirect("/index.html");
});

// Sinkronisasi Database dan Jalankan Server
const PORT = process.env.PORT || 3011;

sequelize
  .sync()
  .then(() => {
    console.log("Database synced");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error syncing database:", error);
  });
