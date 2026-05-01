import { SignUp } from "@clerk/clerk-react";
import { Activity, ShieldCheck, HeartPulse } from "lucide-react";
import { motion } from "framer-motion";

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-surface-50">
      {/* Left - Branding */}
      <div className="hidden lg:flex w-1/2 bg-brand-600 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center mix-blend-overlay opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900/80 to-transparent" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <Activity className="w-6 h-6 text-brand-600" />
            </div>
            <span className="text-xl font-display font-bold text-white tracking-wide">CURIFY AI</span>
          </div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white leading-tight mb-6">
              Join Curify AI Today
            </h1>
            <p className="text-brand-100 text-lg leading-relaxed mb-8">
              Create your secure patient account to unlock personalized healthcare navigation, smart hospital matching, and more.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-white">
                <ShieldCheck className="w-5 h-5 text-brand-300" />
                <span>Enterprise-grade security</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <HeartPulse className="w-5 h-5 text-brand-300" />
                <span>AI-powered health insights</span>
              </div>
            </div>
          </motion.div>
        </div>
        
        <div className="relative z-10 flex items-center gap-4 text-brand-200 text-sm">
          <span>© 2026 Curify AI</span>
          <span className="w-1 h-1 rounded-full bg-brand-400" />
          <span>Privacy Policy</span>
          <span className="w-1 h-1 rounded-full bg-brand-400" />
          <span>Terms of Service</span>
        </div>
      </div>
      
      {/* Right - Clerk */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-surface-50">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-brand-600/5 blur-3xl translate-x-1/3 -translate-y-1/3" />
        </div>
        
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 w-full max-w-md">
          <SignUp 
            routing="path" 
            path="/register" 
            signInUrl="/login" 
            fallbackRedirectUrl="/complete-profile" 
          />
        </motion.div>
      </div>
    </div>
  );
}
