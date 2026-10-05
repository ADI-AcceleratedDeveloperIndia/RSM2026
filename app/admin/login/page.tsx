"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";

export default function AdminLoginPage() {
  useEffect(() => {
    redirect("/admin");
  }, []);
  return null;
}



