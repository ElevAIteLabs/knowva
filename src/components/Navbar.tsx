import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, UserCircle, LogOut, LayoutDashboard, Sun, Moon } from "lucide-react";
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
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center p-3">
      <div className="w-full max-w-7xl">
        <div className="glass-morphism-pill dark:!bg-black/20 !bg-white/60 dark:!border-white/20 !border-black/10 flex items-center justify-between h-14 px-6 shadow-md dark:shadow-none">
          <Link to="/" className="flex items-center gap-2 mt-5">
            <img src={logo} alt="KNOWva" className="h-20 w-auto dark:invert-0 invert" style={{ filter: theme === 'light' ? 'brightness(0)' : 'none' }} />
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${location.pathname === link.path
                  ? "dark:text-white text-black dark:bg-white/20 bg-black/10 backdrop-blur-sm border dark:border-white/30 border-black/20"
                  : "dark:text-white/80 text-black/70 hover:text-black dark:hover:text-white dark:hover:bg-white/10 hover:bg-black/5"
                  }`}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold transition-all duration-300 ${location.pathname === "/admin"
                  ? "text-orange-600 dark:text-orange-400 dark:bg-orange-400/10 bg-orange-500/10 backdrop-blur-sm border dark:border-orange-400/30 border-orange-500/30"
                  : "text-orange-600/80 dark:text-orange-400/80 hover:text-orange-600 dark:hover:text-orange-400 dark:hover:bg-orange-400/10 hover:bg-orange-500/10"
                  }`}
              >
                <LayoutDashboard size={16} /> Dashboard
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 mr-2 dark:text-white/80 text-black/70 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-all"
              title="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-full border dark:border-white/10 border-black/10 dark:bg-white/5 bg-black/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all cursor-pointer">
                  <UserCircle size={16} className="dark:text-white/60 text-black/60" />
                  <span className="text-sm dark:text-white/80 text-black/80 font-medium truncate max-w-[100px]">{user.email.split('@')[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1.5 dark:text-white/60 text-black/60 hover:text-black dark:hover:text-white dark:hover:bg-white/10 hover:bg-black/10 rounded-full transition-all"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-1.5 text-sm font-medium rounded-full border dark:border-white/20 border-black/20 dark:text-white/80 text-black/80 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-300"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-1.5 text-sm font-medium rounded-full bg-gradient-to-r from-primary to-orange-600 text-black font-semibold hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all duration-300 shadow-md"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 dark:text-white/80 text-black/80 hover:text-black dark:hover:text-white"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 dark:text-white/80 text-black/80 hover:text-black dark:hover:text-white"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-morphism-pill dark:!bg-black/20 !bg-white/60 dark:!border-white/20 !border-black/10 mt-4 mx-auto max-w-md shadow-md dark:shadow-none"
          >
            <div className="p-6 flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 text-center ${location.pathname === link.path
                    ? "dark:text-white text-black dark:bg-white/20 bg-black/10 backdrop-blur-sm border dark:border-white/30 border-black/20"
                    : "dark:text-white/80 text-black/70 hover:text-black dark:hover:text-white dark:hover:bg-white/10 hover:bg-black/5"
                    }`}
                >
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-full text-sm font-bold transition-all duration-300 text-center ${location.pathname === "/admin"
                    ? "text-orange-600 dark:text-orange-400 dark:bg-orange-400/10 bg-orange-500/10 backdrop-blur-sm border dark:border-orange-400/30 border-orange-500/30"
                    : "text-orange-600/80 dark:text-orange-400/80 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-500/10 dark:hover:bg-orange-400/10"
                    }`}
                >
                  <LayoutDashboard size={14} /> Dashboard
                </Link>
              )}
              <div className="flex flex-col gap-3 pt-3 border-t dark:border-white/20 border-black/10">
                {user ? (
                  <div className="flex items-center justify-between px-2">
                    <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 dark:text-white/80 text-black/80 hover:text-black dark:hover:text-white transition-all cursor-pointer">
                      <UserCircle size={18} />
                      <span className="text-sm font-medium">{user.email.split('@')[0]}</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileOpen(false);
                      }}
                      className="p-2 dark:text-white/60 text-black/60 hover:text-black dark:hover:text-white dark:bg-white/5 bg-black/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-all"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="px-3 py-2 text-sm font-medium rounded-full border dark:border-white/20 border-black/20 dark:text-white text-black hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-300 text-center"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMobileOpen(false)}
                      className="px-3 py-2 text-sm font-medium rounded-full bg-gradient-to-r from-primary to-orange-600 text-black font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-md hover:shadow-lg text-center"
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
