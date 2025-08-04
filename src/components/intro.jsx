import React from 'react';
import { Link } from 'react-router-dom';

const Intro = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-teal-500 to-green-500 flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl w-full text-center space-y-10 z-10 px-6">
        {/* Floating Logo */}
        <div className="flex justify-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold shadow-2xl animate-bounce-slow transition-transform hover:scale-110 duration-300">
            Dr. Healia
          </div>
        </div>

        {/* Gradient Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight bg-gradient-to-r from-white via-blue-50 to-teal-100 bg-clip-text text-transparent">
          Welcome to Dr. Healia
        </h1>

        {/* Description */}
        <p className="text-lg sm:text-xl text-white/95 leading-relaxed max-w-2xl mx-auto drop-shadow-md">
          Your personal health companion is here! Chat with our intelligent, empathetic AI to understand your symptoms and get guidance in English or French. Your privacy and care are our top priorities.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-5 mt-6">
          <Link
            to="/signin"
            className="group px-8 py-4 text-lg font-semibold text-white bg-blue-800 rounded-full hover:bg-blue-900 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 transform focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-opacity-50"
          >
            <span className="group-hover:scale-105 transition-transform">Login</span>
          </Link>
          <Link
            to="/signup"
            className="group px-8 py-4 text-lg font-semibold text-blue-800 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 transform focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-40"
          >
            <span className="group-hover:scale-105 transition-transform">Sign Up</span>
          </Link>
        </div>

        {/* Language Badges (Interactive Touch) */}
        <div className="flex justify-center gap-4 mt-6 text-sm font-medium text-white/80">
          <span className="bg-white/20 px-4 py-2 rounded-full transition hover:bg-white/30">
            🇬🇧 English
          </span>
          <span className="bg-white/20 px-4 py-2 rounded-full transition hover:bg-white/30">
            🇫🇷 Français
          </span>
        </div>
      </div>

      {/* Custom Keyframes for Floating Animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: float 6s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fadeIn 1.5s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Intro;