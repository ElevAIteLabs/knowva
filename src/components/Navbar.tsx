import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, UserCircle, LogOut, LayoutDashboard, Sun, Moon, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/knowva-logo.png";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "All Tools", path: "/all-tools" },
  { label: "Community", path: "/community" },
  { label: "Compare", path: "/compare" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<{ email: string } | null>(null);

  const [theme, setTheme] = useState<"light" | "dark">(
    () => (localStorage.getItem("theme") as "light" | "dark") || "light"
  );

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

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
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center p-2 sm:p-4 font-sans">
      <div className="w-full max-w-7xl relative">
        <div className={`glass-morphism-pill border flex items-center justify-between h-14 sm:h-16 md:h-18 px-4 sm:px-6 md:px-6 relative backdrop-blur-3xl rounded-full transition-all duration-300 ${theme === 'dark'
          ? '!bg-black/70 border-white/10'
          : '!bg-slate-200/70 border-slate-500/70 shadow-sm'
          }`}>

          <div className="flex items-center flex-1">
            <Link to="/" className="inline-block">
              <img
                src={logo}
                alt="KNOWva"
                className="h-20 sm:h-36 w-auto object-contain translate-y-4 sm:translate-y-4"
              />
            </Link>
          </div>

          {/* Desktop Navigation Links - Centered */}
          <div className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2 h-full py-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-5 py-2 text-base font-medium tracking-tight transition-all duration-300 rounded-full whitespace-nowrap group ${isActive
                    ? "text-primary bg-primary/10 border border-primary/20 backdrop-blur-md"
                    : theme === 'dark'
                      ? "text-white/70 hover:text-white bg-white/5 border-transparent hover:border-white/10"
                      : "text-slate-600 hover:text-slate-900 bg-slate-400/5 border-transparent hover:border-slate-200"
                    }`}
                >
                  <span className="relative z-10">{link.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-pill"
                      className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-full z-0"
                      transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                    />
                  )}
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                to="/admin"
                className={`relative flex items-center gap-2 px-5 py-2 text-base font-medium transition-all duration-300 rounded-full group ${location.pathname === "/admin"
                  ? "text-primary bg-primary/10 border border-primary/20"
                  : theme === 'dark'
                    ? "text-white/70 bg-white/5 border-transparent hover:border-white/10"
                    : "text-slate-600 bg-slate-400/5 border-transparent hover:border-slate-200"
                  }`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <LayoutDashboard size={18} /> Dashboard
                </span>
                {location.pathname === "/admin" && (
                  <motion.div
                    layoutId="active-nav-pill"
                    className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-full z-0"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                  />
                )}
                <div className="absolute inset-0 bg-primary/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />
              </Link>
            )}
          </div>

          {/* Actions / Auth Section */}
          <div className="hidden md:flex items-center justify-end gap-5 flex-1">
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-full transition-all duration-300 border backdrop-blur-md hover:scale-110 active:scale-95 ${theme === 'dark'
                ? 'text-white/80 hover:text-white hover:bg-white/10 border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200 shadow-sm'
                }`}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className={`flex items-center gap-2.5 px-4 py-2 rounded-full border transition-all cursor-pointer group hover:shadow-lg ${theme === 'dark'
                    ? 'border-white/10 bg-white/5 hover:bg-white/10 text-white/90'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm'
                    }`}
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <UserCircle size={18} className="text-primary" />
                  </div>
                  <span className="text-sm font-bold tracking-tight truncate max-w-[120px]">
                    {user.email.split('@')[0]}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className={`p-2.5 rounded-full transition-all hover:bg-red-500/10 hover:text-red-500 border border-transparent ${theme === 'dark' ? 'text-white/60' : 'text-slate-400'
                    }`}
                  title="Sign Out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className={`text-sm font-black transition-all duration-300 hover:text-primary ${theme === 'dark' ? 'text-white/80' : 'text-slate-600'
                    }`}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-7 py-2.5 text-sm font-black rounded-full bg-slate-950 text-white hover:bg-primary hover:text-black transition-all duration-300 shadow-md hover:shadow-primary/20 active:scale-95"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`p-2.5 border rounded-full transition-all duration-300 backdrop-blur-md ${theme === 'dark'
                ? 'bg-white/5 border-white/10 text-white/80 hover:text-white'
                : 'bg-white/50 border-slate-200 text-slate-700 hover:text-slate-900 font-bold'
                }`}
              aria-label="Toggle Menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-[75px] sm:top-[85px] left-4 right-4 !bg-black-700/90 border border-white/10 py-5 px-5 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl z-[100]"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 text-center ${location.pathname === link.path
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "dark:text-white/60 text-black/60 hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                >
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 text-center ${location.pathname === "/admin"
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-foreground/60 hover:bg-primary/5"
                    }`}
                >
                  <LayoutDashboard size={14} /> Dashboard
                </Link>
              )}

              <div className="h-px bg-border my-2" />

              {user ? (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between p-5 rounded-2xl bg-secondary/50 border border-border"
                  >
                    <div className="flex items-center gap-4 text-foreground font-bold">
                      <UserCircle size={28} />
                      <span className="text-lg">{user.email.split('@')[0]}</span>
                    </div>
                    <ChevronRight size={20} className="text-muted-foreground" />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="py-2.5 text-xs font-bold rounded-2xl border border-border text-foreground text-center"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="py-2.5 text-xs font-bold rounded-2xl bg-primary text-black text-center"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
