import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, MessageCircle, Phone, ArrowRight } from "lucide-react";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const faqItems = [
    {
      question: "How do I verify a supplier?",
      answer: "Use our built-in verification system through the supplier profile page. All suppliers undergo rigorous background checks before being listed."
    },
    {
      question: "What payment methods are supported?",
      answer: "We support bank transfers, credit cards, and secure escrow services. All transactions are protected by our payment security system."
    },
    {
      question: "How long does shipping take?",
      answer: "Shipping times vary by supplier location and product type. Each product listing shows estimated delivery times from that specific supplier."
    },
    {
      question: "Are there any membership fees?",
      answer: "Basic membership is free. Premium features like advanced analytics and priority support are available through our enterprise plans."
    },
    {
      question: "How do I resolve a dispute?",
      answer: "Contact our support team immediately through the resolution center. We mediate all disputes and offer purchase protection on qualified transactions."
    },
    {
      question: "Can I request custom products?",
      answer: "Yes! Use our custom order system to submit specifications to qualified suppliers. We'll match you with manufacturers who can fulfill your request."
    }
  ];

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-green-600 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">FAQs</h1>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Find answers to common questions about using Duty Dinar and managing your B2B transactions
          </p>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="py-16 px-4 bg-green-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqItems.map((item, index) => (
              <div 
                key={index}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  className="w-full p-6 text-left flex justify-between items-center"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <span className="text-lg font-semibold text-green-600">{item.question}</span>
                  <ChevronDown 
                    className={`ml-4 text-green-600 transition-transform ${openIndex === index ? 'rotate-180' : ''}`}
                    size={24}
                  />
                </button>
                {openIndex === index && (
                  <div className="p-6 pt-0 border-t border-green-50">
                    <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Support CTA */}
      <div className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="bg-green-600 rounded-xl p-8 md:p-12 text-white">
            <MessageCircle className="mx-auto mb-6" size={48} />
            <h2 className="text-3xl font-bold mb-4">Still need help?</h2>
            <p className="mb-8 max-w-xl mx-auto">
              Our support team is available 24/7 to assist you with any questions
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="mailto:support@dutydinar.com"
                className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 flex items-center justify-center"
              >
                <MessageCircle className="mr-2" size={20} />
                Chat Support
              </a>
              <a
                href="tel:+962780000000"
                className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 flex items-center justify-center"
              >
                <Phone className="mr-2" size={20} />
                +962 78 000 0000
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-green-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Start Your Journey Today</h2>
          <p className="mb-8 max-w-xl mx-auto">
            Join thousands of businesses growing with Duty Dinar
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/signup"
              className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 flex items-center"
            >
              Create Free Account
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;