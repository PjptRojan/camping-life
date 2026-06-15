/**
 * main.tsx
 * -----------------------------------------------------------------------------
 * Application entry point. Wires React to the DOM and provides the Redux store
 * to the entire component tree.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { store } from "@/store";
import App from "@/App";
import "./index.css";
import { ToastContainer } from "react-toastify";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element #root not found in index.html");
}

createRoot(rootElement).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnHover
          draggable
          theme="light"
        />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
