import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          {/* Logo and Company */}
          <div className="flex flex-col items-center space-y-4 mb-6">
            <Link to="/" className="text-lg font-semibold text-gray-700 hover:text-gray-900">
              ShadowCongress
            </Link>
            <p className="text-sm text-gray-500">
              A product of Franklin Graystone LLC
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-8 mb-6">
            <Link 
              to="/about" 
              className="text-sm text-gray-500 hover:text-gray-700 hover:underline transition-colors"
            >
              About Us
            </Link>
            <Link 
              to="/contact" 
              className="text-sm text-gray-500 hover:text-gray-700 hover:underline transition-colors"
            >
              Contact Us
            </Link>
            <Link 
              to="/privacy" 
              className="text-sm text-gray-500 hover:text-gray-700 hover:underline transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              to="/terms" 
              className="text-sm text-gray-500 hover:text-gray-700 hover:underline transition-colors"
            >
              Terms of Service
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-center">
            <p className="text-xs text-gray-400">
              © {currentYear} Franklin Graystone LLC. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;