import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Globe, Send, ArrowRight } from "lucide-react";
import { fastScrollToTop } from '../utils/scrollToTop';

const ContactUs = () => {
    useEffect(() => {
        fastScrollToTop(700);
      }, []);
      
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-green-600 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Get in touch with our team to learn more about how Duty Dinar can help your business
          </p>
        </div>
      </div>

      {/* Contact Methods */}
      <div className="py-16 px-4 bg-green-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <Mail className="text-green-600 mx-auto mb-4" size={40} />
            <h3 className="text-xl font-semibold text-green-600 mb-2">Email Us</h3>
            <p className="text-gray-600 mb-2">General inquiries</p>
            <a href="mailto:info@dutydinar.com" className="text-green-600 hover:text-green-700">
              info@dutydinar.com
            </a>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <Phone className="text-green-600 mx-auto mb-4" size={40} />
            <h3 className="text-xl font-semibold text-green-600 mb-2">Call Us</h3>
            <p className="text-gray-600 mb-2">Mon-Fri 9am-5pm GMT</p>
            <a href="tel:+962780000000" className="text-green-600 hover:text-green-700">
              +962 78 000 0000
            </a>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <MapPin className="text-green-600 mx-auto mb-4" size={40} />
            <h3 className="text-xl font-semibold text-green-600 mb-2">Visit Us</h3>
            <p className="text-gray-600">
              Al Hussein Business Park<br/>
              Amman, Jordan
            </p>
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-green-600">Send a Message</h2>
            <form className="space-y-6">
              <div>
                <label className="block text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Message</label>
                <textarea
                  rows="4"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center"
              >
                Send Message
                <Send className="ml-2" size={20} />
              </button>
            </form>
          </div>
          
          {/* Map */}
          <div className="rounded-lg overflow-hidden shadow-lg">
            <iframe
              title="Office Location"
              src="https://maps.google.com/maps?q=Al%20Hussein%20Business%20Park%20Amman&t=&z=13&ie=UTF8&iwloc=&output=embed"
              className="w-full h-full min-h-[400px]"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-green-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Contact Us</h2>
          <p className="mb-8 max-w-xl mx-auto">
            Subscribe to our newsletter for updates and industry insights
          </p>
          <div className="flex justify-center space-x-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-4 py-3 rounded-lg text-gray-700 w-64"
            />
            <button className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 flex items-center">
              Subscribe
              <ArrowRight className="ml-2" size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
);
};

export default ContactUs;