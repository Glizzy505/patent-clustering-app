import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { motion } from "framer-motion";
import "./App.css";
import LandingDashboard from "./components/LandingDashboard";
import ClusterExplorer from "./components/ClusterExplorer";
import PatentList from "./components/PatentList";
import About from "./components/About";
import Header from "./components/Header";
import Footer from "./components/Footer";
import UploadAbstract from "./components/UploadAbstract";
import KeywordView from "./components/KeywordView";

function App() {
  return (
    <div className="d-flex flex-column min-vh-100" data-testid="app-container">
      <BrowserRouter>
        <Header />
        <main className="flex-grow-1">
          <Routes>
            <Route
              path="/"
              element={
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <LandingDashboard />
                </motion.div>
              }
            />
            <Route path="/clusters" element={<ClusterExplorer />} />
            <Route path="/patents" element={<PatentList />} />
            <Route path="/about" element={<About />} />
            <Route path="/upload" element={<UploadAbstract />} />
            <Route path="/keywords" element={<KeywordView />} />
          </Routes>
        </main>
        <Footer
          style={{ position: "relative", zIndex: 1 }}
          data-testid="footer-component"
        />
      </BrowserRouter>
    </div>
  );
}

export default App;
