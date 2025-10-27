import React from 'react';
import { Check, ArrowRight } from 'lucide-react';

interface PricingProps {
  onNavigate?: (page: string) => void;
}

const Pricing = ({ onNavigate }: PricingProps) => {
  const handleTryFreeClick = () => {
    if (onNavigate) {
      onNavigate('signup');
    }
  };

  return (
    <section id="pricing" className="bg-black py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Section Header */}
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            All-Inclusive Startup Journey
          </h2>
          <p className="text-xl text-gray-400 mb-12">
            Get every query answered
          </p>

          {/* Pricing Card */}
          <div className="max-w-md mx-auto">
            <div className="bg-black-900 rounded-2xl border border-gray-700 p-8 relative overflow-hidden">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
              
              <div className="relative z-10">
                {/* Badge */}
                <div className="inline-flex items-center px-4 py-2 bg-black-500/20 border border-black-500/30 rounded-full text-white-400 text-sm font-semibold mb-6">
                  Free Trial Available
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {[
                    'Legal compliance guidance',
                    'Tax and grant discovery',
                    'Branding assistance',
                    'HR policy templates',
                    'Local language support',
                    'Personalized mentor consultation'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Check className="h-5 w-5 text-white-500 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button 
                  onClick={handleTryFreeClick}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2 shadow-xl"
                >
                  <span>Try it for free now</span>
                  <ArrowRight className="h-5 w-5" />
                </button>

                <p className="text-sm text-gray-500 mt-4">
                  No credit card required • Start immediately
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;