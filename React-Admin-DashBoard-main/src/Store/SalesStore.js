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

const useSalesStore = create((set, get) => ({
  loading: false,
  error: null,
  // Filter state management
  selectedMonth: getInitialMonth(),
  selectedYear: getInitialYear(),
  fromDate: localStorage.getItem("fromDate") || "",
  toDate: localStorage.getItem("toDate") || "",
  isDateRangeActive: localStorage.getItem("isDateRangeActive") === "true",
  monthlySales: { totalOnlineCash: 0, totalPhysicalCash: 0, totalSales: 0 },
  monthlyOrders: { totalAmount: 0, totalOrders: 0 },
  salesPieChartData: [],
  yearlyOrdersSummary: null,
  monthlySalesData: { sales: [] },
  monthlyOrderData: { orders: [] },
  combinedSalesTotal: 0,
  combinedOrdersTotal: 0,
  totalSales: 0,
  yearlyTotalSales: 0,
  // Add sales and orders arrays for SalesData component
  sales: [],
  orders: [],

  // Filter state setters
  setSelectedMonth: (month) => {
    const m = Number(month);
    localStorage.setItem("selectedMonth", m);
    const currentYear = Number(localStorage.getItem("selectedYear")) || new Date().getFullYear();
    set({ selectedMonth: m });
    // Clear date range when switching to month/year mode
    if (localStorage.getItem("isDateRangeActive") === "true") {
      localStorage.removeItem("fromDate");
      localStorage.removeItem("toDate");
      localStorage.removeItem("isDateRangeActive");
      set({ fromDate: "", toDate: "", isDateRangeActive: false });
    }
    // Data will be fetched by useEffect in components
  },
  setSelectedYear: (year) => {
    const y = Number(year);
    localStorage.setItem("selectedYear", y);
    const currentMonth = Number(localStorage.getItem("selectedMonth")) || new Date().getMonth() + 1;
    set({ selectedYear: y });
    // Clear date range when switching to month/year mode
    if (localStorage.getItem("isDateRangeActive") === "true") {
      localStorage.removeItem("fromDate");
      localStorage.removeItem("toDate");
      localStorage.removeItem("isDateRangeActive");
      set({ fromDate: "", toDate: "", isDateRangeActive: false });
    }
    // Data will be fetched by useEffect in components
  },
  setFromDate: (date) => {
    localStorage.setItem("fromDate", date);
    set({ fromDate: date });
    const toDate = localStorage.getItem("toDate");
    if (date && toDate) {
      localStorage.setItem("isDateRangeActive", "true");
      set({ isDateRangeActive: true });
      // Data will be fetched by useEffect in components
    }
  },
  setToDate: (date) => {
    localStorage.setItem("toDate", date);
    set({ toDate: date });
    const fromDate = localStorage.getItem("fromDate");
    if (date && fromDate) {
      localStorage.setItem("isDateRangeActive", "true");
      set({ isDateRangeActive: true });
      // Data will be fetched by useEffect in components
    }
  },
  setIsDateRangeActive: (active) => {
    localStorage.setItem("isDateRangeActive", active);
    set({ isDateRangeActive: active });
  },
  resetDateRange: () => {
    localStorage.removeItem("fromDate");
    localStorage.removeItem("toDate");
    localStorage.removeItem("isDateRangeActive");
    set({ fromDate: "", toDate: "", isDateRangeActive: false });
  },

  // Calculate combined totals for dashboard
  getCombinedTotals: async () => {
    const { selectedMonth, selectedYear, isDateRangeActive, fromDate, toDate } = get();
    
    try {
      let salesTotal = 0;
      let ordersTotal = 0;
      
      // Fetch sales total from backend
      if (isDateRangeActive && fromDate && toDate) {
        const salesResponse = await axiosInstance.get(`/sales/date-range-sales-total`, {
          params: { fromDate, toDate }
        });
        salesTotal = salesResponse.data.totalSalesAmount || 0;
        
        const ordersResponse = await axiosInstance.get(`/order/date-range-orders-total`, {
          params: { fromDate, toDate }
        });
        ordersTotal = ordersResponse.data.totalOrdersAmount || 0;
      } else if (selectedMonth === 0) {
        // Yearly totals
        const salesResponse = await axiosInstance.get(`/sales/yearly-sales-total`, {
          params: { year: selectedYear }
        });
        salesTotal = salesResponse.data.totalSalesAmount || 0;
        
        const ordersResponse = await axiosInstance.get(`/order/yearly-orders-total`, {
          params: { year: selectedYear }
        });
        ordersTotal = ordersResponse.data.totalOrdersAmount || 0;
      } else {
        // Monthly totals
        const salesResponse = await axiosInstance.get(`/sales/monthly-sales-total`, {
          params: { month: selectedMonth, year: selectedYear }
        });
        salesTotal = salesResponse.data.totalSalesAmount || 0;
        
        const ordersResponse = await axiosInstance.get(`/order/monthly-orders-total`, {
          params: { month: selectedMonth, year: selectedYear }
        });
        ordersTotal = ordersResponse.data.totalOrdersAmount || 0;
      }
      
      return {
        totalSales: salesTotal,
        totalOrders: ordersTotal,
        combinedTotal: salesTotal + ordersTotal
      };
    } catch (error) {
      console.error('Error fetching combined totals:', error);
      return {
        totalSales: 0,
        totalOrders: 0,
        combinedTotal: 0
      };
    }
  },

  // Sales CRUD operations
  getMonthlySales: async (month, year) => {
    if (Number(month) === 0) return; // Don't fetch if 'All' selected
    set({ loading: true });
    try {
      const response = await axiosInstance.get(`/sales/monthly-sales`, {
        params: { month, year },
      });
      set({ monthlySales: response.data.monthlySales });
      set({ loading: false });
    } catch (error) {
      console.error("Error fetching monthly sales:", error);
      set({ loading: false });
      throw error;
    }
  },

  getMonthlyOrders: async (month, year) => {
    if (Number(month) === 0) return; // Don't fetch if 'All' selected
    set({ loading: true });
    try {
      const response = await axiosInstance.get(`/order/monthly-orders`, {
        params: { month, year },
      });
      set({ monthlyOrders: response.data.monthlyOrders });
      set({ loading: false });
    } catch (error) {
      console.error("Error fetching monthly orders:", error);
      set({ loading: false });
      throw error;
    }
  },

  getSalesPieChartData: async (month, year) => {
    if (Number(month) === 0) return; // Don't fetch if 'All' selected
    set({ loading: true });
    try {
      const response = await axiosInstance.get(`/sales/sales-pie-chart-data`, {
        params: { month, year },
      });
      const pieChartData = response.data.salesPieChartData.map((item) => ({
        x: item.category,
        y: Number(item.totalAmount),
        text: `${item.percentage} %`,
      }));
      set({ salesPieChartData: pieChartData });
      set({ loading: false });
    } catch (error) {
      console.error("Error fetching sales pie chart data:", error);
      set({ loading: false });
      throw error;
    }
  },

  getYearlySalesSummary: async (year) => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get(`/sales/yearly-sales`, {
        params: { year },
      });
      // Format pie chart data for consistency
      const pieChartData = response.data.salesPieChartData.map((item) => ({
        x: item.category,
        y: Number(item.totalAmount),
        text: `${item.percentage} %`,
      }));
      set({
        yearlyOrdersSummary: {
          totalYearlySales: response.data.totalYearlySales,
          salesPieChartData: pieChartData,
        },
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching yearly sales summary:", error);
      set({ loading: false });
      throw error;
    }
  },

  getMonthlySalesData: async (month, year) => {
    if (Number(month) === 0) return; // Don't fetch if 'All' selected
    set({ loading: true });
    try {
      const response = await axiosInstance.get(`/sales/monthly-sales-data`, {
        params: { month, year },
      });
      set({ monthlySalesData: response.data, loading: false });
    } catch (error) {
      console.error("Error fetching monthly sales data:", error);
      set({ loading: false });
      throw error;
    }
  },

  getMonthlyOrderData: async (month, year) => {
    if (Number(month) === 0) return; // Don't fetch if 'All' selected
    set({ loading: true });
    try {
      const response = await axiosInstance.get(`/order/monthly-order-data`, {
        params: { month, year },
      });
      set({ monthlyOrderData: response.data, loading: false });
    } catch (error) {
      console.error("Error fetching monthly order data:", error);
      set({ loading: false });
      throw error;
    }
  },

  addSales: async (salesData) => {
    try {
      let dataToSend = salesData;
      let config = {};
      // If file is present, use FormData
      if (salesData.file) {
        const formData = new FormData();
        Object.entries(salesData).forEach(([key, value]) => {
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
        "/sales/add-sales",
        dataToSend,
        config
      );
      toast.success("Sales added successfully!");
      return response.data;
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Failed to add sales. Please try again."
      );
      throw error;
    }
  },

  addOrder: async (orderData) => {
    try {
      let dataToSend = orderData;
      let config = {};
      // If file is present, use FormData
      if (orderData.file) {
        const formData = new FormData();
        Object.entries(orderData).forEach(([key, value]) => {
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
        "/order/add-order",
        dataToSend,
        config
      );
      toast.success("Order added successfully!");
      return response.data;
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Failed to add order. Please try again."
      );
      throw error;
    }
  },

  deleteSale: async (id) => {
    try {
      await axiosInstance.delete(`/sales/delete-sales/${id}`);
      toast.success("Sale deleted successfully!");
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          "Failed to delete sale. Please try again."
      );
      throw error;
    }
  },

  deleteOrder: async (id) => {
    try {
      await axiosInstance.delete(`/order/delete-order/${id}`);
      toast.success("Order deleted successfully!");
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          "Failed to delete order. Please try again."
      );
      throw error;
    }
  },

  updateSale: async (id, salesData) => {
    try {
      let dataToSend = salesData;
      let config = {};
      if (salesData.file) {
        const formData = new FormData();
        Object.entries(salesData).forEach(([key, value]) => {
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
        `/sales/update-sales/${id}`,
        dataToSend,
        config
      );
      toast.success("Sale updated successfully!");
      return response.data;
    } catch (error) {
      console.error("Update sale error details:", error);
      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to update sale. Please try again.";
      toast.error(errorMessage);
      throw error;
    }
  },

  updateOrder: async (id, orderData) => {
    try {
      let dataToSend = orderData;
      let config = {};
      if (orderData.file) {
        const formData = new FormData();
        Object.entries(orderData).forEach(([key, value]) => {
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
        `/order/update-order/${id}`,
        dataToSend,
        config
      );
      toast.success("Order updated successfully!");
      return response.data;
    } catch (error) {
      console.error("Update order error details:", error);
      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to update order. Please try again.";
      toast.error(errorMessage);
      throw error;
    }
  },

  // Date range filter functions
  getDateRangeSales: async (fromDate, toDate) => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get(`/sales/date-range-sales`, {
        params: { fromDate, toDate },
      });
      set({
        monthlySales: {
          totalOnlineCash: 0,
          totalPhysicalCash: 0,
          totalSales: response.data.totalSales,
        },
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching date range sales:", error);
      set({ loading: false });
      throw error;
    }
  },

  getDateRangeOrders: async (fromDate, toDate) => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get(`/order/date-range-orders`, {
        params: { fromDate, toDate },
      });
      set({
        monthlyOrders: response.data.totalOrders,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching date range orders:", error);
      set({ loading: false });
      throw error;
    }
  },

  getDateRangeSalesPieChartData: async (fromDate, toDate) => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get(
        `/sales/date-range-sales-pie-chart-data`,
        {
          params: { fromDate, toDate },
        }
      );
      const pieChartData = response.data.salesPieChartData.map((item) => ({
        x: item.category,
        y: Number(item.totalAmount),
        text: `${item.percentage} %`,
      }));
      set({
        salesPieChartData: pieChartData,
        monthlySales: {
          totalOnlineCash: 0,
          totalPhysicalCash: 0,
          totalSales: response.data.totalSales,
        },
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching date range sales pie chart data:", error);
      set({ loading: false });
      throw error;
    }
  },

  getDateRangeOrderData: async (fromDate, toDate) => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get(`/order/date-range-order-data`, {
        params: { fromDate, toDate },
      });
      set({ monthlyOrderData: response.data, loading: false });
    } catch (error) {
      console.error("Error fetching date range order data:", error);
      set({ loading: false });
      throw error;
    }
  },

  // Functions expected by SalesData component
  getSales: async (year) => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get(`/sales/yearly-sales-data`, {
        params: { year },
      });
      set({ sales: response.data.sales || [], loading: false });
    } catch (error) {
      console.error("Error fetching yearly sales:", error);
      set({ loading: false });
      throw error;
    }
  },

  getOrders: async (year) => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get(`/order/yearly-order-data`, {
        params: { year },
      });
      set({ orders: response.data.orders || [], loading: false });
    } catch (error) {
      console.error("Error fetching yearly orders:", error);
      set({ loading: false });
      throw error;
    }
  },

  getSalesData: async (month, year) => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get(`/sales/monthly-sales-data`, {
        params: { month, year },
      });
      set({ sales: response.data.sales || [], loading: false });
    } catch (error) {
      console.error("Error fetching monthly sales data:", error);
      set({ loading: false });
      throw error;
    }
  },

  getOrdersData: async (month, year) => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get(`/order/monthly-order-data`, {
        params: { month, year },
      });
      set({ orders: response.data.orders || [], loading: false });
    } catch (error) {
      console.error("Error fetching monthly orders data:", error);
      set({ loading: false });
      throw error;
    }
  },

  getDateRangeSalesData: async (fromDate, toDate) => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get(`/sales/date-range-sales-data`, {
        params: { fromDate, toDate },
      });
      set({ sales: response.data.sales || [], loading: false });
    } catch (error) {
      console.error("Error fetching date range sales data:", error);
      set({ loading: false });
      throw error;
    }
  },

  getDateRangeOrdersData: async (fromDate, toDate) => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get(`/order/date-range-order-data`, {
        params: { fromDate, toDate },
      });
      set({ orders: response.data.orders || [], loading: false });
    } catch (error) {
      console.error("Error fetching date range orders data:", error);
      set({ loading: false });
      throw error;
    }
  },

  // Functions expected by Ecommerce component
  getTotalSales: async (month, year) => {
    if (Number(month) === 0) return; // Don't fetch if 'All' selected
    set({ loading: true });
    try {
      // Fetch monthly sales and orders, then combine
      const [salesRes, ordersRes] = await Promise.all([
        axiosInstance.get(`/sales/monthly-sales`, { params: { month, year } }),
        axiosInstance.get(`/order/monthly-orders`, { params: { month, year } }),
      ]);
      const monthlySalesTotal = salesRes.data?.monthlySales?.totalSales || 0;
      const monthlyOrdersAmount =
        ordersRes.data?.monthlyOrders?.totalAmount || 0;
      set({
        totalSales: Number(monthlySalesTotal) + Number(monthlyOrdersAmount),
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching total sales:", error);
      set({ loading: false });
      throw error;
    }
  },

  getYearlySales: async (year) => {
    set({ loading: true });
    try {
      // Fetch yearly sales and yearly orders, then combine
      const [salesRes, ordersRes] = await Promise.all([
        axiosInstance.get(`/sales/yearly-sales`, { params: { year } }),
        axiosInstance.get(`/order/yearly-orders`, { params: { year } }),
      ]);
      const yearlySalesTotal = salesRes.data?.totalYearlySales || 0;
      const yearlyOrdersTotal =
        ordersRes.data?.totalYearlyOrdersAmount || 0;
      set({
        yearlyTotalSales: Number(yearlySalesTotal) + Number(yearlyOrdersTotal),
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching yearly sales:", error);
      set({ loading: false });
      throw error;
    }
  },

  getDateRangeTotalSales: async (fromDate, toDate) => {
    set({ loading: true });
    try {
      // Fetch date-range sales and orders, then combine
      const [salesRes, ordersRes] = await Promise.all([
        axiosInstance.get(`/sales/date-range-sales`, {
          params: { fromDate, toDate },
        }),
        axiosInstance.get(`/order/date-range-orders`, {
          params: { fromDate, toDate },
        }),
      ]);
      const rangeSalesTotal = salesRes.data?.totalSales || 0;
      const rangeOrdersAmount =
        ordersRes.data?.totalOrders?.totalAmount || 0;
      set({
        totalSales: Number(rangeSalesTotal) + Number(rangeOrdersAmount),
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching date range total sales:", error);
      set({ loading: false });
      throw error;
    }
  },
}));

export default useSalesStore;
