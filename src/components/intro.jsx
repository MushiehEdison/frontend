import React from 'react';
import { Link } from 'react-router-dom';

const Intro = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Organic background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-green-100 rounded-full filter blur-3xl opacity-40 animate-float-slow"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-100 rounded-full filter blur-3xl opacity-40 animate-float-slow delay-2000"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-teal-100 rounded-full filter blur-3xl opacity-30 animate-float-slow delay-3000"></div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl w-full text-center space-y-10 z-10 px-6 py-12">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg transform transition-all duration-500 group-hover:rotate-3 group-hover:scale-105">
              <span className="text-3xl font-bold text-white tracking-tighter">
                𝐻𝑒𝒶𝓁𝐼𝒜
              </span>
            </div>
            <div className="absolute -z-10 -inset-2 bg-green-200/50 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900">
          <span className="relative inline-block">
            <span className="relative z-10">Smart Health</span>
            <span className="absolute bottom-2 left-0 w-full h-3 bg-green-200/50 z-0"></span>
          </span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500">
            Made Simple
          </span>
        </h1>

        {/* Description */}
        <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
          Your personal AI health companion. Get instant, empathetic guidance in English or French. 
          We combine medical knowledge with cutting-edge technology to support your wellness journey.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-5 mt-8">
          <Link
            to="/signin"
            className="relative px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-green-500 to-blue-500 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-[1.02] transform overflow-hidden group"
          >
            <span className="relative z-10">Get Started</span>
            <span className="absolute inset-0 bg-gradient-to-r from-green-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </Link>
          <Link
            to="/signup"
            className="relative px-8 py-4 text-lg font-semibold text-gray-700 bg-white rounded-xl border-2 border-gray-200 hover:border-green-400 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] transform overflow-hidden group"
          >
            <span className="relative z-10">Learn More</span>
            <span className="absolute inset-0 bg-green-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </Link>
        </div>

        {/* Language Selector */}
        <div className="flex justify-center gap-4 mt-8">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-gray-700 border border-gray-200 hover:border-green-400 hover:text-green-600 transition-all duration-200 shadow-sm hover:shadow-md">
            <span>🇬🇧</span>
            <span>English</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-gray-700 border border-gray-200 hover:border-blue-400 hover:text-blue-600 transition-all duration-200 shadow-sm hover:shadow-md">
            <span>🇫🇷</span>
            <span>Français</span>
          </button>
        </div>

        {/* Health indicators (decorative) */}
        <div className="flex justify-center gap-6 mt-12 opacity-70">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse delay-1000"></div>
            <span>Private</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-3 h-3 bg-teal-400 rounded-full animate-pulse delay-1500"></div>
            <span>Reliable</span>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        .animate-float-slow {
          animation: float 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Intro;