import React, { useEffect, useState } from "react";
import { BsBoxSeam } from "react-icons/bs";
import { useStateContext } from "../contexts/ContextProvider";
import { useRole } from "../contexts/RoleContext";
import useExpenseStore from "../Store/ExpenseStore";

const Ecommerce = () => {
  const { currentColor, currentMode } = useStateContext();
  const { permissions } = useRole();
  const [isMobile, setIsMobile] = useState(false);
  const {
    selectedMonth,
    selectedYear,
    getMonthlyExpense,
    getTotalLoansExpense,
    monthlyExpense,
    totalLoansExpense,
    loading: expenseLoading,
    getYearlyExpenseSummary,
    yearlyExpenseSummary,
    fromDate,
    toDate,
    isDateRangeActive,
    getDateRangeExpense,
    getDateRangeLoansExpense,
    dataRefreshTrigger,
  } = useExpenseStore();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1023);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isDateRangeActive && fromDate && toDate) {
          await Promise.all([
            getDateRangeExpense(fromDate, toDate),
            getDateRangeLoansExpense(fromDate, toDate),
          ]);
        } else if (selectedYear !== new Date().getFullYear()) {
          await Promise.all([
            getYearlyExpenseSummary(selectedYear),
          ]);
        } else {
          await Promise.all([
            getMonthlyExpense(selectedMonth, selectedYear),
            getTotalLoansExpense(selectedMonth, selectedYear),
          ]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [
    selectedMonth,
    selectedYear,
    getMonthlyExpense,
    getTotalLoansExpense,
    getYearlyExpenseSummary,
    isDateRangeActive,
    fromDate,
    toDate,
    getDateRangeExpense,
    getDateRangeLoansExpense,
    dataRefreshTrigger,
  ]);

  const displayExpense = isDateRangeActive 
    ? monthlyExpense
    : (yearlyExpenseSummary && selectedYear !== new Date().getFullYear())
      ? yearlyExpenseSummary?.totalYearlyExpense
      : monthlyExpense;

  return (
    <div className={currentMode === "Dark" ? "dark" : ""}>
      {expenseLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="text-xl font-semibold text-gray-600 dark:text-gray-300">
            Loading...
          </div>
        </div>
      ) : (
        <div className="m-2 md:m-10 p-4 md:p-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 w-full ecommerce-cards">
            <div
              className="bg-white h-44 dark:text-gray-200 dark:bg-secondary-dark-bg shadow-2xl w-full p-4 pt-4 rounded-xl flex flex-col justify-between ecommerce-card relative group"
              title="Total monthly expenses"
            >
              <div>
                <p className="font-bold text-gray-400">Total Expense</p>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl text-black dark:text-white">
                      ₹{displayExpense ? Number(displayExpense).toLocaleString("en-IN") : "0"}
                    </p>
                  </div>
                  <div
                    className="text-3xl text-white rounded-full p-4 opacity-0 group-hover:opacity-100 group-hover:bg-red-400 transition-all"
                    style={{ background: currentColor }}
                  >
                    <BsBoxSeam />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ecommerce;
