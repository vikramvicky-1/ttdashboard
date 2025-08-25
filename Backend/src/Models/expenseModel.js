import mongoose from "mongoose";
import Category from "./categoryModel.js";

const expenseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      validate: {
        validator: async function(value) {
          const category = await Category.findOne({ name: value });
          return !!category;
        },
        message: 'Category does not exist'
      }
    },
    subCategory: {
      type: String,
      validate: {
        validator: async function(value) {
          if (!value) return true; // subcategory is optional
          const category = await Category.findOne({ name: this.category });
          return category && category.subCategories.includes(value);
        },
        message: 'Subcategory does not exist for this category'
      }
    },
    date: {
      type: Date,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["Paid", "Pending"],
    },
    paymentMode: {
      type: String,
      enum: ["Cash", "Online", "Black Box"],
      required: function () {
        return this.paymentStatus === "Paid";
      },
      validate: {
        validator: function (value) {
          // If status is "Pending", paymentMode must be undefined/null
          if (this.paymentStatus === "Pending") {
            return value === undefined || value === null;
          }
          return true; // Otherwise, value must be valid per enum
        },
        message: "paymentMode must be empty when paymentStatus is Pending",
      },
    },
    remarks: String,
    fileUrl: String,
  },
  { timestamps: true }
);

// Remove the hardcoded virtual - categories will be fetched from database

export default mongoose.model("Expense", expenseSchema);
