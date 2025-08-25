import express from "express";
import {
  createOrder,
  getMonthlyOrders,
  getYearlyOrdersSummary,
  getMonthlyOrderData,
  getYearlyOrderData,
  getMonthlyOrdersTotal,
  getYearlyOrdersTotal,
  getDateRangeOrdersTotal,
  updateOrder,
  deleteOrder,
  getDateRangeOrders,
  getDateRangeOrderData,
} from "../Controllers/orderController.js";
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

router.post("/add-order", upload.single("file"), createOrder);
router.get("/monthly-orders", getMonthlyOrders);
router.get("/monthly-order-data", getMonthlyOrderData);
router.get("/yearly-orders", getYearlyOrdersSummary);
router.get("/yearly-order-data", getYearlyOrderData);
router.delete("/delete-order/:id", deleteOrder);
router.put("/update-order/:id", upload.single("file"), updateOrder);

// Date range filter routes
router.get("/date-range-orders", getDateRangeOrders);
router.get("/date-range-order-data", getDateRangeOrderData);

// Total orders amount routes
router.get("/monthly-orders-total", getMonthlyOrdersTotal);
router.get("/yearly-orders-total", getYearlyOrdersTotal);
router.get("/date-range-orders-total", getDateRangeOrdersTotal);

export default router;
