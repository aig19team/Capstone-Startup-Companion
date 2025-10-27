import React from 'react';
import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

interface FooterProps {
  onNavigate?: (page: string) => void;
}

const Footer = ({ onNavigate }: FooterProps) => {
  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Why Choose', href: '#benefits' },
    { name: 'How it works', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Testimony', href: '#testimonials' },
    { name: 'FAQs', href: '#faq' },
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Instagram, href: '#', label: 'Instagram' },
  ];

  const handleGetStartedClick = () => {
    if (onNavigate) {
      onNavigate('signup');
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
    <footer className="bg-black-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid lg:grid-cols-3 gap-12 mb-12">
          {/* Logo and Tagline */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <img src="/Logo Gear.png" alt="StartUP Companion Logo" className="h-8 w-8" />
              <span className="text-xl font-bold text-white">StartUP Companion</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Ready to turn your service business spark into reality?
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Start your journey today with Startup Companion—your AI-powered guide from registration to launch.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-1">
            <h4 className="text-lg font-semibold text-white mb-6">Navigation</h4>
            <div className="grid grid-cols-2 gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Social Media */}
          <div className="lg:col-span-1">
            <h4 className="text-lg font-semibold text-white mb-6">Connect With Us</h4>
            <div className="flex space-x-4 mb-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5 text-gray-400 hover:text-white" />
                </a>
              ))}
            </div>
            <p className="text-gray-400 text-sm">
              Follow us for startup tips, success stories, and platform updates.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-black-600/10 to-black-600/10 border border-blue-500/20 rounded-xl p-8 mb-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Start Your Business Journey?
            </h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Join thousands of entrepreneurs who have successfully launched their service businesses with our expert guidance.
            </p>
            <button 
              onClick={handleGetStartedClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              Get Started Today
            </button>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <a href="#privacy" className="hover:text-white transition-colors duration-200">
                Privacy Policy
              </a>
              <span>•</span>
              <a href="#terms" className="hover:text-white transition-colors duration-200">
                Terms & Conditions
              </a>
            </div>
            <div className="text-sm text-gray-400">
              © {new Date().getFullYear()} Startup Companion. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;