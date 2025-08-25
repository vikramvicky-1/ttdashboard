import express from "express";
import {
  createSales,
  getMonthlySales,
  getSalesPieChartData,
  getYearlySalesSummary,
  getMonthlySalesData,
  getYearlySalesData,
  getMonthlySalesTotal,
  getYearlySalesTotal,
  getDateRangeSalesTotal,
  updateSales,
  deleteSales,
  getDateRangeSales,
  getDateRangeSalesPieChartData,
  getDateRangeSalesData,
} from "../Controllers/salesController.js";
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

router.post("/add-sales", upload.single("file"), createSales);
router.get("/monthly-sales", getMonthlySales);
router.get("/sales-pie-chart-data", getSalesPieChartData);
router.get("/yearly-sales", getYearlySalesSummary);
router.get("/monthly-sales-data", getMonthlySalesData);
router.get("/yearly-sales-data", getYearlySalesData);
router.delete("/delete-sales/:id", deleteSales);
router.put("/update-sales/:id", upload.single("file"), updateSales);

// Date range filter routes
router.get("/date-range-sales", getDateRangeSales);
router.get("/date-range-sales-pie-chart-data", getDateRangeSalesPieChartData);
router.get("/date-range-sales-data", getDateRangeSalesData);

// Total sales amount routes
router.get("/monthly-sales-total", getMonthlySalesTotal);
router.get("/yearly-sales-total", getYearlySalesTotal);
router.get("/date-range-sales-total", getDateRangeSalesTotal);

export default router;
