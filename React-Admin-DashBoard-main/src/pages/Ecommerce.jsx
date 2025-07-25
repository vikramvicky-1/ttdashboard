import React, { useState, useEffect } from "react";
import { FaRupeeSign } from "react-icons/fa";
import { DropDownListComponent } from "@syncfusion/ej2-react-dropdowns";
import { useStateContext } from "../contexts/ContextProvider";
import { earningData, dropdownData } from "../data/dummy";
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
} from "../data/dummy";
import useExpenseStore from "../Store/ExpenseStore";

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
  const [inHand, setInHand] = useState("10000.00");
  const {
    selectedMonth,
    selectedYear,
    getMonthlyExpense,
    getTotalLoansExpense,
    monthlyExpense,
    totalLoansExpense,
    loading,
    getYearlyExpenseSummary,
    yearlyExpenseSummary,
    // Date range filter
    fromDate,
    toDate,
    isDateRangeActive,
    getDateRangeExpense,
    getDateRangeLoansExpense,
  } = useExpenseStore();

  useEffect(() => {
    if (isDateRangeActive && fromDate && toDate) {
      // Use date range filter
      getDateRangeExpense(fromDate, toDate);
      getDateRangeLoansExpense(fromDate, toDate);
    } else {
      // Use month/year filter
      if (selectedMonth === 0) {
        getYearlyExpenseSummary(selectedYear);
      } else {
        getMonthlyExpense(selectedMonth, selectedYear);
        getTotalLoansExpense(selectedMonth, selectedYear);
      }
    }
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
  ]);

  // Use yearly or monthly data based on selection
  const displayExpense =
    selectedMonth === 0
      ? yearlyExpenseSummary?.totalYearlyExpense
      : monthlyExpense;
  const displayLoans =
    selectedMonth === 0
      ? yearlyExpenseSummary?.totalLoansExpense
      : totalLoansExpense;

  console.log("displayExpense", displayExpense);
  console.log("displayLoans", displayLoans);

  return (
    <div className="main-content-mobile">
      {loading && (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      )}
      <div className="w-full px-2 md:px-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full ecommerce-cards">
          {/* In Hand Card */}
          <div className="bg-white dark:text-gray-500 dark:bg-secondary-dark-bg shadow-2xl h-44 rounded-xl w-full p-8 pt-9 bg-hero-pattern bg-no-repeat bg-cover bg-center flex flex-col justify-between ecommerce-card">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-black text-xl">In Hand</p>
                <p
                  className={`text-2xl mt-10 ${
                    inHand <= 0
                      ? "text-red-500"
                      : inHand > 0 && inHand <= 50000
                      ? "text-yellow-500"
                      : "text-green-500"
                  }`}
                >
                  ₹{inHand}
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
          {earningData(displayExpense, displayLoans).map((item) => (
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
              <div className="flex flex-col items-center justify-center flex-1">
                <span className="text-xl md:text-3xl font-bold mb-1">
                  {item.amount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className="text-sm font-semibold"
                  style={{ color: item.pcColor }}
                >
                  {item.percentage}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-6 sm:gap-10 flex-col items-center justify-center mt-6">
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg shadow-2xl m-2 sm:m-3 p-3 sm:p-4 rounded-2xl w-full max-w-6xl">
          <div className="m-2 p-2 pb-4 md:p-6 lg:p-10 md:m-6 lg:m-10 mt-6 sm:mt-8 md:mt-12 lg:mt-16 md:rounded-3xl dark:bg-secondary-dark-bg rounded-xl bg-gray-200 w-full">
            <ChartsHeader category="Sale Report" title="DAILY SALE" />
            <div className="w-full overflow-x-auto scrollbar-hide">
              <div style={{ minWidth: 900, height: "350px" }}>
                <ChartComponent
                  id="Charts"
                  primaryXAxis={ColorMappingPrimaryXAxis}
                  primaryYAxis={ColorMappingPrimaryYAxis}
                  chartArea={{ border: { width: 0 } }}
                  background={currentMode === "Dark" ? "#33373E" : "#fff"}
                  legendSettings={{ visible: false }}
                  tooltip={{
                    enable: true,
                  }}
                >
                  <Inject
                    services={[ColumnSeries, Tooltip, Legend, Category]}
                  />
                  <SeriesCollectionDirective>
                    <SeriesDirective
                      dataSource={colorMappingData[0]}
                      name="SALE"
                      xName="x"
                      yName="y"
                      type="Column"
                      cornerRadius={{
                        topLeft: 10,
                        topRight: 10,
                      }}
                    />
                  </SeriesCollectionDirective>
                  <RangeColorSettingsDirective>
                    {rangeColorMapping.map((item, index) => (
                      <RangeColorSettingDirective key={index} {...item} />
                    ))}
                  </RangeColorSettingsDirective>
                </ChartComponent>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ecommerce;
