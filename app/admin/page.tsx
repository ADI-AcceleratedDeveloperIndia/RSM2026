"use client";

import { useState } from "react";
import AdminDashboard from "@/components/AdminDashboard";
import AdminSignIn from "@/components/AdminSignIn";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <AdminSignIn onSignIn={() => setIsAuthenticated(true)} />;
  }

  return <AdminDashboard />;
}



