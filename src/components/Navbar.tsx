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
    () => (localStorage.getItem("theme") as "light" | "dark") || "dark"
  );

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark" && user) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme, user]);

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
        <div className="glass-morphism-pill !bg-black-700/80 border border-white/10 flex items-center justify-between h-16 sm:h-20 md:h-24 px-4 sm:px-6 md:px-8 relative overflow-hidden backdrop-blur-3xl rounded-full transition-all duration-300">

          <div className="flex items-center flex-1">
            <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-110">
              <img
                src={logo}
                alt="KNOWva"
                className="h-20 sm:h-32 md:h-40 w-auto object-contain transition-all duration-300 translate-y-2 sm:translate-y-4"
                style={{
                  filter: 'invert(79%) sepia(87%) saturate(541%) hue-rotate(334deg) brightness(101%) contrast(101%)'
                }}
              />
            </Link>
          </div>

          {/* Desktop Navigation Links - Centered */}
          <div className="hidden md:flex items-center gap-10 absolute left-1/2 -translate-x-1/2 h-full py-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-6 py-2.5 text-lg font-medium tracking-tight transition-all duration-300 rounded-full whitespace-nowrap group ${isActive
                    ? "text-primary bg-primary/10 border border-primary/20 backdrop-blur-md"
                    : "text-white/70 hover:text-white bg-white/5 backdrop-blur-sm border border-transparent hover:border-white/10"
                    }`}
                >
                  <span className="relative z-10">{link.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-pill"
                      className="absolute inset-0 bg-primary/20 border border-primary/30 rounded-full z-0"
                      transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                    />
                  )}
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                to="/admin"
                className={`relative flex items-center gap-2 px-6 py-2.5 text-lg font-medium transition-all duration-300 rounded-full group ${location.pathname === "/admin"
                  ? "text-primary bg-primary/10 border border-primary/20"
                  : "text-white/70 bg-white/5 backdrop-blur-sm border border-transparent hover:border-white/10"
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
          <div className="hidden md:flex items-center justify-end gap-3 flex-1">
            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleTheme}
                  className="p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300 border border-white/10 backdrop-blur-md mr-1"
                  title="Toggle Theme"
                >
                  {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <div className="flex items-center gap-2">
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                  >
                    <UserCircle size={24} className="text-white/70 transition-colors" />
                    <span className="text-lg text-white/80 font-medium truncate max-w-[150px]">
                      {user.email.split('@')[0]}
                    </span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-8 py-3 text-lg font-bold rounded-full border border-white/10 text-white/80 hover:bg-white/5 transition-all duration-300 backdrop-blur-md"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-8 py-3 text-lg font-bold rounded-full bg-primary text-black transition-all duration-300"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2.5 bg-white/5 border border-white/10 dark:text-white/80 text-white/80 hover:text-white dark:hover:text-white rounded-full transition-all duration-300 backdrop-blur-md"
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
            className="md:hidden absolute top-[85px] sm:top-[95px] left-4 right-4 !bg-black-700/90 border border-white/10 py-6 px-6 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl z-[100]"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 text-center ${location.pathname === link.path
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
