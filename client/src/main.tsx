import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

console.log("=== VITE ENV TEST START ===");
console.log("FULL import.meta.env:", import.meta.env);
console.log("VITE_FIREBASE_API_KEY:", import.meta.env.VITE_FIREBASE_API_KEY);
console.log("VITE_FIREBASE_AUTH_DOMAIN:", import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
console.log("VITE_FIREBASE_PROJECT_ID:", import.meta.env.VITE_FIREBASE_PROJECT_ID);
console.log("=== VITE ENV TEST END ===");

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);