import React from "react";
import ReactDOM from "react-dom/client"; // Correct import for React 18
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const root = ReactDOM.createRoot(document.getElementById("root")); // Correctly initialize root
root.render(<App />);

reportWebVitals();
