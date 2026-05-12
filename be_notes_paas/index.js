// Import Package dan File
const express = require("express");
const sequelize = require("./config/database");
const noteRoutes = require("./routes/noteRoutes");

// Inisialisasi Express dan Cors
const app = express();
const cors = require("cors");
require("dotenv").config();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1/notes", noteRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Notes API - YusufNurRamadhan 123230188",
    endpoints: {
      "GET /api/v1/notes": "Get all notes",
      "GET /api/v1/notes/:id": "Get note by ID",
      "POST /api/v1/notes": "Create new note",
      "PUT /api/v1/notes/:id": "Update note",
      "DELETE /api/v1/notes/:id": "Delete note"
    }
  });
});

// Sinkronisasi Database dan Jalankan Server
const PORT = process.env.PORT || 3000;

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
