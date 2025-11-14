import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import AppRoutes from "./AppRoutes";
import { fetchCurrentAuthUser } from "../redux/slices/userSlice";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  const dispatch = useDispatch();
  const { getToken, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      if (loading) return;
      try {
        const token = getToken(); // JWT token
        if (token && isAuthenticated) {
          dispatch(fetchCurrentAuthUser(token));
        }
      } catch (error) {
        console.error("Failed to get token:", error);
      }
    };
    fetchUser();
  }, [dispatch, getToken, loading, isAuthenticated]);

  return (
    <>
      <AppRoutes />
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}
