"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck } from "lucide-react";

interface AdminSignInProps {
  onSignIn: () => void;
}

export default function AdminSignIn({ onSignIn }: AdminSignInProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Dummy authentication - accept any username/password
    if (username && password) {
      onSignIn();
    } else {
      setError("Please enter username and password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-white p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <ShieldCheck className="h-8 w-8 text-emerald-700" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
            <CardDescription>Sign in to access the admin panel</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full rs-btn-primary">
              Sign In
            </Button>
          </form>
          <p className="text-xs text-center text-slate-500 mt-4">
            Demo: Enter any username and password to sign in
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

