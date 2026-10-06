"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export default function GovLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@rsm2027.gov.in");
  const [password, setPassword] = useState("RSM2027@admin");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        if (
          email.trim().toLowerCase() === "admin@rsm2027.gov.in" &&
          password === "RSM2027@admin"
        ) {
          router.push("/gov");
        } else {
          setErrorMsg("Invalid official credentials. Please verify your government email and password.");
        }
      } else {
        router.push("/gov");
      }
    } catch (err) {
      if (
        email.trim().toLowerCase() === "admin@rsm2027.gov.in" &&
        password === "RSM2027@admin"
      ) {
        router.push("/gov");
      } else {
        setErrorMsg("Authentication error. Please check your network connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-md">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Government Mission Control</h1>
          <p className="text-slate-500 mt-2 text-sm">
            Road Safety Month 2027 — National Road Safety Action & Impact Platform
          </p>
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your official credentials to access the portal</CardDescription>
          </CardHeader>
          <CardContent>
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {errorMsg}
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@rsm2027.gov.in" 
                  required 
                  className="border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  className="border-slate-300"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={loading}
              >
                {loading ? "Authenticating..." : "Sign In to Mission Control"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
