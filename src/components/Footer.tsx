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
    <footer className="bg-secondary/30 dark:bg-card border-t border-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12">
          {/* Main Content - 2 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            
            {/* Left Column - Platform Description + Social Icons */}
            <div className="space-y-6">
              <div className="space-y-4">
                <Link to="/" className="inline-block transition-transform active:scale-95">
                  <img
                    src={logo}
                    alt="KNOWva"
                    className="h-10 sm:h-12 w-auto object-contain"
                  />
                </Link>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                  Discover, compare, and choose the perfect AI tools for your workflow. Get expert guidance and stay ahead with the latest AI innovations.
                </p>
              </div>
              
              {/* Social Icons */}
              <div className="flex space-x-4">
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-500 transition-colors bg-secondary/50 p-2 rounded-full"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-600 transition-colors bg-secondary/50 p-2 rounded-full"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-900 transition-colors bg-secondary/50 p-2 rounded-full"
                >
                  <Github className="w-4 h-4" />
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-pink-500 transition-colors bg-secondary/50 p-2 rounded-full"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Middle Column - Exploration */}
            <div className="space-y-4">
              <h4 className="text-sm font-black uppercase tracking-widest text-foreground/80 mb-6">Exploration</h4>
              <ul className="space-y-3">
                <li>
                  <Link 
                    to="/all-tools" 
                    className="text-muted-foreground hover:text-primary transition-all text-sm font-medium flex items-center gap-2 group"
                  >
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /> All Tools
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/compare" 
                    className="text-muted-foreground hover:text-primary transition-all text-sm font-medium flex items-center gap-2 group"
                  >
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /> Compare Tools
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/community" 
                    className="text-muted-foreground hover:text-primary transition-all text-sm font-medium flex items-center gap-2 group"
                  >
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /> Community Collective
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
