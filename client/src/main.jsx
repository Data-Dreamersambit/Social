import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { ClerkProvider } from "@clerk/clerk-react";
import { store } from "./redux/store.js";
import App from "../src/app/App.jsx";
import "./index.css";
const PUBLISHABLE_KEY ="pk_test_aGVyb2ljLW1hbnRpcy01NS5jbGVyay5hY2NvdW50cy5kZXYk";

createRoot(document.getElementById("root")).render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
    <Provider store={store}>
      <App />
    </Provider>
  </ClerkProvider>
);