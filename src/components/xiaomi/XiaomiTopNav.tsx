import React, { useState, useEffect } from "react";
import { User, Search, ShoppingCart, ChevronRight, Hexagon } from "lucide-react";
import { motion } from "motion/react";

interface XiaomiTopNavProps {
  onSignIn: () => void;
  onEnterDashboard: () => void;
  activeSection: string;
  onSelectSection: (sectionId: string) => void;
}

export const XiaomiTopNav: React.FC<XiaomiTopNavProps> = ({
  onSignIn,
  onEnterDashboard,
  activeSection,
  onSelectSection,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { id: "hero", label: "Global Overview" },
    { id: "design", label: "IoT & Smart Building" },
    { id: "optics", label: "IT Helpdesk" },
    { id: "display", label: "CMMS & Facilities" },
    { id: "battery", label: "ESG & Energy" },
    { id: "specs", label: "Specifications" },
  ];

  return (
    <header className="w-full relative z-50 font-sans">
      {/* 1. Global Xiaomi Black Top Bar */}
      <div className="w-full bg-[#191919] text-[#b0b0b0] text-[12px] h-10 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 bg-[#10b981] flex items-center justify-center text-white font-bold text-xs">
            <Hexagon className="w-4 h-4" />
          </div>
          <nav className="hidden md:flex items-center gap-4 font-normal">
            <span className="text-white transition-colors cursor-pointer">LACAZA OS</span>
            <span className="hover:text-white transition-colors cursor-pointer">Facility Management</span>
            <span className="hover:text-white transition-colors cursor-pointer">ITSM & ITAM</span>
            <span className="hover:text-white transition-colors cursor-pointer">Workspace</span>
          </nav>
        </div>

        <div className="flex items-center gap-4 font-normal">
          <span className="hover:text-white transition-colors cursor-pointer">Blog</span>
          <span className="hover:text-white transition-colors cursor-pointer">Support</span>
          <div className="flex items-center gap-3 ml-2">
            <Search className="w-4 h-4 hover:text-white cursor-pointer" />
            <User onClick={onSignIn} className="w-4 h-4 hover:text-white cursor-pointer" />
          </div>
        </div>
      </div>

      {/* 2. Floating Sticky Product Sub-Navigation Bar */}
      <div 
        className={`w-full transition-all duration-300 ${
          isScrolled 
            ? "fixed top-0 bg-[rgba(25,25,25,0.95)] backdrop-blur-md border-b border-white/5" 
            : "bg-[#000000] border-b border-white/10"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          {/* Product Title */}
          <div className="flex items-center gap-4">
            <span 
              onClick={() => onSelectSection("hero")}
              className="text-white font-semibold text-lg tracking-tight cursor-pointer"
            >
              LACAZA CAFM & IT
            </span>
          </div>

          {/* Center/Right Navigation Links */}
          <div className="flex items-center gap-6">
            <nav className="hidden lg:flex items-center gap-6 text-[13px] font-medium">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => onSelectSection(link.id)}
                  className={`transition-colors cursor-pointer ${
                    activeSection === link.id
                      ? "text-[#10b981]"
                      : "text-neutral-300 hover:text-white"
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </nav>

            <button
              onClick={onEnterDashboard}
              className="ml-4 px-5 py-2 rounded-full bg-white text-black hover:bg-neutral-200 text-[13px] font-semibold transition-all duration-200 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            >
              Access Portal
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
