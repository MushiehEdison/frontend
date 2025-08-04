import React from 'react';
import { Link } from 'react-router-dom';

const Intro = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Main Content */}
      <div className="max-w-2xl w-full text-center space-y-8 px-6">
        {/* Simple Text Logo */}
        <div className="mb-8 transition-all duration-300 hover:opacity-90">
          <h1 className="text-5xl sm:text-6xl font-light tracking-tight text-gray-900">
            <span className="font-medium">𝐻𝑒𝒶𝓁𝐼𝒜</span>
          </h1>
        </div>

        {/* Tagline */}
        <h2 className="text-xl sm:text-2xl text-gray-600 font-light">
          Intelligent health guidance, <span className="text-blue-600 font-medium">simplified</span>
        </h2>

        {/* Description */}
        <p className="text-gray-500 max-w-md mx-auto leading-relaxed mt-6">
          Your private AI health assistant. Get clear, medically-informed guidance in English or French.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
          <Link
            to="/signin"
            className="relative px-8 py-3 text-lg font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 transition-all duration-200 group overflow-hidden"
          >
            <span className="relative z-10">Get Started</span>
            <span className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay"></span>
          </Link>
          <Link
            to="/signup"
            className="relative px-8 py-3 text-lg font-medium text-gray-900 bg-white rounded-md border border-gray-300 hover:border-gray-400 transition-all duration-200 group overflow-hidden"
          >
            <span className="relative z-10">Learn More</span>
            <span className="absolute inset-0 bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </Link>
        </div>

        {/* Language Selector - Minimal */}
        <div className="flex justify-center gap-3 mt-8">
          <button className="px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm font-medium">
            English
          </button>
          <span className="text-gray-300">|</span>
          <button className="px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm font-medium">
            Français
          </button>
        </div>

        {/* Subtle Interactive Elements */}
        <div className="mt-16">
          <div className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors duration-200 cursor-pointer group">
            <span>How it works</span>
            <svg 
              className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Intro;