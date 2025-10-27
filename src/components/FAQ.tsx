import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ = () => {
  const [openSections, setOpenSections] = useState({});
  const [openQuestions, setOpenQuestions] = useState({});

  const faqSections = [
    {
      title: 'General',
      questions: [
        {
          q: 'Can I use this app even if I don\'t have prior experience in law or business?',
          a: 'Absolutely! Each tool, template, and explainer is crafted for beginners.'
        },
        {
          q: 'Does the app fill out forms for me?',
          a: 'No; it only guides you through what forms are needed and where/who to contact for completion.'
        },
        {
          q: 'Who should use Startup Companion?',
          a: 'First-time service business founders in India needing straightforward, stepwise startup guidance.'
        },
        {
          q: 'Do you file documents for me?',
          a: 'No. We guide you step-by-step on what to file, where, and how. Final submission happens on official portals.'
        },
        {
          q: 'Does this help with all countries requirements?',
          a: 'Currently all guidance is tailored for Indian jurisdictions Legal & Compliance'
        },
        {
          q: 'Is Startup Companion a law firm?',
          a: 'No. It\'s an educational platform that simplifies processes and connects you to licensed experts when needed.'
        }
      ]
    },
    {
      title: 'Services',
      questions: [
        {
          q: 'Will this app guide me through government grants or schemes available for new businesses?',
          a: 'Yes, the Company Navigator matches relevant programs (Startup India, MSME) and demystifies eligibility.'
        },
        {
          q: 'Can you guarantee registration approval?',
          a: 'We can\'t guarantee government approvals, but our guidance reduces common errors that cause rejection.'
        },
        {
          q: 'Does this cover government schemes like Startup India or MSME Udyam?',
          a: 'Yes. The Compliance module highlights relevant programs, eligibility criteria, and application steps — including Startup India registration, MSME Udyam, and other grants.'
        },
        {
          q: 'Does Startup Companion help with GST registration and returns?',
          a: 'Yes. The Compliance module guides you through the GST registration process step by step, including required documents, application portals, and common pitfalls. We also provide checklists and timelines for filing GST returns. If you need hands-on assistance, Startup Companion connects you with vetted tax mentors (CAs, GST consultants).'
        },
        {
          q: 'Do you provide actual logos or just templates? Can AI create them?',
          a: 'Startup Companion gives branding templates and connects you to AI-powered logo generators. For unique, trademark-ready identities, vetted branding mentors are available.'
        },
        {
          q: 'Does Startup Companion ensure the name is unique and available?',
          a: 'Startup Companion helps you generate name ideas and immediately check for Domain availability; Trademark conflicts (via IP India / USPTO links); Business registry conflicts (India); Social media handles'
        },
        {
          q: 'Can I use this for product startups?',
          a: 'Startup Companion is optimized for service businesses but many steps apply to product-based startups too.'
        }
      ]
    },
    {
      title: 'Mentors',
      questions: [
        {
          q: 'What happens if I have a compliance question the AI can\'t solve?',
          a: 'The integrated Legal Desk connects you to human experts, on-demand.'
        },
        {
          q: 'Can AI replace a mentor?',
          a: 'No. AI gives quick guidance, but mentors bring real-world expertise, judgment, and accountability.'
        },
        {
          q: 'How are mentors vetted?',
          a: 'Every mentor is verified for credentials, track record, and ratings.'
        }
      ]
    },
    {
      title: 'Pricing',
      questions: [
        {
          q: 'Is this free?',
          a: 'Basic guidance is always free, with optional paid recommended expert consults for complex cases.'
        }
      ]
    }
  ];

  const toggleSection = (sectionIndex) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionIndex]: !prev[sectionIndex]
    }));
  };

  const toggleQuestion = (sectionIndex, questionIndex) => {
    const key = `${sectionIndex}-${questionIndex}`;
    setOpenQuestions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <section id="faq" className="bg-black py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-2xl font-bold text-white mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-400">
            Find answers to common questions about Startup Companion
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-6">
          {faqSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="bg-black-900 rounded-xl border border-gray-700 overflow-hidden">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(sectionIndex)}
                className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-gray-800 transition-colors duration-200"
              >
                <h3 className="text-xl font-bold text-white">
                  {section.title}
                </h3>
                {openSections[sectionIndex] ? 
                  <ChevronUp className="h-6 w-6 text-gray-400" /> : 
                  <ChevronDown className="h-6 w-6 text-gray-400" />
                }
              </button>

              {/* Questions */}
              {openSections[sectionIndex] && (
                <div className="border-t border-gray-700">
                  {section.questions.map((item, questionIndex) => (
                    <div key={questionIndex} className="border-b border-gray-700 last:border-b-0">
                      <button
                        onClick={() => toggleQuestion(sectionIndex, questionIndex)}
                        className="w-full px-8 py-4 flex items-center justify-between text-left hover:bg-gray-800/50 transition-colors duration-200"
                      >
                        <span className="text-gray-300 font-medium pr-4">
                          {item.q}
                        </span>
                        {openQuestions[`${sectionIndex}-${questionIndex}`] ? 
                          <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" /> : 
                          <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        }
                      </button>
                      {openQuestions[`${sectionIndex}-${questionIndex}`] && (
                        <div className="px-8 pb-4">
                          <p className="text-gray-400 leading-relaxed">
                            {item.a}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;