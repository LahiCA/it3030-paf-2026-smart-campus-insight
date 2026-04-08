import React from 'react'
import { categories } from '../assets/assets'
import { useAppContext } from '../context/AppContext'

const Categories = () => {
  const { navigate } = useAppContext()

  return (
    <div className='mt-20 px-4 md:px-10'>
      
      {/* Header */}
      <div className='flex items-center justify-between'>
        <p className='text-2xl md:text-3xl font-semibold text-gray-800'>
          Categories
        </p>
        <span className='text-sm text-gray-500 hidden md:block'>
          Explore facilities
        </span>
      </div>

      {/* Grid */}
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-6 mt-10'>
        
        {categories.map((category, index) => (
          <div
            key={index}
            className='group flex flex-col items-center justify-center rounded-2xl p-5 cursor-pointer bg-white border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-2'
            onClick={() => {
              navigate(`/facilities/${category.path}`)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          >
            
            {/* Icon Container */}
            <div className='w-20 h-20 flex items-center justify-center rounded-full bg-gray-50 group-hover:bg-gray-100 transition'>
              <img
                src={category.image}
                alt={category.text}
                className='w-12 h-12 object-contain transition-transform duration-300 group-hover:scale-110'
              />
            </div>

            {/* Text */}
            <p className='mt-4 text-center text-sm md:text-base font-medium text-gray-700 group-hover:text-gray-900'>
              {category.text}
            </p>

          </div>
        ))}
      </div>
    </div>
  )
}

export default Categories