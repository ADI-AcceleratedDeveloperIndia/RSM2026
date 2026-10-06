"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Users, ArrowRight, ShieldCheck, AlertCircle, ArrowLeft } from "lucide-react";

export default function OrganizerLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [usePhoneLogin, setUsePhoneLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const payload: any = {
        identifier: identifier.trim(),
      };
      if (usePhoneLogin) {
        payload.phone = phone.trim();
      } else {
        payload.password = password;
      }

      const res = await fetch("/api/organizer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Login failed. Please verify your credentials.");
        return;
      }

      // Store organizer details in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("rsm_organizer", JSON.stringify(data.organizer));
      }

      // Redirect to organizer dashboard
      router.push("/organizer/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);
      setErrorMsg("Unable to connect to the authentication service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Top return link */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <Link href="/" className="inline-flex items-center gap-1 hover:text-emerald-700 transition">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Public Portal</span>
          </Link>
          <span className="font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Road Safety Month 2027
          </span>
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
            <Users className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Organizer Portal Sign In
          </h1>
          <p className="text-sm text-slate-600">
            Dedicated access for verified school, college, corporate & NGO road safety coordinators.
          </p>
        </div>

        {/* Card Form */}
        <Card className="border-emerald-100 shadow-xl shadow-emerald-950/5">
          <CardHeader className="pb-4">
            <CardTitle className="text-base text-slate-900">Organizer Credentials</CardTitle>
            <CardDescription className="text-xs">
              Enter your official Organizer ID (Temporary or Final) or registered Email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="identifier" className="text-xs font-semibold text-slate-700">
                  Organizer ID or Registered Email *
                </Label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="e.g. STGV-RSM-2027-... or TEMP-ORG-... or user@school.edu"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="border-slate-300 h-10 text-sm"
                />
              </div>

              {!usePhoneLogin ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                      Password *
                    </Label>
                    <button
                      type="button"
                      onClick={() => setUsePhoneLogin(true)}
                      className="text-[11px] text-emerald-700 hover:underline"
                    >
                      Login with Phone instead?
                    </button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-slate-300 h-10 text-sm"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="phone" className="text-xs font-semibold text-slate-700">
                      Registered Phone Number *
                    </Label>
                    <button
                      type="button"
                      onClick={() => setUsePhoneLogin(false)}
                      className="text-[11px] text-emerald-700 hover:underline"
                    >
                      Login with Password instead?
                    </button>
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="10-digit registered mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="border-slate-300 h-10 text-sm"
                  />
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-10 font-medium text-sm shadow-md shadow-emerald-700/20"
              >
                {loading ? "Authenticating..." : "Sign In to Organizer Dashboard"}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2 text-center text-xs text-slate-500">
              <div>
                Don't have an Organizer ID yet?{" "}
                <Link href="/organizer" className="text-emerald-700 font-semibold hover:underline">
                  Register as Organizer
                </Link>
              </div>
              <div className="pt-2 text-[11px]">
                Are you a Government Transport Officer?{" "}
                <Link href="/gov/login" className="text-indigo-600 font-semibold hover:underline">
                  Government Mission Control
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
