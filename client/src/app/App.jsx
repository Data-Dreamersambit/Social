import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useAuth } from "@clerk/clerk-react";
import AppRoutes from "./AppRoutes";
import { fetchCurrentAuthUser } from "../redux/slices/userSlice";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  const dispatch = useDispatch();
  const { getToken, isLoaded } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      if (!isLoaded) return;
      try {
        const token = await getToken(); // Clerk JWT token
        console.log(token)
        if (token) dispatch(fetchCurrentAuthUser(token));
      } catch (error) {
        console.error("Failed to get Clerk token:", error);
      }
    };
    fetchUser();
  }, [dispatch, getToken, isLoaded]);

  return (
    <BrowserRouter>
      <AppRoutes />
      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  );
}
