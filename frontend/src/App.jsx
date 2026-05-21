// App.jsx — routing + protected routes
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import Profile from "./pages/Profile.jsx";

// ADD THESE
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";

// Wrapper that only allows logged-in users
const Protected = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 text-black dark:bg-gray-900 dark:text-white transition-colors duration-300">
        Loading...
      </div>
    );

  return user ? children : <Navigate to="/login" />;
};

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" /> : <Login />}
      />

      <Route
        path="/register"
        element={user ? <Navigate to="/" /> : <Register />}
      />

      {/* ADD THESE ROUTES */}
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        path="/"
        element={
          <Protected>
            <Home />
          </Protected>
        }
      />

      <Route
        path="/profile"
        element={
          <Protected>
            <Profile />
          </Protected>
        }
      />
    </Routes>
  );
}
