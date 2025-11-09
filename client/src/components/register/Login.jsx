import React from "react";
import { SignIn, useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";

function Login() {
  const { isSignedIn } = useUser();

  if (isSignedIn) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <SignIn
        signUpUrl="/signup"      // 👈 redirect Clerk’s “Sign up” link to your route
        afterSignInUrl="/"        // 👈 redirect after login
      />
    </div>
  );
}

export default Login;