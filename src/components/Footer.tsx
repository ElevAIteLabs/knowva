import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Twitter,
  Linkedin,
  Github,
  Instagram,
  Mail,
  ChevronRight,
  Send,
  Users,
  Briefcase,
  BarChart3,
  CreditCard,
  FileText,
  User,
  Building2,
  MessageSquare,
} from "lucide-react";
import logo from "@/assets/knowva-logo.png";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Newsletter subscription:", email);
    setEmail("");
  };

  return (
    <footer className="bg-gray-100 dark:bg-black border-t border-gray-200 dark:border-white/10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12">
          {/* Main Content - 4 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Left Column - Platform Description + Social Icons */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Platform</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Discover, compare, and choose the perfect AI tools for your workflow. Get expert guidance and stay ahead with the latest AI innovations.
                </p>
              </div>
              
              {/* Social Icons */}
              <div className="flex space-x-4">
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-pink-500 transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Column 1 - Platform Links */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Platform</h4>
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/categories" 
                    className="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors text-sm"
                  >
                    Categories
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/compare" 
                    className="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors text-sm"
                  >
                    Compare Tools
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/newsletter" 
                    className="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors text-sm"
                  >
                    Newsletter
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/consulting" 
                    className="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors text-sm"
                  >
                    Consulting
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2 - For Providers Links */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">For Providers</h4>
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/providers/submit" 
                    className="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors text-sm"
                  >
                    Submit Tool
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/providers/featured" 
                    className="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors text-sm"
                  >
                    Featured Listing
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/providers/analytics" 
                    className="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors text-sm"
                  >
                    Analytics
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/providers" 
                    className="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors text-sm"
                  >
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3 - Company Links */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/about" 
                    className="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors text-sm"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/blog" 
                    className="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors text-sm"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/careers" 
                    className="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors text-sm"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/contact" 
                    className="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors text-sm"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section - Newsletter + Copyright + Links */}
          <div className="border-t border-gray-200 dark:border-white/10 pt-8 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Newsletter */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Stay Updated</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Subscribe to our newsletter for the latest AI tools and updates.
                </p>
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-2 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm dark:text-white"
                  />
                  <button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Subscribe
                  </button>
                </form>
              </div>

              {/* Copyright + Links */}
              <div className="space-y-4">
                <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                  <Link to="/privacy" className="hover:text-orange-500 transition-colors">
                    Privacy
                  </Link>
                  <span className="text-gray-400">•</span>
                  <Link to="/terms" className="hover:text-orange-500 transition-colors">
                    Terms
                  </Link>
                  <span className="text-gray-400">•</span>
                  <Link to="/cookies" className="hover:text-orange-500 transition-colors">
                    Cookies
                  </Link>
                </div>
                <div className="text-sm text-gray-500">
                  © 2024 KNOWva. All rights reserved.
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
