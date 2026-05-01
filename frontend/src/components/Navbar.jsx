import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Activity, LogOut, User, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-surface-950/80 backdrop-blur-xl border-b border-surface-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center
                          group-hover:shadow-lg group-hover:shadow-brand-500/25 transition-shadow duration-300">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-white">
              CURIFY <span className="text-brand-400">AI</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link to="/dashboard" className="text-sm text-surface-400 hover:text-white transition-colors group">
                  Welcome, <span className="text-brand-300 font-medium group-hover:text-brand-200">{user.name}</span>
                </Link>
                {user.role && <span className="badge-blue capitalize">{user.role}</span>}
                {user.role === "patient" && location.pathname !== "/search" && (
                  <Link to="/search" className="btn-secondary text-sm">Search</Link>
                )}
                {user.role === "lender" && location.pathname !== "/lender-dashboard" && (
                  <Link to="/lender-dashboard" className="btn-secondary text-sm">Dashboard</Link>
                )}
                <Link to="/dashboard" className="text-sm text-surface-400 hover:text-white transition-colors">Profile</Link>

                <button onClick={handleLogout} className="flex items-center gap-1.5 text-surface-400 hover:text-rose-400 transition-colors text-sm">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm">Login</Link>
                <Link to="/register" className="btn-primary text-sm">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden text-surface-300" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-surface-700/50 mt-2 pt-4 space-y-3 animate-fade-in">
            {user ? (
              <>
                <Link to="/dashboard" className="block text-sm text-surface-300 px-2 py-2 hover:bg-surface-800/50 rounded-lg transition-colors" onClick={() => setMobileOpen(false)}>
                  <User className="w-4 h-4 inline mr-1" /> {user.name} {user.role && `(${user.role})`}
                </Link>
                {user.role === "patient" && location.pathname !== "/search" && (
                  <Link to="/search" className="block btn-secondary text-sm text-center" onClick={() => setMobileOpen(false)}>Search Hospitals</Link>
                )}
                <Link to="/dashboard" className="block text-center text-sm text-surface-400 py-2" onClick={() => setMobileOpen(false)}>My Profile</Link>

                <button onClick={handleLogout} className="w-full text-center text-sm text-rose-400 py-2">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block btn-secondary text-sm text-center" onClick={() => setMobileOpen(false)}>Login</Link>
                <Link to="/register" className="block btn-primary text-sm text-center" onClick={() => setMobileOpen(false)}>Get Started</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
