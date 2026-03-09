import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, UserCircle, LogOut, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/knowva-logo.png";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Categories", path: "/categories" },
  { label: "Compare", path: "/compare" },
  { label: "Newsletter", path: "/newsletter" },
  { label: "Consulting", path: "/consulting" },
  { label: "For Providers", path: "/providers" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    const handleStorageChange = () => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          setUser(JSON.parse(userStr));
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    handleStorageChange();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const isAdmin = user?.email === "admin@knowva.com";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center p-3">
      <div className="w-full max-w-7xl">
        <div className="glass-morphism-pill flex items-center justify-between h-12 px-6">
          <Link to="/" className="flex items-center gap-2 mt-5">
            <img src={logo} alt="KNOWva" className="h-20 w-auto" />
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300 ${location.pathname === link.path
                  ? "text-white bg-white/20 backdrop-blur-sm border border-white/30"
                  : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-300 ${location.pathname === "/admin"
                  ? "text-orange-400 bg-orange-400/10 backdrop-blur-sm border border-orange-400/30"
                  : "text-orange-400/80 hover:text-orange-400 hover:bg-orange-400/10"
                  }`}
              >
                <LayoutDashboard size={14} /> Dashboard
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
                  <UserCircle size={16} className="text-white/60" />
                  <span className="text-xs text-white/80 font-medium truncate max-w-[100px]">{user.email.split('@')[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-1.5 text-xs font-medium rounded-full border border-white/20 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-1.5 text-xs font-medium rounded-full bg-gradient-to-r from-primary to-orange-600 text-black font-semibold hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all duration-300 shadow-md"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-white/80 hover:text-white"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-morphism-pill mt-4 mx-auto max-w-md"
          >
            <div className="p-6 flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2 rounded-full text-xs font-medium transition-all duration-300 text-center ${location.pathname === link.path
                    ? "text-white bg-white/20 backdrop-blur-sm border border-white/30"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                >
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-full text-xs font-bold transition-all duration-300 text-center ${location.pathname === "/admin"
                    ? "text-orange-400 bg-orange-400/10 backdrop-blur-sm border border-orange-400/30"
                    : "text-orange-400/80 hover:text-orange-400 hover:bg-orange-400/10"
                    }`}
                >
                  <LayoutDashboard size={14} /> Dashboard
                </Link>
              )}
              <div className="flex flex-col gap-3 pt-3 border-t border-white/20">
                {user ? (
                  <div className="flex items-center justify-between px-2">
                    <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-white/80 hover:text-white transition-all cursor-pointer">
                      <UserCircle size={18} />
                      <span className="text-sm font-medium">{user.email.split('@')[0]}</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileOpen(false);
                      }}
                      className="p-2 text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="px-3 py-2 text-xs font-medium rounded-full border border-white/20 text-white hover:bg-white/10 transition-all duration-300 text-center"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMobileOpen(false)}
                      className="px-3 py-2 text-xs font-medium rounded-full bg-gradient-to-r from-primary to-orange-600 text-black font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-md hover:shadow-lg text-center"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
