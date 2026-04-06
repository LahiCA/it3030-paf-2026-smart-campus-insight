import React from 'react'

const AboutUs = () => {
  return (
    <div className="px-6 md:px-16 lg:px-24 py-12 text-gray-700">
      
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          About Us
        </h1>
        <p className="mt-4 text-gray-600">
          Simplifying facility booking for students, staff, and organizations.
        </p>
      </div>

      {/* Main Content */}
      <div className="mt-12 grid md:grid-cols-2 gap-10 items-center">
        
        {/* Image */}
        <img
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644"
          alt="About"
          className="rounded-2xl shadow-md w-full object-cover"
        />

        {/* Text */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Who We Are
          </h2>
          <p className="mt-4 leading-relaxed">
            We are a team dedicated to making facility management and booking
            easier and more efficient. Our platform allows users to quickly
            discover, explore, and reserve spaces such as lecture halls,
            laboratories, meeting rooms, and more.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-6">
            Our Mission
          </h2>
          <p className="mt-4 leading-relaxed">
            Our mission is to provide a seamless and user-friendly experience
            for booking facilities, reducing manual work and improving
            accessibility for everyone.
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-center text-gray-900">
          What We Offer
        </h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 mt-10">
          
          <div className="p-6 bg-white rounded-2xl shadow-sm border hover:shadow-md transition">
            <h3 className="font-semibold text-lg">Easy Booking</h3>
            <p className="mt-2 text-sm text-gray-600">
              Book facilities in just a few clicks with a simple interface.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl shadow-sm border hover:shadow-md transition">
            <h3 className="font-semibold text-lg">Real-Time Availability</h3>
            <p className="mt-2 text-sm text-gray-600">
              Check availability instantly and avoid scheduling conflicts.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl shadow-sm border hover:shadow-md transition">
            <h3 className="font-semibold text-lg">Smart Management</h3>
            <p className="mt-2 text-sm text-gray-600">
              Efficiently manage bookings, schedules, and resources.
            </p>
          </div>

        </div>
      </div>

      {/* Footer CTA */}
      <div className="mt-16 text-center">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
          Start Booking Today
        </h2>
        <p className="mt-3 text-gray-600">
          Discover and reserve facilities with ease.
        </p>

        <button className="mt-6 px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition">
          Explore Facilities
        </button>
      </div>

    </div>
  )
}

export default AboutUs