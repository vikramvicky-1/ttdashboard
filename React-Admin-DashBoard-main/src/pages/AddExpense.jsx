import React, { useState, useRef } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import useExpenseStore from "../Store/ExpenseStore";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const paymentModes = ["Cash", "Online"];

const AddExpense = () => {
  const { currentColor, currentMode } = useStateContext();
  const { categories, categorySubMap, getExpenseCategories, addExpense } =
    useExpenseStore();
  const [form, setForm] = useState({
    date: "",
    category: "",
    subCategory: "",
    amount: "",
    paymentStatus: "",
    paymentMode: "",
    remarks: "",
    file: null,
  });
  const [showPaymentMode, setShowPaymentMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch categories on mount
  React.useEffect(() => {
    getExpenseCategories();
  }, [getExpenseCategories]);

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

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      form.category &&
      categorySubMap[form.category] &&
      categorySubMap[form.category].length > 0 &&
      !form.subCategory
    ) {
      alert("Sub-Category is required for this category.");
      return;
    }
    setSubmitting(true);
    try {
      // Only send paymentMode if paymentStatus is Paid
      const submitData = { ...form };
      if (submitData.paymentStatus !== "Paid") {
        delete submitData.paymentMode;
      }
      await addExpense(submitData);
      setForm({
        date: "",
        category: "",
        subCategory: "",
        amount: "",
        paymentStatus: "",
        paymentMode: "",
        remarks: "",
        file: null,
      });
      setShowPaymentMode(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      // error toast handled in store
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`flex justify-center items-start min-h-screen pt-16 sm:pt-20 md:pt-24 lg:pt-28 pb-8 px-4 add-expense-page ${
        currentMode === "Dark" ? "bg-[#23272e]" : "bg-gray-100"
      } main-content-mobile`}
    >
      <ToastContainer position="top-center" autoClose={2000} />
      <div
        className={`w-full max-w-2xl rounded-xl shadow-2xl p-3 sm:p-4 md:p-6 ${
          currentMode === "Dark"
            ? "bg-[#23272e] text-gray-100"
            : "bg-white text-gray-900"
        }`}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Add New Expense</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div>
              <h6 className="font-semibold mb-4">Basic Information</h6>
              <div className="mb-4">
                <label htmlFor="expenseDate" className="block mb-1 font-medium">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="expenseDate"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  max={today}
                  className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-400 bg-inherit"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="expenseCategory"
                  className="block mb-1 font-medium"
                >
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="expenseCategory"
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
                  htmlFor="expenseSubCategory"
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
                  id="expenseSubCategory"
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
                  htmlFor="expenseAmount"
                  className="block mb-1 font-medium"
                >
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="expenseAmount"
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
                  htmlFor="expenseRemark"
                  className="block mb-1 font-medium"
                >
                  Remarks
                </label>
                <textarea
                  id="expenseRemark"
                  name="remarks"
                  rows={2}
                  value={form.remarks}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-400 bg-inherit"
                ></textarea>
              </div>
              <div className="mb-4">
                <label htmlFor="expenseFile" className="block mb-1 font-medium">
                  File Attachment
                </label>
                <input
                  type="file"
                  id="expenseFile"
                  name="file"
                  accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-400 bg-inherit"
                  ref={fileInputRef}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Allowed: Images, PDFs, Word files. Max size: 10MB.
                </p>
              </div>
            </div>
            {/* Payment Details */}
            <div>
              <h6 className="font-semibold mb-4">Payment Details</h6>
              <div className="mb-4">
                <label
                  htmlFor="paymentStatus"
                  className="block mb-1 font-medium"
                >
                  Payment Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="paymentStatus"
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
                    htmlFor="paymentMode"
                    className="block mb-1 font-medium"
                  >
                    Payment Mode <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="paymentMode"
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
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              className="px-6 py-2 rounded bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-400 hover:dark:bg-gray-600"
              onClick={() => window.history.back()}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded font-semibold text-white"
              style={{
                background: currentColor,
                opacity: submitting ? 0.7 : 1,
              }}
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
          {success && (
            <div className="text-green-600 text-center mt-4 font-semibold">
              Expense added successfully!
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddExpense;
