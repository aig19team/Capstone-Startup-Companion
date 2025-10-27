import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  onNavigate?: (page: string) => void;
}

const Header = ({ onNavigate }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Why Choose', href: '#benefits' },
    { name: 'How it works', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Testimony', href: '#testimonials' },
    { name: 'FAQs', href: '#faq' },
  ];

  const handleSignupClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('signup');
    }
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('home');
    }
  };

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('login');
    }
  };

  const handleNavClick = (href: string) => {
    if (href.startsWith('#') && onNavigate) {
      onNavigate('home');
      // Small delay to ensure page loads before scrolling
      setTimeout(() => {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <header className="bg-black/90 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button 
            onClick={handleHomeClick}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200"
          >
            <img src="/Logo Gear.png" alt="StartUP Companion Logo" className="h-8 w-8" />
            <span className="text-xl font-bold text-white">StartUP Companion</span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-gray-300 hover:text-white transition-colors duration-200 font-medium cursor-pointer"
              >
                {link.name}
              </a>
            ))}
            <div className="flex items-center space-x-4 ml-8">
              <a
                href="#login"
                onClick={handleLoginClick}
                className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
              >
                Login
              </a>
              <a
                href="#signup"
                onClick={handleSignupClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Signup
              </a>
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white transition-colors duration-200"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-800 py-4">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-gray-300 hover:text-white transition-colors duration-200 font-medium py-2 cursor-pointer"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleNavClick(link.href);
                  }}
                >
                  {link.name}
                </a>
              ))}
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-800">
                <button
                  onClick={(e) => {
                    setIsMenuOpen(false);
                    handleLoginClick(e);
                  }}
                  className="text-gray-300 hover:text-white transition-colors duration-200 font-medium py-2 text-left"
                >
                  Login
                </button>
                <button
                  onClick={(e) => {
                    setIsMenuOpen(false);
                    handleSignupClick(e);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 text-center"
                >
                  Signup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;