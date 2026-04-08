import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../assets/assets'

const MainBanner = () => {
  return (
    <div className="relative w-full h-[90vh]">

      {/* Background Image */}
      <img 
        src={assets.main_banner} 
        alt="Main Banner" 
        className="w-full h-full object-cover hidden md:block"
      />
      <img 
        src={assets.main_banner} 
        alt="Main Banner" 
        className="w-full h-full object-cover md:hidden"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">

        {/* Title */}
        <h1 className="text-white text-3xl md:text-5xl lg:text-6xl font-bold max-w-3xl leading-tight">
          Smart Solutions for Everyday Campus Needs
        </h1>

        {/* Subtitle */}
        <p className="text-gray-200 mt-4 max-w-xl text-sm md:text-lg">
          Manage bookings, report issues, and stay updated — all in one smart campus platform.
        </p>

        {/* Buttons */}
        <div className="flex gap-4 mt-8 flex-wrap justify-center">

          {/* Primary Button */}
          <Link
            to="/catalogue"
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm md:text-base font-medium transition shadow-lg"
          >
            Browse Resources
          </Link>

          {/* Secondary Button */}
          <Link
            to="/report"
            className="px-8 py-3 border border-white text-white hover:bg-white hover:text-black rounded-lg text-sm md:text-base font-medium transition"
          >
            Report Issue
          </Link>

        </div>

      </div>
    </div>
  )
}

export default MainBanner