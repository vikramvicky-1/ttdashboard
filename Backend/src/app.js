import express from "express";
import expenseRoutes from "./Routes/expenseRoutes.js";
import cors from "cors";
import path from "path";

const app = express();

// Logging (for debugging)
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

app.use(express.json());

// ✅ Updated CORS setup
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  })
);

// Serve uploaded files statically
app.use("/uploads", express.static(path.resolve("./Backend/uploads")));

app.use("/api/expense", expenseRoutes);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

export default app;
