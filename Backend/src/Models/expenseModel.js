import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: [
        "Thatha Materials",
        "Masala Materials",
        "Add ON Materials",
        "Fresh Materials",
        "Milk",
        "Gas",
        "Packing and Cleaning",
        "Food",
        "Fuel",
        "Bisleri Water Bottle",
        "Transport",
        "Police",
        "BBMP - Garbage",
        "Donation",
        "Coco Powder",
        "Water Can",
        "Staff Expenses",
        "Shop Expenses",
        "Legal Doc",
        "Loans & Interests",
      ],
    },
    subCategory: {
      type: String,
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

expenseSchema.virtual("categorySubMap").get(function () {
  return {
    "Thatha Materials": ["Tea & Coffee", "Cakes & Bakes", "Ice cream"],
    "Masala Materials": ["Cardamom", "Pepper", "Clove", "Masala 1", "Masala 2"],
    "Add ON Materials": [
      "Honey",
      "Jaggery Powder",
      "Chocolate Syrup",
      "Choco Chips",
      "Sprinkels",
      "Sauce",
    ],
    "Fresh Materials": ["Ginger", "Lemon", "Mint"],
    Milk: ["Arokya", "Nandini"],
    Transport: [
      "Hot Snacks",
      "Nandini",
      "Arokya",
      "Thatha Materials",
      "Others - Remark",
    ],
    Police: ["Car", "Bike", "Station"],
    "Staff Expenses": [
      "Room Rent",
      "Room E - Bill",
      "Room Water Tank",
      "Staff Food - Remark",
      "Others - Remark",
    ],
    "Shop Expenses": [
      "Shop Rent",
      "Shop E - Bill",
      "Shop Maintainace - Remark",
      "Wifi",
    ],
    "Legal Doc": [
      "Rental Agreement",
      "Trade License",
      "FSSAI License",
      "Labour License",
    ],
    "Loans & Interests": [
      "GOWTHAM EMI - 4939",
      "GOWTHAM EMI - 14711",
      "GOWTHAM EMI - 4023",
      "SRINIVAS EMI -14839",
      "SRINIVAS EMI - 4000",
      "GOWTHAM INTREST - 2400",
      "GOWTHAM GOLD INTREST - 20400",
      "1720",
    ],
  };
});

export default mongoose.model("Expense", expenseSchema);
