import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import useAuthStore from "./store/useAuthStore";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProjectDetail from "./pages/ProjectDetail";

const Protected = ({ children }) => {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" replace />;
};

const PublicOnly = ({ children }) => {
  const { token } = useAuthStore();
  return !token ? children : <Navigate to="/dashboard" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#171A21",
            color: "#F3F4F6",
            border: "1px solid #2A2F3A",
            borderRadius: "12px",
            fontSize: "13px",
            padding: "12px 16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            fontFamily: "'Geist', sans-serif",
          },
          success: { iconTheme: { primary: "#10B981", secondary: "#171A21" } },
          error: { iconTheme: { primary: "#FF6B6B", secondary: "#171A21" } },
        }}
      />
      <Routes>
        <Route
          path="/login"
          element={
            <PublicOnly>
              <Login />
            </PublicOnly>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnly>
              <Register />
            </PublicOnly>
          }
        />
        <Route
          path="/dashboard"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        />
        <Route
          path="/project/:slug"
          element={
            <Protected>
              <ProjectDetail />
            </Protected>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
