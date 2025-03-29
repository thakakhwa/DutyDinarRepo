import React from 'react';
import { ShieldCheck } from 'lucide-react';

const privacypolicy = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-green-600 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-4">
            <ShieldCheck size={48} className="text-white" />
            <h1 className="text-4xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-lg mt-4 max-w-2xl mx-auto">
            Last Updated: September 2023 | Effective Date: January 2024
          </p>
        </div>
      </div>

      <div className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto prose lg:prose-lg text-gray-600">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-green-600 mb-4">1. Information Collection</h2>
            <p>
              We collect basic user information to provide and improve our services...
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-green-600 mb-4">2. Data Usage</h2>
            <p>
              Your data is used solely for service delivery and platform improvements...
            </p>
          </section>

          <div className="mt-16 text-center">
            <a
              href="/contact"
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 inline-flex items-center"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default privacypolicy;