import React, { useState, useEffect, useRef } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import { FiDownload, FiFileText, FiEdit2, FiTrash2 } from "react-icons/fi";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import useSalesStore from "../Store/SalesStore";

// Confirmation Modal Component
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  message,
  loading,
}) => {
  const { currentMode } = useStateContext();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`${
          currentMode === "Dark"
            ? "bg-gray-800 text-white"
            : "bg-white text-gray-800"
        } p-6 rounded-lg shadow-lg max-w-md w-full mx-4`}
      >
        <h3 className="text-lg font-semibold mb-4">Confirm Action</h3>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : null}
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Edit Sales Modal Component
const EditSalesModal = ({ sale, onClose, onSave }) => {
  const { currentColor, currentMode } = useStateContext();
  const [form, setForm] = useState({ ...sale, file: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const today = new Date().toISOString().split("T")[0];

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setForm({ ...form, file: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const submitData = { ...form };
      if (form.file) {
        submitData.file = form.file;
      }
      await onSave(sale._id, submitData);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onClose();
    } catch (err) {
      console.error("Update sale error:", err);
      const errorMessage =
        err?.response?.data?.error ||
        err?.message ||
        "Failed to update sale. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`${
          currentMode === "Dark"
            ? "bg-gray-800 text-white"
            : "bg-white text-gray-800"
        } rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 md:mb-6 text-center">
            Edit Sale
          </h2>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="editSaleDate"
                  className="block mb-1 font-medium"
                >
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="editSaleDate"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  max={today}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="editOpeningCash"
                  className="block mb-1 font-medium"
                >
                  Opening Cash <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="editOpeningCash"
                  name="openingCash"
                  value={form.openingCash}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="editPurchaseCash"
                  className="block mb-1 font-medium"
                >
                  Purchase Cash <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="editPurchaseCash"
                  name="purchaseCash"
                  value={form.purchaseCash}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="editOnlineCash"
                  className="block mb-1 font-medium"
                >
                  Online Cash <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="editOnlineCash"
                  name="onlineCash"
                  value={form.onlineCash}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="editPhysicalCash"
                  className="block mb-1 font-medium"
                >
                  Physical Cash <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="editPhysicalCash"
                  name="physicalCash"
                  value={form.physicalCash}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="editCashTransferred"
                  className="block mb-1 font-medium"
                >
                  Cash Transferred <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="editCashTransferred"
                  name="cashTransferred"
                  value={form.cashTransferred}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="editClosingCash"
                  className="block mb-1 font-medium"
                >
                  Closing Cash <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="editClosingCash"
                  name="closingCash"
                  value={form.closingCash}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="editRemarks" className="block mb-1 font-medium">
                  Remarks
                </label>
                <textarea
                  id="editRemarks"
                  name="remarks"
                  value={form.remarks || ""}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="editSaleFile"
                  className="block mb-1 font-medium"
                >
                  File Attachment
                </label>
                <input
                  type="file"
                  id="editSaleFile"
                  name="file"
                  onChange={handleChange}
                  ref={fileInputRef}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Max file size: 5MB. Supported formats: PDF, JPG, PNG, DOCX
                </p>
                {sale.fileUrl && !form.file && (
                  <div className="mt-2">
                    <a
                      href={sale.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Current file: {sale.fileUrl.split("/").pop()}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : null}
                {loading ? "Updating..." : "Update Sale"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Edit Order Modal Component
const EditOrderModal = ({ order, onClose, onSave }) => {
  const { currentColor, currentMode } = useStateContext();
  const [form, setForm] = useState({ ...order, file: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const today = new Date().toISOString().split("T")[0];

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setForm({ ...form, file: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const submitData = { ...form };
      if (form.file) {
        submitData.file = form.file;
      }
      await onSave(order._id, submitData);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onClose();
    } catch (err) {
      console.error("Update order error:", err);
      const errorMessage =
        err?.response?.data?.error ||
        err?.message ||
        "Failed to update order. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`${
          currentMode === "Dark"
            ? "bg-gray-800 text-white"
            : "bg-white text-gray-800"
        } rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 md:mb-6 text-center">
            Edit Order
          </h2>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="editOrderDate"
                  className="block mb-1 font-medium"
                >
                  Order Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="editOrderDate"
                  name="orderDate"
                  value={form.orderDate}
                  onChange={handleChange}
                  max={today}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="editDeliveryDate"
                  className="block mb-1 font-medium"
                >
                  Delivery Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="editDeliveryDate"
                  name="deliveryDate"
                  value={form.deliveryDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="editOrderId" className="block mb-1 font-medium">
                  Order ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="editOrderId"
                  name="orderId"
                  value={form.orderId}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="editAmount" className="block mb-1 font-medium">
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="editAmount"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="editPaymentMode"
                  className="block mb-1 font-medium"
                >
                  Payment Mode <span className="text-red-500">*</span>
                </label>
                <select
                  id="editPaymentMode"
                  name="paymentMode"
                  value={form.paymentMode}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Select Payment Mode</option>
                  <option value="Cash">Cash</option>
                  <option value="Online">Online</option>
                  <option value="Card">Card</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="editOrderRemarks"
                  className="block mb-1 font-medium"
                >
                  Remarks
                </label>
                <textarea
                  id="editOrderRemarks"
                  name="remarks"
                  value={form.remarks || ""}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="editOrderFile"
                  className="block mb-1 font-medium"
                >
                  File Attachment
                </label>
                <input
                  type="file"
                  id="editOrderFile"
                  name="file"
                  onChange={handleChange}
                  ref={fileInputRef}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Max file size: 5MB. Supported formats: PDF, JPG, PNG, DOCX
                </p>
                {order.fileUrl && !form.file && (
                  <div className="mt-2">
                    <a
                      href={order.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Current file: {order.fileUrl.split("/").pop()}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : null}
                {loading ? "Updating..." : "Update Order"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const SalesData = () => {
  const { currentColor, currentMode } = useStateContext();
  const {
    sales,
    orders,
    loading,
    getSales,
    getOrders,
    deleteSale,
    deleteOrder,
    updateSale,
    updateOrder,
    selectedMonth,
    selectedYear,
    isDateRangeActive,
    fromDate,
    toDate,
    getSalesData,
    getOrdersData,
    getDateRangeSalesData,
    getDateRangeOrdersData,
  } = useSalesStore();

  const [activeTab, setActiveTab] = useState("sales");
  const [salesFilter, setSalesFilter] = useState("");
  const [ordersFilter, setOrdersFilter] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [actionModal, setActionModal] = useState({
    open: false,
    type: null,
    row: null,
  });
  const [editModal, setEditModal] = useState({
    open: false,
    item: null,
    type: null,
  });
  const [deletingId, setDeletingId] = useState(null);

  // Load data based on current filter mode
  useEffect(() => {
    if (isDateRangeActive && fromDate && toDate) {
      getDateRangeSalesData(fromDate, toDate);
      getDateRangeOrdersData(fromDate, toDate);
    } else {
      if (selectedMonth === 0) {
        // Get yearly data
        getSales(selectedYear);
        getOrders(selectedYear);
      } else {
        // Get monthly data
        getSalesData(selectedMonth, selectedYear);
        getOrdersData(selectedMonth, selectedYear);
      }
    }
  }, [selectedMonth, selectedYear, isDateRangeActive, fromDate, toDate]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = (data) => {
    let sortable = [...data];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        if (
          sortConfig.key === "date" ||
          sortConfig.key === "orderDate" ||
          sortConfig.key === "deliveryDate"
        ) {
          const aDate = new Date(a[sortConfig.key]);
          const bDate = new Date(b[sortConfig.key]);
          return sortConfig.direction === "asc" ? aDate - bDate : bDate - aDate;
        }
        if (typeof a[sortConfig.key] === "number") {
          return sortConfig.direction === "asc"
            ? a[sortConfig.key] - b[sortConfig.key]
            : b[sortConfig.key] - a[sortConfig.key];
        }
        const aVal = a[sortConfig.key]?.toString().toLowerCase() || "";
        const bVal = b[sortConfig.key]?.toString().toLowerCase() || "";
        return sortConfig.direction === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      });
    }
    return sortable;
  };

  const filterData = (data, filter) => {
    if (!filter) return data;
    const [year, month] = filter.split("-");
    return data.filter((item) => {
      const date = new Date(item.date || item.orderDate);
      return date.getFullYear() == year && date.getMonth() + 1 == month;
    });
  };

  const handleEdit = (row, type) => {
    setEditModal({ open: true, item: row, type });
  };

  const handleDelete = (row, type) => {
    setActionModal({ open: true, type: "delete", row, itemType: type });
  };

  const handleConfirmAction = async () => {
    if (actionModal.type === "delete") {
      try {
        setDeletingId(actionModal.row._id);
        if (actionModal.itemType === "sales") {
          await deleteSale(actionModal.row._id);
          // Refresh sales data
          if (isDateRangeActive && fromDate && toDate) {
            await getDateRangeSalesData(fromDate, toDate);
          } else if (selectedMonth === 0) {
            await getSales(selectedYear);
          } else {
            await getSalesData(selectedMonth, selectedYear);
          }
        } else {
          await deleteOrder(actionModal.row._id);
          // Refresh orders data
          if (isDateRangeActive && fromDate && toDate) {
            await getDateRangeOrdersData(fromDate, toDate);
          } else if (selectedMonth === 0) {
            await getOrders(selectedYear);
          } else {
            await getOrdersData(selectedMonth, selectedYear);
          }
        }
      } catch (error) {
        console.error("Error deleting item:", error);
      } finally {
        setDeletingId(null);
        setActionModal({ open: false, type: null, row: null, itemType: null });
      }
    }
  };

  const handleSaveEdit = async (id, data, type) => {
    try {
      if (type === "sales") {
        await updateSale(id, data);
        // Refresh sales data
        if (isDateRangeActive && fromDate && toDate) {
          await getDateRangeSalesData(fromDate, toDate);
        } else if (selectedMonth === 0) {
          await getSales(selectedYear);
        } else {
          await getSalesData(selectedMonth, selectedYear);
        }
      } else {
        await updateOrder(id, data);
        // Refresh orders data
        if (isDateRangeActive && fromDate && toDate) {
          await getDateRangeOrdersData(fromDate, toDate);
        } else if (selectedMonth === 0) {
          await getOrders(selectedYear);
        } else {
          await getOrdersData(selectedMonth, selectedYear);
        }
      }
      setEditModal({ open: false, item: null, type: null });
    } catch (error) {
      console.error("Error updating item:", error);
      throw error;
    }
  };

  const exportToExcel = (data, filename) => {
    const headers =
      activeTab === "sales"
        ? [
            "Date",
            "Opening",
            "Purchase",
            "Online",
            "Physical",
            "Transferred",
            "Closing",
            "Remarks",
          ]
        : ["Order Date", "Delivery", "Order ID", "Amount", "Mode", "Remarks"];

    const exportData = data.map((item) => {
      if (activeTab === "sales") {
        return {
          Date: formatDate(item.date),
          Opening: item.openingCash,
          Purchase: item.purchaseCash,
          Online: item.onlineCash,
          Physical: item.physicalCash,
          Transferred: item.cashTransferred,
          Closing: item.closingCash,
          Remarks: item.remarks || "",
        };
      } else {
        return {
          "Order Date": formatDate(item.orderDate),
          Delivery: formatDate(item.deliveryDate),
          "Order ID": item.orderId,
          Amount: item.amount,
          Mode: item.paymentMode,
          Remarks: item.remarks || "",
        };
      }
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      ws,
      activeTab === "sales" ? "Sales" : "Orders"
    );
    XLSX.writeFile(
      wb,
      `${filename}_${selectedYear}_${selectedMonth || "All"}.xlsx`
    );
  };

  const exportToPDF = (data, filename) => {
    const doc = new jsPDF({ orientation: "landscape" });
    const title = `${activeTab === "sales" ? "Sales" : "Orders"} Report`;
    const subtitle = `Period: ${
      selectedMonth === 0 ? "All Year" : `Month ${selectedMonth}`
    } ${selectedYear}`;

    doc.setFontSize(16);
    doc.text(title, 14, 22);
    doc.setFontSize(12);
    doc.text(subtitle, 14, 32);

    const headers =
      activeTab === "sales"
        ? [
            "Date",
            "Opening",
            "Purchase",
            "Online",
            "Physical",
            "Transferred",
            "Closing",
            "Remarks",
          ]
        : ["Order Date", "Delivery", "Order ID", "Amount", "Mode", "Remarks"];

    const tableRows = data.map((item) => {
      if (activeTab === "sales") {
        return [
          formatDate(item.date),
          item.openingCash,
          item.purchaseCash,
          item.onlineCash,
          item.physicalCash,
          item.cashTransferred,
          item.closingCash,
          item.remarks || "",
        ];
      } else {
        return [
          formatDate(item.orderDate),
          formatDate(item.deliveryDate),
          item.orderId,
          item.amount,
          item.paymentMode,
          item.remarks || "",
        ];
      }
    });

    doc.autoTable({
      head: [headers],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save(`${filename}_${selectedYear}_${selectedMonth || "All"}.pdf`);
  };

  const filteredSalesData = getSortedData(filterData(sales || [], salesFilter));
  const filteredOrdersData = getSortedData(
    filterData(orders || [], ordersFilter)
  );

  return (
    <div className="main-content-mobile">
      <div className="w-full max-w-full px-2 md:px-4">
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg shadow-2xl m-2 sm:m-3 p-3 sm:p-4 rounded-2xl max-w-full overflow-hidden">
          <div className="m-2 p-2 pb-4 md:p-6 lg:p-8 md:m-4 lg:m-6 mt-6 sm:mt-8 md:mt-12 lg:mt-16 md:rounded-3xl dark:bg-secondary-dark-bg rounded-xl bg-gray-200 max-w-full overflow-hidden">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                Sales Data
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                View and manage your sales and order records
              </p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-300 dark:border-gray-600 mb-6">
              <button
                className={`px-4 py-2 font-semibold ${
                  activeTab === "sales"
                    ? "border-b-2 text-blue-600 border-blue-600"
                    : "text-gray-600 dark:text-gray-400"
                }`}
                onClick={() => setActiveTab("sales")}
              >
                Daily Sales
              </button>
              <button
                className={`px-4 py-2 font-semibold ${
                  activeTab === "orders"
                    ? "border-b-2 text-blue-600 border-blue-600"
                    : "text-gray-600 dark:text-gray-400"
                }`}
                onClick={() => setActiveTab("orders")}
              >
                Orders
              </button>
            </div>

            {/* Sales Tab */}
            {activeTab === "sales" && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                  <div className="w-full sm:w-auto">
                    <input
                      type="month"
                      value={salesFilter}
                      onChange={(e) => setSalesFilter(e.target.value)}
                      className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button
                      onClick={() =>
                        exportToExcel(filteredSalesData, "Daily_Sales")
                      }
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                    >
                      <FiDownload />{" "}
                      <span className="hidden sm:inline">Export</span> Excel
                    </button>
                    <button
                      onClick={() =>
                        exportToPDF(filteredSalesData, "Daily_Sales")
                      }
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                    >
                      <FiFileText />{" "}
                      <span className="hidden sm:inline">Export</span> PDF
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto max-w-full">
                  <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
                    <thead className="bg-gray-800 text-white">
                      <tr>
                        <th
                          className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-xs sm:text-sm whitespace-nowrap cursor-pointer hover:bg-gray-700"
                          onClick={() => handleSort("date")}
                        >
                          Date{" "}
                          {sortConfig.key === "date" &&
                            (sortConfig.direction === "asc" ? "↑" : "↓")}
                        </th>
                        <th
                          className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-xs sm:text-sm whitespace-nowrap cursor-pointer hover:bg-gray-700"
                          onClick={() => handleSort("openingCash")}
                        >
                          Opening{" "}
                          {sortConfig.key === "openingCash" &&
                            (sortConfig.direction === "asc" ? "↑" : "↓")}
                        </th>
                        <th
                          className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-xs sm:text-sm whitespace-nowrap cursor-pointer hover:bg-gray-700"
                          onClick={() => handleSort("purchaseCash")}
                        >
                          Purchase{" "}
                          {sortConfig.key === "purchaseCash" &&
                            (sortConfig.direction === "asc" ? "↑" : "↓")}
                        </th>
                        <th
                          className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-xs sm:text-sm whitespace-nowrap cursor-pointer hover:bg-gray-700"
                          onClick={() => handleSort("onlineCash")}
                        >
                          Online{" "}
                          {sortConfig.key === "onlineCash" &&
                            (sortConfig.direction === "asc" ? "↑" : "↓")}
                        </th>
                        <th
                          className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-xs sm:text-sm whitespace-nowrap cursor-pointer hover:bg-gray-700"
                          onClick={() => handleSort("physicalCash")}
                        >
                          Physical{" "}
                          {sortConfig.key === "physicalCash" &&
                            (sortConfig.direction === "asc" ? "↑" : "↓")}
                        </th>
                        <th
                          className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-xs sm:text-sm whitespace-nowrap cursor-pointer hover:bg-gray-700"
                          onClick={() => handleSort("cashTransferred")}
                        >
                          Transferred{" "}
                          {sortConfig.key === "cashTransferred" &&
                            (sortConfig.direction === "asc" ? "↑" : "↓")}
                        </th>
                        <th
                          className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-xs sm:text-sm whitespace-nowrap cursor-pointer hover:bg-gray-700"
                          onClick={() => handleSort("closingCash")}
                        >
                          Closing{" "}
                          {sortConfig.key === "closingCash" &&
                            (sortConfig.direction === "asc" ? "↑" : "↓")}
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-xs sm:text-sm whitespace-nowrap">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td
                            colSpan="8"
                            className="border border-gray-300 dark:border-gray-600 px-4 py-8 text-center"
                          >
                            <div className="flex justify-center items-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                              <span className="ml-2">
                                Loading sales data...
                              </span>
                            </div>
                          </td>
                        </tr>
                      ) : filteredSalesData.length === 0 ? (
                        <tr>
                          <td
                            colSpan="8"
                            className="border border-gray-300 dark:border-gray-600 px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                          >
                            No sales data available. Add sales entries from the
                            Daily Sales page.
                          </td>
                        </tr>
                      ) : (
                        filteredSalesData.map((sale) => (
                          <tr
                            key={sale._id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-xs sm:text-sm whitespace-nowrap">
                              {formatDate(sale.date)}
                            </td>
                            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-xs sm:text-sm whitespace-nowrap">
                              ₹
                              {Number(sale.openingCash).toLocaleString("en-IN")}
                            </td>
                            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-xs sm:text-sm whitespace-nowrap">
                              ₹
                              {Number(sale.purchaseCash).toLocaleString(
                                "en-IN"
                              )}
                            </td>
                            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-xs sm:text-sm whitespace-nowrap">
                              ₹{Number(sale.onlineCash).toLocaleString("en-IN")}
                            </td>
                            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-xs sm:text-sm whitespace-nowrap">
                              ₹
                              {Number(sale.physicalCash).toLocaleString(
                                "en-IN"
                              )}
                            </td>
                            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-xs sm:text-sm whitespace-nowrap">
                              ₹
                              {Number(sale.cashTransferred).toLocaleString(
                                "en-IN"
                              )}
                            </td>
                            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-xs sm:text-sm whitespace-nowrap">
                              ₹
                              {Number(sale.closingCash).toLocaleString("en-IN")}
                            </td>
                            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-xs sm:text-sm">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEdit(sale, "sales")}
                                  disabled={deletingId === sale._id}
                                  className={`p-1 bg-blue-500 text-white rounded hover:bg-blue-600 ${
                                    deletingId === sale._id
                                      ? "opacity-50 cursor-not-allowed"
                                      : ""
                                  }`}
                                >
                                  <FiEdit2 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDelete(sale, "sales")}
                                  disabled={deletingId === sale._id}
                                  className={`p-1 bg-red-500 text-white rounded hover:bg-red-600 ${
                                    deletingId === sale._id
                                      ? "opacity-50 cursor-not-allowed"
                                      : ""
                                  }`}
                                >
                                  {deletingId === sale._id ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                  ) : (
                                    <FiTrash2 size={14} />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Sales Total */}
                {filteredSalesData.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-semibold">Total Opening:</span>
                        <div className="text-lg font-bold text-green-600">
                          ₹
                          {filteredSalesData
                            .reduce(
                              (sum, sale) => sum + Number(sale.openingCash),
                              0
                            )
                            .toLocaleString("en-IN")}
                        </div>
                      </div>
                      <div>
                        <span className="font-semibold">Total Online:</span>
                        <div className="text-lg font-bold text-blue-600">
                          ₹
                          {filteredSalesData
                            .reduce(
                              (sum, sale) => sum + Number(sale.onlineCash),
                              0
                            )
                            .toLocaleString("en-IN")}
                        </div>
                      </div>
                      <div>
                        <span className="font-semibold">Total Physical:</span>
                        <div className="text-lg font-bold text-purple-600">
                          ₹
                          {filteredSalesData
                            .reduce(
                              (sum, sale) => sum + Number(sale.physicalCash),
                              0
                            )
                            .toLocaleString("en-IN")}
                        </div>
                      </div>
                      <div>
                        <span className="font-semibold">Total Closing:</span>
                        <div className="text-lg font-bold text-orange-600">
                          ₹
                          {filteredSalesData
                            .reduce(
                              (sum, sale) => sum + Number(sale.closingCash),
                              0
                            )
                            .toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                  <div className="w-full sm:w-auto">
                    <input
                      type="month"
                      value={ordersFilter}
                      onChange={(e) => setOrdersFilter(e.target.value)}
                      className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button
                      onClick={() =>
                        exportToExcel(filteredOrdersData, "Orders")
                      }
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                    >
                      <FiDownload />{" "}
                      <span className="hidden sm:inline">Export</span> Excel
                    </button>
                    <button
                      onClick={() => exportToPDF(filteredOrdersData, "Orders")}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                    >
                      <FiFileText />{" "}
                      <span className="hidden sm:inline">Export</span> PDF
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto max-w-full">
                  <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
                    <thead className="bg-gray-800 text-white">
                      <tr>
                        <th
                          className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-xs sm:text-sm whitespace-nowrap cursor-pointer hover:bg-gray-700"
                          onClick={() => handleSort("orderDate")}
                        >
                          Order Date{" "}
                          {sortConfig.key === "orderDate" &&
                            (sortConfig.direction === "asc" ? "↑" : "↓")}
                        </th>
                        <th
                          className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-xs sm:text-sm whitespace-nowrap cursor-pointer hover:bg-gray-700"
                          onClick={() => handleSort("deliveryDate")}
                        >
                          Delivery{" "}
                          {sortConfig.key === "deliveryDate" &&
                            (sortConfig.direction === "asc" ? "↑" : "↓")}
                        </th>
                        <th
                          className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-xs sm:text-sm whitespace-nowrap cursor-pointer hover:bg-gray-700"
                          onClick={() => handleSort("orderId")}
                        >
                          Order ID{" "}
                          {sortConfig.key === "orderId" &&
                            (sortConfig.direction === "asc" ? "↑" : "↓")}
                        </th>
                        <th
                          className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-xs sm:text-sm whitespace-nowrap cursor-pointer hover:bg-gray-700"
                          onClick={() => handleSort("amount")}
                        >
                          Amount{" "}
                          {sortConfig.key === "amount" &&
                            (sortConfig.direction === "asc" ? "↑" : "↓")}
                        </th>
                        <th
                          className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-xs sm:text-sm whitespace-nowrap cursor-pointer hover:bg-gray-700"
                          onClick={() => handleSort("paymentMode")}
                        >
                          Mode{" "}
                          {sortConfig.key === "paymentMode" &&
                            (sortConfig.direction === "asc" ? "↑" : "↓")}
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-xs sm:text-sm whitespace-nowrap">
                          Remarks
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-xs sm:text-sm whitespace-nowrap">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td
                            colSpan="7"
                            className="border border-gray-300 dark:border-gray-600 px-4 py-8 text-center"
                          >
                            <div className="flex justify-center items-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                              <span className="ml-2">
                                Loading orders data...
                              </span>
                            </div>
                          </td>
                        </tr>
                      ) : filteredOrdersData.length === 0 ? (
                        <tr>
                          <td
                            colSpan="7"
                            className="border border-gray-300 dark:border-gray-600 px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                          >
                            No order data available. Add order entries from the
                            Daily Sales page.
                          </td>
                        </tr>
                      ) : (
                        filteredOrdersData.map((order) => (
                          <tr
                            key={order._id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-xs sm:text-sm whitespace-nowrap">
                              {formatDate(order.orderDate)}
                            </td>
                            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-xs sm:text-sm whitespace-nowrap">
                              {formatDate(order.deliveryDate)}
                            </td>
                            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-xs sm:text-sm whitespace-nowrap">
                              {order.orderId}
                            </td>
                            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-xs sm:text-sm whitespace-nowrap">
                              ₹{Number(order.amount).toLocaleString("en-IN")}
                            </td>
                            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-xs sm:text-sm whitespace-nowrap">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  order.paymentMode === "Cash"
                                    ? "bg-green-100 text-green-800"
                                    : order.paymentMode === "Online"
                                    ? "bg-blue-100 text-blue-800"
                                    : order.paymentMode === "Card"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-orange-100 text-orange-800"
                                }`}
                              >
                                {order.paymentMode}
                              </span>
                            </td>
                            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-xs sm:text-sm">
                              <div
                                className="max-w-32 truncate"
                                title={order.remarks}
                              >
                                {order.remarks || "-"}
                              </div>
                            </td>
                            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-xs sm:text-sm">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEdit(order, "orders")}
                                  disabled={deletingId === order._id}
                                  className={`p-1 bg-blue-500 text-white rounded hover:bg-blue-600 ${
                                    deletingId === order._id
                                      ? "opacity-50 cursor-not-allowed"
                                      : ""
                                  }`}
                                >
                                  <FiEdit2 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDelete(order, "orders")}
                                  disabled={deletingId === order._id}
                                  className={`p-1 bg-red-500 text-white rounded hover:bg-red-600 ${
                                    deletingId === order._id
                                      ? "opacity-50 cursor-not-allowed"
                                      : ""
                                  }`}
                                >
                                  {deletingId === order._id ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                  ) : (
                                    <FiTrash2 size={14} />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Orders Total */}
                {filteredOrdersData.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-semibold">Total Orders:</span>
                        <div className="text-lg font-bold text-blue-600">
                          {filteredOrdersData.length}
                        </div>
                      </div>
                      <div>
                        <span className="font-semibold">Total Amount:</span>
                        <div className="text-lg font-bold text-green-600">
                          ₹
                          {filteredOrdersData
                            .reduce(
                              (sum, order) => sum + Number(order.amount),
                              0
                            )
                            .toLocaleString("en-IN")}
                        </div>
                      </div>
                      <div>
                        <span className="font-semibold">Average Order:</span>
                        <div className="text-lg font-bold text-purple-600">
                          ₹
                          {Math.round(
                            filteredOrdersData.reduce(
                              (sum, order) => sum + Number(order.amount),
                              0
                            ) / filteredOrdersData.length
                          ).toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ConfirmationModal
        isOpen={actionModal.open}
        onClose={() =>
          setActionModal({ open: false, type: null, row: null, itemType: null })
        }
        onConfirm={handleConfirmAction}
        message={`Are you sure you want to delete this ${
          actionModal.itemType === "sales" ? "sale" : "order"
        }?`}
        loading={deletingId === actionModal.row?._id}
      />

      {editModal.open && editModal.type === "sales" && (
        <EditSalesModal
          sale={editModal.item}
          onClose={() => setEditModal({ open: false, item: null, type: null })}
          onSave={(id, data) => handleSaveEdit(id, data, "sales")}
        />
      )}

      {editModal.open && editModal.type === "orders" && (
        <EditOrderModal
          order={editModal.item}
          onClose={() => setEditModal({ open: false, item: null, type: null })}
          onSave={(id, data) => handleSaveEdit(id, data, "orders")}
        />
      )}
    </div>
  );
};

export default SalesData;
