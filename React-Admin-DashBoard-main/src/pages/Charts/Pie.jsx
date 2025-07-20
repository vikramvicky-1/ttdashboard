import React, { useEffect, useState, useRef } from "react";
import { ChartsHeader, Doughnut as PieChart } from "../../components";
import useExpenseStore from "../../Store/ExpenseStore";
import { useStateContext } from "../../contexts/ContextProvider";
import {
  FaEdit,
  FaTrash,
  FaFilePdf,
  FaFileExcel,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";

const paymentModes = ["Cash", "Online"];

const monthNames = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const Table = ({ expenses, categories, selectedMonth, selectedYear }) => {
  const { currentMode, currentColor } = useStateContext();
  const {
    deleteExpense,
    updateExpense,
    getMonthlyExpenseData,
    getYearlyExpenseSummary,
    selectedMonth: storeMonth,
    selectedYear: storeYear,
    getExpenseCategories,
    categorySubMap,
    categories: storeCategories,
  } = useExpenseStore();
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [deletingExpenseId, setDeletingExpenseId] = useState(null);

  // Helper to format date as dd/mm/yyyy
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Amount filter state
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  // Sorting logic
  const getSortedExpenses = () => {
    let sortable = [...expenses];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        // For date, sort by timestamp
        if (sortConfig.key === "date") {
          aValue = aValue ? new Date(aValue).getTime() : 0;
          bValue = bValue ? new Date(bValue).getTime() : 0;
        }
        // For amount, sort numerically
        if (sortConfig.key === "amount") {
          aValue = Number(aValue);
          bValue = Number(bValue);
        }
        // For string, case-insensitive
        if (typeof aValue === "string" && typeof bValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  };

  // Filtering logic (category/status only)
  const filteredExpenses = getSortedExpenses().filter((e) => {
    const categoryMatch = filterCategory ? e.category === filterCategory : true;
    const statusMatch = filterStatus ? e.paymentStatus === filterStatus : true;
    return categoryMatch && statusMatch;
  });

  // Sorting handler
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        // Toggle direction
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  // Export to Excel
  const handleExportExcel = () => {
    setModal({ open: true, type: "excel" });
  };

  // Ref for the table
  const tableRef = React.useRef(null);

  // Export to PDF using jsPDF + autoTable (portrait, all columns visible)
  const handleExportPDF = () => {
    setModal({ open: true, type: "pdf" });
  };

  const [modal, setModal] = useState({
    open: false,
    type: null,
    payload: null,
  });

  const confirmDownload = () => {
    if (modal.type === "excel") doExportExcel();
    if (modal.type === "pdf") doExportPDF();
    setModal({ open: false, type: null });
  };

  const doExportExcel = () => {
    const exportData = filteredExpenses.map((exp) => ({
      Date: formatDate(exp.date),
      Category: exp.category,
      "Sub-Category": exp.subCategory || "",
      Amount: exp.amount,
      Status: exp.paymentStatus || "",
      "Payment Mode": exp.paymentMode || "",
      Attachment: exp.attachment || "",
      Remark: exp.remarks || exp.remark || "",
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    // Set column widths for better readability
    ws["!cols"] = [
      { wch: 12 }, // Date
      { wch: 18 }, // Category
      { wch: 18 }, // Sub-Category
      { wch: 10 }, // Amount
      { wch: 10 }, // Status
      { wch: 16 }, // Payment Mode
      { wch: 18 }, // Attachment
      { wch: 24 }, // Remark
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Expenses");
    XLSX.writeFile(
      wb,
      `Expense_Report_TT_KOTHANUR_BLR_04_${selectedYear}_${selectedMonth}.xlsx`
    );
  };

  const doExportPDF = () => {
    const doc = new jsPDF({ orientation: "portrait" });
    const title = `Expense Report for TT KOTHANUR BLR 04`;
    const subtitle = `Month: ${
      selectedMonth ? monthNames[selectedMonth] : "All"
    }  Year: ${selectedYear}`;
    doc.setFontSize(13);
    doc.text(title, 105, 15, { align: "center" });
    doc.setFontSize(10);
    doc.text(subtitle, 105, 22, { align: "center" });
    const tableColumn = [
      "Date",
      "Category",
      "Sub-Category",
      "Amount",
      "Status",
      "Payment Mode",
      "Attachment",
      "Remark",
    ];
    const tableRows = filteredExpenses.map((exp) => [
      formatDate(exp.date),
      exp.category,
      exp.subCategory || "",
      exp.amount,
      exp.paymentStatus || "",
      exp.paymentMode || "",
      exp.attachment || "",
      exp.remarks || exp.remark || "",
    ]);
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      styles: {
        fontSize: 7.5,
        cellPadding: 1.5,
        halign: "center",
        valign: "middle",
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [74, 109, 167],
        textColor: 255,
        fontStyle: "bold",
        halign: "center",
        valign: "middle",
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      didParseCell: function (data) {
        // Color the Status column
        if (data.section === "body" && data.column.index === 4) {
          if (data.cell.raw === "Paid") {
            data.cell.styles.textColor = [34, 197, 94]; // green
            data.cell.styles.fontStyle = "bold";
          } else if (data.cell.raw === "Pending") {
            data.cell.styles.textColor = [239, 68, 68]; // red
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
      columnStyles: {
        0: { cellWidth: 18 }, // Date
        1: { cellWidth: 22 }, // Category
        2: { cellWidth: 22 }, // Sub-Category
        3: { cellWidth: 13 }, // Amount
        4: { cellWidth: 13 }, // Status
        5: { cellWidth: 18 }, // Payment Mode
        6: { cellWidth: 22 }, // Attachment
        7: { cellWidth: 32 }, // Remark
      },
      margin: { left: 5, right: 5 },
      tableWidth: "auto",
    });
    doc.save(
      `Expense_Report_TT_KOTHANUR_BLR_04_${selectedYear}_${selectedMonth}.pdf`
    );
  };

  // Edit/Delete modal logic
  const [actionModal, setActionModal] = useState({
    open: false,
    type: null,
    row: null,
  });
  const [editModal, setEditModal] = useState({ open: false, expense: null });
  const handleEdit = (row) => setActionModal({ open: true, type: "edit", row });
  const handleDelete = (row) =>
    setActionModal({ open: true, type: "delete", row });
  const confirmAction = async () => {
    if (actionModal.type === "edit") {
      setEditModal({ open: true, expense: actionModal.row });
      setActionModal({ open: false, type: null, row: null });
    } else if (actionModal.type === "delete") {
      try {
        setDeletingExpenseId(actionModal.row._id);
        await deleteExpense(actionModal.row._id);
        // Refresh data
        if (storeMonth === 0) {
          await getYearlyExpenseSummary(storeYear);
        } else {
          await getMonthlyExpenseData(storeMonth, storeYear);
        }
      } catch (error) {
        console.error("Error deleting expense:", error);
      } finally {
        setDeletingExpenseId(null);
        setActionModal({ open: false, type: null, row: null });
      }
    }
  };

  const [downloadModal, setDownloadModal] = useState({
    open: false,
    url: "",
    filename: "",
  });

  // Download handler
  const handleDownload = (url, filename) => {
    // Create a temporary link and trigger download
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || url.split("/").pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className={`rounded-xl shadow p-2 md:p-4 mt-2 md:mt-4 w-full overflow-x-auto ${
        currentMode === "Dark"
          ? "bg-[#23272e] text-gray-200"
          : "bg-white text-gray-900"
      }`}
      style={{ maxWidth: "100vw" }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <label htmlFor="categoryFilter" className="font-semibold">
            Category:
          </label>
          <select
            id="categoryFilter"
            className="border rounded px-2 py-1 min-w-[120px]"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{
              background: currentMode === "Dark" ? "#23272e" : "#fff",
              color: currentMode === "Dark" ? "#fff" : "#23272e",
              borderColor: currentColor,
            }}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <label htmlFor="statusFilter" className="font-semibold ml-4">
            Status:
          </label>
          <select
            id="statusFilter"
            className="border rounded px-2 py-1 min-w-[100px]"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              background: currentMode === "Dark" ? "#23272e" : "#fff",
              color: currentMode === "Dark" ? "#fff" : "#23272e",
              borderColor: currentColor,
            }}
          >
            <option value="">All</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
        <div className="flex gap-2 mt-2 md:mt-0">
          <button
            className="flex items-center gap-2 px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700 text-base font-semibold"
            onClick={handleExportExcel}
          >
            <FaFileExcel className="text-xl" /> Export Excel
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700 text-base font-semibold"
            onClick={handleExportPDF}
          >
            <FaFilePdf className="text-xl" /> Export PDF
          </button>
        </div>
      </div>
      <div className="overflow-x-auto w-full">
        <table
          ref={tableRef}
          className="min-w-[800px] md:min-w-full table-auto border text-base bg-white dark:bg-[#23272e]"
        >
          <thead
            className={
              currentMode === "Dark"
                ? "bg-[#2d323b] text-gray-100"
                : "bg-gray-100 text-gray-900"
            }
          >
            <tr>
              {/* Table headers with sort icons */}
              {[
                { key: "date", label: "Date" },
                { key: "category", label: "Category" },
                { key: "subCategory", label: "Sub-Category" },
                {
                  key: "amount",
                  label: (
                    <div className="flex flex-col items-center">
                      <span>Amount</span>
                      <span className="text-xs font-semibold text-blue-600">
                        ₹
                        {filteredExpenses
                          .reduce(
                            (sum, exp) => sum + Number(exp.amount || 0),
                            0
                          )
                          .toLocaleString("en-IN")}
                      </span>
                    </div>
                  ),
                },
                { key: "paymentStatus", label: "Status" },
                { key: "paymentMode", label: "Payment Mode" },
                { key: "attachment", label: "Attachment" },
                { key: "remarks", label: "Remark" },
                { key: "actions", label: "Actions", sortable: false },
              ].map((col) => (
                <th
                  key={col.key}
                  className="px-3 py-3 border text-base cursor-pointer select-none"
                  onClick={
                    col.sortable === false
                      ? undefined
                      : () => handleSort(col.key)
                  }
                >
                  <span className="flex items-center gap-1 justify-center">
                    {col.label}
                    {col.sortable === false ? null : (
                      <>
                        <FaSortUp
                          className={`ml-1 text-xs ${
                            sortConfig.key === col.key &&
                            sortConfig.direction === "asc"
                              ? "text-blue-500"
                              : "text-gray-400"
                          }`}
                        />
                        <FaSortDown
                          className={`ml-0.5 text-xs -mt-1 ${
                            sortConfig.key === col.key &&
                            sortConfig.direction === "desc"
                              ? "text-blue-500"
                              : "text-gray-400"
                          }`}
                        />
                      </>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-6 text-lg ">
                  No data found
                </td>
              </tr>
            ) : (
              filteredExpenses.map((exp) => (
                <tr
                  key={exp._id}
                  className={
                    currentMode === "Dark"
                      ? "hover:bg-[#23272e] border-gray-700"
                      : "hover:bg-gray-50 border-gray-200"
                  }
                >
                  <td className="border px-3 py-3 whitespace-nowrap text-base">
                    {formatDate(exp.date)}
                  </td>
                  <td className="border px-3 py-3 whitespace-nowrap text-base">
                    {exp.category}
                  </td>
                  <td className="border px-3 py-3 whitespace-nowrap text-base">
                    {exp.subCategory || ""}
                  </td>
                  <td className="border px-3 py-3 whitespace-nowrap text-base">
                    ₹{exp.amount}
                  </td>
                  <td className="border px-3 py-3 whitespace-nowrap text-base">
                    {exp.paymentStatus ? (
                      <span
                        className={
                          exp.paymentStatus === "Paid"
                            ? "text-green-500 font-bold"
                            : "text-red-500 font-bold"
                        }
                      >
                        {exp.paymentStatus}
                      </span>
                    ) : (
                      ""
                    )}
                  </td>
                  <td className="border px-3 py-3 whitespace-nowrap text-base">
                    {exp.paymentMode || ""}
                  </td>
                  <td className="border px-3 py-3 whitespace-nowrap text-base">
                    {exp.fileUrl ? (
                      <button
                        className="text-blue-600 underline cursor-pointer"
                        onClick={() =>
                          setDownloadModal({
                            open: true,
                            url: exp.fileUrl,
                            filename: exp.fileUrl.split("/").pop(),
                          })
                        }
                      >
                        {exp.fileUrl.split("/").pop()}
                      </button>
                    ) : (
                      ""
                    )}
                  </td>
                  <td className="border px-3 py-3 whitespace-nowrap text-base">
                    {exp.remarks || exp.remark || ""}
                  </td>
                  <td className="border px-3 py-3 whitespace-nowrap flex gap-3 justify-center items-center">
                    <button
                      className={`${
                        deletingExpenseId
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-blue-500 hover:text-blue-700"
                      }`}
                      title="Edit"
                      onClick={() => handleEdit(exp)}
                      disabled={deletingExpenseId}
                    >
                      <FaEdit className="text-2xl" />
                    </button>
                    <button
                      className={`${
                        deletingExpenseId === exp._id
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-red-500 hover:text-red-700"
                      }`}
                      title="Delete"
                      onClick={() => handleDelete(exp)}
                      disabled={deletingExpenseId === exp._id}
                    >
                      {deletingExpenseId === exp._id ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
                      ) : (
                        <FaTrash className="text-2xl" />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <ConfirmModal
        open={modal.open}
        onClose={() => setModal({ open: false, type: null })}
        onConfirm={confirmDownload}
        title={modal.type === "excel" ? "Download Excel?" : "Download PDF?"}
        confirmText="Download"
        confirmColor="bg-green-600"
      />
      <ConfirmModal
        open={actionModal.open}
        onClose={() => setActionModal({ open: false, type: null, row: null })}
        onConfirm={confirmAction}
        title={
          actionModal.type === "edit"
            ? "Edit this expense?"
            : "Are you sure you want to delete this expense?"
        }
        confirmText={actionModal.type === "edit" ? "Edit" : "Delete"}
        confirmColor={
          actionModal.type === "edit" ? "bg-blue-600" : "bg-red-600"
        }
        loading={deletingExpenseId && actionModal.type === "delete"}
      />
      {/* Edit Modal */}
      {editModal.open && (
        <EditExpenseModal
          expense={editModal.expense}
          onClose={() => setEditModal({ open: false, expense: null })}
          onSave={async (id, data) => {
            await updateExpense(id, data);
            setEditModal({ open: false, expense: null });
            // Refresh data
            if (storeMonth === 0) {
              await getYearlyExpenseSummary(storeYear);
            } else {
              await getMonthlyExpenseData(storeMonth, storeYear);
            }
          }}
        />
      )}
      {/* Download confirmation modal */}
      <ConfirmModal
        open={downloadModal.open}
        onClose={() => setDownloadModal({ open: false, url: "", filename: "" })}
        onConfirm={() => {
          handleDownload(downloadModal.url, downloadModal.filename);
          setDownloadModal({ open: false, url: "", filename: "" });
        }}
        title={`Download file "${downloadModal.filename}"?`}
        confirmText="Download"
        confirmColor="bg-blue-600"
      />
    </div>
  );
};

const Pie = () => {
  const {
    expensePieChartData,
    getExpensePieChartData,
    selectedMonth,
    loading,
    selectedYear,
    monthlyExpense,
    getYearlyExpenseSummary,
    yearlyExpenseSummary,
    getMonthlyExpenseData,
    monthlyExpenseData,
    // Date range filter
    fromDate,
    toDate,
    isDateRangeActive,
    getDateRangePieChartData,
    getDateRangeExpenseData,
  } = useExpenseStore();

  const [view, setView] = useState("pie"); // "pie" or "table"

  useEffect(() => {
    if (isDateRangeActive && fromDate && toDate) {
      // Use date range filter
      getDateRangePieChartData(fromDate, toDate);
      getDateRangeExpenseData(fromDate, toDate);
    } else {
      // Use month/year filter
      if (selectedMonth === 0) {
        getYearlyExpenseSummary(selectedYear);
      } else {
        getExpensePieChartData(selectedMonth, selectedYear);
        getMonthlyExpenseData(selectedMonth, selectedYear);
      }
    }
  }, [
    selectedMonth,
    selectedYear,
    getExpensePieChartData,
    getYearlyExpenseSummary,
    getMonthlyExpenseData,
    isDateRangeActive,
    fromDate,
    toDate,
    getDateRangePieChartData,
    getDateRangeExpenseData,
  ]);

  // Use yearly or monthly data based on selection
  const chartData =
    selectedMonth === 0
      ? yearlyExpenseSummary?.expensePieChartData || []
      : expensePieChartData;
  const total =
    selectedMonth === 0
      ? yearlyExpenseSummary?.totalYearlyExpense
      : monthlyExpense;

  return (
    <div className="m-2 p-2 pb-4 md:p-10 md:m-10 mt-32 sm:mt-28 md:mt-24 lg:mt-20 md:rounded-3xl dark:bg-secondary-dark-bg rounded-xl bg-gray-200">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
        <ChartsHeader
          category="Expense"
          title={`Expense Breakdown amount: ₹ ${
            total ? Number(total).toLocaleString("en-IN") : "0"
          }`}
        />
        <div className="flex gap-2 mt-2 md:mt-0">
          <button
            className={`px-3 sm:px-4 py-2 rounded font-semibold border transition-colors duration-200 text-sm sm:text-base ${
              view === "pie"
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
            }`}
            onClick={() => setView("pie")}
          >
            Pie Chart
          </button>
          <button
            className={`px-3 sm:px-4 py-2 rounded font-semibold border transition-colors duration-200 text-sm sm:text-base ${
              view === "table"
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
            }`}
            onClick={() => setView("table")}
          >
            Table View
          </button>
        </div>
      </div>

      {view === "pie" ? (
        <div className="w-full">
          <PieChart
            id="chart-pie"
            data={chartData}
            legendVisibility
            height="400px"
          />
        </div>
      ) : (
        <div className="table-container">
          <Table
            expenses={monthlyExpenseData.expenses || []}
            categories={monthlyExpenseData.categories || []}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
        </div>
      )}
    </div>
  );
};

// ConfirmModal component
const ConfirmModal = ({
  open,
  onClose,
  onConfirm,
  title,
  confirmText = "Download",
  confirmColor = "bg-green-600",
  children,
  loading = false,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-[#23272e] rounded-lg shadow-2xl p-6 w-[90vw] max-w-md mx-auto flex flex-col items-center">
        <h3 className="text-lg font-semibold mb-2 text-center">{title}</h3>
        {children && (
          <div className="mb-4 text-center text-gray-700 dark:text-gray-200">
            {children}
          </div>
        )}
        <div className="flex gap-4 mt-2">
          <button
            className={`px-5 py-2 rounded font-semibold text-white ${confirmColor} hover:brightness-110 shadow flex items-center gap-2 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Deleting...
              </>
            ) : (
              confirmText
            )}
          </button>
          <button
            className="px-5 py-2 rounded font-semibold bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-400 hover:dark:bg-gray-600 shadow"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// EditExpenseModal component
const EditExpenseModal = ({ expense, onClose, onSave }) => {
  const { currentColor, currentMode } = useStateContext();
  const { categories, categorySubMap, getExpenseCategories } =
    useExpenseStore();
  const [form, setForm] = useState({ ...expense, file: null });
  const [showPaymentMode, setShowPaymentMode] = useState(
    expense.paymentStatus === "Paid"
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  React.useEffect(() => {
    getExpenseCategories();
  }, [getExpenseCategories]);
  const today = new Date().toISOString().split("T")[0];
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
    if (name === "paymentStatus") {
      setShowPaymentMode(value === "Paid");
      if (value !== "Paid") {
        setForm((prev) => ({ ...prev, paymentMode: "" }));
      }
    }
    if (name === "category") {
      setForm((prev) => ({ ...prev, subCategory: "" }));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      form.category &&
      categorySubMap[form.category] &&
      categorySubMap[form.category].length > 0 &&
      !form.subCategory
    ) {
      setError("Sub-Category is required for this category.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const submitData = { ...form };
      if (submitData.paymentStatus !== "Paid") {
        delete submitData.paymentMode;
      }
      await onSave(expense._id, submitData);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onClose(); // Ensure modal closes after successful update
    } catch (err) {
      console.error("Update expense error:", err);
      const errorMessage =
        err?.response?.data?.error ||
        err?.message ||
        "Failed to update expense. Please try again.";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div
        className={`w-full max-w-2xl md:rounded-xl rounded-none shadow-2xl p-2 md:p-6 ${
          currentMode === "Dark"
            ? "bg-[#23272e] text-gray-100"
            : "bg-white text-gray-900"
        }`}
        style={{ minHeight: "100vh", maxHeight: "100vh", overflowY: "auto" }}
      >
        <h2 className="text-2xl font-bold mb-4 md:mb-6 text-center">
          Edit Expense
        </h2>
        {error && <div className="text-red-600 text-center mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Basic Information */}
            <div>
              <h6 className="font-semibold mb-4">Basic Information</h6>
              <div className="mb-4">
                <label
                  htmlFor="editExpenseDate"
                  className="block mb-1 font-medium"
                >
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="editExpenseDate"
                  name="date"
                  value={form.date ? form.date.split("T")[0] : ""}
                  onChange={handleChange}
                  required
                  max={today}
                  className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-400 bg-inherit"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="editExpenseCategory"
                  className="block mb-1 font-medium"
                >
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="editExpenseCategory"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    currentMode === "Dark"
                      ? "bg-[#23272e] text-gray-100"
                      : "bg-white text-gray-900"
                  }`}
                >
                  <option value="">Select Category</option>
                  {categories &&
                    categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                </select>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="editExpenseSubCategory"
                  className="block mb-1 font-medium"
                >
                  Sub-Category
                  {form.category &&
                    categorySubMap[form.category] &&
                    categorySubMap[form.category].length > 0 && (
                      <span className="text-red-500">*</span>
                    )}
                </label>
                <select
                  id="editExpenseSubCategory"
                  name="subCategory"
                  value={form.subCategory}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    currentMode === "Dark"
                      ? "bg-[#23272e] text-gray-100"
                      : "bg-white text-gray-900"
                  }`}
                  disabled={!form.category || !categorySubMap[form.category]}
                  required={
                    form.category &&
                    categorySubMap[form.category] &&
                    categorySubMap[form.category].length > 0
                  }
                >
                  <option value="">Select Sub-Category</option>
                  {form.category &&
                    categorySubMap[form.category] &&
                    categorySubMap[form.category].map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                </select>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="editExpenseAmount"
                  className="block mb-1 font-medium"
                >
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="editExpenseAmount"
                  name="amount"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-400 bg-inherit"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="editExpenseRemark"
                  className="block mb-1 font-medium"
                >
                  Remarks
                </label>
                <textarea
                  id="editExpenseRemark"
                  name="remarks"
                  rows={2}
                  value={form.remarks}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-400 bg-inherit"
                ></textarea>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="editExpenseFile"
                  className="block mb-1 font-medium"
                >
                  File Attachment
                </label>
                <input
                  type="file"
                  id="editExpenseFile"
                  name="file"
                  accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-400 bg-inherit"
                  ref={fileInputRef}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Allowed: Images, PDFs, Word files. Max size: 10MB.
                </p>
                {expense.fileUrl && !form.file && (
                  <div className="mt-2">
                    <a
                      href={expense.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Current file: {expense.fileUrl.split("/").pop()}
                    </a>
                  </div>
                )}
              </div>
            </div>
            {/* Payment Details */}
            <div>
              <h6 className="font-semibold mb-4">Payment Details</h6>
              <div className="mb-4">
                <label
                  htmlFor="editPaymentStatus"
                  className="block mb-1 font-medium"
                >
                  Payment Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="editPaymentStatus"
                  name="paymentStatus"
                  value={form.paymentStatus}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    currentMode === "Dark"
                      ? "bg-[#23272e] text-gray-100"
                      : "bg-white text-gray-900"
                  }`}
                >
                  <option value="">Select Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              {showPaymentMode && (
                <div className="mb-4">
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
                    required={showPaymentMode}
                    className={`w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      currentMode === "Dark"
                        ? "bg-[#23272e] text-gray-100"
                        : "bg-white text-gray-900"
                    }`}
                  >
                    <option value="">Select Mode</option>
                    {paymentModes.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 md:gap-4 mt-4 md:mt-6">
            <button
              type="button"
              className="px-4 md:px-6 py-2 rounded bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-400 hover:dark:bg-gray-600"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 md:px-6 py-2 rounded font-semibold text-white"
              style={{
                background: currentColor,
                opacity: submitting ? 0.7 : 1,
              }}
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Pie;
