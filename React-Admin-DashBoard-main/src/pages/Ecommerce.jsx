import React, { useEffect, useState } from "react";
import { BsCurrencyDollar } from "react-icons/bs";
import { GoPrimitiveDot } from "react-icons/go";
import { IoIosMore } from "react-icons/io";
import { DropDownListComponent } from "@syncfusion/ej2-react-dropdowns";
import { FaRupeeSign } from "react-icons/fa";
import { useStateContext } from "../contexts/ContextProvider";
import { useRole } from "../contexts/RoleContext";
import useExpenseStore from "../Store/ExpenseStore";
import useSalesStore from "../Store/SalesStore";
import {
  ChartComponent,
  SeriesCollectionDirective,
  SeriesDirective,
  Inject,
  Tooltip,
  Category,
  ColumnSeries,
  Legend,
  RangeColorSettingsDirective,
  RangeColorSettingDirective,
} from "@syncfusion/ej2-react-charts";
import ChartsHeader from "../components/ChartsHeader";
import {
  colorMappingData,
  ColorMappingPrimaryXAxis,
  ColorMappingPrimaryYAxis,
  rangeColorMapping,
  earningData,
  dropdownData,
} from "../data/dummy";

const DropDown = ({ currentMode }) => (
  <div className="w-28 border-1 border-color px-2 py-1 rounded-md">
    <DropDownListComponent
      id="time"
      fields={{ text: "Time", value: "Id" }}
      style={{ border: "none", color: currentMode === "Dark" && "white" }}
      value="1"
      dataSource={dropdownData}
      popupHeight="220px"
      popupWidth="120px"
    />
  </div>
);

const Ecommerce = () => {
  const { currentColor, currentMode } = useStateContext();
  const { permissions } = useRole();
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
    // Date range filter
    fromDate,
    toDate,
    isDateRangeActive,
    getDateRangeExpense,
    getDateRangeLoansExpense,
    dataRefreshTrigger,
  } = useExpenseStore();

  const {
    totalSales,
    loading: salesLoading,
    getTotalSales,
    getYearlySales,
    yearlyTotalSales,
    getDateRangeTotalSales,
    getDailySalesData,
    dailySalesData,
    dailySalesTotal,
  } = useSalesStore();

  useEffect(() => {
    const fetchData = async () => {
      
      try {
        if (isDateRangeActive && fromDate && toDate) {
          // Use date range filter
          await Promise.all([
            getDateRangeExpense(fromDate, toDate),
            getDateRangeLoansExpense(fromDate, toDate),
            getDateRangeTotalSales(fromDate, toDate)
          ]);
        } else {
          // Use month/year filter
          if (selectedMonth === 0) {
            await Promise.all([
              getYearlyExpenseSummary(selectedYear),
              getYearlySales(selectedYear)
            ]);
          } else {
            await Promise.all([
              getMonthlyExpense(selectedMonth, selectedYear),
              getTotalLoansExpense(selectedMonth, selectedYear),
              getTotalSales(selectedMonth, selectedYear),
              getDailySalesData(selectedMonth, selectedYear)
            ]);
          }
        }
      } catch (error) {
      }
    };
    
    fetchData();
  }, [
    selectedMonth,
    selectedYear,
    isDateRangeActive,
    fromDate,
    toDate,
    dataRefreshTrigger, // Add this to trigger refresh when filters change
    getDateRangeExpense,
    getDateRangeLoansExpense,
    getDateRangeTotalSales,
    getYearlyExpenseSummary,
    getYearlySales,
    getMonthlyExpense,
    getTotalLoansExpense,
    getTotalSales,
    getDailySalesData
  ]);

  // Use yearly or monthly data based on selection
  const displayExpense = isDateRangeActive 
    ? monthlyExpense // For date range, use monthlyExpense which gets set by getDateRangeExpense
    : selectedMonth === 0
      ? yearlyExpenseSummary?.totalYearlyExpense
      : monthlyExpense;
      
  const displayLoans = isDateRangeActive
    ? totalLoansExpense // For date range, use totalLoansExpense which gets set by getDateRangeLoansExpense
    : selectedMonth === 0
      ? yearlyExpenseSummary?.totalLoansExpense
      : totalLoansExpense;
      
  const displaySales = isDateRangeActive
    ? totalSales // For date range, use totalSales which gets set by getDateRangeTotalSales
    : selectedMonth === 0 
      ? yearlyTotalSales 
      : totalSales;


  // Calculate In Hand Cash: (Sales + Loans) - Expenses
  const calculateInHandCash = () => {
    const sales = Number(displaySales) || 0;
    const loans = Number(displayLoans) || 0;
    const expenses = Number(displayExpense) || 0;
    
    const inHandAmount = (sales + loans) - expenses;
    return inHandAmount;
  };

  const inHandCash = calculateInHandCash();

  return (
    <div className="main-content-mobile">
      {(expenseLoading || salesLoading) ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      ) : (
      <div className="w-full px-2 md:px-0 mt-[-70px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full ecommerce-cards">
          {/* Show only Sales chart for Staff, all cards for others */}
          {permissions.canSeeAllCards && (
            <>
              {/* In Hand Card */}
              <div className="bg-white dark:text-gray-500 dark:bg-secondary-dark-bg shadow-2xl h-44 rounded-xl w-full p-8 pt-9 bg-hero-pattern bg-no-repeat bg-cover bg-center flex flex-col justify-between ecommerce-card">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-black text-xl">In Hand</p>
                    <p
                      className={`text-2xl mt-10 ${
                        inHandCash <= 0
                          ? "text-red-500"
                          : inHandCash > 0 && inHandCash <= 50000
                          ? "text-yellow-500"
                          : "text-green-500"
                      }`}
                    >
                      ₹{inHandCash.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <button
                    type="button"
                    style={{ background: currentColor }}
                    className="text-2xl opacity-0.9 text-white hover:drop-shadow-xl rounded-full p-4"
                  >
                    <FaRupeeSign />
                  </button>
                </div>
              </div>
              {/* Earnings Cards */}
              {earningData(displayExpense, displayLoans, displaySales).map(
                (item) => (
                  <div
                    key={item.title}
                    className="bg-white h-44 dark:text-gray-200 dark:bg-secondary-dark-bg shadow-2xl w-full p-4 pt-4 rounded-xl flex flex-col justify-between ecommerce-card"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-base text-gray-700 dark:text-gray-200">
                        {item.title}
                      </p>
                      <button
                        type="button"
                        style={{
                          color: item.iconColor,
                          backgroundColor: item.iconBg,
                        }}
                        className="text-2xl rounded-full p-3 hover:drop-shadow-xl"
                      >
                        {item.icon}
                      </button>
                    </div>
                    <div className="flex flex-col justify-end flex-grow">
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">
                        {item.amount}
                      </p>
                      <span
                        className="text-sm font-semibold"
                        style={{ color: item.pcColor }}
                      >
                        {item.percentage}
                      </span>
                    </div>
                  </div>
                )
              )}
            </>
          )}
          
          {/* For Staff users, show only a simple sales chart */}
          {permissions.isStaff && (
            <div className="col-span-full">
              <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg shadow-2xl rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4">Sales Overview</h3>
                <p className="text-3xl font-bold text-green-600">
                  ₹{displaySales ? Number(displaySales).toLocaleString("en-IN") : "0"}
                </p>
                <p className="text-sm text-gray-500 mt-2">Total Sales</p>
              </div>
            </div>
          )}
        </div>

        {/* Show chart only when a specific month is selected (not 'All' and not date range) */}
        {selectedMonth !== 0 && !isDateRangeActive && (
          <div className="flex gap-6 sm:gap-10 flex-col items-center justify-center mt-6">
            <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg shadow-2xl m-2 sm:m-3 p-3 sm:p-4 rounded-2xl w-full max-w-6xl">
              <div className="m-2 p-2 pb-4 md:p-6 lg:p-10 md:m-6 lg:m-10 mt-6 sm:mt-8 md:mt-12 lg:mt-16 md:rounded-3xl dark:bg-secondary-dark-bg rounded-xl bg-gray-200 w-full">
                <ChartsHeader 
                  category="Sale Report" 
                  title={`DAILY SALES & ORDERS - Total: ₹${dailySalesTotal ? Number(dailySalesTotal).toLocaleString("en-IN") : "0"}`} 
                />
                <div 
                  className="w-full chart-container relative" 
                  style={{ 
                    scrollbarWidth: "thin", 
                    msOverflowStyle: "auto"
                  }}
                >
                  <style>{`
                    .chart-container::-webkit-scrollbar {
                      width: 8px;
                      height: 8px;
                    }
                    
                    .chart-container::-webkit-scrollbar-track {
                      background: rgba(0, 0, 0, 0.1);
                      border-radius: 4px;
                    }
                    
                    .chart-container::-webkit-scrollbar-thumb {
                      background: ${currentColor};
                      border-radius: 4px;
                      opacity: 0.7;
                    }
                    
                    .chart-container::-webkit-scrollbar-thumb:hover {
                      background: ${currentColor};
                      opacity: 1;
                    }
                    
                    
                    /* Desktop - no scroll, fit to container */
                    @media (min-width: 1024px) {
                      .chart-container {
                        overflow: visible;
                      }
                      .chart-container::-webkit-scrollbar {
                        display: none;
                      }
                      .chart-inner {
                        width: 100% !important;
                        min-width: auto !important;
                      }
                    }
                    
                    /* Mobile/Tablet - enable horizontal scroll with visible scrollbar */
                    @media (max-width: 1023px) {
                      .chart-container {
                        overflow-x: scroll !important;
                        overflow-y: visible !important;
                        -webkit-overflow-scrolling: touch;
                        scroll-behavior: smooth;
                        touch-action: pan-x pan-y;
                        position: relative;
                        z-index: 1;
                        height: 420px;
                        scrollbar-width: thin;
                        scrollbar-color: ${currentColor} rgba(0, 0, 0, 0.1);
                      }
                      .chart-container::-webkit-scrollbar {
                        width: 12px !important;
                        height: 12px !important;
                        display: block !important;
                      }
                      .chart-container::-webkit-scrollbar-track {
                        background: rgba(0, 0, 0, 0.1) !important;
                        border-radius: 6px !important;
                      }
                      .chart-container::-webkit-scrollbar-thumb {
                        background: ${currentColor} !important;
                        border-radius: 6px !important;
                        opacity: 1 !important;
                      }
                      .chart-inner {
                        min-width: 1600px !important;
                        width: 1600px !important;
                        height: 400px;
                        position: relative;
                      }
                    }
                  `}</style>
                  <div 
                    className="chart-inner" 
                    style={{ width: "100%", height: "400px" }}
                  >
                    <ChartComponent
                      id="DailySalesChart"
                      primaryXAxis={{
                        valueType: "Category",
                        majorGridLines: { width: 0 },
                        title: "Day of Month",
                        titleStyle: {
                          color: currentMode === "Dark" ? "#FFFFFF" : "#000000",
                          size: "16px",
                          fontWeight: "500",
                        },
                        labelStyle: {
                          color: currentMode === "Dark" ? "#FFFFFF" : "#000000",
                          size: "11px",
                          fontWeight: "500",
                        },
                        labelIntersectAction: "None",
                        interval: 1,
                        edgeLabelPlacement: "Shift",
                        labelPlacement: "OnTicks",
                        tickPosition: "Outside",
                        majorTickLines: { width: 1, height: 5 },
                      }}
                      primaryYAxis={{
                        lineStyle: { width: 0 },
                        majorTickLines: { width: 0 },
                        minorTickLines: { width: 0 },
                        labelFormat: "₹ {value}",
                        title: "Sales + Orders Amount",
                        titleStyle: {
                          color: currentMode === "Dark" ? "#FFFFFF" : "#000000",
                          size: "16px",
                          fontWeight: "500",
                        },
                        labelStyle: {
                          color: currentMode === "Dark" ? "#FFFFFF" : "#000000",
                        },
                      }}
                      chartArea={{ border: { width: 0 } }}
                      background={currentMode === "Dark" ? "#33373E" : "#fff"}
                      legendSettings={{ visible: false }}
                      tooltip={{
                        enable: true,
                        format: "Day ${point.x}:${point.y}<br/>",
                      }}
                      width="100%"
                      height="400px"    
                      pointRender={(args) => {
                        const value = args.point.y;
                        if (value < 5000) {
                          args.fill = '#fa0202'; // bright Red
                        } else if (value >= 5000 && value <= 10000) {
                          args.fill = '#fae602'; // bright Yellow
                        } else {
                          args.fill = '#02fa02'; // bright Green
                        }
                      }}
                      zoomSettings={{
                        enableSelectionZooming: true,
                        enableScrollbar: true,
                      }}
                    >
                      <Inject
                        services={[ColumnSeries, Tooltip, Legend, Category]}
                      />
                      <SeriesCollectionDirective>
                        <SeriesDirective
                          dataSource={dailySalesData}
                          name="Daily Sales + Orders"
                          xName="x"
                          yName="y"
                          type="Column"
                          fill="#6BCF7F"
                          cornerRadius={{
                            topLeft: 10,
                            topRight: 10,
                          }}
                        />
                      </SeriesCollectionDirective>
                    </ChartComponent>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
};

export default Ecommerce;
