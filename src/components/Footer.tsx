import { Link } from "react-router-dom";
import {
  Twitter,
  Linkedin,
  Github,
  Instagram,
  ChevronRight,
} from "lucide-react";
import logo from "@/assets/knowva-logo.png";

const Footer = () => {
  return (
    <footer className="bg-black text-white border-t border-white/5 transition-colors duration-300 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12">
          {/* Main Content - 2 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
            {/* Column 1: Logo */}
            <div className="flex justify-center md:justify-start -mt-8">
              <Link to="/" className="inline-block transition-transform active:scale-95 shrink-0">
                <img
                  src={logo}
                  alt="KNOWva"
                  className="h-28 sm:h-44 w-auto object-contain"
                />
              </Link>
            </div>

            {/* Column 2: Description (Higher up) */}
            <div className="flex flex-col items-center text-center mt-4">
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
                Discover, compare, and choose the perfect AI tools for your workflow. Get expert guidance and stay ahead with the latest AI innovations.
              </p>
            </div>

            {/* Column 3: Exploration & Socials (Starting from same point) */}
            <div className="flex flex-col items-center md:items-start space-y-8 md:ml-auto">
              <div className="space-y-4">
                <h4 className="text-sm font-black uppercase tracking-widest text-white/90">Exploration</h4>
                <ul className="space-y-3 flex flex-col items-center md:items-start">
                  <li>
                    <Link to="/all-tools" className="text-slate-400 hover:text-primary transition-all text-sm font-medium flex items-center gap-2 group">
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /> All Tools
                    </Link>
                  </li>
                  <li>
                    <Link to="/compare" className="text-slate-400 hover:text-primary transition-all text-sm font-medium flex items-center gap-2 group">
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /> Compare Tools
                    </Link>
                  </li>
                  <li>
                    <Link to="/community" className="text-slate-400 hover:text-primary transition-all text-sm font-medium flex items-center gap-2 group">
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /> Community Collective
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-black uppercase tracking-widest text-white/90">Connect</h4>
                <div className="flex space-x-3">
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary transition-colors bg-white/5 p-2 rounded-full">
                    <Twitter className="w-4 h-4" />
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary transition-colors bg-white/5 p-2 rounded-full">
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary transition-colors bg-white/5 p-2 rounded-full">
                    <Github className="w-4 h-4" />
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary transition-colors bg-white/5 p-2 rounded-full">
                    <Instagram className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
