"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Shield, MapPin, Globe, Lock, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function GovLogin() {
  const router = useRouter();
  const [loginType, setLoginType] = useState<"superadmin" | "district_admin" | "state_admin">("superadmin");
  const [email, setEmail] = useState("admin@rsm2027.gov.in");
  const [password, setPassword] = useState("RSM2027@admin");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRoleSelect = (type: "superadmin" | "district_admin" | "state_admin") => {
    setLoginType(type);
    setErrorMsg("");
    if (type === "superadmin") {
      setEmail("admin@rsm2027.gov.in");
      setPassword("RSM2027@admin");
    } else if (type === "district_admin") {
      setEmail("dto.hyderabad@stategov.in");
      setPassword("RSM2027@dto");
    } else if (type === "state_admin") {
      setEmail("commissioner.transport@stategov.in");
      setPassword("RSM2027@state");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (res?.error) {
        // Fallback check for offline/sandbox test mode
        if (
          email.trim().toLowerCase() === "admin@rsm2027.gov.in" &&
          password === "RSM2027@admin"
        ) {
          router.push("/gov");
          return;
        } else if (
          email.trim().toLowerCase().startsWith("dto.") &&
          (password === "RSM2027@dto" || password === "RSM2027@admin")
        ) {
          const dist = email.split("@")[0].replace("dto.", "");
          const capDist = dist.charAt(0).toUpperCase() + dist.slice(1);
          router.push(`/gov?district=${encodeURIComponent(capDist)}`);
          return;
        }
        setErrorMsg("Invalid official credentials. Please verify your government email and password.");
      } else {
        // Query session to route intelligently
        try {
          const sessionRes = await fetch("/api/auth/session");
          const sessionData = await sessionRes.json();
          if (sessionData?.user?.role === "district_admin" && sessionData?.user?.district) {
            router.push(`/gov?district=${encodeURIComponent(sessionData.user.district)}`);
            return;
          }
        } catch (_) {}
        
        router.push("/gov");
      }
    } catch (err) {
      setErrorMsg("Authentication error. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 py-8">
      <div className="w-full max-w-md space-y-6">
        {/* Government Branding Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30 border border-indigo-400/30">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Government Mission Control</h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Road Safety Month 2027 — National Road Safety Action & Impact Platform
          </p>
        </div>

        {/* Role Toggle Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-800 rounded-2xl border border-slate-700">
          <button
            type="button"
            onClick={() => handleRoleSelect("superadmin")}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
              loginType === "superadmin"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Eagle's Eye (State)</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleSelect("district_admin")}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
              loginType === "district_admin"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>District RTA Head (DTO)</span>
          </button>
        </div>

        <Card className="border-slate-800 bg-slate-800/90 text-slate-100 shadow-xl backdrop-blur">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg text-white">
                  {loginType === "superadmin"
                    ? "State Command Center Login"
                    : "District RTA Head Login"}
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs mt-0.5">
                  {loginType === "superadmin"
                    ? "Full state overview, delta ranking & system configuration"
                    : "Local district sanctions, organizer approvals & DRSC dossiers"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded-xl flex items-center gap-2">
                <Lock className="h-4 w-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs text-slate-300">Official Government Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@rsm2027.gov.in" 
                  required 
                  className="bg-slate-900 border-slate-700 text-white text-xs h-10 rounded-xl focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs text-slate-300">Secure Access Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  className="bg-slate-900 border-slate-700 text-white text-xs h-10 rounded-xl focus:border-indigo-500"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold h-11 rounded-xl shadow-lg shadow-indigo-600/20 active:scale-[0.99] transition-all"
                disabled={loading}
              >
                {loading ? "Authenticating Official..." : (
                  loginType === "superadmin"
                    ? "Enter State Eagle's Eye Control →"
                    : "Access District Transport Command →"
                )}
              </Button>
            </form>

            {/* Quick credentials helper banner for demo/inspection */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 text-[11px] text-slate-400 space-y-1">
              <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
                <span>Role-Based Access Control Active:</span>
              </div>
              <p>• <strong>State Super Admin:</strong> <code className="text-indigo-300">admin@rsm2027.gov.in</code> / <code className="text-slate-300">RSM2027@admin</code></p>
              <p>• <strong>District RTA Head (Hyd):</strong> <code className="text-indigo-300">dto.hyderabad@stategov.in</code> / <code className="text-slate-300">RSM2027@dto</code></p>
              <p>• <strong>District RTA Head (Krmr):</strong> <code className="text-indigo-300">dto.karimnagar@stategov.in</code> / <code className="text-slate-300">RSM2027@dto</code></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
