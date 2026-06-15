/**
 * App.tsx
 * -----------------------------------------------------------------------------
 * Top-level route table. Maps URLs to pages; the dashboard lives at "/",
 * account creation at "/signup" and login at "/signin". Unknown paths fall
 * back to the dashboard.
 */

import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import SignUpPage from "@/pages/SignUpPage";
import SignInPage from "@/pages/SignInPage";
import { ProtectedRoute } from "@/components";

export default function App(): JSX.Element {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
