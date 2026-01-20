import { useState } from "react";
import { useLocation } from "wouter";
import BrainLogo from "@/components/BrainLogo";
import ThemeToggle from "@/components/ThemeToggle";

interface TopNavigationProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export default function TopNavigation({ onGetStarted, onSignIn }: TopNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [, setLocation] = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="top-nav">
      <div className="nav-container">
        {/* Logo */}
        <a href="#" className="nav-logo" onClick={(e) => { e.preventDefault(); setLocation('/landing'); }}>
          <div className="nav-logo-icon">
            <BrainLogo size={28} animate={true} />
          </div>
          <span>Smart PromptIQ</span>
        </a>

        {/* Desktop Navigation */}
        <div className={`nav-buttons ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <a
            href="tel:+17273045812"
            className="nav-btn nav-btn-ghost"
            style={{ color: '#f97316', fontWeight: 600 }}
          >
            📞 727-304-5812
          </a>
          <button
            onClick={() => setLocation('/contact')}
            className="nav-btn nav-btn-ghost"
          >
            Contact
          </button>
          <ThemeToggle />
          <button
            onClick={onSignIn}
            className="nav-btn nav-btn-ghost"
          >
            Sign In
          </button>
          <button
            onClick={onGetStarted}
            className="nav-btn nav-btn-primary"
          >
            ✨ Get Started
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-nav-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>
    </nav>
  );
}