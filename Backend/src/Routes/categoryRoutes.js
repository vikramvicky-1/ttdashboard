import express from "express";
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  addSubCategory,
  updateSubCategory,
  deleteSubCategory
} from "../Controllers/categoryController.js";

const router = express.Router();

// Category routes
router.get("/categories", getCategories);
router.post("/categories", addCategory);
router.put("/categories/:categoryName", updateCategory);
router.delete("/categories/:categoryName", deleteCategory);

// Subcategory routes
router.post("/subcategories", addSubCategory);
router.put("/subcategories/:categoryName/:subCategoryName", updateSubCategory);
router.delete("/subcategories/:categoryName/:subCategoryName", deleteSubCategory);

export default router;
