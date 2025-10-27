import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  onNavigate?: (page: string) => void;
}

const Hero = ({ onNavigate }: HeroProps) => {
  const handleStartJourneyClick = () => {
    if (onNavigate) {
      onNavigate('signup');
    }
  };

  return (
    <section id="home" className="bg-black py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* App Name with Icon */}
          <div className="flex items-center justify-center space-x-3 mb-8">
            <img src="/Logo Gear.png" alt="StartUP Companion Logo" className="h-10 w-10" />
            <h1 className="text-4xl lg:text-6xl font-bold text-white">
              StartUP Companion
            </h1>
          </div>

          {/* Main Header */}
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-6 leading-tight max-w-5xl mx-auto">
            Personalized guidance for setting up your business in 
            <span className="text-blue-500"> less than 30 minutes</span>
          </h2>

          {/* Sub-headers */}
          <div className="space-y-4 mb-8">
            <p className="text-lg lg:text-xl text-white-400 max-w-4xl mx-auto leading-relaxed">
              Your one-stop shop — get expert guidance on legal requirements, registration, 
              financial options, branding and HR all tailored to your unique business idea.
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button 
              onClick={handleStartJourneyClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 hover:scale-105 flex items-center space-x-2 shadow-2xl"
            >
              <span>Start Your Journey</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            <button 
              onClick={handleStartJourneyClick}
              className="border-2 border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200"
            >
              Try it for Free
            </button>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 pt-8 border-t border-gray-800">
            <p className="text-gray-400 text-sm mb-4">Trusted by entrepreneurs across India</p>
            <div className="flex items-center justify-center space-x-8 text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Personalized</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Reliable</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Beginner Friendly</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;