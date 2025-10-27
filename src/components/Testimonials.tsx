import React from 'react';
import { Star, Quote } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      quote: "As a first-time founder, Startup Companion took all the fear out of registrations and compliance. I registered my LLP with zero hassle.",
      author: "Rajesh S.",
      role: "Founder",
      company: "Management Consultant, Mumbai"
    },
    {
      quote: "The financial setup agent was incredible! They helped me find grants I didn't even know existed and set up my business banking in less than 30 minutes.",
      author: "Emily K.",
      role: "Co-founder",
      company: "Marketing Agency, Kolkatta"
    },
    {
      quote: "Everything was built for beginners like me—from legal templates to step-by-step workflows. Highly recommended!",
      author: "Swetha M.",
      role: "Small Business Owner",
      company: "Hyderabad"
    }
  ];

  return (
    <section id="testimonials" className="bg-black-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-2xl font-bold text-white mb-6">
            What Our Founders Say
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Real stories from entrepreneurs who transformed their ideas into successful businesses
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-black/50 rounded-xl border border-gray-700 p-8 hover:border-blue-500/30 transition-all duration-300 group"
            >
              {/* Quote Icon */}
              <Quote className="h-8 w-8 text-white-500 mb-6 group-hover:scale-110 transition-transform duration-300" />

              {/* Stars */}
              <div className="flex space-x-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-300 leading-relaxed mb-8 text-lg">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="border-t border-gray-700 pt-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {testimonial.author.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">
                      {testimonial.author}
                    </h4>
                    <p className="text-gray-400 text-sm">
                      {testimonial.role}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;