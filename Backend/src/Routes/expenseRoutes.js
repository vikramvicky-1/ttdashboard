import express from "express";
import {
  createExpense,
  getMonthlyExpense,
  getLoansAndInterestsMonthlyTotals,
  getExpensePieChartData,
  getYearlyExpenseSummary,
  getMonthlyExpenseData,
  getExpenseCategories,
  deleteExpense,
  updateExpense,
  getDateRangeExpense,
  getDateRangeLoansExpense,
  getDateRangePieChartData,
  getDateRangeExpenseData,
} from "../Controllers/expenseController.js";
import { requireAccountantOrAdmin, requireAdmin } from "../MIddlewares/roleMiddleware.js";
import { authenticateToken } from "../MIddlewares/authMiddleware.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve("./uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname.replace(/\s+/g, "_"));
  },
});

function fileFilter(req, file, cb) {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/jpg",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images, PDFs, and Word files are allowed!"), false);
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

router.post("/add-expense", authenticateToken, requireAccountantOrAdmin, upload.single("file"), createExpense);
router.get("/monthly-expense", authenticateToken, requireAccountantOrAdmin, getMonthlyExpense);
router.get("/loans-expense", authenticateToken, requireAccountantOrAdmin, getLoansAndInterestsMonthlyTotals);
router.get("/expense-pie-chart-data", authenticateToken, requireAccountantOrAdmin, getExpensePieChartData);
router.get("/yearly-expense", authenticateToken, requireAccountantOrAdmin, getYearlyExpenseSummary);
router.get("/monthly-expense-data", authenticateToken, requireAccountantOrAdmin, getMonthlyExpenseData);
router.get("/categories", authenticateToken, requireAccountantOrAdmin, getExpenseCategories);
router.delete("/delete-expense/:id", authenticateToken, requireAdmin, deleteExpense);
router.put("/update-expense/:id", authenticateToken, requireAdmin, upload.single("file"), updateExpense);

// Date range filter routes
router.get("/date-range-expense", authenticateToken, requireAccountantOrAdmin, getDateRangeExpense);
router.get("/date-range-loans-expense", authenticateToken, requireAccountantOrAdmin, getDateRangeLoansExpense);
router.get("/date-range-pie-chart-data", authenticateToken, requireAccountantOrAdmin, getDateRangePieChartData);
router.get("/date-range-expense-data", authenticateToken, requireAccountantOrAdmin, getDateRangeExpenseData);

export default router;
