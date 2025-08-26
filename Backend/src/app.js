import express from "express";
import expenseRoutes from "./routes/expenseRoutes.js";
import salesRoutes from "./routes/salesRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import userRoutes from "./routes/userRoutes.js";
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
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://ttdashboard.onrender.com",
    ],
  })
);

// Serve uploaded files statically
app.use("/uploads", express.static(path.resolve("./uploads")));

app.use("/api/expense", expenseRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/order", orderRoutes);
app.use("/api", categoryRoutes);
app.use("/api/users", userRoutes);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

export default app;
