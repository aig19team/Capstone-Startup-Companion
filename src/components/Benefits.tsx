import React from 'react';
import { Shield, User, Lightbulb } from 'lucide-react';

const Benefits = () => {
  const benefits = [
    {
      icon: Lightbulb,
      title: 'Instant Guidance Anytime',
      description: 'Get answers on business, taxes, HR, or marketing by typing or speaking directly through the chat interface.',
      accent: 'bg-white-500/10 border-white-500/20'
    },
    {
      icon: Shield,
      title: 'Stay Compliant with Ease',
      description: 'A simple tool that helps first‑time founders handle compliance without confusion or fear of complexity.',
      accent: 'bg-white-500/10 border-white-500/20'
    },
    {
      icon: User,
      title: 'Direct Access to Mentors',
      description: 'Connect with trusted mentors through shared contact details for personalized support when you need it.',
      accent: 'bg-white-500/10 border-white-500/20'
    }
  ];

  return (
    <section id="benefits" className="bg-black py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Why Choose Startup Companion?
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Everything you need to transform your service business idea into a thriving reality
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className={`p-8 rounded-xl border ${benefit.accent} hover:scale-105 transition-all duration-300 group`}
            >
              <div className="mb-6">
                <benefit.icon className="h-12 w-12 text-blue-500 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">
                {benefit.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;