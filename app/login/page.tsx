"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ShieldCheck, ArrowRight, Lock, 
  Smartphone, Store, Scissors, Loader2, Mail, ChevronLeft 
} from "lucide-react";

export default function UnifiedLogin() {
  const router = useRouter();
  const [role, setRole] = useState<"owner" | "stylist">("owner");
  const [isLoading, setIsLoading] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (role === "owner") {
        router.push("/dashboard/owner/review"); 
      } else {
        router.push("/dashboard/stylist/schedule");
      }
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
      
      {/* Back to Home Link */}
      <Link 
        href="/" 
        className="flex items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors mb-6 font-bold text-sm"
      >
        <ChevronLeft size={16} /> Back to Home
      </Link>

      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        
        <div className="bg-blue-600 p-8 text-white text-center space-y-2">
          <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Partner Portal</h1>
          <p className="text-blue-100 text-sm font-medium">Access your shop management tools</p>
        </div>

        <div className="p-8">
          {/* Role Switcher */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
            <button 
              type="button"
              onClick={() => { setRole("owner"); setIdentifier(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${role === "owner" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <Store size={18} /> Owner
            </button>
            <button 
              type="button"
              onClick={() => { setRole("stylist"); setIdentifier(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${role === "stylist" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <Scissors size={18} /> Stylist
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Input Field */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-400 ml-1">
                {role === "owner" ? "Email or Mobile Number" : "Registered Mobile Number"}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  {role === "owner" && identifier.includes('@') ? (
                    <Mail size={18} />
                  ) : (
                    <Smartphone size={18} />
                  )}
                </div>
                <input 
                  required
                  type="text" 
                  placeholder={role === "owner" ? "email@example.com or 98765..." : "98765 43210"}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50/50 transition-all font-medium text-slate-900"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-black uppercase text-slate-400">Password</label>
                <Link href="/forgot-password" className="text-xs font-bold text-blue-600 hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  required
                  type="password" 
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50/50 transition-all font-medium text-slate-900"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-70 mt-4 shadow-xl shadow-slate-900/10"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>Sign In <ArrowRight size={20} /></>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            {role === "owner" ? (
              <p className="text-slate-500 text-sm font-medium">
                Want to partner with us? 
                <Link href="/register-shop" className="text-blue-600 font-bold hover:underline ml-1">
                  Register your shop
                </Link>
              </p>
            ) : (
              <p className="text-slate-500 text-sm font-medium px-4 text-slate-400">
                Stylist access is granted via the shop owner.
              </p>
            )}
            
            <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              <ShieldCheck size={14} className="text-blue-600" /> Secure Partner Access
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}