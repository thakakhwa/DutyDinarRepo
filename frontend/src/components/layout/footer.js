// components/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';




const Footer = () => {
  return (
    <footer className="bg-green-600 text-white py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Duty Dinar</h3>
            <p className="text-sm">
              Connecting global businesses with trusted suppliers since 2025
            </p>
            <div className="flex space-x-4">
            <a 
                href="https://www.facebook.com/share/1BVJob7PMb/?mibextid=wwXIfr" 
                target="_blank"
              ><Facebook className="hover:text-green-200 cursor-pointer transition-colors" /></a>
              <a 
                href="https://twitter.com/dutydinar"
                target="_blank"
              ><Twitter className="hover:text-green-200 cursor-pointer transition-colors" /></a>
              <a 
                href="https://www.instagram.com/dutydinar/" 
                target="_blank"
              ><Instagram className="hover:text-green-200 cursor-pointer transition-colors" /></a>
              <a 
                href="http://linkedin.com/company/dutydinar" 
                target="_blank"
              ><Linkedin className="hover:text-green-200 cursor-pointer transition-colors" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-lg font-semibold mb-2">Quick Links</h4>
            <Link to="/about" className="block text-sm hover:text-green-200 transition-colors">About Us</Link>
            <Link to="/contact" className="block text-sm hover:text-green-200 transition-colors">Contact</Link>
            <Link to="/faq" className="block text-sm hover:text-green-200 transition-colors">FAQ</Link>
            <Link to="/tos" className="block text-sm hover:text-green-200 transition-colors">Terms of Service</Link>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <h4 className="text-lg font-semibold mb-2">Categories</h4>
            <Link to="/categories/electronics" className="block text-sm hover:text-green-200 transition-colors">Electronics</Link>
            <Link to="/categories/machinery" className="block text-sm hover:text-green-200 transition-colors">Machinery</Link>
            <Link to="/categories/textiles" className="block text-sm hover:text-green-200 transition-colors">Textiles</Link>
            <Link to="/categories/raw-materials" className="block text-sm hover:text-green-200 transition-colors">Raw Materials</Link>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Stay Updated</h4>
            <form className="flex flex-col sm:flex-row gap-2">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 rounded-lg bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
              />
              <button 
                type="submit"
                className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 text-sm font-medium transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-green-700 mt-8 pt-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Duty Dinar. All rights reserved.</p>
          <div className="mt-2 flex justify-center space-x-4">
            <Link to="/Privacypolicy" className="hover:text-green-200 transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;