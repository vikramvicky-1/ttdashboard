import { create } from "zustand";
import axiosInstance from "../Library/Axios";
import { toast } from "react-toastify";
const getInitialMonth = () => {
  const saved = localStorage.getItem("selectedMonth");
  if (saved) return Number(saved);
  return new Date().getMonth() + 1; // JS months are 0-based
};

const getInitialYear = () => {
  const saved = localStorage.getItem("selectedYear");
  if (saved) return Number(saved);
  return new Date().getFullYear();
};

const useExpenseStore = create((set) => ({
  loading: false,
  error: null,
  monthlyExpense: 0,
  totalLoansExpense: null,
  expensePieChartData: [],
  yearlyExpenseSummary: null, // { totalYearlyExpense, totalLoansExpense, expensePieChartData }
  monthlyExpenseData: { categories: [], expenses: [] },
  categories: [],
  categorySubMap: {},
  selectedMonth: getInitialMonth(),
  selectedYear: getInitialYear(),
  // Date range filter state
  fromDate: localStorage.getItem("fromDate") || "",
  toDate: localStorage.getItem("toDate") || "",
  isDateRangeActive: localStorage.getItem("isDateRangeActive") === "true",
  setFromDate: (date) => {
    localStorage.setItem("fromDate", date);
    set({ fromDate: date });
    // Clear month/year data when date range is active
    if (date && localStorage.getItem("toDate")) {
      localStorage.setItem("isDateRangeActive", "true");
      set({ isDateRangeActive: true });
    }
  },
  setToDate: (date) => {
    localStorage.setItem("toDate", date);
    set({ toDate: date });
    // Clear month/year data when date range is active
    if (date && localStorage.getItem("fromDate")) {
      localStorage.setItem("isDateRangeActive", "true");
      set({ isDateRangeActive: true });
    }
  },
  setIsDateRangeActive: (active) => {
    localStorage.setItem("isDateRangeActive", active);
    set({ isDateRangeActive: active });
    // Clear data when switching modes
    if (active) {
      set({
        monthlyExpense: 0,
        totalLoansExpense: null,
        expensePieChartData: [],
        yearlyExpenseSummary: null,
        monthlyExpenseData: { categories: [], expenses: [] },
      });
    }
  },
  resetDateRange: () => {
    localStorage.removeItem("fromDate");
    localStorage.removeItem("toDate");
    localStorage.removeItem("isDateRangeActive");
    set({ fromDate: "", toDate: "", isDateRangeActive: false });
    // Clear date range data
    set({
      monthlyExpense: 0,
      totalLoansExpense: null,
      expensePieChartData: [],
      yearlyExpenseSummary: null,
      monthlyExpenseData: { categories: [], expenses: [] },
    });
    // The useEffect in components will handle the data refresh with month/year
  },
  setSelectedMonth: (month) => {
    localStorage.setItem("selectedMonth", month);
    set({ selectedMonth: month });
    // Clear date range data when switching to month/year mode
    if (localStorage.getItem("isDateRangeActive") === "true") {
      localStorage.removeItem("fromDate");
      localStorage.removeItem("toDate");
      localStorage.removeItem("isDateRangeActive");
      set({ fromDate: "", toDate: "", isDateRangeActive: false });
    }
    // If switching to 'All', clear monthly data
    if (Number(month) === 0) {
      set({
        monthlyExpense: 0,
        totalLoansExpense: null,
        expensePieChartData: [],
      });
    } else {
      set({ yearlyExpenseSummary: null });
    }
  },
  setSelectedYear: (year) => {
    localStorage.setItem("selectedYear", year);
    set({ selectedYear: year });
    // Clear date range data when switching to month/year mode
    if (localStorage.getItem("isDateRangeActive") === "true") {
      localStorage.removeItem("fromDate");
      localStorage.removeItem("toDate");
      localStorage.removeItem("isDateRangeActive");
      set({ fromDate: "", toDate: "", isDateRangeActive: false });
    }
  },
  getMonthlyExpense: async (month, year) => {
    if (Number(month) === 0) return; // Don't fetch if 'All' selected
    set({ loading: true });
    try {
      const response = await axiosInstance.get(`/expense/monthly-expense`, {
        params: { month, year },
      });
      set({ monthlyExpense: response.data.monthlyExpense });
      set({ loading: false });
    } catch (error) {
      console.error("Error fetching monthly expense:", error);
      set({ loading: false });
      throw error;
    }
  },
  getTotalLoansExpense: async (month, year) => {
    if (Number(month) === 0) return; // Don't fetch if 'All' selected
    set({ loading: true });
    try {
      const response = await axiosInstance.get(`/expense/loans-expense`, {
        params: { month, year },
      });
      set({ totalLoansExpense: response.data.totalLoansExpense });
      set({ loading: false });
    } catch (error) {
      console.error("Error fetching loans totals:", error);
      set({ loading: false });
      throw error;
    }
  },
  getExpensePieChartData: async (month, year) => {
    if (Number(month) === 0) return; // Don't fetch if 'All' selected
    set({ loading: true });
    try {
      const response = await axiosInstance.get(
        `/expense/expense-pie-chart-data`,
        {
          params: { month, year },
        }
      );
      const pieChartData = response.data.expensePieChartData.map((item) => ({
        x: item.category,
        y: Number(item.totalAmount),
        text: `${item.percentage} %`,
      }));
      set({ expensePieChartData: pieChartData });
      set({ monthlyExpense: response.data.totalMonthlyExpense });
      set({ loading: false });
    } catch (error) {
      console.error("Error fetching expense pie chart data:", error);
      set({ loading: false });
      throw error;
    }
  },
  getYearlyExpenseSummary: async (year) => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get(`/expense/yearly-expense`, {
        params: { year },
      });
      // Format pie chart data for consistency
      const pieChartData = response.data.expensePieChartData.map((item) => ({
        x: item.category,
        y: Number(item.totalAmount),
        text: `${item.percentage} %`,
      }));
      set({
        yearlyExpenseSummary: {
          totalYearlyExpense: response.data.totalYearlyExpense,
          totalLoansExpense: response.data.totalLoansExpense,
          expensePieChartData: pieChartData,
        },
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching yearly expense summary:", error);
      set({ loading: false });
      throw error;
    }
  },
  getMonthlyExpenseData: async (month, year) => {
    if (Number(month) === 0) return; // Don't fetch if 'All' selected
    set({ loading: true });
    try {
      const response = await axiosInstance.get(
        `/expense/monthly-expense-data`,
        {
          params: { month, year },
        }
      );
      set({ monthlyExpenseData: response.data, loading: false });
    } catch (error) {
      console.error("Error fetching monthly expense data:", error);
      set({ loading: false });
      throw error;
    }
  },
  getExpenseCategories: async () => {
    try {
      const response = await axiosInstance.get("/expense/categories");
      set({
        categories: response.data.categories,
        categorySubMap: response.data.categorySubMap,
      });
    } catch (error) {
      console.error("Error fetching categories:", error);
      set({ categories: [], categorySubMap: {} });
    }
  },
  addExpense: async (expenseData) => {
    try {
      let dataToSend = expenseData;
      let config = {};
      // If file is present, use FormData
      if (expenseData.file) {
        const formData = new FormData();
        Object.entries(expenseData).forEach(([key, value]) => {
          if (key === "file") {
            if (value) formData.append(key, value);
          } else if (value !== undefined && value !== null && value !== "") {
            formData.append(key, String(value));
          }
        });
        dataToSend = formData;
        config.headers = { "Content-Type": "multipart/form-data" };
      }
      const response = await axiosInstance.post(
        "/expense/add-expense",
        dataToSend,
        config
      );
      toast.success("Expense added successfully!");
      return response.data;
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          "Failed to add expense. Please try again."
      );
      throw error;
    }
  },
  deleteExpense: async (id) => {
    try {
      await axiosInstance.delete(`/expense/delete-expense/${id}`);
      toast.success("Expense deleted successfully!");
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          "Failed to delete expense. Please try again."
      );
      throw error;
    }
  },
  updateExpense: async (id, expenseData) => {
    try {
      let dataToSend = expenseData;
      let config = {};
      if (expenseData.file) {
        const formData = new FormData();
        Object.entries(expenseData).forEach(([key, value]) => {
          if (key === "file") {
            if (value) formData.append(key, value);
          } else if (value !== undefined && value !== null && value !== "") {
            formData.append(key, String(value));
          }
        });
        dataToSend = formData;
        config.headers = { "Content-Type": "multipart/form-data" };
      }
      const response = await axiosInstance.put(
        `/expense/update-expense/${id}`,
        dataToSend,
        config
      );
      toast.success("Expense updated successfully!");
      return response.data;
    } catch (error) {
      console.error("Update expense error details:", error);
      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to update expense. Please try again.";
      toast.error(errorMessage);
      throw error;
    }
  },
  // New date range filter functions
  getDateRangeExpense: async (fromDate, toDate) => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get(`/expense/date-range-expense`, {
        params: { fromDate, toDate },
      });
      set({ monthlyExpense: response.data.totalExpense, loading: false });
    } catch (error) {
      console.error("Error fetching date range expense:", error);
      set({ loading: false });
      throw error;
    }
  },
  getDateRangeLoansExpense: async (fromDate, toDate) => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get(
        `/expense/date-range-loans-expense`,
        {
          params: { fromDate, toDate },
        }
      );
      set({
        totalLoansExpense: response.data.totalLoansExpense,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching date range loans expense:", error);
      set({ loading: false });
      throw error;
    }
  },
  getDateRangePieChartData: async (fromDate, toDate) => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get(
        `/expense/date-range-pie-chart-data`,
        {
          params: { fromDate, toDate },
        }
      );
      const pieChartData = response.data.expensePieChartData.map((item) => ({
        x: item.category,
        y: Number(item.totalAmount),
        text: `${item.percentage} %`,
      }));
      set({
        expensePieChartData: pieChartData,
        monthlyExpense: response.data.totalExpense,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching date range pie chart data:", error);
      set({ loading: false });
      throw error;
    }
  },
  getDateRangeExpenseData: async (fromDate, toDate) => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get(
        `/expense/date-range-expense-data`,
        {
          params: { fromDate, toDate },
        }
      );
      set({ monthlyExpenseData: response.data, loading: false });
    } catch (error) {
      console.error("Error fetching date range expense data:", error);
      set({ loading: false });
      throw error;
    }
  },
}));

export default useExpenseStore;
