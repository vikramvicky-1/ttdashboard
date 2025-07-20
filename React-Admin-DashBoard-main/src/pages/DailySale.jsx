import React, { useState, useEffect } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import {
  FiDownload,
  FiFileText,
  FiEdit2,
  FiTrash2,
  FiPlus,
} from "react-icons/fi";

const DailySale = () => {
  const { currentColor, currentMode } = useStateContext();
  const [activeTab, setActiveTab] = useState("sales");
  const [salesData, setSalesData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [editMode, setEditMode] = useState(null);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [salesFilter, setSalesFilter] = useState("");
  const [ordersFilter, setOrdersFilter] = useState("");
  const [loading, setLoading] = useState(false);

  // Form states
  const [salesForm, setSalesForm] = useState({
    date: "",
    openingCash: "",
    purchaseCash: "",
    onlineCash: "",
    physicalCash: "",
    cashTransferred: "",
    closingCash: "",
  });

  const [orderForm, setOrderForm] = useState({
    orderDate: "",
    deliveryDate: "",
    orderId: "",
    amount: "",
    paymentMode: "",
    attachment: null,
    remark: "",
  });

  const handleSalesFormChange = (e) => {
    const { name, value } = e.target;
    setSalesForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOrderFormChange = (e) => {
    const { name, value, files } = e.target;
    setOrderForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSalesSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    if (editMode && editMode.type === "sales") {
      // Update existing sale
      const updatedSales = salesData.map((sale, index) =>
        index === editMode.index ? salesForm : sale
      );
      setSalesData(updatedSales);
      setEditMode(null);
    } else {
      // Add new sale
      setSalesData((prev) => [...prev, { ...salesForm, id: Date.now() }]);
    }

    setSalesForm({
      date: "",
      openingCash: "",
      purchaseCash: "",
      onlineCash: "",
      physicalCash: "",
      cashTransferred: "",
      closingCash: "",
    });
    setShowSalesModal(false);
    setLoading(false);
  };

  const handleOrderSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const fileName = orderForm.attachment?.name || "-";

    if (editMode && editMode.type === "order") {
      // Update existing order
      const updatedOrders = ordersData.map((order, index) =>
        index === editMode.index ? { ...orderForm, fileName } : order
      );
      setOrdersData(updatedOrders);
      setEditMode(null);
    } else {
      // Add new order
      setOrdersData((prev) => [
        ...prev,
        { ...orderForm, fileName, id: Date.now() },
      ]);
    }

    setOrderForm({
      orderDate: "",
      deliveryDate: "",
      orderId: "",
      amount: "",
      paymentMode: "",
      attachment: null,
      remark: "",
    });
    setShowOrderModal(false);
    setLoading(false);
  };

  const editRow = (data, type, index) => {
    if (type === "sales") {
      setSalesForm(data);
      setEditMode({ type: "sales", index });
      setShowSalesModal(true);
    } else {
      setOrderForm(data);
      setEditMode({ type: "order", index });
      setShowOrderModal(true);
    }
  };

  const deleteRow = (index, type) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      if (type === "sales") {
        setSalesData((prev) => prev.filter((_, i) => i !== index));
      } else {
        setOrdersData((prev) => prev.filter((_, i) => i !== index));
      }
    }
  };

  const filterData = (data, filter) => {
    if (!filter) return data;

    const [year, month] = filter.split("-");
    return data.filter((item) => {
      const date = new Date(item.date || item.orderDate);
      return date.getFullYear() == year && date.getMonth() + 1 == month;
    });
  };

  const exportToExcel = (data, filename) => {
    // Simple CSV export for now
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
          ]
        : [
            "Order Date",
            "Delivery",
            "Order ID",
            "Amount",
            "Mode",
            "File",
            "Remark",
          ];

    const csvContent = [
      headers.join(","),
      ...data.map((item) => {
        if (activeTab === "sales") {
          return `${item.date},${item.openingCash},${item.purchaseCash},${item.onlineCash},${item.physicalCash},${item.cashTransferred},${item.closingCash}`;
        } else {
          return `${item.orderDate},${item.deliveryDate},${item.orderId},${item.amount},${item.paymentMode},${item.fileName},${item.remark}`;
        }
      }),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = (data, filename) => {
    // Simple text-based PDF export
    const content = data
      .map((item, index) => {
        if (activeTab === "sales") {
          return `${index + 1}. Date: ${item.date}, Opening: ${
            item.openingCash
          }, Purchase: ${item.purchaseCash}, Online: ${
            item.onlineCash
          }, Physical: ${item.physicalCash}, Transferred: ${
            item.cashTransferred
          }, Closing: ${item.closingCash}`;
        } else {
          return `${index + 1}. Order Date: ${item.orderDate}, Delivery: ${
            item.deliveryDate
          }, Order ID: ${item.orderId}, Amount: ${item.amount}, Mode: ${
            item.paymentMode
          }, File: ${item.fileName}, Remark: ${item.remark}`;
        }
      })
      .join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredSalesData = filterData(salesData, salesFilter);
  const filteredOrdersData = filterData(ordersData, ordersFilter);

  return (
    <div className="main-content-mobile">
      <div className="w-full px-2 md:px-0">
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg shadow-2xl m-2 sm:m-3 p-3 sm:p-4 rounded-2xl w-full">
          <div className="m-2 p-2 pb-4 md:p-6 lg:p-10 md:m-6 lg:m-10 mt-6 sm:mt-8 md:mt-12 lg:mt-16 md:rounded-3xl dark:bg-secondary-dark-bg rounded-xl bg-gray-200 w-full">
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                  <div className="flex-1">
                    <input
                      type="month"
                      value={salesFilter}
                      onChange={(e) => setSalesFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        exportToExcel(filteredSalesData, "Daily_Sales")
                      }
                      className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      <FiDownload /> Export Excel
                    </button>
                    <button
                      onClick={() =>
                        exportToPDF(filteredSalesData, "Daily_Sales")
                      }
                      className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      <FiFileText /> Export PDF
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => {
                      setEditMode(null);
                      setShowSalesModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    <FiPlus /> Add Sale
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(null);
                      setShowOrderModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    <FiPlus /> Add Order
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                    <thead className="bg-gray-800 text-white">
                      <tr>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                          Date
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                          Opening
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                          Purchase
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                          Online
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                          Physical
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                          Transferred
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                          Closing
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSalesData.map((sale, index) => (
                        <tr
                          key={sale.id || index}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                            {sale.date}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                            {sale.openingCash}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                            {sale.purchaseCash}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                            {sale.onlineCash}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                            {sale.physicalCash}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                            {sale.cashTransferred}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                            {sale.closingCash}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                            <div className="flex gap-2">
                              <button
                                onClick={() => editRow(sale, "sales", index)}
                                className="p-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                              >
                                <FiEdit2 size={14} />
                              </button>
                              <button
                                onClick={() => deleteRow(index, "sales")}
                                className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                              >
                                <FiTrash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                  <div className="flex-1">
                    <input
                      type="month"
                      value={ordersFilter}
                      onChange={(e) => setOrdersFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        exportToExcel(filteredOrdersData, "Orders")
                      }
                      className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      <FiDownload /> Export Excel
                    </button>
                    <button
                      onClick={() => exportToPDF(filteredOrdersData, "Orders")}
                      className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      <FiFileText /> Export PDF
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => {
                      setEditMode(null);
                      setShowSalesModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    <FiPlus /> Add Sale
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(null);
                      setShowOrderModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    <FiPlus /> Add Order
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                    <thead className="bg-gray-800 text-white">
                      <tr>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                          Order Date
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                          Delivery
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                          Order ID
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                          Amount
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                          Mode
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                          File
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                          Remark
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrdersData.map((order, index) => (
                        <tr
                          key={order.id || index}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                            {order.orderDate}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                            {order.deliveryDate}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                            {order.orderId}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                            {order.amount}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                            {order.paymentMode}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                            {order.fileName}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                            {order.remark}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                            <div className="flex gap-2">
                              <button
                                onClick={() => editRow(order, "order", index)}
                                className="p-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                              >
                                <FiEdit2 size={14} />
                              </button>
                              <button
                                onClick={() => deleteRow(index, "order")}
                                className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                              >
                                <FiTrash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sales Modal */}
      {showSalesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editMode?.type === "sales" ? "Edit Sale" : "Add Sale"}
                </h3>
                <button
                  onClick={() => setShowSalesModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSalesSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="date"
                    value={salesForm.date}
                    onChange={handleSalesFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="number"
                      name="openingCash"
                      value={salesForm.openingCash}
                      onChange={handleSalesFormChange}
                      placeholder="Opening Cash"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      name="purchaseCash"
                      value={salesForm.purchaseCash}
                      onChange={handleSalesFormChange}
                      placeholder="Purchase Cash"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      name="onlineCash"
                      value={salesForm.onlineCash}
                      onChange={handleSalesFormChange}
                      placeholder="Online Cash"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      name="physicalCash"
                      value={salesForm.physicalCash}
                      onChange={handleSalesFormChange}
                      placeholder="Physical Cash"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      name="cashTransferred"
                      value={salesForm.cashTransferred}
                      onChange={handleSalesFormChange}
                      placeholder="Cash Transferred"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      name="closingCash"
                      value={salesForm.closingCash}
                      onChange={handleSalesFormChange}
                      placeholder="Closing Cash"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowSalesModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editMode?.type === "order" ? "Edit Order" : "Add Order"}
                </h3>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleOrderSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Order Date
                  </label>
                  <input
                    type="datetime-local"
                    name="orderDate"
                    value={orderForm.orderDate}
                    onChange={handleOrderFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Delivery Date
                  </label>
                  <input
                    type="datetime-local"
                    name="deliveryDate"
                    value={orderForm.deliveryDate}
                    onChange={handleOrderFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      name="orderId"
                      value={orderForm.orderId}
                      onChange={handleOrderFormChange}
                      placeholder="Order ID"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      name="amount"
                      value={orderForm.amount}
                      onChange={handleOrderFormChange}
                      placeholder="Amount"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <select
                    name="paymentMode"
                    value={orderForm.paymentMode}
                    onChange={handleOrderFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Select Payment Mode</option>
                    <option value="Cash">Cash</option>
                    <option value="Online">Online</option>
                  </select>
                </div>

                <div>
                  <input
                    type="file"
                    name="attachment"
                    onChange={handleOrderFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <textarea
                    name="remark"
                    value={orderForm.remark}
                    onChange={handleOrderFormChange}
                    rows="2"
                    placeholder="Remark (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowOrderModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailySale;
