import Expense from "../Models/expenseModel.js";
import Category from "../Models/categoryModel.js";
import fs from "fs";
import path from "path";

export const createExpense = async (req, res) => {
  try {
    let fileUrl = req.body.fileUrl;
    if (req.file) {
      // File uploaded, set fileUrl to public path
      fileUrl = `/uploads/${req.file.filename}`;
    }

    // Validate subcategory if provided
    if (req.body.subCategory && req.body.category) {
      const category = await Category.findOne({ name: req.body.category });
      if (!category) {
        return res.status(400).json({
          error: `${req.body.category} is not a valid category.`,
        });
      }
      
      if (!category.subCategories.includes(req.body.subCategory)) {
        return res.status(400).json({
          error: `${req.body.subCategory} is not a valid subcategory for the selected category.`,
        });
      }
    }

    const expense = new Expense({ ...req.body, fileUrl });
    await expense.save();
    res.status(201).json({ expense, message: "Expense created successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getMonthlyExpense = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        error: "Month and year are required (e.g. ?month=7&year=2025)",
      });
    }

    const monthInt = parseInt(month);
    const yearInt = parseInt(year);

    if (isNaN(monthInt) || isNaN(yearInt) || monthInt < 1 || monthInt > 12) {
      return res.status(400).json({ error: "Invalid month or year" });
    }

    const startDate = new Date(yearInt, monthInt - 1, 1);
    const endDate = new Date(yearInt, monthInt, 1);

    const total = await Expense.aggregate([
      {
        $match: {
          date: {
            $gte: startDate,
            $lt: endDate,
          },
          // Only consider paid expenses
          category: { $ne: "Loans & Interests" },
          paymentStatus: "Paid", // Exclude Loans & Interests regardless of payment status
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    res.status(200).json({ monthlyExpense: total[0]?.totalAmount || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getLoansAndInterestsMonthlyTotals = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        error: "Month and year are required (e.g. ?month=6&year=2025)",
      });
    }

    const monthInt = parseInt(month);
    const yearInt = parseInt(year);

    if (isNaN(monthInt) || isNaN(yearInt) || monthInt < 1 || monthInt > 12) {
      return res.status(400).json({ error: "Invalid month or year" });
    }

    const startDate = new Date(yearInt, monthInt - 1, 1);
    const endDate = new Date(yearInt, monthInt, 1);

    const total = await Expense.aggregate([
      {
        $match: {
          category: "Loans & Interests",
        },
      },
      {
        $match: {
          paymentStatus: "Paid",
        },
      },
      {
        $match: {
          date: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const totalLoansExpense = total.length > 0 ? total[0].totalAmount : 0;

    res.status(200).json({
      totalLoansExpense,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getExpensePieChartData = async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({
        error: "Month and year are required (e.g. ?month=6&year=2025)",
      });
    }

    const monthInt = parseInt(month);
    const yearInt = parseInt(year);

    if (isNaN(monthInt) || isNaN(yearInt) || monthInt < 1 || monthInt > 12) {
      return res.status(400).json({ error: "Invalid month or year" });
    }
    const startDate = new Date(yearInt, monthInt - 1, 1);
    const endDate = new Date(yearInt, monthInt, 1);

    // Get total expense for the month (excluding Loans & Interests)
    const totalResult = await Expense.aggregate([
      {
        $match: {
          category: { $ne: "Loans & Interests" },
          date: { $gte: startDate, $lt: endDate },
          paymentStatus: "Paid",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);
    const totalAmount = totalResult[0]?.totalAmount || 0;

    // Get category-wise totals
    const expensePieChartData = await Expense.aggregate([
      {
        $match: {
          category: { $ne: "Loans & Interests" },
          date: { $gte: startDate, $lt: endDate },
          paymentStatus: "Paid",
        },
      },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    // Add percentage to each category
    const formattedData = expensePieChartData.map((item) => ({
      category: item._id,
      totalAmount: item.totalAmount,
      percentage:
        totalAmount > 0
          ? ((item.totalAmount / totalAmount) * 100).toFixed(2)
          : "0",
    }));

    res.status(200).json({
      expensePieChartData: formattedData,
      totalMonthlyExpense: totalAmount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getYearlyExpenseSummary = async (req, res) => {
  try {
    const { year } = req.query;
    if (!year) {
      return res.status(400).json({
        error: "Year is required (e.g. ?year=2025)",
      });
    }
    const yearInt = parseInt(year);
    if (isNaN(yearInt)) {
      return res.status(400).json({ error: "Invalid year" });
    }
    const startDate = new Date(yearInt, 0, 1); // Jan 1st
    const endDate = new Date(yearInt + 1, 0, 1); // Jan 1st next year

    // Total yearly expense (excluding Loans & Interests)
    const totalResult = await Expense.aggregate([
      {
        $match: {
          category: { $ne: "Loans & Interests" },
          date: { $gte: startDate, $lt: endDate },
          paymentStatus: "Paid",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);
    const totalAmount = totalResult[0]?.totalAmount || 0;

    // Total yearly Loans & Interests
    const loansResult = await Expense.aggregate([
      {
        $match: {
          category: "Loans & Interests",
          date: { $gte: startDate, $lt: endDate },
          paymentStatus: "Paid",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);
    const totalLoansExpense = loansResult[0]?.totalAmount || 0;

    // Category-wise yearly totals (excluding Loans & Interests)
    const expensePieChartData = await Expense.aggregate([
      {
        $match: {
          category: { $ne: "Loans & Interests" },
          date: { $gte: startDate, $lt: endDate },
          paymentStatus: "Paid",
        },
      },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);
    const formattedData = expensePieChartData.map((item) => ({
      category: item._id,
      totalAmount: item.totalAmount,
      percentage:
        totalAmount > 0
          ? ((item.totalAmount / totalAmount) * 100).toFixed(2)
          : "0",
    }));

    res.status(200).json({
      totalYearlyExpense: totalAmount,
      totalLoansExpense,
      expensePieChartData: formattedData,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMonthlyExpenseData = async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({
        error: "Month and year are required (e.g. ?month=7&year=2025)",
      });
    }
    const monthInt = parseInt(month);
    const yearInt = parseInt(year);
    if (isNaN(monthInt) || isNaN(yearInt) || monthInt < 1 || monthInt > 12) {
      return res.status(400).json({ error: "Invalid month or year" });
    }
    const startDate = new Date(yearInt, monthInt - 1, 1);
    const endDate = new Date(yearInt, monthInt, 1);

    // Get all expenses for the month
    const expenses = await Expense.find({
      date: { $gte: startDate, $lt: endDate },
    }).lean();

    // Get unique categories
    const categories = [...new Set(expenses.map((exp) => exp.category))];

    res.status(200).json({
      categories,
      expenses,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getExpenseCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    
    // Transform to the expected format
    const categorySubMap = {};
    const categoryNames = [];
    
    categories.forEach(category => {
      categoryNames.push(category.name);
      categorySubMap[category.name] = category.subCategories || [];
    });

    res.status(200).json({ 
      categories: categoryNames, 
      categorySubMap 
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Updating expense with ID:", id);
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);

    let expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }
    let fileUrl = expense.fileUrl;
    // If a new file is uploaded, replace the old one
    if (req.file) {
      // Remove old file if present
      if (expense.fileUrl) {
        const oldFilePath = path.resolve(
          "./uploads" + expense.fileUrl.replace("/uploads", "")
        );
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      fileUrl = `/uploads/${req.file.filename}`;
    }
    // Update fields
    const updateData = { ...req.body, fileUrl };

    // Validate subcategory if provided
    if (updateData.subCategory && updateData.category) {
      const category = await Category.findOne({ name: updateData.category });
      if (!category) {
        return res.status(400).json({
          error: `${updateData.category} is not a valid category.`,
        });
      }
      
      if (!category.subCategories.includes(updateData.subCategory)) {
        return res.status(400).json({
          error: `${updateData.subCategory} is not a valid subcategory for the selected category.`,
        });
      }
    }

    // Ensure correct types for amount and date
    if (updateData.amount !== undefined)
      updateData.amount = Number(updateData.amount);
    if (updateData.date !== undefined)
      updateData.date = new Date(updateData.date);
    // Remove fileUrl if not present in update
    if (!fileUrl) delete updateData.fileUrl;
    console.log("Update data:", updateData);
    expense = await Expense.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    console.log("Updated expense:", expense);
    res.status(200).json({ expense, message: "Expense updated successfully" });
  } catch (err) {
    console.error("Update expense error:", err);
    res.status(400).json({ error: err.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }
    // Remove file if present
    if (expense.fileUrl) {
      const filePath = path.resolve(
        "./uploads" + expense.fileUrl.replace("/uploads", "")
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    await Expense.findByIdAndDelete(id);
    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// New date range filter functions
export const getDateRangeExpense = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    if (!fromDate || !toDate) {
      return res.status(400).json({
        error:
          "fromDate and toDate are required (e.g. ?fromDate=2025-01-01&toDate=2025-01-31)",
      });
    }

    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    endDate.setHours(23, 59, 59, 999); // Include the entire end date

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    if (startDate > endDate) {
      return res
        .status(400)
        .json({ error: "fromDate cannot be greater than toDate" });
    }

    // Get total expense for the date range (excluding Loans & Interests)
    const totalResult = await Expense.aggregate([
      {
        $match: {
          category: { $ne: "Loans & Interests" },
          date: { $gte: startDate, $lte: endDate },
          paymentStatus: "Paid",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const totalExpense = totalResult[0]?.totalAmount || 0;

    res.status(200).json({ totalExpense });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getDateRangeLoansExpense = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    if (!fromDate || !toDate) {
      return res.status(400).json({
        error:
          "fromDate and toDate are required (e.g. ?fromDate=2025-01-01&toDate=2025-01-31)",
      });
    }

    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    endDate.setHours(23, 59, 59, 999); // Include the entire end date

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    if (startDate > endDate) {
      return res
        .status(400)
        .json({ error: "fromDate cannot be greater than toDate" });
    }

    // Get total Loans & Interests for the date range
    const totalResult = await Expense.aggregate([
      {
        $match: {
          category: "Loans & Interests",
          date: { $gte: startDate, $lte: endDate },
          paymentStatus: "Paid",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const totalLoansExpense = totalResult[0]?.totalAmount || 0;

    res.status(200).json({ totalLoansExpense });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getDateRangePieChartData = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    if (!fromDate || !toDate) {
      return res.status(400).json({
        error:
          "fromDate and toDate are required (e.g. ?fromDate=2025-01-01&toDate=2025-01-31)",
      });
    }

    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    endDate.setHours(23, 59, 59, 999); // Include the entire end date

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    if (startDate > endDate) {
      return res
        .status(400)
        .json({ error: "fromDate cannot be greater than toDate" });
    }

    // Get total expense for the date range (excluding Loans & Interests)
    const totalResult = await Expense.aggregate([
      {
        $match: {
          category: { $ne: "Loans & Interests" },
          date: { $gte: startDate, $lte: endDate },
          paymentStatus: "Paid",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);
    const totalAmount = totalResult[0]?.totalAmount || 0;

    // Get category-wise totals for the date range
    const expensePieChartData = await Expense.aggregate([
      {
        $match: {
          category: { $ne: "Loans & Interests" },
          date: { $gte: startDate, $lte: endDate },
          paymentStatus: "Paid",
        },
      },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    // Add percentage to each category
    const formattedData = expensePieChartData.map((item) => ({
      category: item._id,
      totalAmount: item.totalAmount,
      percentage:
        totalAmount > 0
          ? ((item.totalAmount / totalAmount) * 100).toFixed(2)
          : "0",
    }));

    res.status(200).json({
      expensePieChartData: formattedData,
      totalExpense: totalAmount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getDateRangeExpenseData = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    if (!fromDate || !toDate) {
      return res.status(400).json({
        error:
          "fromDate and toDate are required (e.g. ?fromDate=2025-01-01&toDate=2025-01-31)",
      });
    }

    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    endDate.setHours(23, 59, 59, 999); // Include the entire end date

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    if (startDate > endDate) {
      return res
        .status(400)
        .json({ error: "fromDate cannot be greater than toDate" });
    }

    // Get all expenses for the date range
    const expenses = await Expense.find({
      date: { $gte: startDate, $lte: endDate },
    }).lean();

    // Get unique categories
    const categories = [...new Set(expenses.map((exp) => exp.category))];

    res.status(200).json({
      categories,
      expenses,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
