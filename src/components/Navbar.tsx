import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, UserCircle, LogOut, LayoutDashboard, Sun, Moon, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/knowva-logo.png";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Categories", path: "/categories" },
  { label: "Compare", path: "/compare" },
  // { label: "Newsletter", path: "/newsletter" },
  // { label: "Consulting", path: "/consulting" },
  // { label: "For Providers", path: "/providers" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<{ email: string } | null>(null);
  
  const [theme, setTheme] = useState<"light" | "dark">(
    () => (localStorage.getItem("theme") as "light" | "dark") || "dark"
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
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center p-3 font-sans">
      <div className="w-full max-w-7xl relative">
        <div className="glass-morphism-pill dark:!bg-black/20 !bg-white/60 dark:!border-white/20 !border-black/10 flex items-center justify-between h-14 px-6 shadow-md dark:shadow-none relative overflow-hidden backdrop-blur-xl">
          
          {/* Logo Section */}
          <div className="flex items-center flex-1">
            <Link to="/" className="flex items-center gap-2 mt-5 transition-transform hover:scale-105">
              <img 
                src={logo} 
                alt="KNOWva" 
                className="h-20 w-auto dark:invert-0 invert" 
                style={{ filter: theme === 'light' ? 'brightness(0)' : 'none' }} 
              />
            </Link>
          </div>

          {/* Desktop Navigation Links - Perfectly Centered */}
          <div className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2 h-full py-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-2 text-sm font-semibold tracking-tight transition-colors duration-500 rounded-full group ${
                    isActive
                      ? "text-primary"
                      : "dark:text-white/60 text-black/60 hover:text-black dark:hover:text-white"
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
                  <div className="absolute inset-0 bg-black/5 dark:bg-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />
                </Link>
              );
            })}
            
            {isAdmin && (
              <Link
                to="/admin"
                className={`relative flex items-center gap-1.5 px-4 py-2 text-sm font-bold transition-all duration-500 rounded-full group ${
                  location.pathname === "/admin"
                    ? "text-orange-500"
                    : "text-orange-600/60 dark:text-orange-400/60 hover:text-orange-600 dark:hover:text-orange-400"
                }`}
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  <LayoutDashboard size={14} /> Dashboard
                </span>
                {location.pathname === "/admin" && (
                  <motion.div
                    layoutId="active-nav-pill"
                    className="absolute inset-0 bg-orange-500/10 border border-orange-500/20 rounded-full z-0"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                  />
                )}
                <div className="absolute inset-0 bg-orange-500/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />
              </Link>
            )}
          </div>

          {/* Actions / Auth Section */}
          <div className="hidden md:flex items-center justify-end gap-3 flex-1">
            <button
              onClick={toggleTheme}
              className="p-2 mr-1 dark:text-white/80 text-black/70 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-all duration-300"
              title="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <Link 
                  to="/profile" 
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border dark:border-white/10 border-black/10 dark:bg-white/5 bg-black/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all cursor-pointer group"
                >
                  <UserCircle size={16} className="dark:text-white/40 text-black/40 group-hover:text-primary transition-colors" />
                  <span className="text-sm dark:text-white/80 text-black/80 font-medium truncate max-w-[100px]">
                    {user.email.split('@')[0]}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 dark:text-white/40 text-black/40 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-1.5 text-sm font-medium rounded-full dark:text-white/80 text-black/80 hover:text-black dark:hover:text-white transition-all duration-300"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2 text-sm font-bold rounded-full bg-primary text-black hover:shadow-[0_8px_20px_rgba(255,179,71,0.3)] transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right Controls */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 dark:text-white/80 text-black/80 hover:text-black dark:hover:text-white rounded-full transition-colors"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 dark:text-white/80 text-black/80 hover:text-black dark:hover:text-white rounded-full transition-colors"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden absolute top-[70px] left-3 right-3 glass-morphism-pill dark:!bg-black/40 !bg-white/80 dark:!border-white/10 !border-black/5 py-4 px-6 shadow-2xl backdrop-blur-2xl rounded-3xl"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 text-center ${
                    location.pathname === link.path
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
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 text-center ${
                    location.pathname === "/admin"
                      ? "bg-orange-500/10 text-orange-500 border border-orange-500/20"
                      : "text-orange-500/60 dark:text-orange-400/60 hover:bg-orange-500/5"
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
                    className="flex items-center justify-between p-4 rounded-2xl bg-secondary/50 border border-border"
                  >
                    <div className="flex items-center gap-3 text-foreground font-bold">
                      <UserCircle size={18} />
                      <span>{user.email.split('@')[0]}</span>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground" />
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileOpen(false);
                    }}
                    className="w-full py-3 rounded-2xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="py-3 text-sm font-bold rounded-2xl border border-border text-foreground text-center"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="py-3 text-sm font-bold rounded-2xl bg-primary text-black text-center"
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
