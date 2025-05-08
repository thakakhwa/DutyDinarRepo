import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { fastScrollToTop } from '../utils/scrollToTop';

const TOS = () => {
  useEffect(() => {
    fastScrollToTop(700);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-green-600 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Last Updated: September 2023 | Effective Date: January 2024
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto prose lg:prose-lg">
          <div className="space-y-12 text-gray-600">
            <section>
              <h2 className="text-2xl font-bold text-green-600 mb-4">1. Acceptance of Terms</h2>
              <p className="mb-6">
                By accessing or using the Duty Dinar platform ("Service"), you agree to be bound by these Terms of Service. 
                If you disagree with any part of the terms, you may not access the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-600 mb-4">2. User Responsibilities</h2>
              <ol className="list-decimal pl-6 space-y-4">
                <li>You must be at least 18 years old to use this Service</li>
                <li>You are responsible for maintaining the confidentiality of your account</li>
                <li>You agree to provide accurate and complete registration information</li>
                <li>Any fraudulent activity will result in immediate account termination</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-600 mb-4">3. Transactions</h2>
              <p className="mb-4">
                Duty Dinar acts as a platform for B2B transactions but is not a party to any agreements between buyers and suppliers.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>All transactions are between registered business entities</li>
                <li>We do not guarantee product quality or delivery timelines</li>
                <li>Disputes must be resolved directly between parties</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-600 mb-4">4. Intellectual Property</h2>
              <p>
                All content on the Service, including text, graphics, logos, and software, is the property of Duty Dinar or 
                its licensors and protected by international copyright laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-600 mb-4">5. Limitation of Liability</h2>
              <p>
                Duty Dinar shall not be liable for any indirect, incidental, special, consequential or punitive damages arising from:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Use or inability to use the Service</li>
                <li>Unauthorized access to your transmissions</li>
                <li>Conduct of third parties on the Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-600 mb-4">6. Modifications</h2>
              <p>
                We reserve the right to modify these terms at any time. Continued use after changes constitutes acceptance of 
                the revised terms. Major changes will be communicated via email or platform notification.
              </p>
            </section>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-green-50 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-green-600 mb-6">Questions About Our Terms?</h2>
          <p className="mb-8 max-w-xl mx-auto text-gray-600">
            Contact our legal team for any clarifications regarding these terms of service
          </p>
          <Link
            to="/contact"
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center mx-auto w-fit"
          >
            Contact Legal Team
            <ArrowRight className="ml-2" size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TOS;