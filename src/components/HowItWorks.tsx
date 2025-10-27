import React from 'react';
import { UserPlus, Settings, MessageSquare, Phone, History } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: UserPlus,
      title: 'On-boarding',
      description: 'Register and sign in to StartUP Companion with a simple process.',
      accent: 'bg-black-500/10 border-white-500/20'
    },
    {
      icon: Settings,
      title: 'Choose Your Service',
      description: 'Select the support you need—such as idea tuning, registration, compliance, branding, or HR.',
      accent: 'bg-black-500/10 border-white-500/20'
    },
    {
      icon: MessageSquare,
      title: 'Get Personalized Guidance',
      description: 'Receive clear, tailored information to help you start your business.',
      accent: 'bg-black-500/10 border-white-500/20'
    },
    {
      icon: Phone,
      title: 'Connect with Mentors',
      description: 'If you need more clarity, connect directly with trusted mentors matched to your needs.',
      accent: 'bg-black-500/10 border-white-500/20'
    },
    {
      icon: History,
      title: 'Access Your History',
      description: 'Return anytime with new queries—your past interactions and history are always saved for easy reference.',
      accent: 'bg-black-500/10 border-white-500/20'
    }
  ];

  return (
    <section id="how-it-works" className="bg-black-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            How Does It Work?
          </h2>
          <p className="text-xl text-white-400 max-w-2xl mx-auto">
            Simple steps to transform your business idea into reality
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`p-6 rounded-xl border ${step.accent} hover:scale-105 transition-all duration-300 group relative`}
            >
              {/* Step Number */}
              <div className="absolute top-3 right-3 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">{index + 1}</span>
              </div>
              
              <div className="mb-4">
                <step.icon className="h-8 w-8 text-white-500 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">
                {step.title}
              </h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;