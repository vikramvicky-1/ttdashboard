import React, { useEffect } from "react";
import { Navbar, Sidebar } from "./components";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useStateContext } from "./contexts/ContextProvider";
import {
  Ecommerce,
  Pie,
  AddExpense,
  Login,
  DailySale,
  SalesData,
  ManageCategories,
} from "./pages";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const App = () => {
  const {
    currentColor,
    setCurrentColor,
    currentMode,
    setCurrentMode,
    activeMenu,
  } = useStateContext();

  useEffect(() => {
    const currentThemeColor = localStorage.getItem("colorMode");
    const currentThemeMode = localStorage.getItem("themeMode");
    if ((currentThemeColor, currentThemeMode)) {
      setCurrentColor(currentThemeColor);
      setCurrentMode(currentThemeMode);
    }
  }, []);

  return (
    <div className={currentMode === "Dark" ? "dark" : ""}>
      <BrowserRouter>
        <Routes>
          {/* Login Page - Main Landing */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />

          {/* Dashboard Routes - Protected */}
          <Route
            path="/dashboard"
            element={
              <div className="flex relative dark:bg-main-dark-bg">
                <Sidebar />
                <div
                  className={`dark:bg-main-dark-bg bg-main-bg min-h-screen w-full transition-all duration-300 ${
                    activeMenu ? "sidebar-expanded" : "sidebar-collapsed"
                  }`}
                >
                  <Navbar />
                  <div className="pt-0">
                    <Ecommerce />
                  </div>
                </div>
              </div>
            }
          />

          {/* Other Dashboard Routes */}
          <Route
            path="/expenses"
            element={
              <div className="flex relative dark:bg-main-dark-bg">
                <Sidebar />
                <div
                  className={`dark:bg-main-dark-bg bg-main-bg min-h-screen w-full transition-all duration-300 ${
                    activeMenu ? "sidebar-expanded" : "sidebar-collapsed"
                  }`}
                >
                  <Navbar />
                  <div className="pt-0">
                    <Pie />
                  </div>
                </div>
              </div>
            }
          />

          <Route
            path="/add-expense"
            element={
              <div className="flex relative dark:bg-main-dark-bg">
                <Sidebar />
                <div
                  className={`dark:bg-main-dark-bg bg-main-bg min-h-screen w-full transition-all duration-300 ${
                    activeMenu ? "sidebar-expanded" : "sidebar-collapsed"
                  }`}
                >
                  <Navbar />
                  <div className="pt-0">
                    <AddExpense />
                  </div>
                </div>
              </div>
            }
          />

          <Route
            path="/daily-sale"
            element={
              <div className="flex relative dark:bg-main-dark-bg">
                <Sidebar />
                <div
                  className={`dark:bg-main-dark-bg bg-main-bg min-h-screen w-full transition-all duration-300 ${
                    activeMenu ? "sidebar-expanded" : "sidebar-collapsed"
                  }`}
                >
                  <Navbar />
                  <div className="pt-0">
                    <DailySale />
                  </div>
                </div>
              </div>
            }
          />

          <Route
            path="/sales-data"
            element={
              <div className="flex relative dark:bg-main-dark-bg">
                <Sidebar />
                <div
                  className={`dark:bg-main-dark-bg bg-main-bg min-h-screen w-full transition-all duration-300 ${
                    activeMenu ? "sidebar-expanded" : "sidebar-collapsed"
                  }`}
                >
                  <Navbar />
                  <div className="pt-0">
                    <SalesData />
                  </div>
                </div>
              </div>
            }
          />

          <Route
            path="/manage-categories"
            element={
              <div className="flex relative dark:bg-main-dark-bg">
                <Sidebar />
                <div
                  className={`dark:bg-main-dark-bg bg-main-bg min-h-screen w-full transition-all duration-300 ${
                    activeMenu ? "sidebar-expanded" : "sidebar-collapsed"
                  }`}
                >
                  <Navbar />
                  <div className="pt-0">
                    <ManageCategories />
                  </div>
                </div>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>

      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={currentMode === "Dark" ? "dark" : "light"}
      />
    </div>
  );
};
