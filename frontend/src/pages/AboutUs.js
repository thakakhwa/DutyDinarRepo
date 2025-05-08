import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, Globe, Shield, Package, ArrowRight } from "lucide-react";
import { fastScrollToTop } from '../utils/scrollToTop';

// Rest of your component...

const AboutUs = () => {
  useEffect(() => {
    fastScrollToTop(700);
  }, []);
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-green-600 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">About Duty Dinar</h1>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Connecting global businesses with trusted suppliers since 2025
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/contact"
              className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
            >
              Contact Us
            </Link>
            <Link
              to="/signup"
              className="border-2 border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
            >
              Join Now
            </Link>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-green-600">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              To revolutionize B2B commerce by creating a seamless platform that
              connects businesses with verified suppliers worldwide, ensuring
              transparency, reliability, and efficiency in every transaction.
            </p>
            <div className="flex items-center space-x-4 text-green-600">
              <Globe size={48} />
              <span className="text-xl font-semibold">Global Reach</span>
            </div>
          </div>
          <img
            src="/about-mission.jpg"
            alt="Global network"
            className="rounded-lg shadow-lg"
          />
        </div>
      </div>

      {/* Values Section */}
      <div className="py-16 px-4 bg-green-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-green-600 text-center mb-12">
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Integrity",
                text: "Ethical business practices in every transaction",
              },
              {
                icon: Users,
                title: "Collaboration",
                text: "Building strong partnerships",
              },
              {
                icon: Package,
                title: "Quality",
                text: "Verified suppliers and products",
              },
            ].map((value, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <value.icon className="text-green-600 mb-4" size={40} />
                <h3 className="text-xl font-semibold text-green-600 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600">{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-green-600 text-center mb-12">
            Leadership Team
          </h2>
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Member 1 - Zaid Qal */}
              <div className="group text-center">
                <div className="relative overflow-hidden rounded-lg mb-4 aspect-[3/4]">
                  <img
                    src="/zaidqal.png"
                    alt="Zaid Qal"
                    className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-green-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h3 className="text-xl font-semibold text-green-600 mb-1">
                  Zaid Qal
                </h3>
                <p className="text-gray-600 text-lg">CEO</p>
              </div>

              {/* Member 2 - Zaid Haija */}
              <div className="group text-center">
                <div className="relative overflow-hidden rounded-lg mb-4 aspect-[3/4]">
                  <img
                    src="/zaidhaija.jpeg"
                    alt="Zaid Haija"
                    className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-green-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h3 className="text-xl font-semibold text-green-600 mb-1">
                  Zaid Haija
                </h3>
                <p className="text-gray-600 text-lg">CTO</p>
              </div>

              {/* Member 3 - Anas Ghazal */}
              <div className="group text-center">
                <div className="relative overflow-hidden rounded-lg mb-4 aspect-[3/4]">
                  <img
                    src="/anasghazal.jpg"
                    alt="Anas Ghazal"
                    className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-green-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h3 className="text-xl font-semibold text-green-600 mb-1">
                  Anas Ghazal
                </h3>
                <p className="text-gray-600 text-lg">CNO</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-green-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="mb-8 max-w-xl mx-auto">
            Join thousands of businesses already benefiting from our platform
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/signup"
              className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 flex items-center"
            >
              Create Account
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
